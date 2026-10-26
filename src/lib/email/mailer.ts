import nodemailer from 'nodemailer'

export type SendVerificationEmailParams = {
  to: string
  code: string
  fullName?: string
}

export async function sendVerificationCodeEmail({
  to,
  code,
  fullName = 'User',
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const user = process.env.GMAIL_USER?.trim()
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Email Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 24px; }
        .badge { display: inline-block; padding: 6px 12px; background: #eff6ff; color: #2563eb; font-weight: 600; font-size: 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 12px 0 6px 0; }
        .subtitle { font-size: 14px; color: #64748b; margin: 0; }
        .code-box { background: #f1f5f9; border: 2px dashed #93c5fd; border-radius: 8px; text-align: center; padding: 20px; margin: 28px 0; }
        .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; margin: 0; }
        .expiry { font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 8px; }
        .instructions { font-size: 14px; line-height: 1.6; color: #475569; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">SISS Security</span>
          <h1 class="title">Verify your email address</h1>
          <p class="subtitle">Small Inventory and Supplier System</p>
        </div>

        <p class="instructions">
          Hello <strong>${escapeHtml(fullName)}</strong>,
        </p>
        <p class="instructions">
          Thank you for registering. Use the 6-digit verification code below to verify your email address and activate your account:
        </p>

        <div class="code-box">
          <p class="code">${escapeHtml(code)}</p>
          <p class="expiry">⏳ Code expires in 10 minutes</p>
        </div>

        <p class="instructions">
          If you did not request this account registration, please disregard this email. Never share this code with anyone.
        </p>

        <div class="footer">
          <p>Small Inventory and Supplier System &bull; Institutional Asset Management</p>
        </div>
      </div>
    </body>
    </html>
  `

  if (!user || !pass) {
    // If SMTP credentials aren't configured yet, log prominently for local testing
    console.warn('\n======================================================')
    console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is not configured in .env.local')
    console.warn(`📩 [DEV EMAIL VERIFICATION]`)
    console.warn(`   Recipient: ${to}`)
    console.warn(`   Verification Code: ${code}`)
    console.warn('======================================================\n')
    return { success: true }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      requireTLS: true,
      auth: {
        user,
        pass,
      },
    })

    await transporter.sendMail({
      from: `"SISS Portal" <${user}>`,
      to,
      subject: `[SISS] Your Verification Code is ${code}`,
      text: `Your SISS verification code is: ${code}. It expires in 10 minutes.`,
      html: htmlContent,
    })

    return { success: true }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email'
    console.error('Error sending verification email via Gmail SMTP:', err)
    return { success: false, error: errorMessage }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

