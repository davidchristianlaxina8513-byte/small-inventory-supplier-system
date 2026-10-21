import type { Database } from '@/types/database.types'

export type AppRole = Database['public']['Enums']['app_role']

const ROLE_LABELS: Record<AppRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  non_teaching: 'Non-teaching staff',
  office_staff: 'Office staff',
  office_head: 'Office head',
  admin: 'Administrator',
}

export const APP_ROLES = Object.keys(ROLE_LABELS) as AppRole[]

export function roleLabel(role: AppRole): string {
  return ROLE_LABELS[role]
}

export const OFFICE_SCOPED_ROLES: AppRole[] = ['office_staff', 'office_head']

export function roleRequiresOffice(role: AppRole): boolean {
  return OFFICE_SCOPED_ROLES.includes(role)
}
