import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function getWorkflowOptions() {
  const supabase = await createClient()
  const [offices, items, assets, locations] = await Promise.all([
    supabase.from('offices').select('id,name').eq('is_active', true).order('name'),
    supabase
      .from('items')
      .select('id,office_id,item_code,name,tracking_type')
      .eq('is_active', true)
      .order('name'),
    supabase.rpc('get_reservable_assets'),
    supabase.from('locations').select('id,office_id,name').eq('is_active', true).order('name'),
  ])
  return {
    offices: offices.data ?? [],
    items: items.data ?? [],
    assets: assets.data ?? [],
    locations: locations.data ?? [],
  }
}

export async function listRequests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('requests')
    .select(
      'id,reference_number,request_type,purpose,needed_at,status,created_at,requester_id,offices(name),profiles!requests_requester_id_fkey(full_name),request_items(id,item_id,requested_quantity,approved_quantity,issued_quantity,items(name,item_code))'
    )
    .order('created_at', { ascending: false })
  if (error) throw new Error('Unable to load requests.')
  return data ?? []
}

export async function listAssets() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assets')
    .select(
      'id,asset_code,serial_number,condition,status,notes,is_active,items(name,item_code),locations(name),offices(name)'
    )
    .order('asset_code')
  if (error) throw new Error('Unable to load assets.')
  return data ?? []
}

export async function listLoans() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loans')
    .select(
      'id,released_at,due_at,status,profiles!loans_borrower_id_fkey(full_name),requests(reference_number,office_id),loan_assets(id,asset_id,returned_at,condition_at_release,condition_at_return,assets(asset_code,items(name)))'
    )
    .order('due_at')
  if (error) throw new Error('Unable to load loans.')
  return data ?? []
}

export async function listReservations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id,starts_at,ends_at,purpose,status,requester_id,assets(asset_code,items(name)),profiles!reservations_requester_id_fkey(full_name),offices(name)'
    )
    .order('starts_at', { ascending: false })
  if (error) throw new Error('Unable to load reservations.')
  return data ?? []
}

export async function listIncidents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incidents')
    .select(
      'id,incident_type,occurred_at,description,status,resolution,created_at,items(name,item_code),assets(asset_code),profiles!incidents_reported_by_fkey(full_name),offices(name)'
    )
    .order('created_at', { ascending: false })
  if (error) throw new Error('Unable to load incidents.')
  return data ?? []
}

export async function listProcurement() {
  const supabase = await createClient()
  const [suppliers, requests, orders] = await Promise.all([
    supabase.from('suppliers').select('*').order('name'),
    supabase
      .from('purchase_requests')
      .select(
        'id,reference_number,office_id,justification,status,created_at,offices(name),purchase_request_items(item_id,quantity,estimated_unit_cost,items(name,item_code))'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('purchase_orders')
      .select(
        'id,order_number,purchase_request_id,supplier_id,order_date,status,suppliers(name),purchase_order_items(id,item_id,location_id,ordered_quantity,received_quantity,unit_cost,items(name,item_code),locations(name))'
      )
      .order('order_date', { ascending: false }),
  ])
  if (suppliers.error || requests.error || orders.error)
    throw new Error('Unable to load procurement records.')
  return {
    suppliers: suppliers.data ?? [],
    requests: requests.data ?? [],
    orders: orders.data ?? [],
  }
}

export async function getDashboardMetrics(userId: string) {
  const supabase = await createClient()
  const [myRequests, pending, lowStock, loans, incidents, notifications] = await Promise.all([
    supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('requester_id', userId),
    supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
    supabase
      .from('items')
      .select('id,reorder_level,inventory_balances(quantity_on_hand)')
      .not('reorder_level', 'is', null),
    supabase.from('loans').select('id,due_at,status'),
    supabase
      .from('incidents')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'resolved'),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ])
  const low = (lowStock.data ?? []).filter(
    (i) =>
      (i.inventory_balances ?? []).reduce((n, b) => n + Number(b.quantity_on_hand), 0) <=
      Number(i.reorder_level)
  ).length
  const activeLoans = (loans.data ?? []).filter((l) => l.status !== 'returned').length
  const overdue = (loans.data ?? []).filter(
    (l) => l.status !== 'returned' && new Date(l.due_at) < new Date()
  ).length
  return {
    myRequests: myRequests.count ?? 0,
    pending: pending.count ?? 0,
    lowStock: low,
    activeLoans,
    overdue,
    openIncidents: incidents.count ?? 0,
    unread: notifications.count ?? 0,
  }
}

export async function listNotifications() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Unable to load notifications.')
  return data ?? []
}

export function relation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value
}
