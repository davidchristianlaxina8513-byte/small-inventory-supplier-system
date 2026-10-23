import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ApiHealthStatus } from './ApiHealthStatus'

afterEach(() => vi.restoreAllMocks())

test('shows online after receiving the expected health response', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  )

  render(<ApiHealthStatus />)

  expect(screen.getByRole('status')).toHaveTextContent('Checking system API...')
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('System API Online'))
  expect(fetch).toHaveBeenCalledWith(
    '/api/health',
    expect.objectContaining({ cache: 'no-store', headers: { accept: 'application/json' } })
  )
})

test.each([
  ['an HTTP failure', new Response(null, { status: 503 })],
  [
    'an invalid response body',
    new Response(JSON.stringify({ status: 'unknown' }), { status: 200 }),
  ],
])('shows unavailable for %s', async (_case, response) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)

  render(<ApiHealthStatus />)

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('System API Unavailable')
  )
})

test('shows unavailable when the request rejects', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network unavailable'))

  render(<ApiHealthStatus />)

  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('System API Unavailable')
  )
})
