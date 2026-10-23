import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { releaseLoanAction, returnLoanAssetAction } from '@/features/workflows/actions'
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
  listLoans,
  listRequests,
  relation,
} from '@/features/workflows/services/workflows'

export default async function BorrowingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [loans, requests, options, params] = await Promise.all([
    listLoans(),
    listRequests(),
    getWorkflowOptions(),
    searchParams,
  ])
  const approved = requests.filter(
    (r) => r.request_type === 'borrow' && ['approved', 'partially_approved'].includes(r.status)
  )
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Circulation</p>
          <h1 className="text-3xl font-bold">Borrowings and returns</h1>
        </header>
        <Notice searchParams={params} />
        <Card title="Release approved borrowing">
          <form action={releaseLoanAction} className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-medium">
              Approved request
              <select className={fieldClass} name="requestId" required>
                <option value="">Select</option>
                {approved.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reference_number}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Available asset
              <select className={fieldClass} name="assetId" required>
                <option value="">Select</option>
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
              Due date
              <input className={fieldClass} name="dueAt" type="datetime-local" required />
            </label>
            <button className={buttonClass}>Release asset</button>
          </form>
        </Card>
        <Card title="Loan register">
          {loans.length === 0 ? (
            <Empty>No loans are visible.</Empty>
          ) : (
            <ul className="divide-y divide-muted">
              {loans.map((l) => (
                <li key={l.id} className="py-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <div>
                      <strong>
                        {relation(l.requests)?.reference_number} · {relation(l.profiles)?.full_name}
                      </strong>
                      <p
                        className={
                          l.status !== 'returned' && new Date(l.due_at) < new Date()
                            ? 'text-red-700'
                            : 'text-slate-600'
                        }
                      >
                        Due {localDate(l.due_at)}
                        {l.status !== 'returned' && new Date(l.due_at) < new Date()
                          ? ' · Overdue'
                          : ''}
                      </p>
                    </div>
                    <Status value={l.status} />
                  </div>
                  {l.loan_assets.map((a) => (
                    <div key={a.id} className="mt-3 rounded bg-slate-50 p-3">
                      <span>
                        {relation(a.assets)?.asset_code} ·{' '}
                        {relation(relation(a.assets)?.items ?? null)?.name}
                      </span>
                      {!a.returned_at ? (
                        <form
                          action={returnLoanAssetAction}
                          className="mt-2 flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="loanAssetId" value={a.id} />
                          <label className="text-xs">
                            Return condition
                            <select className={fieldClass} name="condition">
                              {['good', 'fair', 'damaged', 'missing', 'under_repair'].map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                          </label>
                          <button className={buttonClass}>Record return</button>
                        </form>
                      ) : (
                        <span className="ml-3 text-slate-600">
                          Returned {localDate(a.returned_at)}
                        </span>
                      )}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  )
}
