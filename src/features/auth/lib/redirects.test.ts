import { expect, test } from 'vitest'
import { safeNextPath } from './redirects'

test('defaults to the dashboard when no destination is given', () => {
  expect(safeNextPath(undefined)).toBe('/dashboard')
  expect(safeNextPath('')).toBe('/dashboard')
  expect(safeNextPath('   ')).toBe('/dashboard')
})

test('accepts application-relative destinations', () => {
  expect(safeNextPath('/dashboard')).toBe('/dashboard')
  expect(safeNextPath('/admin/users?filter=active')).toBe('/admin/users?filter=active')
})

test('rejects absolute, protocol-relative, and scheme URLs', () => {
  expect(safeNextPath('https://evil.example/steal')).toBe('/dashboard')
  expect(safeNextPath('//evil.example/steal')).toBe('/dashboard')
  expect(safeNextPath('javascript:alert(1)')).toBe('/dashboard')
  expect(safeNextPath('/\\evil.example')).toBe('/dashboard')
})

test('rejects destinations containing control characters', () => {
  expect(safeNextPath('/dashboard\nSet-Cookie: x=y')).toBe('/dashboard')
})
