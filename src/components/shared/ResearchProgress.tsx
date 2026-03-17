'use client'

import { useState, useEffect } from 'react'

const STAGES = [
  { label: 'Setting up research agent', duration: 2000 },
  { label: 'Scanning Reddit threads', duration: 5000 },
  { label: 'Scanning X (Twitter)', duration: 5000 },
  { label: 'Scanning LinkedIn posts', duration: 5000 },
  { label: 'Reading news & blogs', duration: 4000 },
  { label: 'Ranking signals', duration: 3000 },
  { label: 'Finalizing brief', duration: 6000 },
]

const TOTAL_DURATION = STAGES.reduce((sum, s) => sum + s.duration, 0)

export default function ResearchProgress() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const ms = Date.now() - start
      // Cap at 95% so it never looks "done" before the real response
      setElapsed(Math.min(ms, TOTAL_DURATION * 0.95))
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Find current stage
  let accumulated = 0
  let currentStageIndex = STAGES.length - 1
  for (let i = 0; i < STAGES.length; i++) {
    accumulated += STAGES[i].duration
    if (elapsed < accumulated) {
      currentStageIndex = i
      break
    }
  }

  const percent = Math.min((elapsed / TOTAL_DURATION) * 100, 95)

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: 4,
          background: 'var(--bg3)',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            background: 'var(--accent)',
            borderRadius: 99,
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>

      {/* Stage label */}
      <p className="font-mono" style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>
        {STAGES[currentStageIndex].label}
      </p>

      {/* Stage checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {STAGES.map((stage, i) => {
          const done = i < currentStageIndex
          const active = i === currentStageIndex
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: done ? 'var(--green)' : active ? 'var(--text1)' : 'var(--text3)',
                transition: 'color 0.3s',
              }}
            >
              <span style={{ fontSize: 10, width: 14, textAlign: 'center' }}>
                {done ? '✓' : active ? '●' : '○'}
              </span>
              {stage.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
