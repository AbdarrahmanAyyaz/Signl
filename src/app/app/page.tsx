'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Brief, BriefStatus, Signal, Platform, Tone, GeneratedPost, GenerateStatus, Niche, AccountIntelligence, UsageRecord } from '@/lib/types'
import BriefPanel from '@/components/brief/BriefPanel'
import GeneratorPanel from '@/components/generator/GeneratorPanel'
import PlanIntroCard from '@/components/shared/PlanIntroCard'

const TONE_KEYS: Record<string, Tone> = {
  '1': 'contrarian',
  '2': 'story',
  '3': 'hottake',
  '4': 'question',
  '5': 'observation',
}

export default function Home() {
  const router = useRouter()
  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefStatus, setBriefStatus] = useState<BriefStatus>('idle')
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [platform, setPlatform] = useState<Platform>('x')
  const [tone, setTone] = useState<Tone>('contrarian')
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>('idle')
  const [niche, setNiche] = useState<Niche | null>(null)
  const [accountIntel, setAccountIntel] = useState<AccountIntelligence | null>(null)
  const [checked, setChecked] = useState(false)
  const [usage, setUsage] = useState<UsageRecord | null>(null)
  const [postLimitHit, setPostLimitHit] = useState(false)
  const [briefLimitHit, setBriefLimitHit] = useState(false)
  const [showPlanIntro, setShowPlanIntro] = useState(false)

  // Load niche config + latest brief on mount
  useEffect(() => {
    async function init() {
      try {
        const nicheRes = await fetch('/api/niche')
        const nicheData = await nicheRes.json()

        if (!nicheData.config) {
          router.push('/onboarding')
          return
        }

        const activeNiche = nicheData.config.niches.find(
          (n: Niche) => n.id === nicheData.config.activeNicheId
        )
        setNiche(activeNiche || null)
        if (activeNiche) setTone(activeNiche.toneDefault)

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

        const briefRes = await fetch('/api/research')
        const briefData = await briefRes.json()

        if (briefData.brief) {
          setBrief(briefData.brief)
          setBriefStatus('ready')

          // Auto-select first signal
          if (briefData.brief.signals?.length > 0) {
            setSelectedSignal(briefData.brief.signals[0])
          }
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
  }, [router])

  // Show plan intro after first brief loads for new users
  useEffect(() => {
    if (usage && !usage.hasSeenPlanIntro && briefStatus === 'ready' && brief) {
      setShowPlanIntro(true)
    }
  }, [usage, briefStatus, brief])

  const handleRefresh = useCallback(async () => {
    setBriefStatus('loading')
    setSelectedSignal(null)
    setPost(null)
    setGenerateStatus('idle')
    setBriefLimitHit(false)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicheId: niche?.id }),
      })

      if (res.status === 402) {
        setBriefLimitHit(true)
        setBriefStatus('ready')
        return
      }

      const data = await res.json()
      if (data.brief) {
        setBrief(data.brief)
        setBriefStatus('ready')
        // Auto-select first signal
        if (data.brief.signals?.length > 0) {
          setSelectedSignal(data.brief.signals[0])
        }
        // Refresh usage counts
        try {
          const usageRes = await fetch('/api/usage')
          const usageData = await usageRes.json()
          if (usageData.usage) setUsage(usageData.usage)
        } catch { /* non-fatal */ }
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
    setPostLimitHit(false)
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

      if (res.status === 402) {
        setPostLimitHit(true)
        setGenerateStatus('idle')
        return
      }

      const data = await res.json()
      if (data.post) {
        setPost(data.post)
        setGenerateStatus('ready')
        // Refresh usage counts
        try {
          const usageRes = await fetch('/api/usage')
          const usageData = await usageRes.json()
          if (usageData.usage) setUsage(usageData.usage)
        } catch { /* non-fatal */ }
      } else {
        setGenerateStatus('error')
      }
    } catch {
      setGenerateStatus('error')
    }
  }, [selectedSignal, niche, platform, tone])

  const handleCopyPost = useCallback(async () => {
    if (!post) return
    await navigator.clipboard.writeText(post.content)
  }, [post])

  const handleDismissPlanIntro = useCallback(async () => {
    setShowPlanIntro(false)
    try {
      await fetch('/api/usage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenPlanIntro: true }),
      })
      if (usage) setUsage({ ...usage, hasSeenPlanIntro: true })
    } catch { /* non-fatal */ }
  }, [usage])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return

      const key = e.key
      if ((key === 'g' || key === 'G') && selectedSignal) {
        handleGenerate('')
      } else if ((key === 'r' || key === 'R') && post) {
        handleGenerate('')
      } else if ((key === 'c' || key === 'C') && post) {
        handleCopyPost()
      } else if (key in TONE_KEYS) {
        setTone(TONE_KEYS[key])
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedSignal, post, handleGenerate, handleCopyPost])

  if (!checked) return null

  return (
    <>
      <div style={{ position: 'relative' }}>
        <BriefPanel
          brief={brief}
          status={briefStatus}
          nicheName={niche?.name}
          selectedSignal={selectedSignal}
          onSelectSignal={setSelectedSignal}
          onRefresh={handleRefresh}
          accountIntel={accountIntel}
          briefLimitHit={briefLimitHit}
        />

        {/* Plan intro card — overlays the brief panel */}
        {showPlanIntro && (
          <PlanIntroCard
            onUpgrade={() => {
              handleDismissPlanIntro()
              router.push('/app/settings#upgrade')
            }}
            onDismiss={handleDismissPlanIntro}
          />
        )}
      </div>

      <GeneratorPanel
        selectedSignal={selectedSignal}
        platform={platform}
        onPlatformChange={setPlatform}
        tone={tone}
        onToneChange={setTone}
        post={post}
        generateStatus={generateStatus}
        onGenerate={handleGenerate}
        postLimitHit={postLimitHit}
        usage={usage}
      />
    </>
  )
}
