import { expect, test } from 'vitest'
import { validateCredentials } from './validation'

test('requires an email address', () => {
  expect(validateCredentials('', 'password123')).toEqual({
    email: 'Enter your email address.',
  })
})

test('rejects malformed email addresses', () => {
  expect(validateCredentials('not-an-email', 'password123')).toEqual({
    email: 'Enter a valid email address.',
  })
})

test('requires a password', () => {
  expect(validateCredentials('user@school.test', '')).toEqual({
    password: 'Enter your password.',
  })
})

test('accepts valid credentials', () => {
  expect(validateCredentials('user@school.test', 'password123')).toEqual({})
})
