// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, test, vi } from 'vitest'

const { getClaims } = vi.hoisted(() => ({ getClaims: vi.fn() }))

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getClaims } }),
}))

import { updateSession } from './proxy'

function request(path: string) {
  return new NextRequest(`http://127.0.0.1:3000${path}`)
}

describe('updateSession', () => {
  test('lets the login page handle an authenticated session', async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: { sub: 'user-1' } } })

    const response = await updateSession(request('/login'))

    expect(response.headers.get('location')).toBeNull()
  })

  test('redirects unauthenticated protected requests to login', async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: null } })

    const response = await updateSession(request('/dashboard'))

    expect(response.headers.get('location')).toContain('/login')
  })
})
