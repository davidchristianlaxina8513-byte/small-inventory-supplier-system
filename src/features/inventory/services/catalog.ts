import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import type { TrackingType } from '@/features/inventory/lib/tracking'

export type InventoryOfficeOption = {
  id: string
  name: string
}

export type CategoryOption = {
  id: string
  officeId: string
  officeName: string
  name: string
  isActive: boolean
}

export type LocationOption = {
  id: string
  officeId: string
  officeName: string
  name: string
  isActive: boolean
}

export type InventoryItemSummary = {
  id: string
  officeId: string
  officeName: string
  categoryId: string
  categoryName: string
  itemCode: string
  name: string
  description: string | null
  unitOfMeasure: string
  trackingType: TrackingType
  reorderLevel: number | null
  isActive: boolean
  totalOnHand: number
  lowStock: boolean
}

export type InventoryItemDetail = InventoryItemSummary & {
  balances: Array<{
    locationId: string
    locationName: string
    quantityOnHand: number
  }>
  movements: InventoryMovement[]
}

export type InventoryMovement = {
  id: string
  movementType: Database['public']['Enums']['stock_movement_type']
  quantity: number
  reason: string
  reference: string | null
  performedBy: string
  performedByName: string
  createdAt: string
}

export type InventoryFilters = {
  officeId?: string
  categoryId?: string
  trackingType?: string
  status?: string
  search?: string
}

export async function getInventoryItems(
  filters: InventoryFilters = {}
): Promise<InventoryItemSummary[]> {
  const supabase = await createClient()
  let query = supabase
    .from('items')
    .select(
      'id, office_id, category_id, item_code, name, description, unit_of_measure, tracking_type, reorder_level, is_active, categories(name), offices(name), inventory_balances(quantity_on_hand)'
    )
    .order('item_code')

  if (filters.officeId) query = query.eq('office_id', filters.officeId)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.trackingType) {
    query = query.eq(
      'tracking_type',
      filters.trackingType as Database['public']['Enums']['inventory_tracking_type']
    )
  }
  if (filters.status === 'active') query = query.eq('is_active', true)
  if (filters.status === 'inactive') query = query.eq('is_active', false)

  const { data, error } = await query
  if (error) throw new Error('Unable to load inventory items.')

  const search = filters.search?.trim().toLowerCase()
  return (data ?? []).map(mapItemSummary).filter((item) => {
    if (!search) return true
    return (
      item.name.toLowerCase().includes(search) ||
      item.itemCode.toLowerCase().includes(search) ||
      item.categoryName.toLowerCase().includes(search)
    )
  })
}

export async function getInventoryItem(itemId: string): Promise<InventoryItemDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select(
      'id, office_id, category_id, item_code, name, description, unit_of_measure, tracking_type, reorder_level, is_active, categories(name), offices(name), inventory_balances(quantity_on_hand, locations(id, name))'
    )
    .eq('id', itemId)
    .maybeSingle()

  if (error || !data) return null

  const summary = mapItemSummary(data)
  const balances = (data.inventory_balances ?? [])
    .map((balance) => {
      const location = firstRelation(balance.locations)
      return {
        locationId: location?.id ?? '',
        locationName: location?.name ?? 'Unknown location',
        quantityOnHand: Number(balance.quantity_on_hand),
      }
    })
    .sort((left, right) => left.locationName.localeCompare(right.locationName))

  const { data: movementRows, error: movementError } = await supabase.rpc('get_item_movements', {
    target_item_id: itemId,
  })

  if (movementError) throw new Error('Unable to load movement history.')

  return {
    ...summary,
    balances,
    movements: (movementRows ?? []).map((movement) => ({
      id: movement.id,
      movementType: movement.movement_type,
      quantity: Number(movement.quantity),
      reason: movement.reason,
      reference: movement.reference,
      performedBy: movement.performed_by,
      performedByName: movement.performed_by_name,
      createdAt: movement.created_at,
    })),
  }
}

export async function getCategoryOptions(
  officeIds: string[],
  includeInactive = false
): Promise<CategoryOption[]> {
  if (officeIds.length === 0) return []

  const supabase = await createClient()
  let query = supabase
    .from('categories')
    .select('id, office_id, name, is_active, offices(name)')
    .order('name')

  if (officeIds.length > 0) query = query.in('office_id', officeIds)
  if (!includeInactive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw new Error('Unable to load categories.')

  return (data ?? []).map((category) => ({
    id: category.id,
    officeId: category.office_id,
    officeName: firstRelation(category.offices)?.name ?? 'Unknown office',
    name: category.name,
    isActive: category.is_active,
  }))
}

export async function getLocationOptions(
  officeIds: string[],
  includeInactive = false
): Promise<LocationOption[]> {
  if (officeIds.length === 0) return []

  const supabase = await createClient()
  let query = supabase
    .from('locations')
    .select('id, office_id, name, is_active, offices(name)')
    .order('name')

  if (officeIds.length > 0) query = query.in('office_id', officeIds)
  if (!includeInactive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw new Error('Unable to load locations.')

  return (data ?? []).map((location) => ({
    id: location.id,
    officeId: location.office_id,
    officeName: firstRelation(location.offices)?.name ?? 'Unknown office',
    name: location.name,
    isActive: location.is_active,
  }))
}

export async function getInventoryOfficeOptions(): Promise<InventoryOfficeOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offices')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error('Unable to load offices.')
  return data ?? []
}

export async function getItemRow(itemId: string): Promise<{
  id: string
  officeId: string
  officeName: string
  categoryId: string
  itemCode: string
  name: string
  description: string | null
  unitOfMeasure: string
  trackingType: TrackingType
  reorderLevel: number | null
  isActive: boolean
} | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select(
      'id, office_id, category_id, item_code, name, description, unit_of_measure, tracking_type, reorder_level, is_active, offices(name)'
    )
    .eq('id', itemId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    officeId: data.office_id,
    officeName: firstRelation(data.offices)?.name ?? 'Unknown office',
    categoryId: data.category_id,
    itemCode: data.item_code,
    name: data.name,
    description: data.description,
    unitOfMeasure: data.unit_of_measure,
    trackingType: data.tracking_type,
    reorderLevel: data.reorder_level === null ? null : Number(data.reorder_level),
    isActive: data.is_active,
  }
}

function mapItemSummary(item: {
  id: string
  office_id: string
  category_id: string
  item_code: string
  name: string
  description: string | null
  unit_of_measure: string
  tracking_type: TrackingType
  reorder_level: number | null
  is_active: boolean
  categories: { name: string } | { name: string }[] | null
  offices: { name: string } | { name: string }[] | null
  inventory_balances: Array<{ quantity_on_hand: number }> | null
}): InventoryItemSummary {
  const totalOnHand = (item.inventory_balances ?? []).reduce(
    (total, balance) => total + Number(balance.quantity_on_hand),
    0
  )
  const reorderLevel = item.reorder_level === null ? null : Number(item.reorder_level)

  return {
    id: item.id,
    officeId: item.office_id,
    officeName: firstRelation(item.offices)?.name ?? 'Unknown office',
    categoryId: item.category_id,
    categoryName: firstRelation(item.categories)?.name ?? 'Unknown category',
    itemCode: item.item_code,
    name: item.name,
    description: item.description,
    unitOfMeasure: item.unit_of_measure,
    trackingType: item.tracking_type,
    reorderLevel,
    isActive: item.is_active,
    totalOnHand,
    lowStock: reorderLevel !== null && totalOnHand <= reorderLevel,
  }
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
