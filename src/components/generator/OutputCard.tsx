'use client'

import { useState } from 'react'
import type { GeneratedPost, GenerateStatus } from '@/lib/types'
import { COPY } from '@/lib/copy'
import AlgoAudit from './AlgoAudit'
import LoadingSpinner from '../shared/LoadingSpinner'

interface OutputCardProps {
  post: GeneratedPost | null
  status: GenerateStatus
  onRegenerate: () => void
  postLimitHit?: boolean
}

function getResetDate(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

function getDaysUntilReset(): number {
  const now = new Date()
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function OutputCard({ post, status, onRegenerate, postLimitHit }: OutputCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!post) return
    await navigator.clipboard.writeText(post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  // Post limit hit
  if (postLimitHit) {
    const resetDate = getResetDate()
    const daysLeft = getDaysUntilReset()
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text0)' }}>
          {COPY.limits.postHit.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
          {COPY.limits.postHit.body(resetDate, 23)}
        </p>
        <a
          href="/app/settings#upgrade"
          style={{
            marginTop: 8,
            padding: '10px 20px',
            background: 'var(--accent)',
            borderRadius: 8,
            color: '#0f0d0b',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {COPY.limits.postHit.cta}
        </a>
        <p className="font-mono" style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
          or wait {daysLeft} day{daysLeft !== 1 ? 's' : ''} until your limit resets
        </p>
      </div>
    )
  }

  // Idle — no signal selected
  if (status === 'idle' && !post) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text2)',
          fontSize: 14,
        }}
      >
        Select a signal from the brief to generate a post
      </div>
    )
  }

  // Error state
  if (status === 'error' && !post) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          color: 'var(--text2)',
          fontSize: 14,
        }}
      >
        <p style={{ color: 'var(--signal-high)', fontSize: 13, fontWeight: 500 }}>Generation failed</p>
        <p style={{ color: 'var(--text2)', fontSize: 12 }}>Something went wrong. Try again.</p>
        <button
          onClick={onRegenerate}
          style={{
            marginTop: 4,
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--accent-border)',
            borderRadius: 8,
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Loading overlay */}
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'rgba(15, 13, 11, 0.6)',
            borderRadius: 12,
            zIndex: 5,
          }}
        >
          <LoadingSpinner size={24} />
          <p style={{ color: 'var(--text1)', fontSize: 13 }}>Generating your post...</p>
        </div>
      )}

      {post && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            opacity: status === 'loading' ? 0.3 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {/* Post content */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              background: 'var(--bg2)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.85,
                color: 'var(--text0)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {post.content}
            </p>
          </div>

          {/* Algo checks + best time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
            <AlgoAudit checks={post.algoChecks} />
            {post.bestPostingTime && (
              <span
                className="font-mono"
                style={{
                  marginLeft: 'auto',
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent-text)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {post.bestPostingTime}
              </span>
            )}
          </div>

          {/* Action buttons — Copy and Regenerate at equal prominence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text2)' }}>
                {post.charCount} chars
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  background: copied ? 'var(--green-soft)' : 'var(--accent)',
                  border: copied ? '1px solid #4ade8022' : 'none',
                  borderRadius: 8,
                  color: copied ? 'var(--green)' : '#0f0d0b',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {copied ? 'Copied ✓' : 'Copy post'}
              </button>
              <button
                onClick={onRegenerate}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text1)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Regenerate ↺
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
