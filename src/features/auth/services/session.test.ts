import { beforeEach, describe, expect, test, vi } from 'vitest'

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: (fn: unknown) => fn }
})

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`)
  },
  notFound: () => {
    throw new Error('not-found')
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

import { requireActiveUser, requireAdmin } from './session'

type TestRole = 'student' | 'admin'

function makeProfile(status: 'pending' | 'active' | 'suspended', roles: TestRole[]) {
  return {
    id: 'user-1',
    full_name: 'Test User',
    school_id: null,
    account_status: status,
    office_id: null,
    offices: null,
    user_roles: roles.map((role) => ({ role, office_id: null, offices: null })),
  }
}

function mockSession(
  profile: ReturnType<typeof makeProfile> | null,
  user: { id: string } | null = profile ? { id: profile.id } : null
) {
  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
        })),
      })),
    })),
  })
}

describe('active-account guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects unauthenticated users to login', async () => {
    mockSession(null, null)

    await expect(requireActiveUser()).rejects.toThrow('redirect:/login')
  })

  test('redirects pending users to account status', async () => {
    mockSession(makeProfile('pending', []))

    await expect(requireActiveUser()).rejects.toThrow('redirect:/account-status')
  })

  test('redirects suspended users to account status', async () => {
    mockSession(makeProfile('suspended', ['student']))

    await expect(requireActiveUser()).rejects.toThrow('redirect:/account-status')
  })

  test('denies admin routes to active non-admins', async () => {
    mockSession(makeProfile('active', ['student']))

    await expect(requireAdmin()).rejects.toThrow('not-found')
  })

  test('allows active admins through', async () => {
    mockSession(makeProfile('active', ['admin']))

    await expect(requireAdmin()).resolves.toMatchObject({
      id: 'user-1',
      status: 'active',
    })
  })
})
