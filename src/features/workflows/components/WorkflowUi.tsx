import type { ReactNode } from 'react'

export const fieldClass =
  'mt-1 h-10 w-full rounded-control border border-slate-300 bg-white px-3 text-sm'
export const areaClass =
  'mt-1 min-h-24 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm'
export const buttonClass =
  'inline-flex h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'

export function Notice({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const error = one(searchParams.error),
    success = one(searchParams.success)
  if (!error && !success) return null
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={`rounded-control border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
    >
      {error ?? 'The change was saved.'}
    </p>
  )
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-control border border-muted bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-sm text-slate-600">{children}</p>
}
export function Status({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
      {value.replaceAll('_', ' ')}
    </span>
  )
}
export function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
export function localDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(value))
}
