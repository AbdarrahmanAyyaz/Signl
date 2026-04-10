import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await GET()
    const data = await res.json()
    expect(data.status).toBe('ok')
  })

  it('returns a valid ISO timestamp', async () => {
    const res = await GET()
    const data = await res.json()
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })

  it('returns 200 status', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
  })
})
