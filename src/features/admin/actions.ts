'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/features/auth/services/session'
import { APP_ROLES, roleRequiresOffice, type AppRole } from '@/features/auth/lib/roles'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MANAGEABLE_STATUSES = ['active', 'suspended'] as const

function fail(code: string): never {
  redirect(`/admin/users?error=${code}`)
}

function readUuid(formData: FormData, key: string): string {
  const value = formData.get(key)
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) fail('invalid-request')
  return value
}

export async function setAccountStatusAction(formData: FormData) {
  const admin = await requireAdmin()
  const userId = readUuid(formData, 'userId')
  const statusValue = formData.get('status')
  const status = MANAGEABLE_STATUSES.find((value) => value === statusValue)

  if (!status) fail('invalid-request')
  if (userId === admin.id) fail('self-status')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: status })
    .eq('id', userId)

  if (error) fail('status-update-failed')

  revalidatePath('/admin/users')
  revalidatePath('/dashboard')
}

export async function assignRoleAction(formData: FormData) {
  await requireAdmin()
  const userId = readUuid(formData, 'userId')
  const roleValue = formData.get('role')
  const role = APP_ROLES.find((value) => value === roleValue)

  if (!role) fail('invalid-request')

  let officeId: string | null = null
  if (roleRequiresOffice(role)) {
    officeId = readUuid(formData, 'officeId')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: role as AppRole, office_id: officeId })

  if (error) fail('role-assignment-failed')

  revalidatePath('/admin/users')
  revalidatePath('/dashboard')
}

export async function removeRoleAction(formData: FormData) {
  const admin = await requireAdmin()
  const roleId = readUuid(formData, 'roleId')

  const supabase = await createClient()
  const { data: assignment, error: readError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .eq('id', roleId)
    .maybeSingle()

  if (readError || !assignment) fail('role-removal-failed')
  if (assignment.user_id === admin.id && assignment.role === 'admin') fail('self-role')

  const { error } = await supabase.from('user_roles').delete().eq('id', roleId)
  if (error) fail('role-removal-failed')

  revalidatePath('/admin/users')
  revalidatePath('/dashboard')
}
