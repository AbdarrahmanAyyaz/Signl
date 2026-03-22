import fs from 'fs'
import path from 'path'
import { auth } from '@clerk/nextjs/server'
import type { NicheConfig, Niche, Brief, GeneratedPost, AccountIntelligence } from './types'

const DATA_DIR = path.join(process.cwd(), 'data', 'users')

interface UsageRecord {
  month: string
  postsGenerated: number
  briefsGenerated: number
  plan: 'free' | 'pro'
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function getUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  return userId
}

async function getUserDir(): Promise<string> {
  const userId = await getUserId()
  const dir = path.join(DATA_DIR, userId)
  ensureDir(dir)
  return dir
}

// --- Usage tracking ---

export async function getUserUsage(): Promise<UsageRecord> {
  try {
    const userDir = await getUserDir()
    const usagePath = path.join(userDir, 'usage.json')
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    if (!fs.existsSync(usagePath)) {
      const defaultUsage: UsageRecord = {
        month: currentMonth,
        postsGenerated: 0,
        briefsGenerated: 0,
        plan: 'free',
      }
      return defaultUsage
    }

    const raw = fs.readFileSync(usagePath, 'utf-8')
    const usage = JSON.parse(raw) as UsageRecord

    // Reset counts if it's a new month
    if (usage.month !== currentMonth) {
      usage.month = currentMonth
      usage.postsGenerated = 0
      usage.briefsGenerated = 0
      fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2), 'utf-8')
    }

    return usage
  } catch {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return {
      month: currentMonth,
      postsGenerated: 0,
      briefsGenerated: 0,
      plan: 'free',
    }
  }
}

export async function incrementUsage(field: 'postsGenerated' | 'briefsGenerated'): Promise<void> {
  const userDir = await getUserDir()
  const usagePath = path.join(userDir, 'usage.json')
  const usage = await getUserUsage()
  usage[field] += 1
  fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2), 'utf-8')
}

// --- Niche config ---

export async function getNicheConfig(): Promise<NicheConfig | null> {
  try {
    const userDir = await getUserDir()
    const configPath = path.join(userDir, 'niche-config.json')
    if (!fs.existsSync(configPath)) return null
    const raw = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as NicheConfig
  } catch {
    return null
  }
}

export async function saveNicheConfig(config: NicheConfig): Promise<void> {
  const userDir = await getUserDir()
  const configPath = path.join(userDir, 'niche-config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

export function getActiveNiche(config: NicheConfig): Niche | null {
  return config.niches.find(n => n.id === config.activeNicheId) ?? null
}

// --- Briefs ---

export async function getLatestBrief(nicheId: string): Promise<Brief | null> {
  try {
    const userDir = await getUserDir()
    const nicheDir = path.join(userDir, 'briefs', nicheId)
    if (!fs.existsSync(nicheDir)) return null

    const files = fs.readdirSync(nicheDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()

    if (files.length === 0) return null

    const raw = fs.readFileSync(path.join(nicheDir, files[0]), 'utf-8')
    return JSON.parse(raw) as Brief
  } catch {
    return null
  }
}

export async function saveBrief(brief: Brief): Promise<void> {
  const userDir = await getUserDir()
  const nicheDir = path.join(userDir, 'briefs', brief.nicheId)
  ensureDir(nicheDir)
  // Sanitize ISO timestamp for safe filenames (replace colons with dashes)
  const safeTimestamp = brief.generatedAt.replace(/:/g, '-')
  const filename = `${safeTimestamp}.json`
  fs.writeFileSync(path.join(nicheDir, filename), JSON.stringify(brief, null, 2), 'utf-8')
}

// --- Posts ---

export async function getPosts(nicheId?: string): Promise<GeneratedPost[]> {
  try {
    const userDir = await getUserDir()
    const postsDir = path.join(userDir, 'posts')
    ensureDir(postsDir)
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'))

    const posts: GeneratedPost[] = files.map(f => {
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
      return JSON.parse(raw) as GeneratedPost
    })

    const filtered = nicheId ? posts.filter(p => p.nicheId === nicheId) : posts
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export async function savePost(post: GeneratedPost): Promise<void> {
  const userDir = await getUserDir()
  const postsDir = path.join(userDir, 'posts')
  ensureDir(postsDir)
  const filename = `${post.id}.json`
  fs.writeFileSync(path.join(postsDir, filename), JSON.stringify(post, null, 2), 'utf-8')
}

// --- Account intelligence ---

export async function getAccountIntelligence(nicheId: string): Promise<AccountIntelligence | null> {
  try {
    const userDir = await getUserDir()
    const filePath = path.join(userDir, 'intelligence', `${nicheId}.json`)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

export async function saveAccountIntelligence(intel: AccountIntelligence): Promise<void> {
  const userDir = await getUserDir()
  const intelDir = path.join(userDir, 'intelligence')
  ensureDir(intelDir)
  const filePath = path.join(intelDir, `${intel.nicheId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(intel, null, 2))
}
