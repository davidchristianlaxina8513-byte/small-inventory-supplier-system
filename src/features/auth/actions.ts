'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canAccessApplication } from './lib/accountStatus'
import { safeNextPath } from './lib/redirects'
import { validateCredentials, type CredentialErrors } from './lib/validation'

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
    .select('account_status')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return {
      error: 'Your account is not set up yet. Contact an administrator.',
      email,
    }
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
