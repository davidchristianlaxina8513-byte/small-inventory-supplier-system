'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { signUpAction, type SignUpState } from '../actions'

type RegisterAction = (state: SignUpState, formData: FormData) => Promise<SignUpState>

type RegisterFormProps = {
  action?: RegisterAction
}

export function RegisterForm({ action = signUpAction }: RegisterFormProps) {
  const [state, formAction] = useActionState(action, {})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const fieldErrors = state.fieldErrors

  return (
    <form action={formAction} noValidate className="space-y-4">
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
        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="e.g. Juan Dela Cruz"
            defaultValue={state.values?.fullName ?? ''}
            aria-invalid={fieldErrors?.fullName ? 'true' : undefined}
            aria-describedby={fieldErrors?.fullName ? 'name-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          {fieldErrors?.fullName ? (
            <p id="name-error" className="mt-1 text-xs font-medium text-red-600">
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
          Email address <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="e.g. user@gmail.com"
            defaultValue={state.values?.email ?? ''}
            aria-invalid={fieldErrors?.email ? 'true' : undefined}
            aria-describedby={fieldErrors?.email ? 'email-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          {fieldErrors?.email ? (
            <p id="email-error" className="mt-1 text-xs font-medium text-red-600">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="schoolId" className="block text-sm font-semibold text-gray-900">
          School ID <span className="text-xs font-normal text-gray-500">(Optional)</span>
        </label>
        <div className="mt-1">
          <input
            id="schoolId"
            name="schoolId"
            type="text"
            placeholder="e.g. 2026-10492"
            defaultValue={state.values?.schoolId ?? ''}
            aria-invalid={fieldErrors?.schoolId ? 'true' : undefined}
            aria-describedby={fieldErrors?.schoolId ? 'school-id-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          {fieldErrors?.schoolId ? (
            <p id="school-id-error" className="mt-1 text-xs font-medium text-red-600">
              {fieldErrors.schoolId}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Minimum 6 characters"
            aria-invalid={fieldErrors?.password ? 'true' : undefined}
            aria-describedby={fieldErrors?.password ? 'password-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2 pr-10 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        {fieldErrors?.password ? (
          <p id="password-error" className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            placeholder="Re-type password"
            aria-invalid={fieldErrors?.confirmPassword ? 'true' : undefined}
            aria-describedby={fieldErrors?.confirmPassword ? 'confirm-password-error' : undefined}
            className="block w-full rounded-md bg-white px-3 py-2 pr-10 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-blue-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors?.confirmPassword ? (
          <p id="confirm-password-error" className="mt-1 text-xs font-medium text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>

      <div className="text-center text-sm text-gray-600 pt-2">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in here
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
      className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Creating account...' : 'Create Account'}
    </button>
  )
}

