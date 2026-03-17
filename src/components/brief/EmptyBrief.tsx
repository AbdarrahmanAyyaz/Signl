'use client'

interface EmptyBriefProps {
  nicheName?: string
  scheduledTime?: string
  onRefreshNow: () => void
}

export default function EmptyBrief({ nicheName, scheduledTime, onRefreshNow }: EmptyBriefProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--bg3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text2)',
          fontSize: 20,
        }}
      >
        ⏱
      </div>

      {scheduledTime ? (
        <>
          <p style={{ color: 'var(--text1)', fontSize: 14, fontWeight: 500 }}>
            Brief will refresh at {scheduledTime}
          </p>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            New signals for {nicheName || 'your niche'} will appear here
          </p>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text1)', fontSize: 14, fontWeight: 500 }}>
            No research brief yet
          </p>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>
            Run your first research scan to discover signals
          </p>
        </>
      )}

      <button
        onClick={onRefreshNow}
        style={{
          marginTop: 4,
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid var(--accent-border)',
          borderRadius: 99,
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Refresh now instead →
      </button>
    </div>
  )
}
