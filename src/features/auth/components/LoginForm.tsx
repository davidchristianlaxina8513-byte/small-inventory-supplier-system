'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/common/Button'
import { signInAction, type SignInState } from '../actions'

type LoginAction = (state: SignInState, formData: FormData) => Promise<SignInState>

type LoginFormProps = {
  next?: string
  action?: LoginAction
}

export function LoginForm({ next, action = signInAction }: LoginFormProps) {
  const [state, formAction] = useActionState(action, {})
  const emailError = state.fieldErrors?.email
  const passwordError = state.fieldErrors?.password

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email ?? ''}
          aria-invalid={emailError ? 'true' : undefined}
          aria-describedby={emailError ? 'email-error' : undefined}
          className="h-11 w-full rounded-control border border-muted bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        {emailError ? (
          <p id="email-error" className="text-sm text-red-700">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={passwordError ? 'true' : undefined}
          aria-describedby={passwordError ? 'password-error' : undefined}
          className="h-11 w-full rounded-control border border-muted bg-surface px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        {passwordError ? (
          <p id="password-error" className="text-sm text-red-700">
            {passwordError}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="next" value={next ?? ''} />
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="large" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  )
}
