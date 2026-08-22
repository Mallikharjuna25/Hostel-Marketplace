import nodemailer from 'nodemailer'

interface SendOtpOptions {
  to: string
  otp: string
  fullName?: string
}

export function createMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendOtpEmail({
  to,
  otp,
  fullName,
}: SendOtpOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const transporter = createMailTransporter()
    const fromAddress =
      process.env.SMTP_FROM ||
      `"Hostel Marketplace" <${process.env.SMTP_USER || 'no-reply@campus.in'}>`

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #E5E2DD; padding: 36px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #E8602C; letter-spacing: -0.5px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 700; color: #1A1A2E; margin-bottom: 8px; }
          .subtitle { font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 24px; }
          .otp-box { background: #FFF8F3; border: 2px dashed #E8602C; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E8602C; }
          .otp-expiry { font-size: 12px; color: #9C5838; margin-top: 8px; font-weight: 600; }
          .footer { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 32px; border-top: 1px solid #F0EDE8; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ HOSTEL MARKETPLACE</div>
          <h1 class="title">Verify Your Email Address</h1>
          <p class="subtitle">Hello ${fullName || 'Student'}, use the 6-digit verification code below to verify your account and join the campus marketplace.</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ Valid for 10 minutes. Do not share this code.</div>
          </div>

          <p style="font-size: 13px; color: #4B5563; line-height: 1.5;">
            If you did not request this verification code, please ignore this email.
          </p>

          <div class="footer">
            Campus Peer-to-Peer Hostel Marketplace · Secure & Verified Student Network
          </div>
        </div>
      </body>
    </html>
    `

    if (!transporter) {
      console.warn(
        `[SMTP Notice] SMTP_USER and SMTP_PASS are not set in .env. Live OTP generated for ${to}: ${otp}`
      )
      return {
        success: false,
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env',
      }
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Your Verification Code is ${otp} — Hostel Marketplace`,
      text: `Your Hostel Marketplace verification code is: ${otp}. Valid for 10 minutes.`,
      html: htmlContent,
    })

    console.log(`[SMTP Success] Email sent successfully to ${to}, MessageID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    console.error('[SMTP Error] Failed to send email:', err)
    return { success: false, error: err.message || 'SMTP delivery failed' }
  }
}
