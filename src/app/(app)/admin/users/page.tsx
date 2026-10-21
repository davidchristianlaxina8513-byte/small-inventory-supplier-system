import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/common/Button'
import { requireAdmin } from '@/features/auth/services/session'
import { APP_ROLES, roleLabel } from '@/features/auth/lib/roles'
import {
  assignRoleAction,
  removeRoleAction,
  setAccountStatusAction,
} from '@/features/admin/actions'
import { getOfficeOptions, getUsersForAdministration } from '@/features/admin/services/users'

export const metadata: Metadata = {
  title: 'Users | SISS',
}

const ERROR_MESSAGES: Record<string, string> = {
  'invalid-request': 'The request was invalid. Review the form and try again.',
  'self-status': 'You cannot change the status of your own account.',
  'self-role': 'You cannot remove your own administrator role.',
  'status-update-failed': 'The account status could not be updated.',
  'role-assignment-failed': 'The role could not be assigned. The user may already have that role.',
  'role-removal-failed': 'The role could not be removed.',
}

type AdminUsersPageProps = {
  searchParams: Promise<{ error?: string | string[] }>
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const admin = await requireAdmin()
  const [params, users, offices] = await Promise.all([
    searchParams,
    getUsersForAdministration(),
    getOfficeOptions(),
  ])

  const errorCode = typeof params.error === 'string' ? params.error : undefined
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : undefined

  return (
    <Section>
      <Container className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight">User accounts</h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            Approve or suspend accounts and assign roles. Role changes take effect on the
            user&apos;s next request.
          </p>
        </header>

        {errorMessage ? (
          <p
            role="alert"
            className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-6">
          {users.length === 0 ? (
            <p className="rounded-control border border-muted bg-surface p-6 text-sm text-slate-600">
              No user accounts found.
            </p>
          ) : (
            users.map((user) => {
              const isSelf = user.id === admin.id

              return (
                <article
                  key={user.id}
                  aria-labelledby={`user-${user.id}`}
                  className="rounded-control border border-muted bg-surface p-6 shadow-sm"
                >
                  <header className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 id={`user-${user.id}`} className="text-xl font-semibold">
                        {user.fullName}
                      </h2>
                      <p className="break-words text-sm text-slate-600">
                        {user.email ?? 'No email recorded'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {user.schoolId ? `School ID: ${user.schoolId}` : 'No school ID recorded'}
                        {user.officeName ? ` · ${user.officeName}` : ''}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </header>

                  <div className="mt-6 grid gap-8 lg:grid-cols-2">
                    <section aria-labelledby={`roles-heading-${user.id}`}>
                      <h3
                        id={`roles-heading-${user.id}`}
                        className="text-sm font-semibold uppercase tracking-wide text-slate-600"
                      >
                        Roles
                      </h3>
                      {user.roles.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {user.roles.map((assignment) => (
                            <li
                              key={assignment.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-background px-3 py-2 text-sm"
                            >
                              <span>
                                <span className="font-medium">{roleLabel(assignment.role)}</span>
                                {assignment.officeName ? (
                                  <span className="text-slate-600"> — {assignment.officeName}</span>
                                ) : null}
                              </span>
                              {isSelf && assignment.role === 'admin' ? (
                                <span className="text-xs text-slate-500">
                                  Current administrator
                                </span>
                              ) : (
                                <form action={removeRoleAction}>
                                  <input type="hidden" name="roleId" value={assignment.id} />
                                  <button
                                    type="submit"
                                    className="text-sm font-medium text-red-700 underline-offset-4 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </form>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">No roles assigned.</p>
                      )}

                      <form action={assignRoleAction} className="mt-4 space-y-3">
                        <input type="hidden" name="userId" value={user.id} />
                        <div className="space-y-1.5">
                          <label htmlFor={`role-${user.id}`} className="block text-sm font-medium">
                            Assign role
                          </label>
                          <select
                            id={`role-${user.id}`}
                            name="role"
                            defaultValue="student"
                            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
                          >
                            {APP_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {roleLabel(role)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`office-${user.id}`}
                            className="block text-sm font-medium"
                          >
                            Office (office staff and head roles only)
                          </label>
                          <select
                            id={`office-${user.id}`}
                            name="officeId"
                            defaultValue=""
                            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
                          >
                            <option value="">Select an office</option>
                            {offices.map((office) => (
                              <option key={office.id} value={office.id}>
                                {office.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500">
                            Required when the selected role is {roleLabel('office_staff')} or{' '}
                            {roleLabel('office_head')}.
                          </p>
                        </div>
                        <Button type="submit">Assign role</Button>
                      </form>
                    </section>

                    <section aria-labelledby={`status-heading-${user.id}`}>
                      <h3
                        id={`status-heading-${user.id}`}
                        className="text-sm font-semibold uppercase tracking-wide text-slate-600"
                      >
                        Account access
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {isSelf
                          ? 'This is your account. Ask another administrator to change its status.'
                          : user.status === 'active'
                            ? 'This user can access permitted application routes.'
                            : 'This user cannot access application routes.'}
                      </p>
                      {!isSelf ? (
                        <form action={setAccountStatusAction} className="mt-4">
                          <input type="hidden" name="userId" value={user.id} />
                          {user.status === 'active' ? (
                            <Button
                              type="submit"
                              name="status"
                              value="suspended"
                              variant="secondary"
                            >
                              Suspend account
                            </Button>
                          ) : (
                            <Button type="submit" name="status" value="active">
                              Activate account
                            </Button>
                          )}
                        </form>
                      ) : null}
                    </section>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </Container>
    </Section>
  )
}
