import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createAssetAction } from '@/features/workflows/actions'
import {
  buttonClass,
  Card,
  Empty,
  fieldClass,
  Notice,
  Status,
} from '@/features/workflows/components/WorkflowUi'
import { getWorkflowOptions, listAssets, relation } from '@/features/workflows/services/workflows'

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [assets, options, params] = await Promise.all([
    listAssets(),
    getWorkflowOptions(),
    searchParams,
  ])
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Inventory</p>
          <h1 className="text-3xl font-bold">Serialized assets</h1>
          <p className="mt-2 text-slate-600">
            Register and track individually identified equipment.
          </p>
        </header>
        <Notice searchParams={params} />
        <Card title="Register asset">
          <form action={createAssetAction} className="grid gap-3 sm:grid-cols-3">
            <Select
              name="officeId"
              label="Office"
              options={options.offices.map((o) => [o.id, o.name])}
            />
            <Select
              name="itemId"
              label="Serialized item"
              options={options.items
                .filter((i) => i.tracking_type === 'serialized_asset')
                .map((i) => [i.id, `${i.item_code} — ${i.name}`])}
            />
            <Select
              name="locationId"
              label="Location"
              options={options.locations.map((l) => [l.id, l.name])}
            />
            <Input name="assetCode" label="Asset code" />
            <Input name="serialNumber" label="Serial number (optional)" required={false} />
            <Input name="notes" label="Notes (optional)" required={false} />
            <button className={buttonClass}>Register asset</button>
          </form>
        </Card>
        <Card title="Asset register">
          {assets.length === 0 ? (
            <Empty>No serialized assets have been registered.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="p-2">Code</th>
                    <th className="p-2">Item</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Condition</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-b border-muted">
                      <td className="p-2 font-medium">{a.asset_code}</td>
                      <td className="p-2">{relation(a.items)?.name}</td>
                      <td className="p-2">{relation(a.locations)?.name}</td>
                      <td className="p-2">
                        <Status value={a.condition} />
                      </td>
                      <td className="p-2">
                        <Status value={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Container>
    </Section>
  )
}
function Input({
  name,
  label,
  required = true,
}: {
  name: string
  label: string
  required?: boolean
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input className={fieldClass} name={name} required={required} />
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
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
