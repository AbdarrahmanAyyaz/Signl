import { NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getNicheConfig, getActiveNiche, savePost } from '@/lib/storage'
import { runGenerate } from '@/lib/ai'
import { buildPostPrompt } from '@/lib/prompts'
import { extractJSON } from '@/lib/json'
import type { GenerateRequest, GeneratedPost, Signal } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json()
    const { signalId, signalTitle, signalSummary, signalQuote, platform, tone, direction, nicheId } = body

    if (!signalId || !platform || !tone) {
      return NextResponse.json({ error: 'Missing required fields: signalId, platform, tone' }, { status: 400 })
    }

    const config = getNicheConfig()
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

    const prompt = buildPostPrompt(platform, niche, signal, tone, direction)
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

    savePost(post)
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[API] POST /api/generate error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
