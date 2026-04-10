import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies before importing the route
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}))

vi.mock('@/lib/storage', () => ({
  getNicheConfig: vi.fn(),
  getActiveNiche: vi.fn(),
  getLatestBrief: vi.fn(),
  saveBrief: vi.fn(),
  getUserUsage: vi.fn(),
  checkBriefLimit: vi.fn(),
  incrementBriefUsage: vi.fn(),
}))

vi.mock('@/lib/ai', () => ({
  runResearch: vi.fn(),
}))

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

import { GET, POST } from '@/app/api/research/route'
import { auth } from '@clerk/nextjs/server'
import * as storage from '@/lib/storage'
import { runResearch } from '@/lib/ai'

const mockAuth = vi.mocked(auth)
const mockGetNicheConfig = vi.mocked(storage.getNicheConfig)
const mockGetActiveNiche = vi.mocked(storage.getActiveNiche)
const mockGetLatestBrief = vi.mocked(storage.getLatestBrief)
const mockCheckBriefLimit = vi.mocked(storage.checkBriefLimit)
const mockGetUserUsage = vi.mocked(storage.getUserUsage)
const mockRunResearch = vi.mocked(runResearch)

function makeNicheConfig() {
  return {
    activeNicheId: 'prod-niche',
    niches: [{
      id: 'prod-niche',
      name: 'Productivity',
      topic: 'productivity systems',
      audience: 'founders',
      voiceExamples: ['test voice'],
      toneDefault: 'contrarian' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }],
  }
}

function makeValidResearchResponse() {
  return JSON.stringify({
    signals: [
      {
        rank: 1,
        title: 'Signal 1',
        summary: 'Summary 1',
        quote: 'Real quote here',
        sources: ['reddit', 'x'],
        strength: 'high',
        engagementNote: '1k upvotes',
      },
      {
        rank: 2,
        title: 'Signal 2',
        summary: 'Summary 2',
        quote: 'Another real quote',
        sources: ['linkedin'],
        strength: 'medium',
        engagementNote: '200 reactions',
      },
    ],
  })
}

describe('GET /api/research', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns null brief when no niche config', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetNicheConfig.mockResolvedValue(null)
    const res = await GET()
    const data = await res.json()
    expect(data.brief).toBeNull()
  })

  it('returns null brief when no active niche', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetActiveNiche.mockReturnValue(null)
    const res = await GET()
    const data = await res.json()
    expect(data.brief).toBeNull()
  })

  it('returns cached brief when available', async () => {
    const mockBrief = { id: 'brief-1', signals: [], nicheId: 'prod-niche' }
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetActiveNiche.mockReturnValue(makeNicheConfig().niches[0])
    mockGetLatestBrief.mockResolvedValue(mockBrief as any)
    const res = await GET()
    const data = await res.json()
    expect(data.brief).toEqual(mockBrief)
  })
})

describe('POST /api/research', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 402 when daily brief limit reached', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 2, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(false)

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(402)
    const data = await res.json()
    expect(data.error).toContain('limit')
  })

  it('returns 400 when no niche configured', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(null)

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when niche not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({ nicheId: 'nonexistent' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns brief on successful research', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockRunResearch.mockResolvedValue({
      text: makeValidResearchResponse(),
      model: 'gemini-2.5-flash',
    })

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.brief).toBeDefined()
    expect(data.brief.signals).toHaveLength(2)
    expect(data.brief.signals[0].title).toBe('Signal 1')
  })

  it('validates signal strength values', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockRunResearch.mockResolvedValue({
      text: JSON.stringify({
        signals: [{
          rank: 1, title: 'Test', summary: 'Test', quote: 'test',
          sources: ['reddit'], strength: 'INVALID', engagementNote: '',
        }],
      }),
      model: 'gemini-2.5-flash',
    })

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const data = await res.json()
    // Invalid strength should default to 'medium'
    expect(data.brief.signals[0].strength).toBe('medium')
  })

  it('filters invalid source types', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockRunResearch.mockResolvedValue({
      text: JSON.stringify({
        signals: [{
          rank: 1, title: 'Test', summary: 'Test', quote: 'test',
          sources: ['reddit', 'invalid_source', 'x'], strength: 'high', engagementNote: '',
        }],
      }),
      model: 'gemini-2.5-flash',
    })

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(data.brief.signals[0].sources).toEqual(['reddit', 'x'])
  })

  it('returns 502 when AI returns unparseable response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({
      plan: 'free', month: '2026-04', postsGenerated: 0,
      today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
    })
    mockCheckBriefLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockRunResearch.mockResolvedValue({
      text: 'Sorry, I cannot help with that.',
      model: 'gemini-2.5-flash',
    })

    const req = new Request('http://localhost/api/research', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(502)
  })
})
