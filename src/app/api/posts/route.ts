import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getPosts } from '@/lib/storage'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const nicheId = searchParams.get('nicheId') || undefined
    const posts = await getPosts(nicheId)
    return NextResponse.json({ posts })
  } catch (err) {
    console.error('[API] GET /api/posts error:', err)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
