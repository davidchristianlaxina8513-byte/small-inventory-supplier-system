import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { recordMovementAction, setItemActiveAction } from '@/features/inventory/actions'
import { InventoryNotice } from '@/features/inventory/components/InventoryNotice'
import { MovementForm } from '@/features/inventory/components/MovementForm'
import { MovementHistory } from '@/features/inventory/components/MovementHistory'
import { canManageInventoryOffice, canRecordAdjustment } from '@/features/inventory/lib/permissions'
import { TRACKING_TYPE_LABELS } from '@/features/inventory/lib/tracking'
import { isUuid } from '@/features/inventory/lib/validation'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getInventoryItem, getLocationOptions } from '@/features/inventory/services/catalog'
import { transferStockAction } from '@/features/workflows/actions'
import { buttonClass, fieldClass } from '@/features/workflows/components/WorkflowUi'

type ItemDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
  title: 'Inventory item | SISS',
}

export default async function InventoryItemPage({ params, searchParams }: ItemDetailPageProps) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const access = await requireInventoryAccess()
  const item = await getInventoryItem(id)
  if (!item) notFound()

  const [locations, query] = await Promise.all([
    getLocationOptions([item.officeId], false),
    searchParams,
  ])
  const canManage = canManageInventoryOffice(access.profile, item.officeId)
  const canAdjust = canRecordAdjustment(access.profile, item.officeId)
  const success = readParam(query, 'success')
  const error = readParam(query, 'error')

  return (
    <Section>
      <Container className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Inventory</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <span
                className={
                  item.isActive
                    ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900'
                    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700'
                }
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {item.itemCode} · {item.categoryName} · {item.officeName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/inventory"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to inventory
            </Link>
            {canManage ? (
              <Link
                href={`/inventory/${item.id}/edit`}
                className="inline-flex h-10 items-center rounded-control border border-muted bg-surface px-4 text-sm font-medium hover:text-primary"
              >
                Edit item
              </Link>
            ) : null}
            {canManage ? (
              <form action={setItemActiveAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="isActive" value={item.isActive ? 'false' : 'true'} />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-control border border-muted bg-surface px-4 text-sm font-medium hover:text-primary"
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </form>
            ) : null}
          </div>
        </header>

        <InventoryNotice success={success} error={error} />

        <div className="grid gap-6 lg:grid-cols-3">
          <section
            aria-labelledby="item-summary-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm lg:col-span-2"
          >
            <h2 id="item-summary-heading" className="text-lg font-semibold">
              Item details
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-600">Tracking type</dt>
                <dd>{TRACKING_TYPE_LABELS[item.trackingType]}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Unit of measure</dt>
                <dd>{item.unitOfMeasure}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Reorder level</dt>
                <dd>
                  {item.reorderLevel === null ? 'Not set' : formatQuantity(item.reorderLevel)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">On hand</dt>
                <dd className="tabular-nums">
                  {formatQuantity(item.totalOnHand)} {item.unitOfMeasure}
                  {item.lowStock ? (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      Low stock
                    </span>
                  ) : null}
                </dd>
              </div>
              {item.description ? (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-slate-600">Description</dt>
                  <dd className="whitespace-pre-line">{item.description}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section
            aria-labelledby="item-balances-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm"
          >
            <h2 id="item-balances-heading" className="text-lg font-semibold">
              Balances by location
            </h2>
            {item.balances.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No stock has been recorded yet.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {item.balances.map((balance) => (
                  <li key={balance.locationId} className="flex items-center justify-between gap-4">
                    <span>{balance.locationName}</span>
                    <span className="tabular-nums">
                      {formatQuantity(balance.quantityOnHand)} {item.unitOfMeasure}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {canManage ? (
          <section
            aria-labelledby="record-movement-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm"
          >
            <h2 id="record-movement-heading" className="text-lg font-semibold">
              Record stock movement
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Every change must explain why stock moved. Recorded movements cannot be edited or
              deleted.
            </p>
            <div className="mt-5">
              <MovementForm
                action={recordMovementAction}
                itemId={item.id}
                locations={locations}
                canAdjust={canAdjust}
              />
            </div>
          </section>
        ) : null}

        {canManage && item.trackingType === 'quantity_stock' && locations.length > 1 ? (
          <section
            aria-labelledby="transfer-stock-heading"
            className="rounded-control border border-muted bg-surface p-6 shadow-sm"
          >
            <h2 id="transfer-stock-heading" className="text-lg font-semibold">
              Transfer stock
            </h2>
            <form
              action={transferStockAction}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input type="hidden" name="itemId" value={item.id} />
              <label className="text-sm font-medium">
                From
                <select className={fieldClass} name="fromLocationId" required>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                To
                <select className={fieldClass} name="toLocationId" required>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Quantity
                <input
                  className={fieldClass}
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Reason
                <input className={fieldClass} name="reason" required />
              </label>
              <button className={buttonClass}>Transfer</button>
            </form>
          </section>
        ) : null}

        <section aria-labelledby="movement-history-heading" className="space-y-4">
          <div>
            <h2 id="movement-history-heading" className="text-lg font-semibold">
              Movement history
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Permanent append-only ledger, newest first.
            </p>
          </div>
          <MovementHistory movements={item.movements} />
        </section>
      </Container>
    </Section>
  )
}

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 3 }).format(value)
}
