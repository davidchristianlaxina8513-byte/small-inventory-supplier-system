import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createItemAction } from '@/features/inventory/actions'
import { ItemForm } from '@/features/inventory/components/ItemForm'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getCategoryOptions } from '@/features/inventory/services/catalog'

export const metadata: Metadata = {
  title: 'New item | SISS',
}

export default async function NewInventoryItemPage() {
  const access = await requireInventoryAccess()
  const categories = await getCategoryOptions(
    access.offices.map((office) => office.id),
    false
  )

  return (
    <Section>
      <Container className="max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">Inventory</p>
          <h1 className="text-3xl font-bold tracking-tight">New item</h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            Create the catalog record first. Quantities are added later through stock movements, not
            by editing the catalog.
          </p>
        </header>

        {categories.length === 0 ? (
          <p className="rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This office has no active categories yet.{' '}
            <Link href="/inventory/categories" className="font-medium underline underline-offset-4">
              Create a category first
            </Link>
            .
          </p>
        ) : null}

        <div className="rounded-control border border-muted bg-surface p-6 shadow-sm">
          <ItemForm
            action={createItemAction}
            mode="create"
            offices={access.offices}
            categories={categories}
            cancelHref="/inventory"
          />
        </div>
      </Container>
    </Section>
  )
}
