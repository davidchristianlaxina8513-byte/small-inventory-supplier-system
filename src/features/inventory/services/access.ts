import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireActiveUser, type SessionProfile } from '@/features/auth/services/session'
import {
  canViewInventory,
  getAssignedInventoryOffices,
  isInventoryAdmin,
  resolveInventoryOfficeId,
  type InventoryOffice,
} from '@/features/inventory/lib/permissions'

export type InventoryAccess = {
  profile: SessionProfile
  isAdmin: boolean
  offices: InventoryOffice[]
}

export async function requireInventoryAccess(): Promise<InventoryAccess> {
  const profile = await requireActiveUser()

  if (!canViewInventory(profile)) notFound()

  if (isInventoryAdmin(profile)) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('offices')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error('Unable to load offices.')

    return { profile, isAdmin: true, offices: data ?? [] }
  }

  const offices = getAssignedInventoryOffices(profile)
  if (offices.length === 0) notFound()

  return { profile, isAdmin: false, offices }
}

export function resolveAllowedOfficeId(
  access: InventoryAccess,
  requestedOfficeId: string
): string | null {
  return resolveInventoryOfficeId(access.profile, access.offices, requestedOfficeId)
}
