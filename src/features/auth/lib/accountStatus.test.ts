import { expect, test } from 'vitest'
import { canAccessApplication, describeAccountStatus } from './accountStatus'

test('only active accounts can access the application', () => {
  expect(canAccessApplication('active')).toBe(true)
  expect(canAccessApplication('pending')).toBe(false)
  expect(canAccessApplication('suspended')).toBe(false)
  expect(canAccessApplication(null)).toBe(false)
  expect(canAccessApplication(undefined)).toBe(false)
})

test('describes non-active account states without exposing internals', () => {
  expect(describeAccountStatus('pending')).toBe(
    'Your account is waiting for an administrator to approve it.'
  )
  expect(describeAccountStatus('suspended')).toBe(
    'Your account is suspended. Contact an administrator if you believe this is a mistake.'
  )
  expect(describeAccountStatus('active')).toBe('Your account is active.')
})
