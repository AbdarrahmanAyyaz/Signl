import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuid } from 'uuid'
import { getNicheConfig, getActiveNiche, getLatestBrief, saveBrief, getUserUsage, checkBriefLimit, incrementBriefUsage } from '@/lib/storage'
import { LIMITS } from '@/lib/constants'
import { runResearch } from '@/lib/ai'
import { buildResearchPrompt } from '@/lib/prompts'
import { extractJSON } from '@/lib/json'
import type { Brief, Signal, SignalStrength, SourceType } from '@/lib/types'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = await getNicheConfig()
    if (!config) return NextResponse.json({ brief: null })

    const niche = getActiveNiche(config)
    if (!niche) return NextResponse.json({ brief: null })

    const brief = await getLatestBrief(niche.id)
    return NextResponse.json({ brief })
  } catch (err) {
    console.error('[API] GET /api/research error:', err)
    return NextResponse.json({ error: 'Failed to fetch brief' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check usage limits
    const usage = await getUserUsage()
    if (!checkBriefLimit(usage)) {
      return NextResponse.json({
        error: 'Daily brief limit reached',
        limit: LIMITS.free.briefsPerDay,
        message: 'Free plan includes 2 research briefs per day. Upgrade to Pro for unlimited daily auto-briefs.',
        upgradeUrl: '/app/settings#upgrade',
      }, { status: 402 })
    }

    const body = await request.json().catch(() => ({}))
    const config = await getNicheConfig()
    if (!config) {
      return NextResponse.json({ error: 'No niche configured' }, { status: 400 })
    }

    const nicheId = (body.nicheId as string | undefined) || config.activeNicheId
    const niche = config.niches.find(n => n.id === nicheId)
    if (!niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }

    const prompt = buildResearchPrompt(niche)
    const { text, model } = await runResearch(prompt)
    console.log(`[API] Research completed using ${model}`)

    const parsed = extractJSON(text)
    if (!parsed || !Array.isArray(parsed.signals)) {
      console.error('[API] Failed to parse research response as JSON with signals array')
      return NextResponse.json({ error: 'Failed to parse research results' }, { status: 502 })
    }

    const validStrengths: SignalStrength[] = ['high', 'medium', 'rising']
    const validSources: SourceType[] = ['reddit', 'x', 'linkedin', 'news']

    const signals: Signal[] = (parsed.signals as Record<string, unknown>[]).map(
      (s: Record<string, unknown>, i: number) => {
        const rawStrength = (s.strength as string) || 'medium'
        const strength: SignalStrength = validStrengths.includes(rawStrength as SignalStrength)
          ? (rawStrength as SignalStrength)
          : 'medium'

        const rawSources = Array.isArray(s.sources) ? s.sources : []
        const sources: SourceType[] = rawSources.filter(
          (src: unknown): src is SourceType => validSources.includes(src as SourceType)
        )

        return {
          id: uuid(),
          rank: i + 1,
          title: (s.title as string) || '',
          summary: (s.summary as string) || '',
          quote: (s.quote as string) || '',
          sources,
          strength,
          engagementNote: (s.engagementNote as string) || '',
        }
      }
    )

    const now = new Date().toISOString()
    const brief: Brief = {
      id: uuid(),
      nicheId: niche.id,
      nicheName: niche.name,
      signals,
      generatedAt: now,
      refreshedAt: now,
    }

    await saveBrief(brief)
    await incrementBriefUsage()

    // Trigger profile scrape if handles exist
    if (niche.xHandle || niche.linkedinHandle) {
      try {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile`, {
          method: 'POST',
        })
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({ brief })
  } catch (err) {
    console.error('[API] POST /api/research error:', err)
    return NextResponse.json({ error: 'Research agent failed' }, { status: 500 })
  }
}
