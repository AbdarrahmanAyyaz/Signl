import { auth } from '@clerk/nextjs/server'
import pool from './db'
import type { NicheConfig, Niche, Brief, GeneratedPost, AccountIntelligence, UsageRecord } from './types'
import { LIMITS } from './constants'

// ---------------------------------------------------------------------------
// Auth helper
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

// ---------------------------------------------------------------------------
// Niche config
// ---------------------------------------------------------------------------

export async function getNicheConfig(): Promise<NicheConfig | null> {
  const userId = await getUserId()
  const result = await pool.query(
    'SELECT * FROM niche_configs WHERE user_id = $1',
    [userId]
  )
  if (!result.rows[0]) return null
  return {
    activeNicheId: result.rows[0].active_niche_id,
    niches: result.rows[0].niches,
  }
}

export async function saveNicheConfig(config: NicheConfig): Promise<void> {
  const userId = await getUserId()
  await pool.query(`
    INSERT INTO niche_configs (user_id, active_niche_id, niches, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET active_niche_id = $2, niches = $3, updated_at = NOW()
  `, [userId, config.activeNicheId, JSON.stringify(config.niches)])
}

export function getActiveNiche(config: NicheConfig): Niche | null {
  return config.niches.find(n => n.id === config.activeNicheId) ?? null
}

// ---------------------------------------------------------------------------
// Briefs
// ---------------------------------------------------------------------------

export async function getLatestBrief(nicheId: string): Promise<Brief | null> {
  const userId = await getUserId()
  const result = await pool.query(`
    SELECT * FROM briefs
    WHERE user_id = $1 AND niche_id = $2
    ORDER BY refreshed_at DESC
    LIMIT 1
  `, [userId, nicheId])
  if (!result.rows[0]) return null
  const row = result.rows[0]
  return {
    id: row.id,
    nicheId: row.niche_id,
    nicheName: row.niche_name,
    signals: row.signals,
    generatedAt: row.generated_at,
    refreshedAt: row.refreshed_at,
  }
}

export async function saveBrief(brief: Brief): Promise<void> {
  const userId = await getUserId()
  await pool.query(`
    INSERT INTO briefs (id, user_id, niche_id, niche_name, signals, generated_at, refreshed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO UPDATE
    SET signals = $5, refreshed_at = $7
  `, [
    brief.id, userId, brief.nicheId, brief.nicheName,
    JSON.stringify(brief.signals),
    brief.generatedAt, brief.refreshedAt,
  ])
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function getPosts(nicheId?: string): Promise<GeneratedPost[]> {
  const userId = await getUserId()
  const result = nicheId
    ? await pool.query(
        'SELECT * FROM posts WHERE user_id = $1 AND niche_id = $2 ORDER BY created_at DESC',
        [userId, nicheId]
      )
    : await pool.query(
        'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      )
  return result.rows.map(row => ({
    id: row.id,
    nicheId: row.niche_id,
    signalId: row.signal_id,
    signalTitle: row.signal_title,
    platform: row.platform,
    tone: row.tone,
    content: row.content,
    charCount: row.char_count,
    algoChecks: row.algo_checks,
    bestPostingTime: row.best_posting_time,
    direction: row.direction,
    createdAt: row.created_at,
  }))
}

export async function savePost(post: GeneratedPost): Promise<void> {
  const userId = await getUserId()
  await pool.query(`
    INSERT INTO posts (
      id, user_id, niche_id, signal_id, signal_title,
      platform, tone, content, char_count, algo_checks,
      best_posting_time, direction, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
  `, [
    post.id, userId, post.nicheId, post.signalId, post.signalTitle,
    post.platform, post.tone, post.content, post.charCount,
    JSON.stringify(post.algoChecks), post.bestPostingTime,
    post.direction ?? null, post.createdAt,
  ])
}

// ---------------------------------------------------------------------------
// Usage tracking
// ---------------------------------------------------------------------------

export async function getUserUsage(): Promise<UsageRecord> {
  const userId = await getUserId()
  const currentMonth = getCurrentMonth()
  const today = getToday()

  const result = await pool.query(
    'SELECT * FROM usage WHERE user_id = $1',
    [userId]
  )

  if (!result.rows[0]) {
    const usage: UsageRecord = {
      plan: 'free',
      month: currentMonth,
      postsGenerated: 0,
      today,
      briefsToday: 0,
      hasSeenPlanIntro: false,
    }
    await pool.query(`
      INSERT INTO usage (user_id, plan, month, posts_generated, today, briefs_today, has_seen_plan_intro, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [userId, usage.plan, usage.month, usage.postsGenerated, usage.today, usage.briefsToday, usage.hasSeenPlanIntro])
    return usage
  }

  const row = result.rows[0]
  const usage: UsageRecord = {
    plan: row.plan,
    month: row.month,
    postsGenerated: row.posts_generated,
    today: row.today,
    briefsToday: row.briefs_today,
    hasSeenPlanIntro: row.has_seen_plan_intro,
  }

  let changed = false

  // Reset post count on new month
  if (usage.month !== currentMonth) {
    usage.month = currentMonth
    usage.postsGenerated = 0
    changed = true
  }

  // Reset brief count on new day
  if (usage.today !== today) {
    usage.today = today
    usage.briefsToday = 0
    changed = true
  }

  if (changed) {
    await saveUserUsage(usage)
  }

  return usage
}

export async function saveUserUsage(usage: UsageRecord): Promise<void> {
  const userId = await getUserId()
  await pool.query(`
    INSERT INTO usage (
      user_id, plan, month, posts_generated,
      today, briefs_today, has_seen_plan_intro, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET plan=$2, month=$3, posts_generated=$4,
        today=$5, briefs_today=$6, has_seen_plan_intro=$7, updated_at=NOW()
  `, [
    userId, usage.plan, usage.month, usage.postsGenerated,
    usage.today, usage.briefsToday, usage.hasSeenPlanIntro,
  ])
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
  const userId = await getUserId()
  const currentMonth = getCurrentMonth()
  await pool.query(`
    UPDATE usage
    SET posts_generated = CASE WHEN month = $2 THEN posts_generated + 1 ELSE 1 END,
        month = $2,
        updated_at = NOW()
    WHERE user_id = $1
  `, [userId, currentMonth])
}

export async function incrementBriefUsage(): Promise<void> {
  const userId = await getUserId()
  const today = getToday()
  await pool.query(`
    UPDATE usage
    SET briefs_today = CASE WHEN today = $2 THEN briefs_today + 1 ELSE 1 END,
        today = $2,
        updated_at = NOW()
    WHERE user_id = $1
  `, [userId, today])
}

// ---------------------------------------------------------------------------
// Account intelligence
// ---------------------------------------------------------------------------

export async function getAccountIntelligence(nicheId: string): Promise<AccountIntelligence | null> {
  const userId = await getUserId()
  const result = await pool.query(
    'SELECT * FROM account_intelligence WHERE user_id = $1 AND niche_id = $2',
    [userId, nicheId]
  )
  if (!result.rows[0]) return null
  return {
    nicheId: result.rows[0].niche_id,
    ...result.rows[0].data,
    scrapedAt: result.rows[0].scraped_at,
  }
}

export async function saveAccountIntelligence(intel: AccountIntelligence): Promise<void> {
  const userId = await getUserId()
  const { nicheId, scrapedAt, ...data } = intel
  await pool.query(`
    INSERT INTO account_intelligence (user_id, niche_id, data, scraped_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) DO UPDATE
    SET niche_id = $2, data = $3, scraped_at = $4
  `, [userId, nicheId, JSON.stringify(data), scrapedAt])
}
