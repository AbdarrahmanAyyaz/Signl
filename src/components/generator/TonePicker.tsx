'use client'

import type { Tone } from '@/lib/types'

const TONE_LABELS: Record<Tone, string> = {
  contrarian: 'Contrarian',
  story: 'Personal story',
  hottake: 'Hot take',
  question: 'Question',
  observation: 'Observation',
}

const ALL_TONES: Tone[] = ['contrarian', 'story', 'hottake', 'question', 'observation']

interface TonePickerProps {
  selected: Tone
  onSelect: (tone: Tone) => void
}

export default function TonePicker({ selected, onSelect }: TonePickerProps) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ALL_TONES.map(tone => {
        const isActive = selected === tone
        return (
          <button
            key={tone}
            onClick={() => onSelect(tone)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 500,
              border: isActive ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text1)',
              transition: 'all 0.15s',
            }}
          >
            {TONE_LABELS[tone]}
          </button>
        )
      })}
    </div>
  )
}
