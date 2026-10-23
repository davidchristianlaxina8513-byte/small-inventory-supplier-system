'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireActiveUser } from '@/features/auth/services/session'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type RequestType = Database['public']['Enums']['request_type']
type DecisionType = Database['public']['Enums']['decision_type']
type AssetCondition = Database['public']['Enums']['asset_condition']

const text = (data: FormData, key: string) => {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}
const number = (data: FormData, key: string) => Number(text(data, key))
const date = (data: FormData, key: string) => {
  const value = text(data, key)
  return value ? new Date(value).toISOString() : undefined
}

function fail(path: string, message = 'The change could not be saved.'): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}
function ok(path: string, message = 'saved'): never {
  revalidatePath(path)
  revalidatePath('/dashboard')
  redirect(`${path}?success=${message}`)
}

export async function createRequestAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const purpose = text(data, 'purpose'),
    quantity = number(data, 'quantity')
  if (purpose.length < 3 || !Number.isFinite(quantity) || quantity <= 0)
    fail('/requests/new', 'Enter a purpose and a positive quantity.')
  const { error } = await supabase.rpc('create_request', {
    p_office_id: text(data, 'officeId'),
    p_request_type: text(data, 'requestType') as RequestType,
    p_purpose: purpose,
    // Supabase's generated RPC type cannot express a nullable PostgreSQL argument.
    p_needed_at: (date(data, 'neededAt') ?? null) as unknown as string,
    p_item_id: text(data, 'itemId'),
    p_quantity: quantity,
    p_notes: text(data, 'notes') || undefined,
  })
  if (error) fail('/requests/new', safeError(error.code))
  ok('/requests')
}

export async function decideRequestAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const id = text(data, 'requestId')
  const { data: items } = await supabase.from('request_items').select('id').eq('request_id', id)
  const quantities = Object.fromEntries(
    (items ?? []).map((i) => [i.id, number(data, `approved-${i.id}`)])
  )
  const { error } = await supabase.rpc('decide_request', {
    p_request_id: id,
    p_decision: text(data, 'decision') as DecisionType,
    p_reason: text(data, 'reason'),
    p_approved_quantities: quantities,
  })
  if (error) fail('/requests', safeError(error.code))
  ok('/requests')
}

export async function issueRequestItemAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('issue_request_item', {
    p_request_item_id: text(data, 'requestItemId'),
    p_location_id: text(data, 'locationId'),
    p_quantity: number(data, 'quantity'),
  })
  if (error) fail('/requests', safeError(error.code))
  ok('/requests')
}

export async function createAssetAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.from('assets').insert({
    office_id: text(data, 'officeId'),
    item_id: text(data, 'itemId'),
    location_id: text(data, 'locationId'),
    asset_code: text(data, 'assetCode'),
    serial_number: text(data, 'serialNumber') || null,
    notes: text(data, 'notes') || null,
  })
  if (error) fail('/assets', safeError(error.code))
  ok('/assets')
}

export async function createReservationAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('create_reservation', {
    p_asset_id: text(data, 'assetId'),
    p_starts_at: date(data, 'startsAt')!,
    p_ends_at: date(data, 'endsAt')!,
    p_purpose: text(data, 'purpose'),
  })
  if (error)
    fail(
      '/reservations',
      error.code === '23P01'
        ? 'That asset is already reserved for the selected time.'
        : safeError(error.code)
    )
  ok('/reservations')
}

export async function releaseLoanAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('release_loan', {
    p_request_id: text(data, 'requestId'),
    p_asset_ids: [text(data, 'assetId')],
    p_due_at: date(data, 'dueAt')!,
  })
  if (error) fail('/borrowings', safeError(error.code))
  ok('/borrowings')
}

export async function returnLoanAssetAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('return_loan_asset', {
    p_loan_asset_id: text(data, 'loanAssetId'),
    p_condition: text(data, 'condition') as AssetCondition,
  })
  if (error) fail('/borrowings', safeError(error.code))
  ok('/borrowings')
}

export async function createIncidentAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { data: item } = await supabase
    .from('items')
    .select('office_id')
    .eq('id', text(data, 'itemId'))
    .single()
  if (!item) fail('/incidents', 'Select a valid item.')
  const { error } = await supabase.from('incidents').insert({
    office_id: item.office_id,
    item_id: text(data, 'itemId'),
    asset_id: text(data, 'assetId') || null,
    incident_type: text(data, 'incidentType') as Database['public']['Enums']['incident_type'],
    occurred_at: date(data, 'occurredAt')!,
    description: text(data, 'description'),
  })
  if (error) fail('/incidents', safeError(error.code))
  ok('/incidents')
}

export async function resolveIncidentAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const condition = text(data, 'assetCondition')
  const { error } = await supabase.rpc('resolve_incident', {
    p_incident_id: text(data, 'incidentId'),
    p_resolution: text(data, 'resolution'),
    p_asset_condition: condition ? (condition as AssetCondition) : undefined,
  })
  if (error) fail('/incidents', safeError(error.code))
  ok('/incidents')
}

export async function transferStockAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const itemId = text(data, 'itemId')
  const { error } = await supabase.rpc('transfer_stock', {
    p_item_id: itemId,
    p_from_location_id: text(data, 'fromLocationId'),
    p_to_location_id: text(data, 'toLocationId'),
    p_quantity: number(data, 'quantity'),
    p_reason: text(data, 'reason'),
  })
  if (error) fail(`/inventory/${itemId}`, safeError(error.code))
  revalidatePath('/inventory')
  ok(`/inventory/${itemId}`, 'transferred')
}

export async function markNotificationsReadAction() {
  const profile = await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', profile.id)
    .is('read_at', null)
  if (error) fail('/notifications', safeError(error.code))
  ok('/notifications', 'read')
}

export async function createSupplierAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.from('suppliers').insert({
    name: text(data, 'name'),
    contact_person: text(data, 'contactPerson') || null,
    email: text(data, 'email') || null,
    phone: text(data, 'phone') || null,
    address: text(data, 'address') || null,
  })
  if (error) fail('/suppliers', safeError(error.code))
  ok('/suppliers')
}

export async function createPurchaseRequestAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const cost = text(data, 'estimatedUnitCost')
  const { error } = await supabase.rpc('create_purchase_request', {
    p_office_id: text(data, 'officeId'),
    p_justification: text(data, 'justification'),
    p_item_id: text(data, 'itemId'),
    p_quantity: number(data, 'quantity'),
    p_estimated_unit_cost: cost ? Number(cost) : undefined,
  })
  if (error) fail('/purchasing', safeError(error.code))
  ok('/purchasing')
}

export async function createPurchaseOrderAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('create_purchase_order', {
    p_purchase_request_id: text(data, 'purchaseRequestId'),
    p_supplier_id: text(data, 'supplierId'),
    p_item_id: text(data, 'itemId'),
    p_location_id: text(data, 'locationId'),
    p_quantity: number(data, 'quantity'),
    p_unit_cost: number(data, 'unitCost'),
  })
  if (error) fail('/purchasing', safeError(error.code))
  ok('/purchasing')
}

export async function receivePurchaseItemAction(data: FormData) {
  await requireActiveUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('receive_purchase_item', {
    p_purchase_order_item_id: text(data, 'purchaseOrderItemId'),
    p_received: number(data, 'received'),
    p_accepted: number(data, 'accepted'),
    p_notes: text(data, 'notes') || undefined,
  })
  if (error) fail('/purchasing', safeError(error.code))
  ok('/purchasing')
}

export async function saveOfficeAction(data: FormData) {
  const profile = await requireActiveUser()
  if (!profile.roles.some((r) => r.role === 'admin')) fail('/dashboard', 'You are not authorized.')
  const supabase = await createClient()
  const id = text(data, 'officeId'),
    name = text(data, 'name')
  const result = id
    ? await supabase
        .from('offices')
        .update({ name, is_active: text(data, 'isActive') === 'true' })
        .eq('id', id)
    : await supabase.from('offices').insert({ name })
  if (result.error) fail('/admin/offices', safeError(result.error.code))
  ok('/admin/offices')
}

function safeError(code: string) {
  if (code === '42501') return 'You are not authorized to perform that action.'
  if (code === '23505') return 'That code or record already exists.'
  if (code === '23514') return 'The values or current workflow state are invalid.'
  if (code === '23P01') return 'The selected schedule conflicts with an existing reservation.'
  return 'The change could not be saved.'
}
