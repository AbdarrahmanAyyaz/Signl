import { describe, it, expect } from 'vitest'
import { buildResearchPrompt, buildPostPrompt } from '@/lib/prompts'
import type { Niche, Signal } from '@/lib/types'

function makeNiche(overrides: Partial<Niche> = {}): Niche {
  return {
    id: 'test-niche',
    name: 'Productivity for Founders',
    topic: 'personal productivity systems',
    audience: 'early-stage founders',
    voiceExamples: [
      'I stopped using task managers and started getting more done.',
      'The system isn\'t broken. You\'re just not the system\'s target user.',
    ],
    toneDefault: 'contrarian',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    rank: 1,
    title: 'People are tired of AI slop',
    summary: 'Growing frustration with generic AI content.',
    quote: 'it just sounds like AI no matter what I do',
    sources: ['reddit', 'x'],
    strength: 'high',
    engagementNote: '1.2k upvotes',
    ...overrides,
  }
}

describe('buildResearchPrompt', () => {
  it('includes niche name, topic, and audience', () => {
    const prompt = buildResearchPrompt(makeNiche())
    expect(prompt).toContain('Productivity for Founders')
    expect(prompt).toContain('personal productivity systems')
    expect(prompt).toContain('early-stage founders')
  })

  it('requests exactly 5 signals', () => {
    const prompt = buildResearchPrompt(makeNiche())
    expect(prompt).toContain('exactly 5 signals')
  })

  it('specifies valid source types', () => {
    const prompt = buildResearchPrompt(makeNiche())
    expect(prompt).toContain('"reddit"')
    expect(prompt).toContain('"x"')
    expect(prompt).toContain('"linkedin"')
    expect(prompt).toContain('"news"')
  })

  it('specifies valid strength values', () => {
    const prompt = buildResearchPrompt(makeNiche())
    expect(prompt).toContain('"high"')
    expect(prompt).toContain('"medium"')
    expect(prompt).toContain('"rising"')
  })

  it('requests JSON-only output', () => {
    const prompt = buildResearchPrompt(makeNiche())
    expect(prompt).toContain('Return ONLY valid JSON')
  })
})

describe('buildPostPrompt', () => {
  const niche = makeNiche()
  const signal = makeSignal()

  it('builds X prompt with correct platform rules', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian')
    expect(prompt).toContain('X (Twitter)')
    expect(prompt).toContain('NO hashtags')
    expect(prompt).toContain('150–280 characters')
    expect(prompt).toContain('Never start with "I"')
  })

  it('builds LinkedIn prompt with correct platform rules', () => {
    const prompt = buildPostPrompt('linkedin', niche, signal, 'story')
    expect(prompt).toContain('LinkedIn')
    expect(prompt).toContain('120–250 words')
    expect(prompt).toContain('"see more"')
  })

  it('includes voice examples', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian')
    expect(prompt).toContain('stopped using task managers')
    expect(prompt).toContain('target user')
  })

  it('includes signal context', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'hottake')
    expect(prompt).toContain('People are tired of AI slop')
    expect(prompt).toContain('it just sounds like AI no matter what I do')
  })

  it('includes direction when provided', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian', 'focus on the irony')
    expect(prompt).toContain('focus on the irony')
    expect(prompt).toContain('DIRECTION FROM THE USER')
  })

  it('excludes direction section when not provided', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian')
    expect(prompt).not.toContain('DIRECTION FROM THE USER')
  })

  it('includes all 5 tone types without error', () => {
    const tones = ['contrarian', 'story', 'hottake', 'question', 'observation'] as const
    for (const tone of tones) {
      const prompt = buildPostPrompt('x', niche, signal, tone)
      expect(prompt).toContain('TONE:')
      expect(prompt.length).toBeGreaterThan(100)
    }
  })

  it('includes account intelligence for X when provided', () => {
    const intel = {
      nicheId: 'test-niche',
      xProfile: {
        handle: 'testuser',
        recentPosts: [],
        topTopics: ['AI tools'],
        writingPatterns: ['Short sentences'],
        topPerformingPost: 'This one went viral',
        avgEngagement: 150,
        topicsToAvoid: ['crypto'],
        audienceSignals: ['loves practical tips'],
      },
      scrapedAt: '2026-04-09T00:00:00Z',
    }
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian', undefined, intel)
    expect(prompt).toContain('Short sentences')
    expect(prompt).toContain('This one went viral')
    expect(prompt).toContain('loves practical tips')
    expect(prompt).toContain('crypto')
  })

  it('includes account intelligence for LinkedIn when provided', () => {
    const intel = {
      nicheId: 'test-niche',
      linkedinProfile: {
        handle: 'testuser',
        recentPosts: [],
        topTopics: ['Leadership'],
        writingPatterns: ['Opens with vulnerability'],
        topPerformingPost: 'I failed three times before...',
        avgEngagement: 200,
        topicsToAvoid: ['hustle culture'],
        audienceSignals: ['resonates with failure stories'],
      },
      scrapedAt: '2026-04-09T00:00:00Z',
    }
    const prompt = buildPostPrompt('linkedin', niche, signal, 'story', undefined, intel)
    expect(prompt).toContain('Opens with vulnerability')
    expect(prompt).toContain('I failed three times before...')
    expect(prompt).toContain('resonates with failure stories')
  })

  it('requests JSON-only output for X', () => {
    const prompt = buildPostPrompt('x', niche, signal, 'contrarian')
    expect(prompt).toContain('Return ONLY valid JSON')
    expect(prompt).toContain('"content"')
    expect(prompt).toContain('"algoChecks"')
    expect(prompt).toContain('"bestPostingTime"')
  })

  it('requests JSON-only output for LinkedIn', () => {
    const prompt = buildPostPrompt('linkedin', niche, signal, 'story')
    expect(prompt).toContain('Return ONLY valid JSON')
    expect(prompt).toContain('"content"')
    expect(prompt).toContain('"algoChecks"')
  })
})
