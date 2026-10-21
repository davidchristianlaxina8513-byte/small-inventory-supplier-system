import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { StarterStatus } from '@/features/status/components/StarterStatus'
import { getStarterStatus } from '@/features/status/services/getStarterStatus'

export default function HomePage() {
  const status = getStarterStatus()
  return (
    <main>
      <Section ui="hero" className="min-h-screen">
        <Container className="space-y-4">
          <p className="text-sm font-semibold text-primary">create-win-project</p>
          <StarterStatus status={status} />
          <p className="max-w-2xl leading-7">{"anewwebapplication"}</p>
          <p>Read <code>AGENTS.md</code> before your first change.</p>
        </Container>
      </Section>
    </main>
  )
}
