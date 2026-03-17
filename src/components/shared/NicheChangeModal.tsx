'use client'

interface NicheChangeModalProps {
  oldNiche: string
  newNiche: string
  onRefreshNow: () => void
  onSchedule: () => void
}

export default function NicheChangeModal({
  oldNiche,
  newNiche,
  onRefreshNow,
  onSchedule,
}: NicheChangeModalProps) {
  return (
    <div className="modal-overlay">
      <div
        className="fade-in"
        style={{
          width: 300,
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: 20,
          }}
        >
          ↻
        </div>

        <h3 style={{ color: 'var(--text0)', fontSize: 16, fontWeight: 600 }}>
          Niche updated
        </h3>

        <p style={{ color: 'var(--text1)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
          Your research brief is set up for your previous niche. Generate a new brief now?
        </p>

        <div
          className="font-mono"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--bg3)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text1)',
            textAlign: 'center',
          }}
        >
          {oldNiche} → {newNiche}
        </div>

        <button
          onClick={onRefreshNow}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--accent)',
            color: '#0f0d0b',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Refresh brief now
          <span style={{ display: 'block', fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>
            Takes ~30 seconds
          </span>
        </button>

        <button
          onClick={onSchedule}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            color: 'var(--text1)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Refresh at next scheduled run
          <span style={{ display: 'block', fontSize: 11, fontWeight: 400, opacity: 0.6, marginTop: 2 }}>
            Tomorrow at 07:00
          </span>
        </button>
      </div>
    </div>
  )
}
