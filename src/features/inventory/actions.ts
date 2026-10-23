'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canManageInventoryOffice, canRecordAdjustment } from '@/features/inventory/lib/permissions'
import { isAdjustment } from '@/features/inventory/lib/tracking'
import {
  isUuid,
  validateCategoryInput,
  validateItemInput,
  validateLocationInput,
  validateMovementInput,
} from '@/features/inventory/lib/validation'
import {
  requireInventoryAccess,
  resolveAllowedOfficeId,
} from '@/features/inventory/services/access'
import { getItemRow } from '@/features/inventory/services/catalog'
import type { InventoryActionState } from '@/features/inventory/types'

type DatabaseError = {
  code?: string
  message: string
}

export async function createCategoryAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const result = validateCategoryInput({
    officeId: readString(formData, 'officeId'),
    name: readString(formData, 'name'),
  })

  if (!result.values) {
    return validationError(result.errors)
  }

  const officeId = resolveAllowedOfficeId(access, result.values.officeId)
  if (!officeId) return notAllowed()

  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert({
    office_id: officeId,
    name: result.values.name,
  })

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath('/inventory/categories')
  redirect('/inventory/categories?success=created')
}

export async function updateCategoryAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const categoryId = readString(formData, 'categoryId')
  if (!isUuid(categoryId)) return invalidRequest()

  const supabase = await createClient()
  const { data: category, error: readError } = await supabase
    .from('categories')
    .select('office_id')
    .eq('id', categoryId)
    .maybeSingle()

  if (readError || !category) return notFoundError()
  if (!canManageInventoryOffice(access.profile, category.office_id)) return notAllowed()

  const result = validateCategoryInput({
    officeId: category.office_id,
    name: readString(formData, 'name'),
  })

  if (!result.values) return validationError(result.errors)

  const { error } = await supabase
    .from('categories')
    .update({
      name: result.values.name,
      is_active: formData.get('isActive') === 'on',
    })
    .eq('id', categoryId)

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath('/inventory/categories')
  redirect('/inventory/categories?success=updated')
}

export async function setCategoryActiveAction(formData: FormData): Promise<void> {
  const access = await requireInventoryAccess()
  const categoryId = readString(formData, 'categoryId')
  const isActive = formData.get('isActive') === 'true'

  if (!isUuid(categoryId)) redirect('/inventory/categories?error=invalid')

  const supabase = await createClient()
  const { data: category, error: readError } = await supabase
    .from('categories')
    .select('office_id')
    .eq('id', categoryId)
    .maybeSingle()

  if (readError || !category) redirect('/inventory/categories?error=not-found')
  if (!canManageInventoryOffice(access.profile, category.office_id)) {
    redirect('/inventory/categories?error=unauthorized')
  }

  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', categoryId)

  if (error) redirect('/inventory/categories?error=failed')

  revalidateInventoryPaths()
  revalidatePath('/inventory/categories')
  redirect(`/inventory/categories?success=${isActive ? 'activated' : 'deactivated'}`)
}

export async function createLocationAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const result = validateLocationInput({
    officeId: readString(formData, 'officeId'),
    name: readString(formData, 'name'),
  })

  if (!result.values) return validationError(result.errors)

  const officeId = resolveAllowedOfficeId(access, result.values.officeId)
  if (!officeId) return notAllowed()

  const supabase = await createClient()
  const { error } = await supabase.from('locations').insert({
    office_id: officeId,
    name: result.values.name,
  })

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath('/inventory/locations')
  redirect('/inventory/locations?success=created')
}

export async function updateLocationAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const locationId = readString(formData, 'locationId')
  if (!isUuid(locationId)) return invalidRequest()

  const supabase = await createClient()
  const { data: location, error: readError } = await supabase
    .from('locations')
    .select('office_id')
    .eq('id', locationId)
    .maybeSingle()

  if (readError || !location) return notFoundError()
  if (!canManageInventoryOffice(access.profile, location.office_id)) return notAllowed()

  const result = validateLocationInput({
    officeId: location.office_id,
    name: readString(formData, 'name'),
  })

  if (!result.values) return validationError(result.errors)

  const { error } = await supabase
    .from('locations')
    .update({
      name: result.values.name,
      is_active: formData.get('isActive') === 'on',
    })
    .eq('id', locationId)

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath('/inventory/locations')
  redirect('/inventory/locations?success=updated')
}

export async function setLocationActiveAction(formData: FormData): Promise<void> {
  const access = await requireInventoryAccess()
  const locationId = readString(formData, 'locationId')
  const isActive = formData.get('isActive') === 'true'

  if (!isUuid(locationId)) redirect('/inventory/locations?error=invalid')

  const supabase = await createClient()
  const { data: location, error: readError } = await supabase
    .from('locations')
    .select('office_id')
    .eq('id', locationId)
    .maybeSingle()

  if (readError || !location) redirect('/inventory/locations?error=not-found')
  if (!canManageInventoryOffice(access.profile, location.office_id)) {
    redirect('/inventory/locations?error=unauthorized')
  }

  const { error } = await supabase
    .from('locations')
    .update({ is_active: isActive })
    .eq('id', locationId)

  if (error) redirect('/inventory/locations?error=failed')

  revalidateInventoryPaths()
  revalidatePath('/inventory/locations')
  redirect(`/inventory/locations?success=${isActive ? 'activated' : 'deactivated'}`)
}

export async function createItemAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const result = validateItemInput(readItemInput(formData))

  if (!result.values) return validationError(result.errors)

  const officeId = resolveAllowedOfficeId(access, result.values.officeId)
  if (!officeId) return notAllowed()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .insert({
      office_id: officeId,
      category_id: result.values.categoryId,
      item_code: result.values.itemCode,
      name: result.values.name,
      description: result.values.description,
      unit_of_measure: result.values.unitOfMeasure,
      tracking_type: result.values.trackingType,
      reorder_level: result.values.reorderLevel,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !data) return databaseError(error)

  revalidateInventoryPaths()
  redirect(`/inventory/${data.id}?success=created`)
}

export async function updateItemAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const itemId = readString(formData, 'itemId')
  if (!isUuid(itemId)) return invalidRequest()

  const item = await getItemRow(itemId)
  if (!item) return notFoundError()
  if (!canManageInventoryOffice(access.profile, item.officeId)) return notAllowed()

  const result = validateItemInput({ ...readItemInput(formData), officeId: item.officeId })
  if (!result.values) return validationError(result.errors)

  const supabase = await createClient()
  const { error } = await supabase
    .from('items')
    .update({
      category_id: result.values.categoryId,
      item_code: result.values.itemCode,
      name: result.values.name,
      description: result.values.description,
      unit_of_measure: result.values.unitOfMeasure,
      tracking_type: result.values.trackingType,
      reorder_level: result.values.reorderLevel,
      is_active: formData.get('isActive') === 'on',
    })
    .eq('id', itemId)

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath(`/inventory/${itemId}`)
  redirect(`/inventory/${itemId}?success=updated`)
}

export async function setItemActiveAction(formData: FormData): Promise<void> {
  const access = await requireInventoryAccess()
  const itemId = readString(formData, 'itemId')
  const isActive = formData.get('isActive') === 'true'

  if (!isUuid(itemId)) redirect('/inventory?error=invalid')

  const item = await getItemRow(itemId)
  if (!item) redirect('/inventory?error=not-found')
  if (!canManageInventoryOffice(access.profile, item.officeId)) {
    redirect('/inventory?error=unauthorized')
  }

  const supabase = await createClient()
  const { error } = await supabase.from('items').update({ is_active: isActive }).eq('id', itemId)

  if (error) redirect(`/inventory/${itemId}?error=failed`)

  revalidateInventoryPaths()
  revalidatePath(`/inventory/${itemId}`)
  redirect(`/inventory/${itemId}?success=${isActive ? 'activated' : 'deactivated'}`)
}

export async function recordMovementAction(
  _previousState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const access = await requireInventoryAccess()
  const result = validateMovementInput({
    itemId: readString(formData, 'itemId'),
    locationId: readString(formData, 'locationId'),
    movementType: readString(formData, 'movementType'),
    quantity: readString(formData, 'quantity'),
    reason: readString(formData, 'reason'),
    reference: readString(formData, 'reference'),
  })

  if (!result.values) return validationError(result.errors)

  const item = await getItemRow(result.values.itemId)
  if (!item) return notFoundError()
  if (!canManageInventoryOffice(access.profile, item.officeId)) return notAllowed()

  if (
    isAdjustment(result.values.movementType) &&
    !canRecordAdjustment(access.profile, item.officeId)
  ) {
    return {
      status: 'error',
      message: 'Only office heads and administrators can record adjustments.',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('record_stock_movement', {
    p_item_id: result.values.itemId,
    p_location_id: result.values.locationId,
    p_movement_type: result.values.movementType,
    p_quantity: result.values.quantity,
    p_reason: result.values.reason,
    p_reference: result.values.reference ?? undefined,
  })

  if (error) return databaseError(error)

  revalidateInventoryPaths()
  revalidatePath(`/inventory/${result.values.itemId}`)
  redirect(`/inventory/${result.values.itemId}?success=movement`)
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function readItemInput(formData: FormData) {
  return {
    officeId: readString(formData, 'officeId'),
    categoryId: readString(formData, 'categoryId'),
    itemCode: readString(formData, 'itemCode'),
    name: readString(formData, 'name'),
    description: readString(formData, 'description'),
    unitOfMeasure: readString(formData, 'unitOfMeasure'),
    trackingType: readString(formData, 'trackingType'),
    reorderLevel: readString(formData, 'reorderLevel'),
  }
}

function validationError(fieldErrors: Record<string, string>): InventoryActionState {
  return {
    status: 'error',
    message: 'Review the highlighted fields and try again.',
    fieldErrors,
  }
}

function invalidRequest(): InventoryActionState {
  return { status: 'error', message: 'The request was invalid. Refresh and try again.' }
}

function notAllowed(): InventoryActionState {
  return { status: 'error', message: 'You are not authorized to manage this office.' }
}

function notFoundError(): InventoryActionState {
  return { status: 'error', message: 'The selected record no longer exists.' }
}

function databaseError(error: DatabaseError | null): InventoryActionState {
  return { status: 'error', message: mapDatabaseMessage(error) }
}

function mapDatabaseMessage(error: DatabaseError | null): string {
  if (!error) return 'The change could not be saved.'
  if (error.code === '23505') {
    return 'A record with that code or name already exists in this office.'
  }
  if (error.code === '23503') {
    return 'The selected category or location does not belong to this office.'
  }
  if (error.code === '23514') {
    return error.message.includes('Insufficient stock')
      ? 'There is not enough stock for this movement.'
      : 'The quantity or stock operation is invalid.'
  }
  if (error.code === '42501') {
    if (error.message.includes('Tracking type')) {
      return 'Tracking type cannot change after stock movements exist.'
    }
    return 'You are not authorized to perform this action.'
  }
  if (error.code === 'P0002') {
    return 'The selected item or location no longer exists.'
  }
  return 'The change could not be saved.'
}

function revalidateInventoryPaths() {
  revalidatePath('/inventory')
  revalidatePath('/inventory/categories')
  revalidatePath('/inventory/locations')
}
