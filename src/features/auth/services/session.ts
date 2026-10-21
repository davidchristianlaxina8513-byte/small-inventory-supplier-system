import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canAccessApplication, type AccountStatus } from '@/features/auth/lib/accountStatus'
import type { AppRole } from '@/features/auth/lib/roles'

export type SessionRole = {
  role: AppRole
  officeId: string | null
  officeName: string | null
}

export type SessionProfile = {
  id: string
  fullName: string
  schoolId: string | null
  status: AccountStatus
  officeId: string | null
  officeName: string | null
  roles: SessionRole[]
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null
  return data.user
})

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, school_id, account_status, office_id, offices(name), user_roles(role, office_id, offices(name))'
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return null

  const office = firstRelation(data.offices)
  const roles = (data.user_roles ?? []).map((assignment) => {
    const roleOffice = firstRelation(assignment.offices)
    return {
      role: assignment.role,
      officeId: assignment.office_id,
      officeName: roleOffice?.name ?? null,
    }
  })

  return {
    id: data.id,
    fullName: data.full_name,
    schoolId: data.school_id,
    status: data.account_status,
    officeId: data.office_id,
    officeName: office?.name ?? null,
    roles,
  }
})

export async function requireActiveUser(): Promise<SessionProfile> {
  const profile = await getSessionProfile()

  if (!profile) redirect('/login')
  if (!canAccessApplication(profile.status)) redirect('/account-status')

  return profile
}

export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await requireActiveUser()

  if (!profile.roles.some(({ role }) => role === 'admin')) notFound()

  return profile
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
