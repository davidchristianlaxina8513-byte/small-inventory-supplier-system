import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
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
    <main className="grid min-h-screen place-items-center py-12">
      <Container className="max-w-md space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">SISS</p>
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm leading-6 text-slate-600">
            Use the school account provided by your inventory administrator.
          </p>
        </header>
        <div className="rounded-control border border-muted bg-surface p-6 shadow-sm">
          <LoginForm next={next} />
        </div>
      </Container>
    </main>
  )
}
