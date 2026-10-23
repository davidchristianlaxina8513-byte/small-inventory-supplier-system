'use client'

import { useEffect, useState } from 'react'

type HealthState = 'loading' | 'online' | 'error'

function isHealthyResponse(value: unknown): value is { status: 'ok' } {
  if (typeof value !== 'object' || value === null) return false
  return 'status' in value && value.status === 'ok'
}

export function ApiHealthStatus() {
  const [state, setState] = useState<HealthState>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function checkHealth() {
      try {
        const response = await fetch('/api/health', {
          cache: 'no-store',
          headers: { accept: 'application/json' },
          signal: controller.signal,
        })
        if (!response.ok || !isHealthyResponse(await response.json())) {
          throw new Error('Unexpected health response')
        }
        setState('online')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState('error')
      }
    }

    void checkHealth()
    return () => controller.abort()
  }, [])

  const label =
    state === 'loading'
      ? 'Checking system API...'
      : state === 'online'
        ? 'System API Online'
        : 'System API Unavailable'

  return (
    <section
      aria-labelledby="api-health-heading"
      className="rounded-control border border-muted bg-surface p-5 shadow-sm"
      data-testid="api-health-status"
    >
      <h2 id="api-health-heading" className="text-sm font-semibold text-slate-600">
        Integration status
      </h2>
      <p className="mt-2 flex items-center gap-2 font-medium" role="status" aria-live="polite">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${
            state === 'online'
              ? 'bg-emerald-500'
              : state === 'error'
                ? 'bg-red-500'
                : 'bg-amber-500'
          }`}
        />
        {label}
      </p>
      {state === 'error' ? (
        <p className="mt-2 text-sm text-slate-600">
          The application could not reach its health endpoint.
        </p>
      ) : null}
    </section>
  )
}
