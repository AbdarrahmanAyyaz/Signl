import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserUsage, saveUserUsage } from '@/lib/storage'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const usage = await getUserUsage()
  return NextResponse.json({ usage })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates = await req.json()

  // Only allow safe fields to be patched from the client
  const allowedFields = ['hasSeenPlanIntro'] as const
  const usage = await getUserUsage()

  for (const field of allowedFields) {
    if (field in updates) {
      (usage as unknown as Record<string, unknown>)[field] = updates[field]
    }
  }

  await saveUserUsage(usage)
  return NextResponse.json({ usage })
}
