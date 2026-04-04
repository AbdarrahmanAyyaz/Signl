import { kv } from '@vercel/kv'
import { auth } from '@clerk/nextjs/server'
import type {
  NicheConfig, Niche, Brief, GeneratedPost,
  UsageRecord, AccountIntelligence,
} from './types'
import { LIMITS } from './constants'

// ---------------------------------------------------------------------------
// Auth + key helpers
// ---------------------------------------------------------------------------

async function getUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  return userId
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

const keys = {
  nicheConfig: (uid: string) => `user:${uid}:niche-config`,
  latestBrief: (uid: string, nicheId: string) => `user:${uid}:brief:${nicheId}`,
  post: (uid: string, postId: string) => `user:${uid}:post:${postId}`,
  postList: (uid: string) => `user:${uid}:posts`,
  usage: (uid: string) => `user:${uid}:usage`,
  intelligence: (uid: string, nicheId: string) => `user:${uid}:intel:${nicheId}`,
}

// ---------------------------------------------------------------------------
// Niche config
// ---------------------------------------------------------------------------

export async function getNicheConfig(): Promise<NicheConfig | null> {
  const userId = await getUserId()
  return await kv.get<NicheConfig>(keys.nicheConfig(userId))
}

export async function saveNicheConfig(config: NicheConfig): Promise<void> {
  const userId = await getUserId()
  await kv.set(keys.nicheConfig(userId), config)
}

export function getActiveNiche(config: NicheConfig): Niche | null {
  return config.niches.find(n => n.id === config.activeNicheId) ?? null
}

// ---------------------------------------------------------------------------
// Briefs
// ---------------------------------------------------------------------------

export async function getLatestBrief(nicheId: string): Promise<Brief | null> {
  const userId = await getUserId()
  return await kv.get<Brief>(keys.latestBrief(userId, nicheId))
}

export async function saveBrief(brief: Brief): Promise<void> {
  const userId = await getUserId()
  await kv.set(keys.latestBrief(userId, brief.nicheId), brief)
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function savePost(post: GeneratedPost): Promise<void> {
  const userId = await getUserId()
  await kv.set(keys.post(userId, post.id), post)
  await kv.lpush(keys.postList(userId), post.id)
  await kv.ltrim(keys.postList(userId), 0, 199)
}

export async function getPosts(nicheId?: string): Promise<GeneratedPost[]> {
  const userId = await getUserId()
  const postIds = await kv.lrange<string>(keys.postList(userId), 0, 99)
  if (!postIds.length) return []
  const posts = await Promise.all(
    postIds.map(id => kv.get<GeneratedPost>(keys.post(userId, id)))
  )
  const valid = posts.filter((p): p is GeneratedPost => p !== null)
  return nicheId ? valid.filter(p => p.nicheId === nicheId) : valid
}

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

export async function getUserUsage(): Promise<UsageRecord> {
  const userId = await getUserId()
  const today = getToday()
  const month = getCurrentMonth()

  const existing = await kv.get<UsageRecord>(keys.usage(userId))

  if (!existing) {
    const usage: UsageRecord = {
      plan: 'free',
      month,
      postsGenerated: 0,
      today,
      briefsToday: 0,
      hasSeenPlanIntro: false,
    }
    await kv.set(keys.usage(userId), usage)
    return usage
  }

  let changed = false

  if (existing.month !== month) {
    existing.month = month
    existing.postsGenerated = 0
    changed = true
  }

  if (existing.today !== today) {
    existing.today = today
    existing.briefsToday = 0
    changed = true
  }

  if (changed) {
    await kv.set(keys.usage(userId), existing)
  }

  return existing
}

export async function saveUserUsage(usage: UsageRecord): Promise<void> {
  const userId = await getUserId()
  await kv.set(keys.usage(userId), usage)
}

// --- Limit checking ---

export function checkPostLimit(usage: UsageRecord): boolean {
  if (usage.plan === 'pro') return true
  const currentMonth = getCurrentMonth()
  if (usage.month !== currentMonth) return true
  return usage.postsGenerated < LIMITS.free.postsPerMonth
}

export function checkBriefLimit(usage: UsageRecord): boolean {
  if (usage.plan === 'pro') return true
  const today = getToday()
  if (usage.today !== today) return true
  return usage.briefsToday < LIMITS.free.briefsPerDay
}

// --- Atomic increments ---

export async function incrementPostUsage(): Promise<void> {
  const usage = await getUserUsage()
  const currentMonth = getCurrentMonth()
  usage.month = currentMonth
  usage.postsGenerated = usage.month === currentMonth
    ? usage.postsGenerated + 1
    : 1
  await saveUserUsage(usage)
}

export async function incrementBriefUsage(): Promise<void> {
  const usage = await getUserUsage()
  const today = getToday()
  usage.briefsToday = usage.today === today
    ? usage.briefsToday + 1
    : 1
  usage.today = today
  await saveUserUsage(usage)
}

// ---------------------------------------------------------------------------
// Account intelligence
// ---------------------------------------------------------------------------

export async function getAccountIntelligence(nicheId: string): Promise<AccountIntelligence | null> {
  const userId = await getUserId()
  return await kv.get<AccountIntelligence>(keys.intelligence(userId, nicheId))
}

export async function saveAccountIntelligence(intel: AccountIntelligence): Promise<void> {
  const userId = await getUserId()
  await kv.set(keys.intelligence(userId, intel.nicheId), intel)
}
