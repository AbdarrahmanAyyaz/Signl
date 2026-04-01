import { NextResponse } from 'next/server'
import { migrate } from '@/lib/migrate'

export async function POST(req: Request) {
  const { secret } = await req.json()
  if (secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await migrate()
  return NextResponse.json({ success: true })
}
