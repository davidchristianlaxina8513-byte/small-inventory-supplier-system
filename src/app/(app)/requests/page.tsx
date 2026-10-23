import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireActiveUser } from '@/features/auth/services/session'
import { decideRequestAction, issueRequestItemAction } from '@/features/workflows/actions'
import {
  buttonClass,
  Card,
  Empty,
  fieldClass,
  localDate,
  Notice,
  Status,
} from '@/features/workflows/components/WorkflowUi'
import { getWorkflowOptions, listRequests, relation } from '@/features/workflows/services/workflows'

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [profile, requests, options, params] = await Promise.all([
    requireActiveUser(),
    listRequests(),
    getWorkflowOptions(),
    searchParams,
  ])
  const staff = profile.roles.some((r) => ['admin', 'office_head', 'office_staff'].includes(r.role))
  const approver = profile.roles.some((r) => ['admin', 'office_head'].includes(r.role))
  return (
    <Section>
      <Container className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Requests</p>
            <h1 className="text-3xl font-bold">Requests and approvals</h1>
          </div>
          <Link className={buttonClass} href="/requests/new">
            New request
          </Link>
        </header>
        <Notice searchParams={params} />
        {requests.length === 0 ? (
          <Empty>No requests are visible to your account.</Empty>
        ) : (
          requests.map((request) => (
            <Card key={request.id} title={`${request.reference_number} · ${request.request_type}`}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p>{request.purpose}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {relation(request.profiles)?.full_name ?? 'Unknown requester'} ·{' '}
                    {relation(request.offices)?.name ?? 'Unknown office'} ·{' '}
                    {localDate(request.created_at)}
                  </p>
                </div>
                <Status value={request.status} />
              </div>
              <ul className="mt-4 divide-y divide-muted border-y border-muted">
                {request.request_items.map((item) => (
                  <li key={item.id} className="py-3 text-sm">
                    <strong>
                      {relation(item.items)?.item_code} {relation(item.items)?.name}
                    </strong>
                    <span className="ml-3 text-slate-600">
                      Requested {Number(item.requested_quantity)} · Approved{' '}
                      {item.approved_quantity === null ? '—' : Number(item.approved_quantity)} ·
                      Issued {Number(item.issued_quantity)}
                    </span>
                    {staff &&
                    ['approved', 'partially_approved'].includes(request.status) &&
                    Number(item.issued_quantity) < Number(item.approved_quantity ?? 0) ? (
                      <form
                        action={issueRequestItemAction}
                        className="mt-3 flex flex-wrap items-end gap-2"
                      >
                        <input type="hidden" name="requestItemId" value={item.id} />
                        <label className="text-xs">
                          Location
                          <select className={fieldClass} name="locationId" required>
                            {options.locations.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs">
                          Issue quantity
                          <input
                            className={fieldClass}
                            name="quantity"
                            type="number"
                            min="0.001"
                            step="0.001"
                            max={Number(item.approved_quantity ?? 0) - Number(item.issued_quantity)}
                            required
                          />
                        </label>
                        <button className={buttonClass}>Issue stock</button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
              {approver &&
              ['submitted', 'under_review', 'needs_clarification'].includes(request.status) ? (
                <form action={decideRequestAction} className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input type="hidden" name="requestId" value={request.id} />
                  {request.request_items.map((item) => (
                    <label key={item.id} className="text-sm">
                      Approved quantity
                      <input
                        className={fieldClass}
                        name={`approved-${item.id}`}
                        type="number"
                        min="0"
                        max={Number(item.requested_quantity)}
                        step="0.001"
                        defaultValue={Number(item.requested_quantity)}
                      />
                    </label>
                  ))}
                  <label className="text-sm">
                    Decision
                    <select className={fieldClass} name="decision">
                      <option value="approve">Approve</option>
                      <option value="partially_approve">Partially approve</option>
                      <option value="needs_clarification">Needs clarification</option>
                      <option value="reject">Reject</option>
                    </select>
                  </label>
                  <label className="text-sm sm:col-span-2">
                    Reason
                    <input className={fieldClass} name="reason" minLength={2} required />
                  </label>
                  <button className={buttonClass}>Record decision</button>
                </form>
              ) : null}
            </Card>
          ))
        )}
      </Container>
    </Section>
  )
}
