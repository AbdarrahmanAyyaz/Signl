export type Tone = 'contrarian' | 'story' | 'hottake' | 'question' | 'observation'
export type Platform = 'x' | 'linkedin'
export type SignalStrength = 'high' | 'medium' | 'rising'
export type SourceType = 'reddit' | 'x' | 'linkedin' | 'news'
export type BriefStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'
export type GenerateStatus = 'idle' | 'loading' | 'ready' | 'error'
export type NicheChangeStep = 'editing' | 'confirm-refresh' | 'refreshing' | 'scheduled'

export interface Niche {
  id: string
  name: string
  topic: string
  audience: string
  voiceExamples: string[]
  toneDefault: Tone
  createdAt: string
  updatedAt: string
}

export interface NicheConfig {
  activeNicheId: string
  niches: Niche[]
}

export interface Signal {
  id: string
  rank: number
  title: string
  summary: string
  quote: string
  sources: SourceType[]
  strength: SignalStrength
  engagementNote: string
}

export interface Brief {
  id: string
  nicheId: string
  nicheName: string
  signals: Signal[]
  generatedAt: string
  refreshedAt: string
}

export interface AlgoCheck {
  label: string
  passed: boolean
}

export interface GeneratedPost {
  id: string
  nicheId: string
  signalId: string
  signalTitle: string
  platform: Platform
  tone: Tone
  content: string
  charCount: number
  algoChecks: AlgoCheck[]
  bestPostingTime: string
  direction?: string
  createdAt: string
}

export interface GenerateRequest {
  signalId: string
  signalTitle: string
  signalSummary: string
  signalQuote: string
  platform: Platform
  tone: Tone
  direction?: string
  nicheId: string
}
