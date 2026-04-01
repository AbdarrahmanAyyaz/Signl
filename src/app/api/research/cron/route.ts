import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all Pro users (free users refresh manually)
  const result = await pool.query(
    "SELECT DISTINCT user_id FROM usage WHERE plan = 'pro'"
  )

  const results = []
  for (const row of result.rows) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-user-id': row.user_id,
        },
        body: JSON.stringify({ cronMode: true }),
      })
      results.push({ userId: row.user_id, success: res.ok })
    } catch {
      results.push({ userId: row.user_id, success: false })
    }
  }

  return NextResponse.json({ refreshed: results.length, results })
}
