import { expect, test } from 'vitest'
import { validateCredentials, validateRegistration } from './validation'

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

test('validateRegistration requires full name and valid fields', () => {
  expect(
    validateRegistration({
      fullName: '',
      email: 'bad-email',
      password: '123',
      confirmPassword: '456',
    })
  ).toEqual({
    fullName: 'Enter your full name.',
    email: 'Enter a valid email address.',
    password: 'Password must be at least 6 characters.',
    confirmPassword: 'Passwords do not match.',
  })
})

test('validateRegistration accepts valid registration payload', () => {
  expect(
    validateRegistration({
      fullName: 'Juan Dela Cruz',
      email: 'juan@school.edu',
      password: 'secretpassword',
      confirmPassword: 'secretpassword',
      schoolId: '2026-001',
    })
  ).toEqual({})
})
