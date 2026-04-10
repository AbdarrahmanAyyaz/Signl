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
                <li>Once paid, update their plan in Upstash Redis:<br>
                  <code style="display: inline-block; margin-top: 4px; padding: 4px 8px; background: #e8e8e8; border-radius: 4px; font-size: 12px;">SET user:${escapeHtml(userId)}:usage</code><br>
                  <span style="font-size: 12px; color: #888;">Set the "plan" field to "pro"</span>
                </li>
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
        subject: 'Your Opensignl Pro upgrade',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
            <div style="margin-bottom: 32px;">
              <span style="font-size: 20px; font-weight: 700; color: #111;">opensignl</span>
            </div>

            <h2 style="margin: 0 0 16px; font-size: 22px; color: #111; font-weight: 600;">
              You're upgrading to Pro
            </h2>

            <p style="color: #444; line-height: 1.7; font-size: 15px; margin: 0 0 16px;">
              Hi ${escapeHtml(user?.firstName ?? 'there')},
            </p>

            <p style="color: #444; line-height: 1.7; font-size: 15px; margin: 0 0 16px;">
              Thanks for requesting a Pro upgrade. I'll send you a payment link
              within a few hours.
            </p>

            <div style="margin: 24px 0; padding: 20px; background: #fef7f0; border-left: 3px solid #fb923c; border-radius: 0 8px 8px 0;">
              <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #111;">
                What you'll get with Pro:
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #555; line-height: 2;">
                <li>Unlimited post generation</li>
                <li>Unlimited daily research briefs</li>
                <li>Priority support</li>
              </ul>
            </div>

            <p style="color: #444; line-height: 1.7; font-size: 15px; margin: 0 0 16px;">
              Once payment is confirmed, your account will be upgraded immediately.
              If you have any questions, just reply to this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />

            <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0;">
              Abdarrahman &middot; Opensignl<br>
              <a href="https://opensignl.com" style="color: #fb923c; text-decoration: none;">opensignl.com</a>
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
