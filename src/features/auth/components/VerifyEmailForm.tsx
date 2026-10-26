'use client'

import { useActionState, useState, useEffect, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  verifyEmailAction,
  resendVerificationCodeAction,
} from '../actions'

type VerifyEmailFormProps = {
  initialEmail?: string
  isRegistered?: boolean
  isUnverifiedPrompt?: boolean
}

export function VerifyEmailForm({
  initialEmail = '',
  isRegistered = false,
  isUnverifiedPrompt = false,
}: VerifyEmailFormProps) {
  const [state, formAction] = useActionState(verifyEmailAction, {})
  const [email, setEmail] = useState(initialEmail)
  const [cooldown, setCooldown] = useState(isRegistered ? 60 : 0)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isResending, startResendTransition] = useTransition()

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = () => {
    if (cooldown > 0 || isResending || !email.trim()) return

    setResendMessage(null)
    setResendError(null)

    startResendTransition(async () => {
      const res = await resendVerificationCodeAction(email)
      if (res.success) {
        setResendMessage(res.message ?? 'New verification code sent!')
        setCooldown(60)
      } else {
        setResendError(res.error ?? 'Failed to resend code.')
        if (res.secondsRemaining) {
          setCooldown(res.secondsRemaining)
        }
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Informational banners */}
      {/* {isRegistered && !state.error && !resendMessage ? (
        <div className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900">
          <EnvelopeIcon className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold">Check your inbox</p>
            <p className="mt-0.5 text-blue-800">
              We sent a 6-digit verification code to <strong>{email}</strong>. It is valid for 10 minutes.
            </p>
          </div>
        </div>
      ) : null} */}

      {isUnverifiedPrompt && !state.error ? (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Email verification required</p>
            <p className="mt-0.5 text-amber-800">
              Your account is unverified. Please enter the verification code sent to your email to activate it.
            </p>
          </div>
        </div>
      ) : null}

      {resendMessage ? (
        <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
          <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <span>{resendMessage}</span>
        </div>
      ) : null}

      {resendError ? (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3.5 text-xs text-red-900">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <span>{resendError}</span>
        </div>
      ) : null}

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3.5 text-xs text-red-900"
        >
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Registered Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@gmail.com"
            className="mt-1 block w-full rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 outline outline-1 -outline-offset-1 outline-gray-300 focus:bg-white focus:outline-2 focus:outline-blue-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="code" className="block text-sm font-bold text-gray-900">
              6-Digit Verification Code
            </label>
            <span className="text-xs text-gray-500">10m expiry &bull; 5 attempts max</span>
          </div>

          <div className="mt-1.5">
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              pattern="[0-9]{6}"
              className="block w-full text-center tracking-[0.5em] font-mono text-2xl font-extrabold rounded-md bg-white px-3 py-3 text-blue-700 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
            />
          </div>
        </div>

        <div className="pt-2">
          <SubmitVerifyButton />
        </div>
      </form>

      {/* Resend Code Section with 60-Second Cooldown */}
      <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-500">Didn&apos;t receive the code or need a new one?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending || !email.trim()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isResending ? (
            <>
              <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
              <span>Sending code...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <span>Resend Code ({cooldown}s)</span>
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Resend Code</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 pt-1">
        Back to{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign In
        </Link>
      </div>
    </div>
  )
}

function SubmitVerifyButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Verifying Code...' : 'Verify & Activate Account'}
    </button>
  )
}
