import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createReservationAction } from '@/features/workflows/actions'
import {
  buttonClass,
  Card,
  Empty,
  fieldClass,
  localDate,
  Notice,
  Status,
} from '@/features/workflows/components/WorkflowUi'
import {
  getWorkflowOptions,
  listReservations,
  relation,
} from '@/features/workflows/services/workflows'

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [rows, options, params] = await Promise.all([
    listReservations(),
    getWorkflowOptions(),
    searchParams,
  ])
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Scheduling</p>
          <h1 className="text-3xl font-bold">Equipment reservations</h1>
        </header>
        <Notice searchParams={params} />
        <Card title="Reserve an asset">
          <form action={createReservationAction} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Asset
              <select className={fieldClass} name="assetId" required>
                <option value="">Select available asset</option>
                {options.assets
                  .filter((a) => a.status === 'available')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.asset_code}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Purpose
              <input className={fieldClass} name="purpose" minLength={3} required />
            </label>
            <label className="text-sm font-medium">
              Starts
              <input className={fieldClass} type="datetime-local" name="startsAt" required />
            </label>
            <label className="text-sm font-medium">
              Ends
              <input className={fieldClass} type="datetime-local" name="endsAt" required />
            </label>
            <button className={buttonClass}>Reserve asset</button>
          </form>
        </Card>
        <Card title="Reservation schedule">
          {rows.length === 0 ? (
            <Empty>No reservations are visible.</Empty>
          ) : (
            <ul className="divide-y divide-muted">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                  <div>
                    <strong>
                      {relation(r.assets)?.asset_code} ·{' '}
                      {relation(relation(r.assets)?.items ?? null)?.name}
                    </strong>
                    <p className="text-slate-600">
                      {localDate(r.starts_at)} to {localDate(r.ends_at)} · {r.purpose}
                    </p>
                  </div>
                  <Status value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  )
}
