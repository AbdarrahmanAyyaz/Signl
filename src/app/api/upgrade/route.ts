import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const { message } = await req.json()

    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName ?? ''}`.trim()
      : 'Unknown'

    const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? 'No email'
    const safeMessage = message ? escapeHtml(message) : ''

    const resend = getResend()

    // Send both emails in parallel
    await Promise.all([
      // Email to YOU — upgrade notification
      resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: process.env.UPGRADE_NOTIFICATION_EMAIL!,
        subject: `Pro upgrade request — ${userName}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; padding: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 18px;">New Pro upgrade request</h2>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Name</td>
                <td style="padding: 8px 0; font-weight: 500;">${escapeHtml(userName)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email</td>
                <td style="padding: 8px 0; font-weight: 500;">
                  <a href="mailto:${escapeHtml(userEmail)}">${escapeHtml(userEmail)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">User ID</td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">${escapeHtml(userId)}</td>
              </tr>
              ${safeMessage ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td>
                <td style="padding: 8px 0;">${safeMessage}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
                <strong>Next steps:</strong>
              </p>
              <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.8;">
                <li>Reply to ${escapeHtml(userEmail)} with a payment link</li>
                <li>Once paid, run: <code>UPDATE usage SET plan='pro' WHERE user_id='${escapeHtml(userId)}'</code></li>
                <li>Reply to confirm access</li>
              </ol>
            </div>

            <p style="margin-top: 16px; font-size: 12px; color: #999;">
              Sent from Opensignl
            </p>
          </div>
        `,
      }),

      // Confirmation email to the USER
      resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: userEmail,
        subject: 'Your Opensignl Pro request',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 18px;">Got your request</h2>
            <p style="color: #555; line-height: 1.6;">
              Hi ${escapeHtml(user?.firstName ?? 'there')},
            </p>
            <p style="color: #555; line-height: 1.6;">
              I'll send you a payment link within a few hours. Once you're set up
              on Pro you'll get unlimited posts, daily auto-briefs, and everything
              else straight away.
            </p>
            <p style="color: #555; line-height: 1.6;">
              If you have any questions just reply to this email.
            </p>
            <p style="color: #555; line-height: 1.6; margin-top: 24px;">
              — Abdarrahman<br>
              <span style="color: #999; font-size: 13px;">Opensignl</span>
            </p>
          </div>
        `,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upgrade email error:', error)
    return NextResponse.json(
      { error: 'Failed to send upgrade request' },
      { status: 500 }
    )
  }
}
