'use client'

import { useActionState } from 'react'
import { Button } from '@/components/common/Button'
import type { InventoryAction, InventoryActionState } from '@/features/inventory/types'
import type { InventoryOfficeOption } from '@/features/inventory/services/catalog'

type CatalogEntity = {
  id: string
  officeId: string
  name: string
  isActive: boolean
}

type CatalogEntityFormProps = {
  action: InventoryAction
  mode: 'create' | 'edit'
  entityLabel: 'category' | 'location'
  idFieldName: 'categoryId' | 'locationId'
  offices: InventoryOfficeOption[]
  entity?: CatalogEntity
  cancelHref?: string
  idPrefix?: string
}

const INITIAL_STATE: InventoryActionState = { status: 'idle' }

export function CatalogEntityForm({
  action,
  mode,
  entityLabel,
  idFieldName,
  offices,
  entity,
  cancelHref,
  idPrefix,
}: CatalogEntityFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)
  const selectedOffice = offices.find((office) => office.id === entity?.officeId)
  const canSelectOffice = offices.length > 1 && mode === 'create'
  const prefix = idPrefix ?? `${entityLabel}-${mode}`

  return (
    <form action={formAction} className="space-y-4">
      {mode === 'edit' && entity ? (
        <input type="hidden" name={idFieldName} value={entity.id} />
      ) : null}

      {state.message ? (
        <p
          role="alert"
          className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          {canSelectOffice ? (
            <>
              <label htmlFor={`${prefix}-office`} className="block text-sm font-medium">
                Office
              </label>
              <select
                id={`${prefix}-office`}
                name="officeId"
                defaultValue={offices[0]?.id}
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
              <input
                type="hidden"
                name="officeId"
                value={entity?.officeId ?? offices[0]?.id ?? ''}
              />
              <p className="text-sm font-medium">Office</p>
              <p className="text-sm text-slate-600">
                {selectedOffice?.name ?? offices[0]?.name ?? 'No office'}
              </p>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${prefix}-name`} className="block text-sm font-medium capitalize">
            {entityLabel} name
          </label>
          <input
            id={`${prefix}-name`}
            name="name"
            defaultValue={entity?.name ?? ''}
            required
            maxLength={120}
            className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="flex items-center gap-2">
          <input
            id={`${prefix}-active`}
            name="isActive"
            type="checkbox"
            defaultChecked={entity?.isActive ?? true}
            className="h-4 w-4 rounded border-muted"
          />
          <label htmlFor={`${prefix}-active`} className="text-sm font-medium">
            Active {entityLabel}
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant={mode === 'create' ? 'primary' : 'secondary'}
          disabled={pending}
        >
          {pending ? 'Saving…' : mode === 'create' ? `Add ${entityLabel}` : `Save ${entityLabel}`}
        </Button>
        {cancelHref ? (
          <a
            href={cancelHref}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Cancel
          </a>
        ) : null}
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium text-red-700">{message}</p>
}
