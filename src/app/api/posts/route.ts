import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/storage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nicheId = searchParams.get('nicheId') || undefined
    const posts = getPosts(nicheId)
    return NextResponse.json({ posts })
  } catch (err) {
    console.error('[API] GET /api/posts error:', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
