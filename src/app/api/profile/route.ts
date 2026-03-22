import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getNicheConfig, getActiveNiche, getAccountIntelligence, saveAccountIntelligence } from '@/lib/storage'
import { buildProfileScrapePrompt } from '@/lib/prompts'
import { runResearch } from '@/lib/ai'
import type { AccountIntelligence } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = await getNicheConfig()
    if (!config) return NextResponse.json({ error: 'No niche config' }, { status: 400 })

    const niche = getActiveNiche(config)
    if (!niche) return NextResponse.json({ error: 'No active niche' }, { status: 400 })

    const hasX = !!niche.xHandle
    const hasLinkedIn = !!niche.linkedinHandle

    if (!hasX && !hasLinkedIn) {
      return NextResponse.json({ error: 'No handles configured' }, { status: 400 })
    }

    const intel: AccountIntelligence = {
      nicheId: niche.id,
      scrapedAt: new Date().toISOString(),
    }

    // Scrape X profile
    if (hasX) {
      try {
        const prompt = buildProfileScrapePrompt(niche, 'x')
        const { text: raw } = await runResearch(prompt)
        const clean = raw.replace(/```json|```/g, '').trim()
        intel.xProfile = JSON.parse(clean)
      } catch (e) {
        console.error('X scrape failed:', e)
      }
    }

    // Scrape LinkedIn profile
    if (hasLinkedIn) {
      try {
        const prompt = buildProfileScrapePrompt(niche, 'linkedin')
        const { text: raw } = await runResearch(prompt)
        const clean = raw.replace(/```json|```/g, '').trim()
        intel.linkedinProfile = JSON.parse(clean)
      } catch (e) {
        console.error('LinkedIn scrape failed:', e)
      }
    }

    await saveAccountIntelligence(intel)
    return NextResponse.json({ intel })

  } catch (error) {
    console.error('Profile scrape error:', error)
    return NextResponse.json({ error: 'Profile scrape failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = await getNicheConfig()
    if (!config) return NextResponse.json({ intel: null })
    const intel = await getAccountIntelligence(config.activeNicheId)
    return NextResponse.json({ intel })
  } catch {
    return NextResponse.json({ intel: null })
  }
}
