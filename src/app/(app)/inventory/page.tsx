import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { InventoryNotice } from '@/features/inventory/components/InventoryNotice'
import { TRACKING_TYPES, TRACKING_TYPE_LABELS } from '@/features/inventory/lib/tracking'
import { isUuid } from '@/features/inventory/lib/validation'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getCategoryOptions, getInventoryItems } from '@/features/inventory/services/catalog'

export const metadata: Metadata = {
  title: 'Inventory | SISS',
}

type InventoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const access = await requireInventoryAccess()
  const params = await searchParams
  const requestedOfficeId = readParam(params, 'office')
  const requestedCategoryId = readParam(params, 'category')
  const requestedTrackingType = readParam(params, 'tracking')
  const requestedStatus = readParam(params, 'status')
  const filters = {
    search: readParam(params, 'q'),
    officeId:
      requestedOfficeId && access.offices.some((office) => office.id === requestedOfficeId)
        ? requestedOfficeId
        : undefined,
    categoryId:
      requestedCategoryId && isUuid(requestedCategoryId) ? requestedCategoryId : undefined,
    trackingType: TRACKING_TYPES.find((type) => type === requestedTrackingType),
    status:
      requestedStatus === 'active' || requestedStatus === 'inactive' ? requestedStatus : undefined,
  }
  const officeIds = access.offices.map((office) => office.id)
  const [items, categories] = await Promise.all([
    getInventoryItems(filters),
    getCategoryOptions(officeIds, true),
  ])

  return (
    <Section>
      <Container className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight">Items and stock</h1>
            <p className="max-w-2xl leading-7 text-slate-600">
              Track office supplies, equipment, quantities, and movement history.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/inventory/categories"
              className="inline-flex h-10 items-center rounded-control border border-muted bg-surface px-4 text-sm font-medium hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/inventory/locations"
              className="inline-flex h-10 items-center rounded-control border border-muted bg-surface px-4 text-sm font-medium hover:text-primary"
            >
              Locations
            </Link>
            <Link
              href="/inventory/new"
              className="inline-flex h-10 items-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              New item
            </Link>
          </div>
        </header>

        <InventoryNotice
          success={readParam(params, 'success')}
          error={readParam(params, 'error')}
        />

        <form
          method="get"
          className="grid gap-4 rounded-control border border-muted bg-surface p-4 md:grid-cols-2 xl:grid-cols-6"
        >
          <div className="space-y-1.5 xl:col-span-2">
            <label htmlFor="inventory-search" className="block text-sm font-medium">
              Search
            </label>
            <input
              id="inventory-search"
              name="q"
              defaultValue={filters.search}
              placeholder="Item code, name, or category"
              className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
            />
          </div>

          {access.offices.length > 1 ? (
            <div className="space-y-1.5">
              <label htmlFor="inventory-office" className="block text-sm font-medium">
                Office
              </label>
              <select
                id="inventory-office"
                name="office"
                defaultValue={filters.officeId ?? ''}
                className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
              >
                <option value="">All offices</option>
                {access.offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="inventory-category" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="inventory-category"
              name="category"
              defaultValue={filters.categoryId ?? ''}
              className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inventory-tracking" className="block text-sm font-medium">
              Tracking type
            </label>
            <select
              id="inventory-tracking"
              name="tracking"
              defaultValue={filters.trackingType ?? ''}
              className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
            >
              <option value="">All tracking types</option>
              {TRACKING_TYPES.map((trackingType) => (
                <option key={trackingType} value={trackingType}>
                  {TRACKING_TYPE_LABELS[trackingType]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="inventory-status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="inventory-status"
              name="status"
              defaultValue={filters.status ?? ''}
              className="h-10 w-full rounded-control border border-muted bg-surface px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end gap-3 md:col-span-2 xl:col-span-6">
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply filters
            </button>
            <Link
              href="/inventory"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Reset
            </Link>
          </div>
        </form>

        {items.length === 0 ? (
          <div className="rounded-control border border-dashed border-muted bg-surface px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">No items found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Adjust the filters or add the first item for an office.
            </p>
            <Link
              href="/inventory/new"
              className="mt-4 inline-flex font-medium text-primary underline-offset-4 hover:underline"
            >
              Add an item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-control border border-muted">
            <table className="min-w-full divide-y divide-muted text-sm">
              <caption className="sr-only">Inventory items</caption>
              <thead className="bg-background text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Office
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    On hand
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Reorder
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Tracking
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted bg-surface">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500">{item.itemCode}</p>
                    </td>
                    <td className="px-4 py-3">{item.categoryName}</td>
                    <td className="px-4 py-3">{item.officeName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {formatQuantity(item.totalOnHand)} {item.unitOfMeasure}
                      {item.lowStock ? (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          Low
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {item.reorderLevel === null ? '—' : formatQuantity(item.reorderLevel)}
                    </td>
                    <td className="px-4 py-3">{TRACKING_TYPE_LABELS[item.trackingType]}</td>
                    <td className={"px-4 py-3 " + (item.isActive ? 'text-green-500' : 'text-red-500')}>{item.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
