'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { signInAction, type SignInState } from '../actions'

type LoginAction = (state: SignInState, formData: FormData) => Promise<SignInState>

type LoginFormProps = {
  next?: string
  initialEmail?: string
  verified?: boolean
  action?: LoginAction
}

export function LoginForm({
  next,
  initialEmail = '',
  verified = false,
  action = signInAction,
}: LoginFormProps) {
  const [state, formAction] = useActionState(action, {})
  const [showPassword, setShowPassword] = useState(false)
  const emailError = state.fieldErrors?.email
  const passwordError = state.fieldErrors?.password

  return (
    <form action={formAction} noValidate className="space-y-6">
      {verified && !state.error ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-semibold">Email verified successfully!</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Your account is active. Please enter your password to sign in.
            </p>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
            Email address
          </label>
        </div>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="e.g. admin@school.edu"
            defaultValue={state.email ?? initialEmail}
            aria-invalid={emailError ? 'true' : undefined}
            aria-describedby={emailError ? 'email-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          {emailError ? (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600">
              {emailError}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
            Password
          </label>
        </div>
        <div className="mt-2 flex">
          <div className="-mr-px grid grow grid-cols-1 focus-within:relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              aria-invalid={passwordError ? 'true' : undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className="block w-full rounded-l-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
            />
          </div>
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            className="flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 hover:bg-gray-50 focus:relative focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </button>
        </div>
        {passwordError ? (
          <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600">
            {passwordError}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="next" value={next ?? ''} />
      <SubmitButton />

      {/* User Creation / Registration Link */}
      <div className="pt-2 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
        >
          Create an account
        </Link>
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}
