'use client'

import { useState } from 'react'
import type { Signal, Platform, Tone, GeneratedPost, GenerateStatus, UsageRecord } from '@/lib/types'
import TonePicker from './TonePicker'
import OutputCard from './OutputCard'
import ShortcutsHelp from '../shared/ShortcutsHelp'
import PlanChip from '../shared/PlanChip'

interface GeneratorPanelProps {
  selectedSignal: Signal | null
  platform: Platform
  onPlatformChange: (p: Platform) => void
  tone: Tone
  onToneChange: (t: Tone) => void
  post: GeneratedPost | null
  generateStatus: GenerateStatus
  onGenerate: (direction: string) => void
  postLimitHit?: boolean
  usage?: UsageRecord | null
}

export default function GeneratorPanel({
  selectedSignal,
  platform,
  onPlatformChange,
  tone,
  onToneChange,
  post,
  generateStatus,
  onGenerate,
  postLimitHit,
  usage,
}: GeneratorPanelProps) {
  const [direction, setDirection] = useState('')

  const handleSubmit = () => {
    onGenerate(direction)
    setDirection('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{ flex: 1, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', padding: '16px 24px', overflow: 'hidden', position: 'relative' }}>
      {/* Header: Generate + plan chip + platform toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text0)' }}>Generate</h2>
          <PlanChip usage={usage ?? null} />
        </div>

        <div
          style={{
            display: 'flex',
            background: 'var(--bg2)',
            borderRadius: 99,
            border: '1px solid var(--border)',
            padding: 2,
          }}
        >
          {(['x', 'linkedin'] as Platform[]).map(p => (
            <button
              key={p}
              onClick={() => onPlatformChange(p)}
              style={{
                padding: '5px 14px',
                borderRadius: 99,
                border: 'none',
                fontSize: 12.5,
                fontWeight: 500,
                background: platform === p ? (p === 'x' ? 'var(--bg4)' : 'rgba(125, 211, 252, 0.12)') : 'transparent',
                color: platform === p ? (p === 'x' ? 'var(--text0)' : 'var(--blue)') : 'var(--text2)',
                transition: 'all 0.15s',
              }}
            >
              {p === 'x' ? 'X' : 'LinkedIn'}
            </button>
          ))}
        </div>
      </div>

      {/* Context strip */}
      {selectedSignal && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 12,
            borderLeft: '2px solid var(--accent)',
            background: 'var(--bg2)',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--accent-text)' }}>
            signal #{selectedSignal.rank}
          </span>
          <p style={{ fontSize: 13, color: 'var(--text0)', marginTop: 2, lineHeight: 1.4 }}>
            {selectedSignal.title}
          </p>
        </div>
      )}

      {/* Tone picker */}
      <div style={{ marginBottom: 16 }}>
        <TonePicker selected={tone} onSelect={onToneChange} />
      </div>

      {/* Output area */}
      <OutputCard
        post={post}
        status={generateStatus}
        onRegenerate={handleSubmit}
        postLimitHit={postLimitHit}
      />

      {/* Direction input */}
      {selectedSignal && !postLimitHit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input
            type="text"
            value={direction}
            onChange={e => setDirection(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add direction… shorter, more personal, reference a book…"
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSubmit}
            disabled={generateStatus === 'loading'}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: '#0f0d0b',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              opacity: generateStatus === 'loading' ? 0.5 : 1,
              cursor: generateStatus === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            Generate
          </button>
        </div>
      )}

      {/* Shortcuts help */}
      <ShortcutsHelp />
    </div>
  )
}
