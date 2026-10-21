import { expect, test } from 'vitest'
import { roleLabel } from './roles'

test('labels every application role for display', () => {
  expect(roleLabel('student')).toBe('Student')
  expect(roleLabel('teacher')).toBe('Teacher')
  expect(roleLabel('non_teaching')).toBe('Non-teaching staff')
  expect(roleLabel('office_staff')).toBe('Office staff')
  expect(roleLabel('office_head')).toBe('Office head')
  expect(roleLabel('admin')).toBe('Administrator')
})
