import Link from 'next/link'
import type { ReactNode } from 'react'
import { Container } from '@/components/layout/Container'
import { SignOutForm } from '@/features/auth/components/SignOutForm'
import { roleLabel } from '@/features/auth/lib/roles'
import { requireActiveUser } from '@/features/auth/services/session'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireActiveUser()
  const isAdmin = profile.roles.some(({ role }) => role === 'admin')
  const roleSummary =
    profile.roles.map(({ role }) => roleLabel(role)).join(', ') || 'No role assigned'

  return (
    <div className="min-h-screen">
      <header className="border-b border-muted bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              SISS
            </Link>
            <nav aria-label="Main">
              <ul className="flex items-center gap-4 text-sm font-medium">
                <li>
                  <Link href="/dashboard" className="hover:text-primary">
                    Dashboard
                  </Link>
                </li>
                {isAdmin ? (
                  <li>
                    <Link href="/admin/users" className="hover:text-primary">
                      Users
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium">{profile.fullName}</p>
              <p className="text-slate-600">{roleSummary}</p>
            </div>
            <SignOutForm />
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  )
}
