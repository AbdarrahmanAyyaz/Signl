'use client'

import { useState, useEffect, useRef } from 'react'

const SHORTCUTS = [
  { key: 'G', action: 'Generate' },
  { key: 'R', action: 'Regenerate' },
  { key: 'C', action: 'Copy' },
  { key: '1-5', action: 'Tone' },
]

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'absolute', bottom: 12, right: 12 }}>
      {open && (
        <div
          className="fade-in"
          style={{
            position: 'absolute',
            bottom: 40,
            right: 0,
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--r-sm)',
            padding: '12px 16px',
            minWidth: 140,
          }}
        >
          <p className="font-mono" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text0)', marginBottom: 8 }}>
            Shortcuts
          </p>
          {SHORTCUTS.map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--accent-text)', fontWeight: 500 }}>{s.key}</span>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text2)' }}>{s.action}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        title="Keyboard shortcuts"
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--r-sm)',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          color: 'var(--text2)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        ?
      </button>
    </div>
  )
}
