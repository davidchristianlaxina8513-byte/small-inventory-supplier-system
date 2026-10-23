'use client'

import { useActionState } from 'react'
import { Button } from '@/components/common/Button'
import {
  MOVEMENT_TYPES,
  MOVEMENT_TYPE_LABELS,
  type MovementType,
} from '@/features/inventory/lib/tracking'
import type { InventoryAction, InventoryActionState } from '@/features/inventory/types'
import type { LocationOption } from '@/features/inventory/services/catalog'

type MovementFormProps = {
  action: InventoryAction
  itemId: string
  locations: LocationOption[]
  canAdjust: boolean
}

const INITIAL_STATE: InventoryActionState = { status: 'idle' }

export function MovementForm({ action, itemId, locations, canAdjust }: MovementFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)
  const availableTypes: MovementType[] = canAdjust
    ? MOVEMENT_TYPES
    : MOVEMENT_TYPES.filter((type) => type === 'receipt' || type === 'issue')

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="itemId" value={itemId} />

      {state.message ? (
        <p
          role="alert"
          className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      {!canAdjust ? (
        <p className="rounded-control border border-muted bg-background px-4 py-3 text-sm text-slate-600">
          Only office heads and administrators can record adjustments.
        </p>
      ) : null}

      {locations.length === 0 ? (
        <p className="rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Create an active location for this office before recording stock.
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="movement-type" className="block text-sm font-medium">
            Movement type
          </label>
          <select
            id="movement-type"
            name="movementType"
            defaultValue="receipt"
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          >
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {MOVEMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Adjustments require a clear reason and are limited to office heads and administrators.
          </p>
          <FieldError message={state.fieldErrors?.movementType} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="movement-location" className="block text-sm font-medium">
            Location
          </label>
          <select
            id="movement-location"
            name="locationId"
            defaultValue={locations[0]?.id ?? ''}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          >
            {locations.length === 0 ? (
              <option value="">No active locations</option>
            ) : (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))
            )}
          </select>
          <FieldError message={state.fieldErrors?.locationId} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="movement-quantity" className="block text-sm font-medium">
            Quantity
          </label>
          <input
            id="movement-quantity"
            name="quantity"
            inputMode="decimal"
            required
            placeholder="1"
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.quantity} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="movement-reference" className="block text-sm font-medium">
            Reference (optional)
          </label>
          <input
            id="movement-reference"
            name="reference"
            maxLength={120}
            placeholder="Delivery receipt or request number"
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.reference} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="movement-reason" className="block text-sm font-medium">
          Reason
        </label>
        <textarea
          id="movement-reason"
          name="reason"
          required
          maxLength={500}
          rows={3}
          placeholder="Explain why the stock is changing"
          className="w-full rounded-control border border-muted bg-surface px-3 py-2 text-sm"
        />
        <FieldError message={state.fieldErrors?.reason} />
      </div>

      <Button type="submit" disabled={pending || locations.length === 0}>
        {pending ? 'Recording…' : 'Record movement'}
      </Button>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium text-red-700">{message}</p>
}
