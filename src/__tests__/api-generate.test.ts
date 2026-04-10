import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}))

vi.mock('@/lib/storage', () => ({
  getNicheConfig: vi.fn(),
  getActiveNiche: vi.fn(),
  getAccountIntelligence: vi.fn(),
  savePost: vi.fn(),
  getUserUsage: vi.fn(),
  checkPostLimit: vi.fn(),
  incrementPostUsage: vi.fn(),
}))

vi.mock('@/lib/ai', () => ({
  runGenerate: vi.fn(),
}))

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-gen',
}))

import { POST } from '@/app/api/generate/route'
import { auth } from '@clerk/nextjs/server'
import * as storage from '@/lib/storage'
import { runGenerate } from '@/lib/ai'

const mockAuth = vi.mocked(auth)
const mockCheckPostLimit = vi.mocked(storage.checkPostLimit)
const mockGetUserUsage = vi.mocked(storage.getUserUsage)
const mockGetNicheConfig = vi.mocked(storage.getNicheConfig)
const mockGetAccountIntelligence = vi.mocked(storage.getAccountIntelligence)
const mockRunGenerate = vi.mocked(runGenerate)

function makeUsage() {
  return {
    plan: 'free' as const, month: '2026-04', postsGenerated: 0,
    today: '2026-04-09', briefsToday: 0, hasSeenPlanIntro: false,
  }
}

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

function makeGenerateRequest(overrides = {}) {
  return {
    signalId: 'sig-1',
    signalTitle: 'Test Signal',
    signalSummary: 'Test summary',
    signalQuote: 'Test quote',
    platform: 'x',
    tone: 'contrarian',
    nicheId: 'prod-niche',
    ...overrides,
  }
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await POST(makeRequest(makeGenerateRequest()))
    expect(res.status).toBe(401)
  })

  it('returns 402 when monthly post limit reached', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue({ ...makeUsage(), postsGenerated: 5 })
    mockCheckPostLimit.mockReturnValue(false)

    const res = await POST(makeRequest(makeGenerateRequest()))
    expect(res.status).toBe(402)
    const data = await res.json()
    expect(data.error).toContain('limit')
  })

  it('returns 400 when missing required fields', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)

    const res = await POST(makeRequest({ tone: 'contrarian' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when no niche configured', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(null)

    const res = await POST(makeRequest(makeGenerateRequest()))
    expect(res.status).toBe(400)
  })

  it('generates post successfully for X', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetAccountIntelligence.mockResolvedValue(null)
    mockRunGenerate.mockResolvedValue({
      text: JSON.stringify({
        content: 'Generated post content here',
        bestPostingTime: 'Tue-Thu 8am',
        algoChecks: [
          { label: 'hook in line 1', passed: true },
          { label: 'no hashtags', passed: true },
        ],
      }),
      model: 'gemini-2.5-flash',
    })

    const res = await POST(makeRequest(makeGenerateRequest()))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.post.content).toBe('Generated post content here')
    expect(data.post.platform).toBe('x')
    expect(data.post.tone).toBe('contrarian')
    expect(data.post.charCount).toBe('Generated post content here'.length)
    expect(data.post.algoChecks).toHaveLength(2)
  })

  it('generates post successfully for LinkedIn', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetAccountIntelligence.mockResolvedValue(null)
    mockRunGenerate.mockResolvedValue({
      text: JSON.stringify({
        content: 'LinkedIn post content',
        bestPostingTime: 'Wed 12pm',
        algoChecks: [],
      }),
      model: 'claude-sonnet-4-6',
    })

    const res = await POST(makeRequest(makeGenerateRequest({ platform: 'linkedin' })))
    const data = await res.json()
    expect(data.post.platform).toBe('linkedin')
  })

  it('returns 502 when AI returns no content field', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetAccountIntelligence.mockResolvedValue(null)
    mockRunGenerate.mockResolvedValue({
      text: JSON.stringify({ wrong: 'format' }),
      model: 'gemini-2.5-flash',
    })

    const res = await POST(makeRequest(makeGenerateRequest()))
    expect(res.status).toBe(502)
  })

  it('saves post and increments usage on success', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetAccountIntelligence.mockResolvedValue(null)
    mockRunGenerate.mockResolvedValue({
      text: JSON.stringify({
        content: 'Post content',
        bestPostingTime: 'Mon 9am',
        algoChecks: [],
      }),
      model: 'gemini-2.5-flash',
    })

    await POST(makeRequest(makeGenerateRequest()))
    expect(storage.savePost).toHaveBeenCalledOnce()
    expect(storage.incrementPostUsage).toHaveBeenCalledOnce()
  })

  it('includes direction in post when provided', async () => {
    mockAuth.mockResolvedValue({ userId: 'user-1' } as any)
    mockGetUserUsage.mockResolvedValue(makeUsage())
    mockCheckPostLimit.mockReturnValue(true)
    mockGetNicheConfig.mockResolvedValue(makeNicheConfig())
    mockGetAccountIntelligence.mockResolvedValue(null)
    mockRunGenerate.mockResolvedValue({
      text: JSON.stringify({
        content: 'Directed post',
        bestPostingTime: 'Mon 9am',
        algoChecks: [],
      }),
      model: 'gemini-2.5-flash',
    })

    const res = await POST(makeRequest(makeGenerateRequest({ direction: 'be spicy' })))
    const data = await res.json()
    expect(data.post.direction).toBe('be spicy')
  })
})
