import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LIMITS } from '@/lib/constants'
import { checkPostLimit, checkBriefLimit } from '@/lib/storage'
import type { UsageRecord } from '@/lib/types'

// Mock the dependencies that storage.ts imports
vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}))
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

function makeUsage(overrides: Partial<UsageRecord> = {}): UsageRecord {
  return {
    plan: 'free',
    month: '2026-04',
    postsGenerated: 0,
    today: '2026-04-09',
    briefsToday: 0,
    hasSeenPlanIntro: false,
    ...overrides,
  }
}

describe('LIMITS constants', () => {
  it('free plan allows 5 posts per month', () => {
    expect(LIMITS.free.postsPerMonth).toBe(5)
  })

  it('free plan allows 2 briefs per day', () => {
    expect(LIMITS.free.briefsPerDay).toBe(2)
  })

  it('pro plan has unlimited posts', () => {
    expect(LIMITS.pro.postsPerMonth).toBe(Infinity)
  })

  it('pro plan has unlimited briefs', () => {
    expect(LIMITS.pro.briefsPerDay).toBe(Infinity)
  })
})

describe('checkPostLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows posts when under limit', () => {
    const usage = makeUsage({ postsGenerated: 3 })
    expect(checkPostLimit(usage)).toBe(true)
  })

  it('allows exactly 4 posts (under 5 limit)', () => {
    const usage = makeUsage({ postsGenerated: 4 })
    expect(checkPostLimit(usage)).toBe(true)
  })

  it('blocks at 5 posts', () => {
    const usage = makeUsage({ postsGenerated: 5 })
    expect(checkPostLimit(usage)).toBe(false)
  })

  it('blocks over 5 posts', () => {
    const usage = makeUsage({ postsGenerated: 7 })
    expect(checkPostLimit(usage)).toBe(false)
  })

  it('resets when month changes', () => {
    const usage = makeUsage({ month: '2026-03', postsGenerated: 5 })
    expect(checkPostLimit(usage)).toBe(true)
  })

  it('pro plan always allowed', () => {
    const usage = makeUsage({ plan: 'pro', postsGenerated: 100 })
    expect(checkPostLimit(usage)).toBe(true)
  })

  it('blocks free plan at exactly the limit', () => {
    const usage = makeUsage({ postsGenerated: LIMITS.free.postsPerMonth })
    expect(checkPostLimit(usage)).toBe(false)
  })
})

describe('checkBriefLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows briefs when under limit', () => {
    const usage = makeUsage({ briefsToday: 1 })
    expect(checkBriefLimit(usage)).toBe(true)
  })

  it('blocks at 2 briefs', () => {
    const usage = makeUsage({ briefsToday: 2 })
    expect(checkBriefLimit(usage)).toBe(false)
  })

  it('blocks over 2 briefs', () => {
    const usage = makeUsage({ briefsToday: 5 })
    expect(checkBriefLimit(usage)).toBe(false)
  })

  it('resets when day changes', () => {
    const usage = makeUsage({ today: '2026-04-08', briefsToday: 2 })
    expect(checkBriefLimit(usage)).toBe(true)
  })

  it('pro plan always allowed', () => {
    const usage = makeUsage({ plan: 'pro', briefsToday: 50 })
    expect(checkBriefLimit(usage)).toBe(true)
  })

  it('allows 0 briefs used', () => {
    const usage = makeUsage({ briefsToday: 0 })
    expect(checkBriefLimit(usage)).toBe(true)
  })

  it('allows exactly 1 brief (under 2 limit)', () => {
    const usage = makeUsage({ briefsToday: 1 })
    expect(checkBriefLimit(usage)).toBe(true)
  })
})
