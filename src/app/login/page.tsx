import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ShieldCheckIcon, CubeIcon } from '@heroicons/react/24/outline'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { canAccessApplication } from '@/features/auth/lib/accountStatus'
import { safeNextPath } from '@/features/auth/lib/redirects'
import { getCurrentUser, getSessionProfile } from '@/features/auth/services/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign in | SISS',
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const next = safeNextPath(typeof params.next === 'string' ? params.next : undefined)
  const user = await getCurrentUser()

  if (user) {
    const profile = await getSessionProfile()
    if (profile) redirect(canAccessApplication(profile.status) ? next : '/account-status')
  }

  return (
    <div className="flex min-h-screen flex-1 bg-white">
      {/* Left Pane - Form matching DCASIS layout */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo / Badge */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 shadow-md">
              <CubeIcon className="h-9 w-9 text-white" aria-hidden="true" />
            </div>
          </div>

          {/* Heading */}
          <div className="py-5 text-center tracking-tight text-gray-900">
            <p className="text-2xl font-bold text-gray-900">Small Inventory and</p>
            <p className="text-2xl font-bold text-blue-600">Supplier System</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Institutional Asset Management
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-base font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Enter your authorized school credentials to access inventory and workflows.
            </p>
          </div>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>

          {/* Footer matching DCASIS */}
          <footer className="mt-10 border-t border-gray-100 pt-6">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                <span>Role-Based Access &amp; Audit Logged</span>
              </div>
              <p className="text-center text-xs leading-5 text-gray-500">
                &copy; {new Date().getFullYear()} School Operations &amp; Property Custodian.
                <br />
                All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Hero Image with Blue Color Wash & Subtle Blur */}
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden bg-blue-950">
        <Image
          priority
          fill
          sizes="50vw"
          alt="Inventory management workspace"
          src="/images/login-hero.jpg"
          className="absolute inset-0 h-full w-full object-cover blur-[1.5px] scale-105"
        />
        {/* Blue color wash with clear visibility of photo */}
        <div className="absolute inset-0 bg-blue-600/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-blue-900/25 to-blue-600/15" />
      </div>
    </div>
  )
}
