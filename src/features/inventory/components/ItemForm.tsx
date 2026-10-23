'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/common/Button'
import { TRACKING_TYPES, TRACKING_TYPE_LABELS } from '@/features/inventory/lib/tracking'
import type { InventoryAction, InventoryActionState } from '@/features/inventory/types'
import type { CategoryOption, InventoryOfficeOption } from '@/features/inventory/services/catalog'

export type ItemFormItem = {
  id: string
  officeId: string
  categoryId: string
  itemCode: string
  name: string
  description: string | null
  unitOfMeasure: string
  trackingType: (typeof TRACKING_TYPES)[number]
  reorderLevel: number | null
  isActive: boolean
}

type ItemFormProps = {
  action: InventoryAction
  mode: 'create' | 'edit'
  offices: InventoryOfficeOption[]
  categories: CategoryOption[]
  item?: ItemFormItem
  cancelHref: string
}

const INITIAL_STATE: InventoryActionState = { status: 'idle' }

export function ItemForm({ action, mode, offices, categories, item, cancelHref }: ItemFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)
  const [selectedOfficeId, setSelectedOfficeId] = useState(item?.officeId ?? offices[0]?.id ?? '')
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    item?.categoryId ??
      categories.find((category) => category.officeId === (item?.officeId ?? offices[0]?.id))?.id ??
      ''
  )
  const officeCategories = categories.filter((category) => category.officeId === selectedOfficeId)
  const selectedOffice = offices.find((office) => office.id === selectedOfficeId)

  function handleOfficeChange(officeId: string) {
    setSelectedOfficeId(officeId)
    setSelectedCategoryId(categories.find((category) => category.officeId === officeId)?.id ?? '')
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === 'edit' && item ? <input type="hidden" name="itemId" value={item.id} /> : null}

      {state.message ? (
        <p
          role="alert"
          className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          {offices.length > 1 && mode === 'create' ? (
            <>
              <label htmlFor="item-office" className="block text-sm font-medium">
                Office
              </label>
              <select
                id="item-office"
                name="officeId"
                value={selectedOfficeId}
                onChange={(event) => handleOfficeChange(event.target.value)}
                className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
              >
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <input type="hidden" name="officeId" value={selectedOfficeId} />
              <p className="text-sm font-medium">Office</p>
              <p className="text-sm text-slate-600">{selectedOffice?.name ?? 'No office'}</p>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="item-category"
            name="categoryId"
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          >
            {officeCategories.length === 0 ? (
              <option value="">No categories for this office</option>
            ) : (
              officeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? '' : ' (inactive)'}
                </option>
              ))
            )}
          </select>
          <FieldError message={state.fieldErrors?.categoryId} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="item-code" className="block text-sm font-medium">
            Item code
          </label>
          <input
            id="item-code"
            name="itemCode"
            defaultValue={item?.itemCode ?? ''}
            required
            maxLength={64}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.itemCode} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="item-name"
            name="name"
            defaultValue={item?.name ?? ''}
            required
            maxLength={160}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="item-description" className="block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="item-description"
          name="description"
          defaultValue={item?.description ?? ''}
          maxLength={2000}
          rows={3}
          className="w-full rounded-control border border-muted bg-surface px-3 py-2 text-sm"
        />
        <FieldError message={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="item-unit" className="block text-sm font-medium">
            Unit of measure
          </label>
          <input
            id="item-unit"
            name="unitOfMeasure"
            defaultValue={item?.unitOfMeasure ?? ''}
            required
            maxLength={32}
            placeholder="piece, box, liter"
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.unitOfMeasure} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-tracking" className="block text-sm font-medium">
            Tracking type
          </label>
          <select
            id="item-tracking"
            name="trackingType"
            defaultValue={item?.trackingType ?? 'quantity_stock'}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          >
            {TRACKING_TYPES.map((trackingType) => (
              <option key={trackingType} value={trackingType}>
                {TRACKING_TYPE_LABELS[trackingType]}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Serialized asset is a label only in this milestone; individual asset records are
            deferred.
          </p>
          <FieldError message={state.fieldErrors?.trackingType} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="item-reorder" className="block text-sm font-medium">
            Reorder level (optional)
          </label>
          <input
            id="item-reorder"
            name="reorderLevel"
            defaultValue={item?.reorderLevel?.toString() ?? ''}
            inputMode="decimal"
            placeholder="10"
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.reorderLevel} />
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="flex items-center gap-2">
          <input
            id="item-active"
            name="isActive"
            type="checkbox"
            defaultChecked={item?.isActive ?? true}
            className="h-4 w-4 rounded border-muted"
          />
          <label htmlFor="item-active" className="text-sm font-medium">
            Active item
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create item' : 'Save item'}
        </Button>
        <a
          href={cancelHref}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium text-red-700">{message}</p>
}
