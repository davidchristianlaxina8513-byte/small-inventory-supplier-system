import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { updateItemAction } from '@/features/inventory/actions'
import { ItemForm } from '@/features/inventory/components/ItemForm'
import { canManageInventoryOffice } from '@/features/inventory/lib/permissions'
import { isUuid } from '@/features/inventory/lib/validation'
import { requireInventoryAccess } from '@/features/inventory/services/access'
import { getCategoryOptions, getInventoryItem } from '@/features/inventory/services/catalog'

type EditItemPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit item | SISS',
}

export default async function EditInventoryItemPage({ params }: EditItemPageProps) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const access = await requireInventoryAccess()
  const item = await getInventoryItem(id)
  if (!item) notFound()
  if (!canManageInventoryOffice(access.profile, item.officeId)) notFound()

  const categories = await getCategoryOptions([item.officeId], true)

  return (
    <Section>
      <Container className="max-w-4xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Inventory</p>
            <h1 className="text-3xl font-bold tracking-tight">Edit {item.name}</h1>
            <p className="text-sm text-slate-600">
              {item.itemCode} · {item.officeName}
            </p>
          </div>
          <Link
            href={`/inventory/${item.id}`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to item
          </Link>
        </header>

        {item.movements.length > 0 ? (
          <p className="rounded-control border border-muted bg-background px-4 py-3 text-sm text-slate-600">
            Tracking type cannot be changed because this item already has stock movements.
          </p>
        ) : null}

        <div className="rounded-control border border-muted bg-surface p-6 shadow-sm">
          <ItemForm
            action={updateItemAction}
            mode="edit"
            offices={[{ id: item.officeId, name: item.officeName }]}
            categories={categories}
            item={{
              id: item.id,
              officeId: item.officeId,
              categoryId: item.categoryId,
              itemCode: item.itemCode,
              name: item.name,
              description: item.description,
              unitOfMeasure: item.unitOfMeasure,
              trackingType: item.trackingType,
              reorderLevel: item.reorderLevel,
              isActive: item.isActive,
            }}
            cancelHref={`/inventory/${item.id}`}
          />
        </div>
      </Container>
    </Section>
  )
}
