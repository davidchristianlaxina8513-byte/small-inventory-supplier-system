import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { requireAdmin } from '@/features/auth/services/session'
import { saveOfficeAction } from '@/features/workflows/actions'
import { buttonClass, Card, fieldClass } from '@/features/workflows/components/WorkflowUi'
import { createClient } from '@/lib/supabase/server'

export default async function OfficesPage() {
  await requireAdmin()
  const supabase = await createClient()
  const { data: offices } = await supabase.from('offices').select('*').order('name')
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="text-3xl font-bold">Offices</h1>
        </header>
        <Card title="Add office">
          <form action={saveOfficeAction} className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">
              Office name
              <input className={fieldClass} name="name" required />
            </label>
            <button className={buttonClass}>Add office</button>
          </form>
        </Card>
        <Card title="Office records">
          <ul className="divide-y">
            {(offices ?? []).map((o) => (
              <li key={o.id} className="py-3">
                <form action={saveOfficeAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="officeId" value={o.id} />
                  <label className="text-sm font-medium">
                    Name
                    <input className={fieldClass} name="name" defaultValue={o.name} required />
                  </label>
                  <label className="text-sm font-medium">
                    Status
                    <select
                      className={fieldClass}
                      name="isActive"
                      defaultValue={String(o.is_active)}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <button className={buttonClass}>Save</button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </Section>
  )
}
