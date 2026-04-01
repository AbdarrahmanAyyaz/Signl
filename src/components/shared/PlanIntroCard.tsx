'use client'

import { COPY } from '@/lib/copy'
import { LIMITS } from '@/lib/constants'

interface PlanIntroCardProps {
  onUpgrade: () => void
  onDismiss: () => void
}

export default function PlanIntroCard({ onUpgrade, onDismiss }: PlanIntroCardProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 9,
        }}
      />

      {/* Card */}
      <div
        className="fade-in"
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          background: 'var(--bg2)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r)',
          padding: 20,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text0)', marginBottom: 16 }}>
          Your free plan
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>&#9673;</span>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text0)', fontWeight: 500, marginBottom: 2 }}>
                {LIMITS.free.briefsPerDay} research briefs per day
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                {COPY.limits.planIntro.briefs}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0, marginTop: 1 }}>&#9673;</span>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text0)', fontWeight: 500, marginBottom: 2 }}>
                {LIMITS.free.postsPerMonth} posts per month
              </p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                {COPY.limits.planIntro.posts}
              </p>
            </div>
          </div>
        </div>

        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: 'var(--accent-text)',
            fontStyle: 'italic',
            marginBottom: 16,
          }}
        >
          {COPY.limits.planIntro.fomo}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onUpgrade}
            style={{
              flex: 1,
              padding: '9px 16px',
              background: 'var(--accent)',
              color: '#0f0d0b',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upgrade to Pro — $19/mo
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '9px 16px',
              background: 'transparent',
              color: 'var(--text2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Got it →
          </button>
        </div>
      </div>
    </>
  )
}
