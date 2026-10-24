import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { createRequestAction } from '@/features/workflows/actions'
import {
  areaClass,
  buttonClass,
  fieldClass,
  Notice,
} from '@/features/workflows/components/WorkflowUi'
import { getWorkflowOptions } from '@/features/workflows/services/workflows'

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [options, params] = await Promise.all([getWorkflowOptions(), searchParams])
  return (
    <Section>
      <Container className="space-y-6">
        <header>
          <Link className="text-sm text-primary hover:underline" href="/requests">
            Back to requests
          </Link>
          <h1 className="mt-2 text-3xl font-bold">New request</h1>
          <p className="mt-2 text-slate-600">
            Submit one item now. Additional items can be submitted as separate request lines in this
            prototype.
          </p>
        </header>
        <Notice searchParams={params} />
        <form
          action={createRequestAction}
          className="grid gap-4 rounded-control border border-muted bg-surface p-6 sm:grid-cols-2"
        >
          <Label text="Office">
            <select className={fieldClass} name="officeId" required>
              <option value="">Select office</option>
              {options.offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Request type">
            <select className={fieldClass} name="requestType" required>
              {['consumable', 'borrow', 'reservation', 'purchase', 'other'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Label>
          <Label text="Item">
            <select className={fieldClass} name="itemId" required>
              <option value="">Select item</option>
              {options.items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.item_code} — {i.name}
                </option>
              ))}
            </select>
          </Label>
          <Label text="Quantity">
            <input
              className={fieldClass}
              name="quantity"
              type="number"
              min="0.001"
              step="0.001"
              required
            />
          </Label>
          <Label text="Needed date">
            <input className={fieldClass} name="neededAt" type="datetime-local" />
          </Label>
          <div className="sm:col-span-2">
            <Label text="Purpose">
              <textarea
                className={areaClass}
                name="purpose"
                minLength={3}
                maxLength={1000}
                required
              />
            </Label>
          </div>
          <div className="sm:col-span-2">
            <Label text="Notes">
              <textarea className={areaClass} name="notes" maxLength={500} />
            </Label>
          </div>
          <div className="sm:col-span-2 pt-2">
            <button className={buttonClass} type="submit">
              Submit request
            </button>
          </div>
        </form>
      </Container>
    </Section>
  )
}
function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium">
      {text}
      {children}
    </label>
  )
}
