import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createSupplierAction } from '@/features/workflows/actions'
import {
  buttonClass,
  Card,
  Empty,
  fieldClass,
  Notice,
} from '@/features/workflows/components/WorkflowUi'
import { listProcurement } from '@/features/workflows/services/workflows'

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [data, params] = await Promise.all([listProcurement(), searchParams])
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Procurement</p>
          <h1 className="text-3xl font-bold">Suppliers</h1>
        </header>
        <Notice searchParams={params} />
        <Card title="Add supplier">
          <form action={createSupplierAction} className="grid gap-3 sm:grid-cols-3">
            {[
              ['name', 'Supplier name'],
              ['contactPerson', 'Contact person'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['address', 'Address'],
            ].map(([name, label], index) => (
              <label key={name} className="text-sm font-medium">
                {label}
                <input
                  className={fieldClass}
                  name={name}
                  type={name === 'email' ? 'email' : 'text'}
                  required={index === 0}
                />
              </label>
            ))}
            <button className={buttonClass}>Save supplier</button>
          </form>
        </Card>
        <Card title="Supplier directory">
          {data.suppliers.length === 0 ? (
            <Empty>No suppliers have been added.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Name</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {data.suppliers.map((s) => (
                    <tr className="border-b" key={s.id}>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2">{s.contact_person ?? '—'}</td>
                      <td className="p-2">{s.email ?? '—'}</td>
                      <td className="p-2">{s.phone ?? '—'}</td>
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
