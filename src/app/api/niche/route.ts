import { NextResponse } from 'next/server'
import { getNicheConfig, saveNicheConfig } from '@/lib/storage'
import type { Niche, NicheConfig } from '@/lib/types'

function generateSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '')
}

export async function GET() {
  try {
    const config = getNicheConfig()
    return NextResponse.json({ config })
  } catch (err) {
    console.error('[API] GET /api/niche error:', err)
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { niche: nicheData, refreshNow } = body as { niche: Partial<Niche>; refreshNow: boolean }

    const now = new Date().toISOString()
    let config = getNicheConfig()

    const nicheId = nicheData.id || generateSlug(nicheData.topic || nicheData.name || 'default')

    const newNiche: Niche = {
      id: nicheId,
      name: nicheData.name || '',
      topic: nicheData.topic || '',
      audience: nicheData.audience || '',
      voiceExamples: nicheData.voiceExamples || [],
      toneDefault: nicheData.toneDefault || 'contrarian',
      createdAt: now,
      updatedAt: now,
    }

    if (config) {
      const existingIndex = config.niches.findIndex(n => n.id === nicheId)
      if (existingIndex >= 0) {
        newNiche.createdAt = config.niches[existingIndex].createdAt
        config.niches[existingIndex] = newNiche
      } else {
        config.niches.push(newNiche)
      }
      config.activeNicheId = nicheId
    } else {
      config = {
        activeNicheId: nicheId,
        niches: [newNiche],
      }
    }

    saveNicheConfig(config)
    return NextResponse.json({ config, nicheId, refreshNow })
  } catch (err) {
    console.error('[API] POST /api/niche error:', err)
    return NextResponse.json({ error: 'Failed to save niche' }, { status: 500 })
  }
}
