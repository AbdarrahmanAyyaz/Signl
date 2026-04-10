import { describe, it, expect } from 'vitest'
import { COPY } from '@/lib/copy'

describe('COPY consistency with LIMITS', () => {
  it('brief limit copy says 2 briefs', () => {
    expect(COPY.limits.briefHit.title).toContain('2')
  })

  it('post limit copy says 5 posts', () => {
    expect(COPY.limits.postHit.title).toContain('5')
  })

  it('plan intro mentions daily brief limit', () => {
    expect(COPY.limits.planIntro.briefs).toContain('tomorrow')
  })

  it('plan intro mentions post limit', () => {
    expect(COPY.limits.planIntro.posts).toContain('5')
  })

  it('upgrade CTA includes price', () => {
    expect(COPY.limits.briefHit.cta).toContain('$19')
  })
})
