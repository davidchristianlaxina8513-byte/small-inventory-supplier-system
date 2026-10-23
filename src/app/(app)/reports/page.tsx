import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireActiveUser } from '@/features/auth/services/session'
import { Card, Empty, localDate, Status } from '@/features/workflows/components/WorkflowUi'
import {
  listIncidents,
  listLoans,
  listProcurement,
  listRequests,
  relation,
} from '@/features/workflows/services/workflows'
import { getInventoryItems } from '@/features/inventory/services/catalog'

export default async function ReportsPage() {
  await requireActiveUser()
  const [items, requests, loans, incidents, procurement] = await Promise.all([
    getInventoryItems(),
    listRequests(),
    listLoans(),
    listIncidents(),
    listProcurement(),
  ])
  const low = items.filter((i) => i.lowStock)
  const overdue = loans.filter((l) => l.status !== 'returned' && new Date(l.due_at) < new Date())
  return (
    <Section>
      <Container className="space-y-6 print:max-w-none">
        <header>
          <p className="text-sm font-semibold text-primary">Reports</p>
          <h1 className="text-3xl font-bold">Operational reports</h1>
          <p className="mt-2 text-slate-600">
            Live data is scoped by your database permissions. Use your browser’s print command for a
            printable copy.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Inventory items', items.length],
            ['Low stock', low.length],
            [
              'Pending requests',
              requests.filter((r) => ['submitted', 'under_review'].includes(r.status)).length,
            ],
            ['Overdue loans', overdue.length],
            ['Open incidents', incidents.filter((i) => i.status !== 'resolved').length],
            ['Purchase orders', procurement.orders.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-control border bg-white p-5">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="mt-1 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <Card title="Low stock">
          {low.length === 0 ? (
            <Empty>No low stock items.</Empty>
          ) : (
            <ul className="divide-y">
              {low.map((i) => (
                <li className="flex justify-between py-2 text-sm" key={i.id}>
                  <span>
                    {i.itemCode} · {i.name}
                  </span>
                  <span>
                    {i.totalOnHand} {i.unitOfMeasure}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Pending requests">
          {requests.filter((r) => ['submitted', 'under_review'].includes(r.status)).length === 0 ? (
            <Empty>No pending requests.</Empty>
          ) : (
            <ul className="divide-y">
              {requests
                .filter((r) => ['submitted', 'under_review'].includes(r.status))
                .map((r) => (
                  <li className="flex justify-between py-2 text-sm" key={r.id}>
                    <span>
                      {r.reference_number} · {relation(r.offices)?.name}
                    </span>
                    <Status value={r.status} />
                  </li>
                ))}
            </ul>
          )}
        </Card>
        <Card title="Overdue loans">
          {overdue.length === 0 ? (
            <Empty>No overdue loans.</Empty>
          ) : (
            <ul className="divide-y">
              {overdue.map((l) => (
                <li className="flex justify-between py-2 text-sm" key={l.id}>
                  <span>
                    {relation(l.requests)?.reference_number} · {relation(l.profiles)?.full_name}
                  </span>
                  <span className="text-red-700">Due {localDate(l.due_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  )
}
