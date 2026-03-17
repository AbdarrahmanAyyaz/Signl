'use client'

import type { Signal } from '@/lib/types'
import SourceBadge from '../shared/SourceBadge'
import HeatPill from '../shared/HeatPill'

interface SignalItemProps {
  signal: Signal
  isActive: boolean
  onClick: () => void
}

export default function SignalItem({ signal, isActive, onClick }: SignalItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        background: isActive ? 'var(--bg2)' : 'transparent',
        border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <span
          className="font-mono"
          style={{ color: 'var(--text2)', fontSize: 11, fontWeight: 500, flexShrink: 0, marginTop: 2 }}
        >
          {signal.rank}
        </span>
        <span style={{ flex: 1, color: 'var(--text0)', fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>
          {signal.title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 22 }}>
        {signal.sources.map(source => (
          <SourceBadge key={source} source={source} />
        ))}
        <HeatPill strength={signal.strength} />
      </div>

      {isActive && (
        <div
          className="fade-in"
          style={{ marginTop: 12, marginLeft: 22, paddingLeft: 12, borderLeft: '2px solid var(--accent)' }}
        >
          <p style={{ color: 'var(--text1)', fontSize: 12.5, lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{signal.quote}&rdquo;
          </p>
          <p className="font-mono" style={{ color: 'var(--text2)', fontSize: 11, marginTop: 6 }}>
            {signal.engagementNote}
          </p>
        </div>
      )}
    </button>
  )
}
