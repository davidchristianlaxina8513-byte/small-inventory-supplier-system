import { describe, expect, it } from 'vitest'
import type { SessionProfile } from '@/features/auth/services/session'
import {
  canManageInventoryOffice,
  canRecordAdjustment,
  canViewInventory,
  getAssignedInventoryOffices,
  resolveInventoryOfficeId,
} from './permissions'

function profile(overrides: Partial<SessionProfile> = {}): SessionProfile {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    fullName: 'Test User',
    schoolId: null,
    status: 'active',
    officeId: null,
    officeName: null,
    roles: [],
    ...overrides,
  }
}

const officeA = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Office A' }
const officeB = { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Office B' }

describe('inventory permissions', () => {
  it('allows an active admin to manage any office and record adjustments', () => {
    const admin = profile({ roles: [{ role: 'admin', officeId: null, officeName: null }] })

    expect(canViewInventory(admin)).toBe(true)
    expect(canManageInventoryOffice(admin, officeA.id)).toBe(true)
    expect(canManageInventoryOffice(admin, officeB.id)).toBe(true)
    expect(canRecordAdjustment(admin, officeA.id)).toBe(true)
  })

  it('limits office staff to their assigned office', () => {
    const staff = profile({
      roles: [{ role: 'office_staff', officeId: officeA.id, officeName: officeA.name }],
    })

    expect(canViewInventory(staff)).toBe(true)
    expect(canManageInventoryOffice(staff, officeA.id)).toBe(true)
    expect(canManageInventoryOffice(staff, officeB.id)).toBe(false)
    expect(canRecordAdjustment(staff, officeA.id)).toBe(false)
  })

  it('allows an office head to record adjustments in the assigned office only', () => {
    const head = profile({
      roles: [{ role: 'office_head', officeId: officeA.id, officeName: officeA.name }],
    })

    expect(canManageInventoryOffice(head, officeA.id)).toBe(true)
    expect(canManageInventoryOffice(head, officeB.id)).toBe(false)
    expect(canRecordAdjustment(head, officeA.id)).toBe(true)
    expect(canRecordAdjustment(head, officeB.id)).toBe(false)
  })

  it('denies roles without inventory management responsibility', () => {
    for (const role of ['student', 'teacher', 'non_teaching'] as const) {
      const user = profile({ roles: [{ role, officeId: null, officeName: null }] })
      expect(canViewInventory(user)).toBe(false)
      expect(canManageInventoryOffice(user, officeA.id)).toBe(false)
      expect(canRecordAdjustment(user, officeA.id)).toBe(false)
    }
  })

  it('denies pending and suspended accounts even when they hold a role', () => {
    const pendingAdmin = profile({
      status: 'pending',
      roles: [{ role: 'admin', officeId: null, officeName: null }],
    })
    const suspendedStaff = profile({
      status: 'suspended',
      roles: [{ role: 'office_staff', officeId: officeA.id, officeName: officeA.name }],
    })

    expect(canViewInventory(pendingAdmin)).toBe(false)
    expect(canManageInventoryOffice(pendingAdmin, officeA.id)).toBe(false)
    expect(canManageInventoryOffice(suspendedStaff, officeA.id)).toBe(false)
  })

  it('resolves an office from allowed offices without trusting the request', () => {
    const admin = profile({ roles: [{ role: 'admin', officeId: null, officeName: null }] })
    const singleOfficeStaff = profile({
      roles: [{ role: 'office_staff', officeId: officeA.id, officeName: officeA.name }],
    })
    const multiOfficeStaff = profile({
      roles: [
        { role: 'office_staff', officeId: officeA.id, officeName: officeA.name },
        { role: 'office_staff', officeId: officeB.id, officeName: officeB.name },
      ],
    })

    expect(resolveInventoryOfficeId(admin, [officeA, officeB], officeB.id)).toBe(officeB.id)
    expect(resolveInventoryOfficeId(admin, [officeA], officeB.id)).toBeNull()
    expect(resolveInventoryOfficeId(singleOfficeStaff, [officeA, officeB], officeB.id)).toBe(
      officeA.id
    )
    expect(resolveInventoryOfficeId(multiOfficeStaff, [officeA, officeB], officeB.id)).toBe(
      officeB.id
    )
    expect(resolveInventoryOfficeId(multiOfficeStaff, [officeA, officeB], 'other')).toBeNull()
  })

  it('returns unique assigned inventory offices from role assignments', () => {
    const staff = profile({
      roles: [
        { role: 'office_staff', officeId: officeA.id, officeName: officeA.name },
        { role: 'office_head', officeId: officeA.id, officeName: officeA.name },
        { role: 'office_staff', officeId: officeB.id, officeName: officeB.name },
        { role: 'student', officeId: null, officeName: null },
      ],
    })

    expect(getAssignedInventoryOffices(staff)).toEqual([officeA, officeB])
  })
})
