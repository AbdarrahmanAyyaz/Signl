import fs from 'fs'
import path from 'path'
import type { NicheConfig, Niche, Brief, GeneratedPost } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const NICHE_CONFIG_PATH = path.join(DATA_DIR, 'niche-config.json')
const BRIEFS_DIR = path.join(DATA_DIR, 'briefs')
const POSTS_DIR = path.join(DATA_DIR, 'posts')

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function getNicheConfig(): NicheConfig | null {
  try {
    if (!fs.existsSync(NICHE_CONFIG_PATH)) return null
    const raw = fs.readFileSync(NICHE_CONFIG_PATH, 'utf-8')
    return JSON.parse(raw) as NicheConfig
  } catch {
    return null
  }
}

export function saveNicheConfig(config: NicheConfig): void {
  ensureDir(DATA_DIR)
  fs.writeFileSync(NICHE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export function getActiveNiche(config: NicheConfig): Niche | null {
  return config.niches.find(n => n.id === config.activeNicheId) ?? null
}

export function getLatestBrief(nicheId: string): Brief | null {
  try {
    const nicheDir = path.join(BRIEFS_DIR, nicheId)
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

export function saveBrief(brief: Brief): void {
  const nicheDir = path.join(BRIEFS_DIR, brief.nicheId)
  ensureDir(nicheDir)
  // Sanitize ISO timestamp for safe filenames (replace colons with dashes)
  const safeTimestamp = brief.generatedAt.replace(/:/g, '-')
  const filename = `${safeTimestamp}.json`
  fs.writeFileSync(path.join(nicheDir, filename), JSON.stringify(brief, null, 2), 'utf-8')
}

export function getPosts(nicheId?: string): GeneratedPost[] {
  try {
    ensureDir(POSTS_DIR)
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'))

    const posts: GeneratedPost[] = files.map(f => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')
      return JSON.parse(raw) as GeneratedPost
    })

    const filtered = nicheId ? posts.filter(p => p.nicheId === nicheId) : posts
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export function savePost(post: GeneratedPost): void {
  ensureDir(POSTS_DIR)
  const filename = `${post.id}.json`
  fs.writeFileSync(path.join(POSTS_DIR, filename), JSON.stringify(post, null, 2), 'utf-8')
}
