import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import {
  createPurchaseOrderAction,
  createPurchaseRequestAction,
  receivePurchaseItemAction,
} from '@/features/workflows/actions'
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
  listProcurement,
  relation,
} from '@/features/workflows/services/workflows'

export default async function PurchasingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [data, options, params] = await Promise.all([
    listProcurement(),
    getWorkflowOptions(),
    searchParams,
  ])
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Procurement</p>
          <h1 className="text-3xl font-bold">Purchasing and receiving</h1>
        </header>
        <Notice searchParams={params} />
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="New purchase request">
            <form action={createPurchaseRequestAction} className="grid gap-3 sm:grid-cols-2">
              <Select
                name="officeId"
                label="Office"
                options={options.offices.map((o) => [o.id, o.name])}
              />
              <Select
                name="itemId"
                label="Item"
                options={options.items.map((i) => [i.id, `${i.item_code} — ${i.name}`])}
              />
              <Input name="quantity" label="Quantity" type="number" />
              <Input
                name="estimatedUnitCost"
                label="Estimated unit cost"
                type="number"
                required={false}
              />
              <label className="text-sm font-medium sm:col-span-2">
                Justification
                <input className={fieldClass} name="justification" minLength={3} required />
              </label>
              <div className="sm:col-span-2 pt-2">
                <button className={buttonClass}>Submit purchase request</button>
              </div>
            </form>
          </Card>
          <Card title="Create purchase order">
            <form action={createPurchaseOrderAction} className="grid gap-3 sm:grid-cols-2">
              <Select
                name="purchaseRequestId"
                label="Purchase request"
                options={data.requests
                  .filter((r) => !['ordered', 'received', 'cancelled'].includes(r.status))
                  .map((r) => [r.id, r.reference_number])}
              />
              <Select
                name="supplierId"
                label="Supplier"
                options={data.suppliers.map((s) => [s.id, s.name])}
              />
              <Select
                name="itemId"
                label="Item"
                options={options.items.map((i) => [i.id, `${i.item_code} — ${i.name}`])}
              />
              <Select
                name="locationId"
                label="Receiving location"
                options={options.locations.map((l) => [l.id, l.name])}
              />
              <Input name="quantity" label="Ordered quantity" type="number" />
              <Input name="unitCost" label="Unit cost" type="number" />
              <div className="sm:col-span-2 pt-2">
                <button className={buttonClass}>Create order</button>
              </div>
            </form>
          </Card>
        </div>
        <Card title="Purchase requests">
          {data.requests.length === 0 ? (
            <Empty>No purchase requests are visible.</Empty>
          ) : (
            <ul className="divide-y">
              {data.requests.map((r) => (
                <li key={r.id} className="flex justify-between gap-3 py-3 text-sm">
                  <div>
                    <strong>
                      {r.reference_number} · {relation(r.offices)?.name}
                    </strong>
                    <p>{r.justification}</p>
                  </div>
                  <Status value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Purchase orders and receipts">
          {data.orders.length === 0 ? (
            <Empty>No purchase orders are visible.</Empty>
          ) : (
            <ul className="divide-y">
              {data.orders.map((o) => (
                <li key={o.id} className="py-4 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <strong>
                        {o.order_number} · {relation(o.suppliers)?.name}
                      </strong>
                      <p className="text-slate-600">Ordered {localDate(o.order_date)}</p>
                    </div>
                    <Status value={o.status} />
                  </div>
                  {o.purchase_order_items.map((i) => (
                    <div key={i.id} className="mt-3 rounded bg-slate-50 p-3">
                      <span>
                        {relation(i.items)?.name}: {Number(i.received_quantity)} /{' '}
                        {Number(i.ordered_quantity)} accepted
                      </span>
                      {Number(i.received_quantity) < Number(i.ordered_quantity) ? (
                        <form
                          action={receivePurchaseItemAction}
                          className="mt-2 flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="purchaseOrderItemId" value={i.id} />
                          <Input name="received" label="Delivered" type="number" />
                          <Input name="accepted" label="Accepted" type="number" />
                          <Input name="notes" label="Discrepancy notes" required={false} />
                          <button className={buttonClass}>Receive</button>
                        </form>
                      ) : null}
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
function Input({
  name,
  label,
  type = 'text',
  required = true,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className={fieldClass}
        name={name}
        type={type}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? '0.01' : undefined}
        required={required}
      />
    </label>
  )
}
function Select({
  name,
  label,
  options,
}: {
  name: string
  label: string
  options: [string, string][]
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select className={fieldClass} name={name} required>
        <option value="">Select</option>
        {options.map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
