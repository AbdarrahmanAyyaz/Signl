'use client'

import type { SourceType } from '@/lib/types'

const SOURCE_STYLES: Record<SourceType, { bg: string; text: string; label: string }> = {
  reddit: { bg: 'rgba(251, 146, 60, 0.12)', text: '#fb923c', label: 'r/' },
  x: { bg: 'rgba(255, 255, 255, 0.06)', text: '#faf6f2', label: 'X' },
  linkedin: { bg: 'rgba(125, 211, 252, 0.12)', text: '#7dd3fc', label: 'in' },
  news: { bg: 'rgba(255, 255, 255, 0.06)', text: '#6e5f56', label: 'news' },
}

export default function SourceBadge({ source }: { source: SourceType }) {
  const style = SOURCE_STYLES[source]
  return (
    <span
      className="font-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 99,
        background: style.bg,
        color: style.text,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}
    >
      {style.label}
    </span>
  )
}
