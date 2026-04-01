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
  xHandle?: string          // without @ — e.g. "abdarrahmanayyaz"
  linkedinHandle?: string   // profile slug — e.g. "abdarrahman-ayyaz"
  createdAt: string
  updatedAt: string
}

export interface AccountIntelligence {
  nicheId: string
  xProfile?: {
    handle: string
    recentPosts: {
      content: string
      replies: number
      reposts: number
      likes: number
      postedAt: string
    }[]
    topTopics: string[]
    writingPatterns: string[]
    topPerformingPost: string
    avgEngagement: number
    topicsToAvoid: string[]
    audienceSignals: string[]
  }
  linkedinProfile?: {
    handle: string
    recentPosts: {
      content: string
      reactions: number
      comments: number
      postedAt: string
    }[]
    topTopics: string[]
    writingPatterns: string[]
    topPerformingPost: string
    avgEngagement: number
    topicsToAvoid: string[]
    audienceSignals: string[]
  }
  scrapedAt: string
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

export interface UsageRecord {
  month: string           // e.g. "2026-03" — for post tracking
  postsGenerated: number
  today: string           // e.g. "2026-03-23" — for brief tracking
  briefsToday: number
  plan: 'free' | 'pro'
  hasSeenPlanIntro: boolean
}
