import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationCodeEmail } from '@/lib/email/mailer'

export const CODE_EXPIRATION_MINUTES = 10
export const MAX_VERIFICATION_ATTEMPTS = 5
export const RESEND_COOLDOWN_SECONDS = 60

export function generate6DigitCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

export function hashVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex')
}

export async function createAndSendVerificationCode(
  userId: string,
  email: string,
  fullName?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  const code = generate6DigitCode()
  const codeHash = hashVerificationCode(code)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + CODE_EXPIRATION_MINUTES * 60 * 1000)

  const { error: dbError } = await admin.from('email_verifications').upsert(
    {
      user_id: userId,
      email: email.toLowerCase().trim(),
      code_hash: codeHash,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
      last_sent_at: now.toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (dbError) {
    console.error('Error storing verification code:', dbError)
    return { success: false, error: 'Failed to record verification code.' }
  }

  const mailResult = await sendVerificationCodeEmail({
    to: email,
    code,
    fullName,
  })

  return mailResult
}

export type VerifyCodeResult = {
  success: boolean
  error?: string
  requiresNewCode?: boolean
}

export async function verifyEmailCode(
  email: string,
  inputCode: string
): Promise<VerifyCodeResult> {
  const admin = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()
  const trimmedCode = inputCode.trim()

  const { data: record, error: fetchError } = await admin
    .from('email_verifications')
    .select('id, user_id, code_hash, attempts, expires_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (fetchError || !record) {
    return {
      success: false,
      error: 'No active verification code found for this email. Please request a new code.',
      requiresNewCode: true,
    }
  }

  // 1. Check max attempts exceeded
  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return {
      success: false,
      error: `Maximum verification attempts (${MAX_VERIFICATION_ATTEMPTS}) exceeded. Please request a new code.`,
      requiresNewCode: true,
    }
  }

  // 2. Check expiration
  const now = new Date()
  const expiresAt = new Date(record.expires_at)
  if (now > expiresAt) {
    return {
      success: false,
      error: 'This verification code has expired (10-minute limit). Please request a new code.',
      requiresNewCode: true,
    }
  }

  // 3. Compare hash
  const inputHash = hashVerificationCode(trimmedCode)
  if (inputHash !== record.code_hash) {
    const nextAttempts = record.attempts + 1
    await admin
      .from('email_verifications')
      .update({ attempts: nextAttempts })
      .eq('id', record.id)

    if (nextAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return {
        success: false,
        error: `Invalid code. You have reached the maximum of ${MAX_VERIFICATION_ATTEMPTS} attempts. Please request a new code.`,
        requiresNewCode: true,
      }
    }

    const remaining = MAX_VERIFICATION_ATTEMPTS - nextAttempts
    return {
      success: false,
      error: `Invalid verification code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    }
  }

  // 4. Code is valid: Mark user verified, set account active, and clean up
  const { error: profileError } = await admin
    .from('profiles')
    .update({
      is_verified: true,
      account_status: 'active',
    })
    .eq('id', record.user_id)

  if (profileError) {
    console.error('Error activating profile:', profileError)
    return { success: false, error: 'Could not activate account. Please contact support.' }
  }

  // Also confirm user email in Supabase auth
  await admin.auth.admin.updateUserById(record.user_id, { email_confirm: true })

  // Delete used verification record (Requirement 10)
  await admin.from('email_verifications').delete().eq('id', record.id)

  return { success: true }
}

export type ResendCodeResult = {
  success: boolean
  error?: string
  secondsRemaining?: number
  message?: string
}

export async function resendVerificationCode(email: string): Promise<ResendCodeResult> {
  const admin = createAdminClient()
  const normalizedEmail = email.toLowerCase().trim()

  const { data: record } = await admin
    .from('email_verifications')
    .select('id, user_id, last_sent_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  let userId = record?.user_id

  if (!record || !userId) {
    // If verification record was cleaned or missing, look up profile
    const { data: profile } = await admin
      .from('profiles')
      .select('id, is_verified, full_name')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!profile) {
      return { success: false, error: 'No account found with this email address.' }
    }

    if (profile.is_verified) {
      return { success: false, error: 'This account is already verified. You may sign in.' }
    }

    userId = profile.id
  } else if (record.last_sent_at) {
    const elapsedSeconds = Math.floor((Date.now() - new Date(record.last_sent_at).getTime()) / 1000)
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const wait = RESEND_COOLDOWN_SECONDS - elapsedSeconds
      return {
        success: false,
        secondsRemaining: wait,
        error: `Please wait ${wait} second${wait === 1 ? '' : 's'} before requesting another code.`,
      }
    }
  }

  // Fetch full name for email
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()

  const sendResult = await createAndSendVerificationCode(
    userId,
    normalizedEmail,
    profile?.full_name ?? undefined
  )

  if (!sendResult.success) {
    return { success: false, error: sendResult.error ?? 'Failed to send verification email.' }
  }

  return { success: true, message: 'A new 6-digit verification code has been sent to your email.' }
}
