'use client'

import { useState } from 'react'
import type { UsageRecord } from '@/lib/types'
import { LIMITS } from '@/lib/constants'

interface PlanChipProps {
  usage: UsageRecord | null
}

export default function PlanChip({ usage }: PlanChipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!usage) return null

  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  const briefsHit = usage.plan === 'free' && usage.today === today && usage.briefsToday >= LIMITS.free.briefsPerDay
  const postsHit = usage.plan === 'free' && usage.month === currentMonth && usage.postsGenerated >= LIMITS.free.postsPerMonth
  const anyHit = briefsHit || postsHit

  if (usage.plan === 'pro') {
    return (
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 'var(--r-pill)',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-border)',
          color: 'var(--accent-text)',
        }}
      >
        Pro
      </span>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <a
        href="/app/settings#upgrade"
        className="font-mono"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 'var(--r-pill)',
          background: anyHit ? '#f8717115' : 'var(--accent-soft)',
          border: `1px solid ${anyHit ? '#f8717130' : 'var(--accent-border)'}`,
          color: anyHit ? 'var(--signal-high)' : 'var(--accent-text)',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        {postsHit && briefsHit ? 'Limits reached' : postsHit ? 'Post limit' : briefsHit ? 'Brief limit' : 'Free ↑'}
      </a>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            padding: '12px 14px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--r-sm)',
            zIndex: 50,
            minWidth: 160,
          }}
        >
          <p className="font-mono" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text0)', marginBottom: 8 }}>
            Free plan
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: briefsHit ? 'var(--signal-high)' : 'var(--text1)', marginBottom: 4 }}>
            {LIMITS.free.briefsPerDay} briefs / day
          </p>
          <p className="font-mono" style={{ fontSize: 11, color: postsHit ? 'var(--signal-high)' : 'var(--text1)', marginBottom: 10 }}>
            {LIMITS.free.postsPerMonth} posts / month
          </p>
          <a
            href="/app/settings#upgrade"
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--accent-text)', textDecoration: 'none' }}
          >
            Upgrade → $19/mo
          </a>
        </div>
      )}
    </div>
  )
}
