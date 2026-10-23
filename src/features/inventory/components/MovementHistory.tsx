import { MOVEMENT_TYPE_LABELS } from '@/features/inventory/lib/tracking'
import type { InventoryMovement } from '@/features/inventory/services/catalog'

const quantityFormatter = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 3 })
const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type MovementHistoryProps = {
  movements: InventoryMovement[]
}

export function MovementHistory({ movements }: MovementHistoryProps) {
  if (movements.length === 0) {
    return (
      <p className="rounded-control border border-dashed border-muted px-4 py-8 text-center text-sm text-slate-600">
        No stock movements recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-control border border-muted">
      <table className="min-w-full divide-y divide-muted text-sm">
        <caption className="sr-only">Stock movement history</caption>
        <thead className="bg-background text-left">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Date
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Quantity
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Reason
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Reference
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Recorded by
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-muted bg-surface">
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="whitespace-nowrap px-4 py-3">
                {dateFormatter.format(new Date(movement.createdAt))}
              </td>
              <td className="px-4 py-3">{MOVEMENT_TYPE_LABELS[movement.movementType]}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                {quantityFormatter.format(movement.quantity)}
              </td>
              <td className="max-w-xs px-4 py-3">{movement.reason}</td>
              <td className="px-4 py-3">{movement.reference ?? '—'}</td>
              <td className="px-4 py-3">{movement.performedByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
