'use client'

import { useState, useEffect } from 'react'
import type { Niche, Tone, AccountIntelligence, UsageRecord } from '@/lib/types'
import { LIMITS } from '@/lib/constants'
import { COPY } from '@/lib/copy'
import NicheChangeModal from '@/components/shared/NicheChangeModal'

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'contrarian', label: 'Contrarian' },
  { value: 'story', label: 'Personal story' },
  { value: 'hottake', label: 'Hot take' },
  { value: 'question', label: 'Question' },
  { value: 'observation', label: 'Observation' },
]

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [toneDefault, setToneDefault] = useState<Tone>('contrarian')
  const [voiceExamples, setVoiceExamples] = useState<string[]>(['', '', '', '', ''])
  const [xHandle, setXHandle] = useState('')
  const [linkedinHandle, setLinkedinHandle] = useState('')
  const [originalNiche, setOriginalNiche] = useState<Niche | null>(null)
  const [accountIntel, setAccountIntel] = useState<AccountIntelligence | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pendingNicheId, setPendingNicheId] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageRecord | null>(null)
  const [upgradeMessage, setUpgradeMessage] = useState('')
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/niche')
      const data = await res.json()
      if (data.config) {
        const active = data.config.niches.find(
          (n: Niche) => n.id === data.config.activeNicheId
        )
        if (active) {
          setOriginalNiche(active)
          setName(active.name)
          setTopic(active.topic)
          setAudience(active.audience)
          setToneDefault(active.toneDefault)
          setXHandle(active.xHandle || '')
          setLinkedinHandle(active.linkedinHandle || '')
          const voices = [...(active.voiceExamples || [])]
          while (voices.length < 5) voices.push('')
          setVoiceExamples(voices)
        }
      }
      // Fetch account intelligence
      try {
        const intelRes = await fetch('/api/profile')
        const intelData = await intelRes.json()
        if (intelData.intel) setAccountIntel(intelData.intel)
      } catch {
        // Non-fatal
      }
      // Fetch usage
      try {
        const usageRes = await fetch('/api/usage')
        const usageData = await usageRes.json()
        if (usageData.usage) setUsage(usageData.usage)
      } catch {
        // Non-fatal
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: {
            name,
            topic,
            audience,
            voiceExamples: voiceExamples.filter(v => v.trim()),
            toneDefault,
            xHandle: xHandle || undefined,
            linkedinHandle: linkedinHandle || undefined,
          },
          refreshNow: false,
        }),
      })
      const data = await res.json()

      // Check if niche changed
      if (originalNiche && data.nicheId !== originalNiche.id) {
        setPendingNicheId(data.nicheId)
        setShowModal(true)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }

      // Update original niche reference
      if (data.config) {
        const active = data.config.niches.find(
          (n: Niche) => n.id === data.config.activeNicheId
        )
        if (active) setOriginalNiche(active)
      }
    } catch (err) {
      console.error('Save error:', err)
    }
    setSaving(false)
  }

  const handleRefreshNow = async () => {
    setShowModal(false)
    // Trigger research refresh from main page on next visit
    await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nicheId: pendingNicheId }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSchedule = () => {
    setShowModal(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateVoice = (index: number, value: string) => {
    const updated = [...voiceExamples]
    updated[index] = value
    setVoiceExamples(updated)
  }

  const handleUpgradeSubmit = async () => {
    setUpgradeStatus('loading')
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: upgradeMessage }),
      })
      if (res.ok) {
        setUpgradeStatus('sent')
      } else {
        setUpgradeStatus('error')
      }
    } catch {
      setUpgradeStatus('error')
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text0)', marginBottom: 24 }}>
        Settings
      </h1>

      {/* Your plan section */}
      <section id="upgrade" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 16 }}>
          Your plan
        </h2>

        {usage?.plan === 'pro' ? (
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: 'var(--r-pill)',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-text)',
                flexShrink: 0,
              }}
            >
              Pro
            </span>
            <p style={{ fontSize: 12, color: 'var(--text1)' }}>
              Unlimited posts · Daily auto-brief · Everything
            </p>
          </div>
        ) : upgradeStatus === 'sent' ? (
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '28px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, color: 'var(--green)', marginBottom: 10 }}>✓</div>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text0)', marginBottom: 6 }}>
              Request sent
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.6 }}>
              Check your email — you'll hear back within a few hours with
              a payment link to activate Pro.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="font-mono" style={{ fontSize: 12, color: 'var(--text1)' }}>Free</span>
              <span className="font-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text0)', letterSpacing: '-0.02em' }}>
                $19<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text2)' }}>/mo</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div className="font-mono" style={{ fontSize: 12, color: 'var(--text1)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text2)', minWidth: 120, flexShrink: 0 }}>Research briefs</span>
                <span>{LIMITS.free.briefsPerDay} per day</span>
              </div>
              <div className="font-mono" style={{ fontSize: 12, color: 'var(--text1)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text2)', minWidth: 120, flexShrink: 0 }}>Posts</span>
                <span>{LIMITS.free.postsPerMonth} per month</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.6, marginBottom: 12 }}>
              Pro includes unlimited posts, daily auto-briefs at 7am, content calendar,
              Google Calendar sync, and account intelligence — $19/month.
            </p>

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

            <textarea
              placeholder="Anything you'd like me to know? (optional)"
              value={upgradeMessage}
              onChange={e => setUpgradeMessage(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                background: 'var(--bg1)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm)',
                padding: '9px 12px',
                fontSize: 12,
                color: 'var(--text0)',
                resize: 'none',
                marginBottom: 12,
              }}
            />

            <button
              onClick={handleUpgradeSubmit}
              disabled={upgradeStatus === 'loading'}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: 'var(--accent)',
                color: '#0f0d0b',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                fontSize: 13,
                fontWeight: 600,
                opacity: upgradeStatus === 'loading' ? 0.6 : 1,
                cursor: upgradeStatus === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {upgradeStatus === 'loading' ? 'Sending...' : 'Upgrade to Pro — $19/mo →'}
            </button>

            {upgradeStatus === 'error' && (
              <p className="font-mono" style={{ fontSize: 11, color: 'var(--signal-high)', marginTop: 8 }}>
                Something went wrong. Email me directly at hello@opensignl.com
              </p>
            )}
          </div>
        )}
      </section>

      {/* Niche settings */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 16 }}>
          Niche settings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              Niche name
            </label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              Topic
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="personal development, productivity, goal-setting"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              Target audience
            </label>
            <input
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="ambitious 25-35 year olds, solo founders"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              Default tone
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TONE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setToneDefault(opt.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: 12.5,
                    fontWeight: 500,
                    border: toneDefault === opt.value
                      ? '1px solid var(--accent-border)'
                      : '1px solid var(--border)',
                    background: toneDefault === opt.value ? 'var(--accent-soft)' : 'transparent',
                    color: toneDefault === opt.value ? 'var(--accent-text)' : 'var(--text1)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Your accounts */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 4 }}>
          Your accounts
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          Opensignl analyses your public posts to write in continuity with your
          existing content — matching your style, avoiding topics you&apos;ve covered,
          and targeting what your audience responds to.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              X (Twitter) handle
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>@</span>
              <input
                value={xHandle}
                onChange={e => setXHandle(e.target.value.replace('@', '').trim())}
                placeholder="yourhandle"
                style={{ width: '100%', borderRadius: '0 6px 6px 0' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text1)', display: 'block', marginBottom: 6 }}>
              LinkedIn profile slug
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <span style={{ padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>linkedin.com/in/</span>
              <input
                value={linkedinHandle}
                onChange={e => setLinkedinHandle(e.target.value.trim())}
                placeholder="your-name"
                style={{ width: '100%', borderRadius: '0 6px 6px 0' }}
              />
            </div>
          </div>
        </div>

        {accountIntel && (
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            Last analysed: {new Date(accountIntel.scrapedAt).toLocaleDateString()}
            <button
              onClick={() => fetch('/api/profile', { method: 'POST' }).then(() => window.location.reload())}
              style={{
                padding: '4px 12px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 99,
                color: 'var(--text1)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Re-analyse now
            </button>
          </p>
        )}
      </section>

      {/* Voice profile */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)', marginBottom: 4 }}>
          Your voice
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          These sentences teach Opensignl how you write. The more specific and natural, the better your posts will sound.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {voiceExamples.map((v, i) => (
            <input
              key={i}
              value={v}
              onChange={e => updateVoice(i, e.target.value)}
              placeholder={`Voice example ${i + 1}`}
              style={{ width: '100%' }}
            />
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, lineHeight: 1.5 }}>
          The more specific and natural these are, the more the generated posts will sound like you rather than AI.
        </p>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '10px 24px',
          background: 'var(--accent)',
          color: '#0f0d0b',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save settings'}
      </button>

      {showModal && (
        <NicheChangeModal
          oldNiche={originalNiche?.name || ''}
          newNiche={name}
          onRefreshNow={handleRefreshNow}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  )
}
