import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { markNotificationsReadAction } from '@/features/workflows/actions'
import { buttonClass, Card, Empty, localDate } from '@/features/workflows/components/WorkflowUi'
import { listNotifications } from '@/features/workflows/services/workflows'

export default async function NotificationsPage() {
  const rows = await listNotifications()
  return (
    <Section>
      <Container className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Updates</p>
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          {rows.some((row) => !row.read_at) ? (
            <form action={markNotificationsReadAction}>
              <button className={buttonClass}>Mark all read</button>
            </form>
          ) : null}
        </header>
        <Card title="Recent notifications">
          {rows.length === 0 ? (
            <Empty>You have no notifications.</Empty>
          ) : (
            <ul className="divide-y">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={`py-3 text-sm ${row.read_at ? 'text-slate-600' : 'font-medium'}`}
                >
                  <p>{row.title}</p>
                  <p className="font-normal">{row.message}</p>
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    {localDate(row.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Container>
    </Section>
  )
}
