'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canAccessApplication } from './lib/accountStatus'
import { safeNextPath } from './lib/redirects'
import {
  validateCredentials,
  validateRegistration,
  type CredentialErrors,
  type RegistrationErrors,
} from './lib/validation'
import {
  createAndSendVerificationCode,
  verifyEmailCode,
  resendVerificationCode,
  type VerifyCodeResult,
  type ResendCodeResult,
} from './services/verification'

export type SignInState = {
  error?: string
  fieldErrors?: CredentialErrors
  email?: string
}

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const nextValue = formData.get('next')

  const fieldErrors = validateCredentials(email, password)
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors, email }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return {
      error: 'Sign-in failed. Check your email address and password.',
      email,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status, is_verified')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return {
      error: 'Your account is not set up yet. Contact an administrator.',
      email,
    }
  }

  // Requirement 9: Block unverified users from logging in, and redirect them to the verify page
  if (profile.is_verified === false) {
    await supabase.auth.signOut()
    redirect(`/verify-email?email=${encodeURIComponent(email)}&unverified=true`)
  }

  if (!canAccessApplication(profile.account_status)) {
    redirect('/account-status')
  }

  redirect(safeNextPath(typeof nextValue === 'string' ? nextValue : undefined))
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export type SignUpState = {
  error?: string
  fieldErrors?: RegistrationErrors
  values?: {
    fullName?: string
    email?: string
    schoolId?: string
  }
}

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const schoolId = String(formData.get('schoolId') ?? '').trim()

  const fieldErrors = validateRegistration({
    fullName,
    email,
    password,
    confirmPassword,
    schoolId,
  })

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      values: { fullName, email, schoolId },
    }
  }

  const admin = createAdminClient()

  // 1. Create the user in Supabase Auth (unverified)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // unverified until OTP check
    user_metadata: {
      full_name: fullName,
      school_id: schoolId || null,
    },
  })

  if (authError || !authData.user) {
    const errorMsg =
      authError?.message?.toLowerCase().includes('already') ||
      authError?.message?.toLowerCase().includes('registered')
        ? 'An account with this email address is already registered. Please sign in.'
        : authError?.message ?? 'Account registration failed. Please try again.'

    return {
      error: errorMsg,
      values: { fullName, email, schoolId },
    }
  }

  // 2. Ensure default role is assigned if not already present
  await admin.from('user_roles').insert({
    user_id: authData.user.id,
    role: 'student',
  })

  // 3. Generate 6-digit OTP code, save in database with 10-min expiry, and send via Gmail SMTP
  const mailResult = await createAndSendVerificationCode(authData.user.id, email, fullName)

  if (!mailResult.success) {
    console.error('Failed to send verification code on registration:', mailResult.error)
  }

  // 4. Redirect to the verify-email page
  redirect(`/verify-email?email=${encodeURIComponent(email)}&registered=true`)
}

export type VerifyEmailState = {
  error?: string
  success?: boolean
  requiresNewCode?: boolean
}

export async function verifyEmailAction(
  _previousState: VerifyEmailState,
  formData: FormData
): Promise<VerifyEmailState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const code = String(formData.get('code') ?? '').trim()

  if (!email) {
    return { error: 'Email address is missing. Please start from the registration page.' }
  }

  if (!code || !/^\d{6}$/.test(code)) {
    return { error: 'Please enter a valid 6-digit verification code.' }
  }

  const result: VerifyCodeResult = await verifyEmailCode(email, code)

  if (!result.success) {
    return {
      error: result.error ?? 'Verification failed.',
      requiresNewCode: result.requiresNewCode,
    }
  }

  // Verification succeeded -> redirect to login with success flag
  redirect(`/login?verified=true&email=${encodeURIComponent(email)}`)
}

export async function resendVerificationCodeAction(email: string): Promise<ResendCodeResult> {
  if (!email || !email.trim()) {
    return { success: false, error: 'Email address is required to resend verification code.' }
  }

  return await resendVerificationCode(email.trim())
}
