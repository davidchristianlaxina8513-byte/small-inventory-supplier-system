import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireActiveUser } from '@/features/auth/services/session'
import { createIncidentAction, resolveIncidentAction } from '@/features/workflows/actions'
import {
  areaClass,
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
  listIncidents,
  relation,
} from '@/features/workflows/services/workflows'

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [profile, rows, options, params] = await Promise.all([
    requireActiveUser(),
    listIncidents(),
    getWorkflowOptions(),
    searchParams,
  ])
  const staff = profile.roles.some(({ role }) =>
    ['admin', 'office_staff', 'office_head'].includes(role)
  )
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Accountability</p>
          <h1 className="text-3xl font-bold">Damage and missing item reports</h1>
        </header>
        <Notice searchParams={params} />
        <Card title="Report an incident">
          <form action={createIncidentAction} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Item
              <select className={fieldClass} name="itemId" required>
                <option value="">Select</option>
                {options.items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.item_code} — {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Asset, when serialized
              <select className={fieldClass} name="assetId">
                <option value="">No specific asset</option>
                {options.assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_code}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Incident type
              <select className={fieldClass} name="incidentType">
                <option value="damage">Damage</option>
                <option value="missing">Missing</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Occurred at
              <input className={fieldClass} type="datetime-local" name="occurredAt" required />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Description
              <textarea className={areaClass} name="description" minLength={5} required />
            </label>
            <button className={buttonClass}>Submit report</button>
          </form>
        </Card>
        <Card title="Incident register">
          {rows.length === 0 ? (
            <Empty>No incidents are visible.</Empty>
          ) : (
            <ul className="divide-y divide-muted">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                  <div>
                    <strong>
                      {relation(r.items)?.item_code} · {relation(r.items)?.name}
                    </strong>
                    <p>{r.description}</p>
                    <p className="text-slate-600">
                      {r.incident_type} · {localDate(r.occurred_at)} · reported by{' '}
                      {relation(r.profiles)?.full_name}
                    </p>
                  </div>
                  <div>
                    <Status value={r.status} />
                    {staff && r.status !== 'resolved' ? (
                      <form action={resolveIncidentAction} className="mt-2 grid gap-2">
                        <input type="hidden" name="incidentId" value={r.id} />
                        <input
                          className={fieldClass}
                          name="resolution"
                          placeholder="Resolution"
                          required
                        />
                        <select className={fieldClass} name="assetCondition">
                          <option value="">Keep asset state</option>
                          {['good', 'fair', 'damaged', 'missing', 'under_repair', 'disposed'].map(
                            (value) => (
                              <option key={value}>{value}</option>
                            )
                          )}
                        </select>
                        <button className={buttonClass}>Resolve</button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  )
}
