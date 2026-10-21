import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { roleLabel } from '@/features/auth/lib/roles'
import { requireActiveUser } from '@/features/auth/services/session'

export const metadata: Metadata = {
  title: 'Dashboard | SISS',
}

export default async function DashboardPage() {
  const profile = await requireActiveUser()
  const isAdmin = profile.roles.some(({ role }) => role === 'admin')

  return (
    <Section>
      <Container className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.fullName}</h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            Your account is active. Inventory, requests, and supplier workflows will appear here as
            later phases are implemented.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <section
            aria-labelledby="profile-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm"
          >
            <h2 id="profile-heading" className="text-lg font-semibold">
              Profile
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-slate-600">School ID</dt>
                <dd>{profile.schoolId ?? 'Not recorded'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Office</dt>
                <dd>{profile.officeName ?? 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Account status</dt>
                <dd className="capitalize">{profile.status}</dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="roles-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm"
          >
            <h2 id="roles-heading" className="text-lg font-semibold">
              Roles
            </h2>
            {profile.roles.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm">
                {profile.roles.map(({ role, officeId, officeName }) => (
                  <li key={`${role}-${officeId ?? 'global'}`} className="flex flex-wrap gap-2">
                    <span className="font-medium">{roleLabel(role)}</span>
                    {officeName ? <span className="text-slate-600">— {officeName}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                No role has been assigned yet. Contact an administrator.
              </p>
            )}
          </section>
        </div>

        {isAdmin ? (
          <aside className="rounded-control border border-muted bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Administration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review account status and role assignments for school users.
            </p>
            <Link
              href="/admin/users"
              className="mt-4 inline-flex font-medium text-primary underline-offset-4 hover:underline"
            >
              Manage users
            </Link>
          </aside>
        ) : null}
      </Container>
    </Section>
  )
}
