import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createLocationAction, updateLocationAction } from '@/features/inventory/actions'
import { CatalogEntityForm } from '@/features/inventory/components/CatalogEntityForm'
import { InventoryNotice } from '@/features/inventory/components/InventoryNotice'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getLocationOptions } from '@/features/inventory/services/catalog'

export const metadata: Metadata = {
  title: 'Inventory locations | SISS',
}

type LocationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryLocationsPage({ searchParams }: LocationsPageProps) {
  const access = await requireInventoryAccess()
  const [locations, params] = await Promise.all([
    getLocationOptions(
      access.offices.map((office) => office.id),
      true
    ),
    searchParams,
  ])

  return (
    <Section>
      <Container className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
            <p className="max-w-2xl leading-7 text-slate-600">
              Locations are the storage areas that hold stock for an office. Deactivate a location
              to prevent new movements into it while preserving its balance history.
            </p>
          </div>
          <Link
            href="/inventory"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to inventory
          </Link>
        </header>

        <InventoryNotice
          success={readParam(params, 'success')}
          error={readParam(params, 'error')}
        />

        <section
          aria-labelledby="new-location-heading"
          className="rounded-control border border-muted bg-surface p-6 shadow-sm"
        >
          <h2 id="new-location-heading" className="text-lg font-semibold">
            Add a location
          </h2>
          <div className="mt-5">
            <CatalogEntityForm
              action={createLocationAction}
              mode="create"
              entityLabel="location"
              idFieldName="locationId"
              offices={access.offices}
              idPrefix="new-location"
            />
          </div>
        </section>

        <section aria-labelledby="location-list-heading" className="space-y-4">
          <h2 id="location-list-heading" className="text-lg font-semibold">
            All locations
          </h2>
          {locations.length === 0 ? (
            <p className="rounded-control border border-dashed border-muted px-4 py-8 text-center text-sm text-slate-600">
              No locations yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {locations.map((location) => (
                <li
                  key={location.id}
                  className="rounded-control border border-muted bg-surface p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-slate-600">{location.officeName}</p>
                    </div>
                    <span
                      className={
                        location.isActive
                          ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900'
                          : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700'
                      }
                    >
                      {location.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <CatalogEntityForm
                    action={updateLocationAction}
                    mode="edit"
                    entityLabel="location"
                    idFieldName="locationId"
                    offices={[{ id: location.officeId, name: location.officeName }]}
                    entity={location}
                    idPrefix={`location-${location.id}`}
                  />
                </li>
              ))}
            </ul>
          )}
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
