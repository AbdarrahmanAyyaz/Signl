import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WAITLIST_PATH = path.join(process.cwd(), 'data', 'waitlist.json')

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Load existing
    let list: { email: string; joinedAt: string }[] = []
    if (fs.existsSync(WAITLIST_PATH)) {
      list = JSON.parse(fs.readFileSync(WAITLIST_PATH, 'utf-8'))
    }

    // Deduplicate
    if (list.some(e => e.email === email)) {
      return NextResponse.json({ message: 'Already on the list', count: list.length })
    }

    list.push({ email, joinedAt: new Date().toISOString() })
    ensureDir(WAITLIST_PATH)
    fs.writeFileSync(WAITLIST_PATH, JSON.stringify(list, null, 2))

    return NextResponse.json({ message: 'Added to waitlist', count: list.length })
  } catch {
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(WAITLIST_PATH)) return NextResponse.json({ count: 0 })
    const list = JSON.parse(fs.readFileSync(WAITLIST_PATH, 'utf-8'))
    return NextResponse.json({ count: list.length })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
