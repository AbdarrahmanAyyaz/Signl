'use client'

import type { SignalStrength } from '@/lib/types'

const HEAT_STYLES: Record<SignalStrength, { bg: string; dot: string; text: string; label: string }> = {
  high: { bg: 'rgba(248, 113, 113, 0.1)', dot: '#f87171', text: '#f87171', label: 'high' },
  medium: { bg: 'rgba(251, 191, 36, 0.1)', dot: '#fbbf24', text: '#fbbf24', label: 'medium' },
  rising: { bg: 'rgba(74, 222, 128, 0.1)', dot: '#4ade80', text: '#4ade80', label: 'rising' },
}

export default function HeatPill({ strength }: { strength: SignalStrength }) {
  const style = HEAT_STYLES[strength]
  return (
    <span
      className="font-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 10px',
        borderRadius: 99,
        background: style.bg,
        color: style.text,
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      <span style={{ color: style.dot, fontSize: 8 }}>●</span>
      {style.label}
    </span>
  )
}
