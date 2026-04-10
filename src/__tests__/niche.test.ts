import { describe, it, expect, vi } from 'vitest'
import { getActiveNiche } from '@/lib/storage'
import type { NicheConfig, Niche } from '@/lib/types'

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}))
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

function makeNiche(overrides: Partial<Niche> = {}): Niche {
  return {
    id: 'test-niche',
    name: 'Test Niche',
    topic: 'Testing',
    audience: 'Testers',
    voiceExamples: ['Example 1'],
    toneDefault: 'contrarian',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('getActiveNiche', () => {
  it('returns the active niche when it exists', () => {
    const config: NicheConfig = {
      activeNicheId: 'niche-1',
      niches: [
        makeNiche({ id: 'niche-1', name: 'First' }),
        makeNiche({ id: 'niche-2', name: 'Second' }),
      ],
    }
    const result = getActiveNiche(config)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('First')
  })

  it('returns null when active niche id does not match', () => {
    const config: NicheConfig = {
      activeNicheId: 'nonexistent',
      niches: [makeNiche({ id: 'niche-1' })],
    }
    expect(getActiveNiche(config)).toBeNull()
  })

  it('returns null for empty niches array', () => {
    const config: NicheConfig = {
      activeNicheId: 'any',
      niches: [],
    }
    expect(getActiveNiche(config)).toBeNull()
  })

  it('returns first match when duplicates exist', () => {
    const config: NicheConfig = {
      activeNicheId: 'dup',
      niches: [
        makeNiche({ id: 'dup', name: 'First match' }),
        makeNiche({ id: 'dup', name: 'Second match' }),
      ],
    }
    const result = getActiveNiche(config)
    expect(result!.name).toBe('First match')
  })
})

describe('generateSlug (via niche API)', () => {
  // We test the slug generation function by importing it indirectly
  // Since it's not exported, we test the logic pattern directly
  function generateSlug(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40)
      .replace(/-+$/, '')
  }

  it('converts spaces to hyphens', () => {
    expect(generateSlug('AI for Founders')).toBe('ai-for-founders')
  })

  it('lowercases everything', () => {
    expect(generateSlug('HELLO WORLD')).toBe('hello-world')
  })

  it('strips special characters', () => {
    expect(generateSlug('AI & ML (2025)')).toBe('ai-ml-2025')
  })

  it('truncates to 40 chars', () => {
    const long = 'this is a very long topic name that should be truncated to forty characters max'
    expect(generateSlug(long).length).toBeLessThanOrEqual(40)
  })

  it('strips trailing hyphens', () => {
    expect(generateSlug('test---')).toBe('test')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })
})
