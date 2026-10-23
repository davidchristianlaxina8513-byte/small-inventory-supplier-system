import type { Database } from '@/types/database.types'

export type TrackingType = Database['public']['Enums']['inventory_tracking_type']
export type MovementType = Database['public']['Enums']['stock_movement_type']

export const TRACKING_TYPES: TrackingType[] = ['serialized_asset', 'quantity_stock']
export const MOVEMENT_TYPES: MovementType[] = [
  'receipt',
  'issue',
  'adjustment_in',
  'adjustment_out',
]

export const TRACKING_TYPE_LABELS: Record<TrackingType, string> = {
  serialized_asset: 'Serialized asset',
  quantity_stock: 'Quantity stock',
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  damage: 'Damage',
  disposal: 'Disposal',
  receipt: 'Stock in (receipt)',
  issue: 'Stock out (issue)',
  return: 'Return',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  adjustment_in: 'Adjustment in',
  adjustment_out: 'Adjustment out',
}

export function isAdjustment(type: MovementType): boolean {
  return type === 'adjustment_in' || type === 'adjustment_out'
}

export function movementDirection(type: MovementType): 1 | -1 {
  return type === 'receipt' ||
    type === 'return' ||
    type === 'transfer_in' ||
    type === 'adjustment_in'
    ? 1
    : -1
}
