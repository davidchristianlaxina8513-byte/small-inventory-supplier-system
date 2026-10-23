import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createCategoryAction, updateCategoryAction } from '@/features/inventory/actions'
import { CatalogEntityForm } from '@/features/inventory/components/CatalogEntityForm'
import { InventoryNotice } from '@/features/inventory/components/InventoryNotice'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getCategoryOptions } from '@/features/inventory/services/catalog'

export const metadata: Metadata = {
  title: 'Inventory categories | SISS',
}

type CategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryCategoriesPage({ searchParams }: CategoriesPageProps) {
  const access = await requireInventoryAccess()
  const [categories, params] = await Promise.all([
    getCategoryOptions(
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
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="max-w-2xl leading-7 text-slate-600">
              Categories group items within an office. Deactivate a category to stop using it for
              new items while keeping existing item records intact.
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
          aria-labelledby="new-category-heading"
          className="rounded-control border border-muted bg-surface p-6 shadow-sm"
        >
          <h2 id="new-category-heading" className="text-lg font-semibold">
            Add a category
          </h2>
          <div className="mt-5">
            <CatalogEntityForm
              action={createCategoryAction}
              mode="create"
              entityLabel="category"
              idFieldName="categoryId"
              offices={access.offices}
              idPrefix="new-category"
            />
          </div>
        </section>

        <section aria-labelledby="category-list-heading" className="space-y-4">
          <h2 id="category-list-heading" className="text-lg font-semibold">
            All categories
          </h2>
          {categories.length === 0 ? (
            <p className="rounded-control border border-dashed border-muted px-4 py-8 text-center text-sm text-slate-600">
              No categories yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-control border border-muted bg-surface p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-slate-600">{category.officeName}</p>
                    </div>
                    <span
                      className={
                        category.isActive
                          ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900'
                          : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700'
                      }
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <CatalogEntityForm
                    action={updateCategoryAction}
                    mode="edit"
                    entityLabel="category"
                    idFieldName="categoryId"
                    offices={[{ id: category.officeId, name: category.officeName }]}
                    entity={category}
                    idPrefix={`category-${category.id}`}
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
