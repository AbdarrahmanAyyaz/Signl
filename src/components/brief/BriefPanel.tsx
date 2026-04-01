'use client'

import type { Brief, BriefStatus, Signal, AccountIntelligence } from '@/lib/types'
import { COPY } from '@/lib/copy'
import SignalItem from './SignalItem'
import EmptyBrief from './EmptyBrief'
import LoadingSpinner from '../shared/LoadingSpinner'
import ResearchProgress from '../shared/ResearchProgress'

interface BriefPanelProps {
  brief: Brief | null
  status: BriefStatus
  nicheName?: string
  selectedSignal: Signal | null
  onSelectSignal: (signal: Signal) => void
  onRefresh: () => void
  accountIntel?: AccountIntelligence | null
  briefLimitHit?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function BriefPanel({
  brief,
  status,
  nicheName,
  selectedSignal,
  onSelectSignal,
  onRefresh,
  accountIntel,
  briefLimitHit,
}: BriefPanelProps) {
  return (
    <div
      style={{
        width: 300,
        height: '100%',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg1)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text0)' }}>Research brief</h2>
          {status === 'ready' && !briefLimitHit && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'var(--green-soft)',
                color: 'var(--green)',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              <span style={{ fontSize: 6 }}>●</span> live
            </span>
          )}
          {briefLimitHit && (
            <span
              className="font-mono"
              style={{
                padding: '2px 8px',
                borderRadius: 99,
                background: '#f8717115',
                border: '1px solid #f8717130',
                color: 'var(--signal-high)',
                fontSize: 10,
              }}
            >
              limit hit
            </span>
          )}
        </div>
      </div>

      {/* Niche bar */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--text1)' }}>
          {nicheName || 'No niche set'}
        </span>
        {!briefLimitHit && (
          <button
            onClick={onRefresh}
            disabled={status === 'loading'}
            style={{
              padding: '4px 12px',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 99,
              color: 'var(--text1)',
              fontSize: 12,
              fontWeight: 500,
              opacity: status === 'loading' ? 0.5 : 1,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Scanning...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Account intelligence indicator */}
      {accountIntel && (
        <div style={{ padding: '6px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', background: 'var(--bg0)', borderBottom: '1px solid var(--border)' }}>
          {accountIntel.xProfile && (
            <span>X analysed · {accountIntel.xProfile.recentPosts.length} posts</span>
          )}
          {accountIntel.xProfile && accountIntel.linkedinProfile && <span> · </span>}
          {accountIntel.linkedinProfile && (
            <span>LinkedIn analysed · {accountIntel.linkedinProfile.recentPosts.length} posts</span>
          )}
          <span style={{ marginLeft: 8, opacity: 0.6 }}>
            Updated {new Date(accountIntel.scrapedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }}>
        {/* Brief limit hit state */}
        {briefLimitHit && brief && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text0)' }}>
              {COPY.limits.briefHit.title}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              {COPY.limits.briefHit.body}
            </p>
            <a
              href="/app/settings#upgrade"
              style={{
                marginTop: 4,
                padding: '8px 16px',
                background: 'var(--accent)',
                borderRadius: 8,
                color: '#0f0d0b',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {COPY.limits.briefHit.cta}
            </a>
            <button
              onClick={() => {/* Parent can handle switching back to brief view */}}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text2)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {COPY.limits.briefHit.secondary}
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '32px 16px', textAlign: 'center' }}>
            <LoadingSpinner size={24} />
            <p style={{ color: 'var(--text1)', fontSize: 13, fontWeight: 500 }}>Researching your niche</p>
            <ResearchProgress />
          </div>
        )}

        {(status === 'empty' || status === 'idle') && !brief && (
          <EmptyBrief nicheName={nicheName} onRefreshNow={onRefresh} />
        )}

        {status === 'ready' && brief && !briefLimitHit && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {brief.signals.map(signal => (
              <SignalItem
                key={signal.id}
                signal={signal}
                isActive={selectedSignal?.id === signal.id}
                onClick={() => onSelectSignal(signal)}
              />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 16px', textAlign: 'center' }}>
            <p style={{ color: 'var(--signal-high)', fontSize: 13, fontWeight: 500 }}>Failed to load brief</p>
            <p style={{ color: 'var(--text2)', fontSize: 12 }}>Something went wrong. Try refreshing.</p>
            <button
              onClick={onRefresh}
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
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {brief && status === 'ready' && !briefLimitHit && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text2)' }}>
            Updated {timeAgo(brief.refreshedAt)}
          </span>
        </div>
      )}
    </div>
  )
}
