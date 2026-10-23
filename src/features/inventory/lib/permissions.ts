import type { SessionProfile } from '@/features/auth/services/session'

export type InventoryOffice = {
  id: string
  name: string
}

const INVENTORY_ROLES = ['office_staff', 'office_head'] as const

export function canViewInventory(profile: SessionProfile): boolean {
  if (profile.status !== 'active') return false
  return isAdmin(profile) || getAssignedInventoryOffices(profile).length > 0
}

export function canManageInventoryOffice(profile: SessionProfile, officeId: string): boolean {
  if (profile.status !== 'active') return false
  if (isAdmin(profile)) return true

  return profile.roles.some(
    (assignment) =>
      INVENTORY_ROLES.includes(assignment.role as (typeof INVENTORY_ROLES)[number]) &&
      assignment.officeId === officeId
  )
}

export function canRecordAdjustment(profile: SessionProfile, officeId: string): boolean {
  if (profile.status !== 'active') return false
  if (isAdmin(profile)) return true

  return profile.roles.some(
    (assignment) => assignment.role === 'office_head' && assignment.officeId === officeId
  )
}

export function getAssignedInventoryOffices(profile: SessionProfile): InventoryOffice[] {
  if (profile.status !== 'active') return []

  const offices = new Map<string, InventoryOffice>()
  for (const assignment of profile.roles) {
    if (
      INVENTORY_ROLES.includes(assignment.role as (typeof INVENTORY_ROLES)[number]) &&
      assignment.officeId &&
      assignment.officeName
    ) {
      offices.set(assignment.officeId, {
        id: assignment.officeId,
        name: assignment.officeName,
      })
    }
  }

  return [...offices.values()]
}

export function resolveInventoryOfficeId(
  profile: SessionProfile,
  availableOffices: InventoryOffice[],
  requestedOfficeId: string
): string | null {
  if (profile.status !== 'active') return null
  if (isAdmin(profile)) {
    return availableOffices.some((office) => office.id === requestedOfficeId)
      ? requestedOfficeId
      : null
  }

  const assignedOffices = getAssignedInventoryOffices(profile)
  if (assignedOffices.length === 0) return null
  if (assignedOffices.length === 1) return assignedOffices[0].id

  return assignedOffices.some((office) => office.id === requestedOfficeId)
    ? requestedOfficeId
    : null
}

export function isInventoryAdmin(profile: SessionProfile): boolean {
  return profile.status === 'active' && isAdmin(profile)
}

function isAdmin(profile: SessionProfile): boolean {
  return profile.roles.some((assignment) => assignment.role === 'admin')
}
