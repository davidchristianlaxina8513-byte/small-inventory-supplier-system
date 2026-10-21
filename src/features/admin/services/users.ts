import { createClient } from '@/lib/supabase/server'
import type { AccountStatus } from '@/features/auth/lib/accountStatus'
import type { AppRole } from '@/features/auth/lib/roles'

export type AdminUserRole = {
  id: string
  role: AppRole
  officeId: string | null
  officeName: string | null
}

export type AdminUser = {
  id: string
  fullName: string
  email: string | null
  schoolId: string | null
  status: AccountStatus
  officeName: string | null
  roles: AdminUserRole[]
}

export type OfficeOption = {
  id: string
  name: string
}

export async function getUsersForAdministration(): Promise<AdminUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, school_id, account_status, offices(name), user_roles(id, role, office_id, offices(name))'
    )
    .order('full_name')

  if (error) throw new Error('Unable to load user accounts.')

  return (data ?? []).map((profile) => {
    const office = firstRelation(profile.offices)
    const roles = (profile.user_roles ?? []).map((assignment) => ({
      id: assignment.id,
      role: assignment.role,
      officeId: assignment.office_id,
      officeName: firstRelation(assignment.offices)?.name ?? null,
    }))

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      schoolId: profile.school_id,
      status: profile.account_status,
      officeName: office?.name ?? null,
      roles,
    }
  })
}

export async function getOfficeOptions(): Promise<OfficeOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offices')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error('Unable to load offices.')

  return data ?? []
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
