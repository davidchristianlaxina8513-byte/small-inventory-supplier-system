import type { StarterStatus as Status } from '../types'

export function StarterStatus({ status }: { status: Status }) {
  return <div data-ui="starter-status" className="space-y-3"><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{status.heading}</h1><p className="text-sm font-medium text-primary">Architecture: {status.profile}</p></div>
}
