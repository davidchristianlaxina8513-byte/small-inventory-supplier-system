import Link from 'next/link'
import type { ReactNode } from 'react'
import { Container } from '@/components/layout/Container'
import { SignOutForm } from '@/features/auth/components/SignOutForm'
import { roleLabel } from '@/features/auth/lib/roles'
import { requireActiveUser } from '@/features/auth/services/session'
import { canViewInventory } from '@/features/inventory/lib/permissions'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireActiveUser()
  const isAdmin = profile.roles.some(({ role }) => role === 'admin')
  const canAccessInventory = canViewInventory(profile)
  const isStaff = profile.roles.some(({ role }) =>
    ['admin', 'office_head', 'office_staff'].includes(role)
  )
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
                {canAccessInventory ? (
                  <li>
                    <Link href="/inventory" className="hover:text-primary">
                      Inventory
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href="/requests" className="hover:text-primary">
                    Requests
                  </Link>
                </li>
                <li>
                  <Link href="/reservations" className="hover:text-primary">
                    Reservations
                  </Link>
                </li>
                <li>
                  <Link href="/borrowings" className="hover:text-primary">
                    Borrowings
                  </Link>
                </li>
                <li>
                  <Link href="/incidents" className="hover:text-primary">
                    Incidents
                  </Link>
                </li>
                <li>
                  <Link href="/notifications" className="hover:text-primary">
                    Notifications
                  </Link>
                </li>
                {isStaff ? (
                  <>
                    <li>
                      <Link href="/assets" className="hover:text-primary">
                        Assets
                      </Link>
                    </li>
                    <li>
                      <Link href="/suppliers" className="hover:text-primary">
                        Suppliers
                      </Link>
                    </li>
                    <li>
                      <Link href="/purchasing" className="hover:text-primary">
                        Purchasing
                      </Link>
                    </li>
                    <li>
                      <Link href="/reports" className="hover:text-primary">
                        Reports
                      </Link>
                    </li>
                  </>
                ) : null}
                {isAdmin ? (
                  <>
                    <li>
                      <Link href="/admin/users" className="hover:text-primary">
                        Users
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/offices" className="hover:text-primary">
                        Offices
                      </Link>
                    </li>
                  </>
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
