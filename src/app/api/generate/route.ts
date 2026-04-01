import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuid } from 'uuid'
import { getNicheConfig, getActiveNiche, getAccountIntelligence, savePost, getUserUsage, checkPostLimit, incrementPostUsage } from '@/lib/storage'
import { LIMITS } from '@/lib/constants'
import { runGenerate } from '@/lib/ai'
import { buildPostPrompt } from '@/lib/prompts'
import { extractJSON } from '@/lib/json'
import type { GenerateRequest, GeneratedPost, Signal } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check usage limits
    const usage = await getUserUsage()
    if (!checkPostLimit(usage)) {
      return NextResponse.json({
        error: 'Monthly post limit reached',
        limit: LIMITS.free.postsPerMonth,
        message: 'Free plan includes 5 posts per month. Upgrade to Pro for unlimited posts.',
        upgradeUrl: '/app/settings#upgrade',
      }, { status: 402 })
    }

    const body: GenerateRequest = await request.json()
    const { signalId, signalTitle, signalSummary, signalQuote, platform, tone, direction, nicheId } = body

    if (!signalId || !platform || !tone) {
      return NextResponse.json({ error: 'Missing required fields: signalId, platform, tone' }, { status: 400 })
    }

    const config = await getNicheConfig()
    if (!config) {
      return NextResponse.json({ error: 'No niche configured' }, { status: 400 })
    }

    const niche = config.niches.find(n => n.id === nicheId) ?? getActiveNiche(config)
    if (!niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }

    const signal: Signal = {
      id: signalId,
      rank: 1,
      title: signalTitle,
      summary: signalSummary,
      quote: signalQuote,
      sources: [],
      strength: 'high',
      engagementNote: '',
    }

    const accountIntel = await getAccountIntelligence(niche.id) ?? undefined
    const prompt = buildPostPrompt(platform, niche, signal, tone, direction, accountIntel)
    const { text, model } = await runGenerate('', prompt)
    console.log(`[API] Generation completed using ${model}`)

    const parsed = extractJSON(text)
    if (!parsed || typeof parsed.content !== 'string') {
      console.error('[API] Failed to parse generation response as JSON with content field')
      return NextResponse.json({ error: 'Failed to parse generated post' }, { status: 502 })
    }

    const content = parsed.content as string

    const post: GeneratedPost = {
      id: uuid(),
      nicheId: niche.id,
      signalId,
      signalTitle,
      platform,
      tone,
      content,
      charCount: content.length,
      algoChecks: Array.isArray(parsed.algoChecks) ? parsed.algoChecks : [],
      bestPostingTime: (parsed.bestPostingTime as string) || '',
      direction: direction || undefined,
      createdAt: new Date().toISOString(),
    }

    await savePost(post)
    await incrementPostUsage()
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[API] POST /api/generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
