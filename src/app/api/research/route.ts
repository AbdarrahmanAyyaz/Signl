import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getNicheConfig, getActiveNiche, getLatestBrief, saveBrief } from '@/lib/storage'
import { runResearch } from '@/lib/ai'
import { buildResearchPrompt } from '@/lib/prompts'
import { extractJSON } from '@/lib/json'
import type { Brief, Signal, SignalStrength, SourceType } from '@/lib/types'

export async function GET() {
  try {
    const config = getNicheConfig()
    if (!config) return NextResponse.json({ brief: null })

    const niche = getActiveNiche(config)
    if (!niche) return NextResponse.json({ brief: null })

    const brief = getLatestBrief(niche.id)
    return NextResponse.json({ brief })
  } catch (err) {
    console.error('[API] GET /api/research error:', err)
    return NextResponse.json({ error: 'Failed to fetch brief' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const config = getNicheConfig()
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

    saveBrief(brief)
    return NextResponse.json({ brief })
  } catch (err) {
    console.error('[API] POST /api/research error:', err)
    return NextResponse.json({ error: 'Research agent failed' }, { status: 500 })
  }
}
