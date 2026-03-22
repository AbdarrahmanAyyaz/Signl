'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Brief, BriefStatus, Signal, Platform, Tone, GeneratedPost, GenerateStatus, Niche, AccountIntelligence } from '@/lib/types'
import BriefPanel from '@/components/brief/BriefPanel'
import GeneratorPanel from '@/components/generator/GeneratorPanel'

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
  }, [router])

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

  if (!checked) return null

  return (
    <>
      <BriefPanel
        brief={brief}
        status={briefStatus}
        nicheName={niche?.name}
        selectedSignal={selectedSignal}
        onSelectSignal={setSelectedSignal}
        onRefresh={handleRefresh}
        accountIntel={accountIntel}
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
