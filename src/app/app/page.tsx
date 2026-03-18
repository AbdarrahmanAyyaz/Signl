'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Brief, BriefStatus, Signal, Platform, Tone, GeneratedPost, GenerateStatus, Niche } from '@/lib/types'
import BriefPanel from '@/components/brief/BriefPanel'
import GeneratorPanel from '@/components/generator/GeneratorPanel'
import ResearchProgress from '@/components/shared/ResearchProgress'

// Onboarding modal for first-time setup
function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [voice, setVoice] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name || !topic || !audience) return
    setSaving(true)
    try {
      await fetch('/api/niche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: {
            name,
            topic,
            audience,
            voiceExamples: voice ? [voice] : [],
            toneDefault: 'contrarian',
          },
          refreshNow: true,
        }),
      })
      onComplete()
    } catch (err) {
      console.error('Onboarding error:', err)
      setSaving(false)
    }
  }

  if (saving) {
    return (
      <div className="modal-overlay">
        <div
          className="fade-in"
          style={{
            width: 420,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #fb923c, #ea580c)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            S
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text0)' }}>Setting up Opensignl</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>
            Running your first research scan. This takes 15-30 seconds.
          </p>
          <div style={{ width: '100%', marginTop: 4 }}>
            <ResearchProgress />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div
        className="fade-in"
        style={{
          width: 420,
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #fb923c, #ea580c)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: "'Geist Mono', monospace",
              marginBottom: 12,
            }}
          >
            S
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text0)' }}>Welcome to Opensignl</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            Let&apos;s set up your research brief. Takes 60 seconds.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Niche name (e.g. Self-improvement · founders)"
            style={{ width: '100%' }}
          />
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic (e.g. personal development, productivity)"
            style={{ width: '100%' }}
          />
          <input
            value={audience}
            onChange={e => setAudience(e.target.value)}
            placeholder="Target audience (e.g. ambitious 25-35 year olds)"
            style={{ width: '100%' }}
          />

          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            Add 1-2 sentences in your writing style (you can add more in Settings)
          </p>
          <input
            value={voice}
            onChange={e => setVoice(e.target.value)}
            placeholder="e.g. Most people don't have a discipline problem. They have a clarity problem."
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name || !topic || !audience}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: (!name || !topic || !audience) ? 'var(--bg3)' : 'var(--accent)',
            color: (!name || !topic || !audience) ? 'var(--text2)' : '#0f0d0b',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            marginTop: 4,
          }}
        >
          Set up Opensignl →
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefStatus, setBriefStatus] = useState<BriefStatus>('idle')
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [platform, setPlatform] = useState<Platform>('x')
  const [tone, setTone] = useState<Tone>('contrarian')
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>('idle')
  const [niche, setNiche] = useState<Niche | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checked, setChecked] = useState(false)

  // Load niche config + latest brief on mount
  useEffect(() => {
    async function init() {
      try {
        const nicheRes = await fetch('/api/niche')
        const nicheData = await nicheRes.json()

        if (!nicheData.config) {
          setShowOnboarding(true)
          setChecked(true)
          return
        }

        const activeNiche = nicheData.config.niches.find(
          (n: Niche) => n.id === nicheData.config.activeNicheId
        )
        setNiche(activeNiche || null)
        if (activeNiche) setTone(activeNiche.toneDefault)

        const briefRes = await fetch('/api/research')
        const briefData = await briefRes.json()

        if (briefData.brief) {
          setBrief(briefData.brief)
          setBriefStatus('ready')
        } else {
          setBriefStatus('empty')
        }
      } catch (err) {
        console.error('Init error:', err)
        setBriefStatus('error')
      }
      setChecked(true)
    }
    init()
  }, [])

  const handleRefresh = useCallback(async () => {
    setBriefStatus('loading')
    setSelectedSignal(null)
    setPost(null)
    setGenerateStatus('idle')
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicheId: niche?.id }),
      })
      const data = await res.json()
      if (data.brief) {
        setBrief(data.brief)
        setBriefStatus('ready')
      } else {
        setBriefStatus('error')
      }
    } catch {
      setBriefStatus('error')
    }
  }, [niche?.id])

  const handleGenerate = useCallback(async (direction: string) => {
    if (!selectedSignal || !niche) return
    setGenerateStatus('loading')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signalId: selectedSignal.id,
          signalTitle: selectedSignal.title,
          signalSummary: selectedSignal.summary,
          signalQuote: selectedSignal.quote,
          platform,
          tone,
          direction: direction || undefined,
          nicheId: niche.id,
        }),
      })
      const data = await res.json()
      if (data.post) {
        setPost(data.post)
        setGenerateStatus('ready')
      } else {
        setGenerateStatus('error')
      }
    } catch {
      setGenerateStatus('error')
    }
  }, [selectedSignal, niche, platform, tone])

  const handleOnboardingComplete = useCallback(async () => {
    setShowOnboarding(false)
    // Re-fetch niche config
    const nicheRes = await fetch('/api/niche')
    const nicheData = await nicheRes.json()
    if (nicheData.config) {
      const activeNiche = nicheData.config.niches.find(
        (n: Niche) => n.id === nicheData.config.activeNicheId
      )
      setNiche(activeNiche || null)
      if (activeNiche) setTone(activeNiche.toneDefault)
    }
    // Run first research
    handleRefresh()
  }, [handleRefresh])

  if (!checked) return null

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <BriefPanel
        brief={brief}
        status={briefStatus}
        nicheName={niche?.name}
        selectedSignal={selectedSignal}
        onSelectSignal={setSelectedSignal}
        onRefresh={handleRefresh}
      />
      <GeneratorPanel
        selectedSignal={selectedSignal}
        platform={platform}
        onPlatformChange={setPlatform}
        tone={tone}
        onToneChange={setTone}
        post={post}
        generateStatus={generateStatus}
        onGenerate={handleGenerate}
      />
    </>
  )
}
