'use client'

import type { AlgoCheck } from '@/lib/types'

export default function AlgoAudit({ checks }: { checks: AlgoCheck[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {checks.map((check, i) => (
        <span
          key={i}
          className="font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 99,
            background: check.passed ? 'var(--green-soft)' : 'rgba(248, 113, 113, 0.08)',
            fontSize: 11,
            fontWeight: 500,
            color: check.passed ? 'var(--green)' : '#f87171',
          }}
        >
          <span style={{ fontSize: 7 }}>●</span>
          {check.label}
        </span>
      ))}
    </div>
  )
}
