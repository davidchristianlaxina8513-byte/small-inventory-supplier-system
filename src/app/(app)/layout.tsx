import type { ReactNode } from 'react'
import { AppNavigation } from '@/components/layout/AppNavigation'
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

  const userContext = {
    fullName: profile.fullName,
    roleSummary,
    officeName: profile.officeName,
    isAdmin,
    isStaff,
    canAccessInventory,
  }

  return <AppNavigation user={userContext}>{children}</AppNavigation>
}
