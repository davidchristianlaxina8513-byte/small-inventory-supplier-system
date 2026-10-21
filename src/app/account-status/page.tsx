import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { SignOutForm } from '@/features/auth/components/SignOutForm'
import { canAccessApplication, describeAccountStatus } from '@/features/auth/lib/accountStatus'
import { getSessionProfile } from '@/features/auth/services/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Account status | SISS',
}

export default async function AccountStatusPage() {
  const profile = await getSessionProfile()

  if (!profile) redirect('/login')
  if (canAccessApplication(profile.status)) redirect('/dashboard')

  return (
    <main className="grid min-h-screen place-items-center py-12">
      <Container className="max-w-lg space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">SISS</p>
          <h1 className="text-3xl font-bold tracking-tight">Account not active</h1>
        </header>
        <section className="space-y-3 rounded-control border border-muted bg-surface p-6 shadow-sm">
          <p role="status" className="leading-7">
            {describeAccountStatus(profile.status)}
          </p>
          <dl className="grid gap-1 text-sm text-slate-600">
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Account</dt>
              <dd>{profile.fullName}</dd>
            </div>
            {profile.schoolId ? (
              <div className="flex gap-2">
                <dt className="font-medium text-foreground">School ID</dt>
                <dd>{profile.schoolId}</dd>
              </div>
            ) : null}
          </dl>
        </section>
        <SignOutForm />
      </Container>
    </main>
  )
}
