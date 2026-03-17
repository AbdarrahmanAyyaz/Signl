'use client'

import { useState, useEffect } from 'react'
import type { GeneratedPost, Platform } from '@/lib/types'

const PLATFORM_BADGE: Record<Platform, { bg: string; color: string; label: string }> = {
  x: { bg: 'rgba(255,255,255,0.06)', color: '#faf6f2', label: 'X' },
  linkedin: { bg: 'rgba(125,211,252,0.12)', color: '#7dd3fc', label: 'LinkedIn' },
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<GeneratedPost[]>([])
  const [filter, setFilter] = useState<'all' | Platform>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/posts')
      const data = await res.json()
      if (data.posts) setPosts(data.posts)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? posts : posts.filter(p => p.platform === filter)

  const handleCopy = async (post: GeneratedPost) => {
    await navigator.clipboard.writeText(post.content)
    setCopiedId(post.id)
    setTimeout(() => setCopiedId(null), 1600)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text0)', marginBottom: 20 }}>
        Post history
      </h1>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['all', 'x', 'linkedin'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: 12.5,
              fontWeight: 500,
              border: filter === f ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              background: filter === f ? 'var(--accent-soft)' : 'transparent',
              color: filter === f ? 'var(--accent-text)' : 'var(--text1)',
            }}
          >
            {f === 'all' ? 'All' : f === 'x' ? 'X' : 'LinkedIn'}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 && (
        <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>
          No posts yet. Generate your first post from the brief.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(post => {
          const badge = PLATFORM_BADGE[post.platform]
          const isExpanded = expandedId === post.id
          const date = new Date(post.createdAt)

          return (
            <div
              key={post.id}
              style={{
                padding: '16px 18px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  className="font-mono"
                  style={{
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: badge.bg,
                    color: badge.color,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {badge.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-text)',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {post.tone}
                </span>
                <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text2)' }}>
                  {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Signal */}
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                Signal: {post.signalTitle}
              </p>

              {/* Content */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
                style={{ cursor: 'pointer' }}
              >
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.85,
                    color: 'var(--text0)',
                    whiteSpace: 'pre-wrap',
                    ...(isExpanded
                      ? { overflow: 'visible' }
                      : {
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }),
                  }}
                >
                  {post.content}
                </p>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {post.charCount} chars
                </span>
                <button
                  onClick={() => handleCopy(post)}
                  style={{
                    padding: '5px 14px',
                    background: copiedId === post.id ? 'var(--green-soft)' : 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: copiedId === post.id ? 'var(--green)' : 'var(--text1)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {copiedId === post.id ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
