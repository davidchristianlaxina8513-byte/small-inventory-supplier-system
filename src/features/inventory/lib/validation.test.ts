import { describe, expect, it } from 'vitest'
import {
  isUuid,
  parseQuantity,
  validateCategoryInput,
  validateItemInput,
  validateLocationInput,
  validateMovementInput,
} from './validation'

const officeId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const categoryId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const itemId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const locationId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'

const validItem = {
  officeId,
  categoryId,
  itemCode: 'PROP-001',
  name: 'Whiteboard Marker',
  description: 'Black marker',
  unitOfMeasure: 'piece',
  trackingType: 'quantity_stock',
  reorderLevel: '10',
}

const validMovement = {
  itemId,
  locationId,
  movementType: 'receipt',
  quantity: '5',
  reason: 'Opening stock',
  reference: 'DR-1001',
}

describe('inventory validation', () => {
  it('accepts a valid item and normalizes optional values', () => {
    const result = validateItemInput({ ...validItem, description: '  ', reorderLevel: '' })

    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      officeId,
      categoryId,
      itemCode: 'PROP-001',
      name: 'Whiteboard Marker',
      description: null,
      unitOfMeasure: 'piece',
      trackingType: 'quantity_stock',
      reorderLevel: null,
    })
  })

  it('rejects missing item fields and invalid identifiers', () => {
    const result = validateItemInput({
      ...validItem,
      officeId: '',
      categoryId: 'not-a-uuid',
      itemCode: ' ',
      name: '',
      unitOfMeasure: '',
      trackingType: 'consumable',
    })

    expect(result.values).toBeNull()
    expect(result.errors.officeId).toBeTruthy()
    expect(result.errors.categoryId).toBeTruthy()
    expect(result.errors.itemCode).toBeTruthy()
    expect(result.errors.name).toBeTruthy()
    expect(result.errors.unitOfMeasure).toBeTruthy()
    expect(result.errors.trackingType).toBeTruthy()
  })

  it('rejects descriptions over 2000 characters and negative reorder levels', () => {
    const result = validateItemInput({
      ...validItem,
      description: 'x'.repeat(2001),
      reorderLevel: '-1',
    })

    expect(result.errors.description).toBeTruthy()
    expect(result.errors.reorderLevel).toBeTruthy()
  })

  it('accepts zero as a reorder level', () => {
    const result = validateItemInput({ ...validItem, reorderLevel: '0' })
    expect(result.values?.reorderLevel).toBe(0)
  })

  it('accepts a valid movement', () => {
    const result = validateMovementInput(validMovement)

    expect(result.errors).toEqual({})
    expect(result.values).toEqual({
      itemId,
      locationId,
      movementType: 'receipt',
      quantity: 5,
      reason: 'Opening stock',
      reference: 'DR-1001',
    })
  })

  it('rejects invalid movement quantities', () => {
    for (const quantity of ['', '0', '-1', '1e3', '1.2345', '100000000000']) {
      const result = validateMovementInput({ ...validMovement, quantity })
      expect(result.values, quantity).toBeNull()
      expect(result.errors.quantity, quantity).toBeTruthy()
    }
  })

  it('rejects blank reasons and overlong references', () => {
    const blankReason = validateMovementInput({ ...validMovement, reason: '   ' })
    const longReference = validateMovementInput({
      ...validMovement,
      reference: 'x'.repeat(121),
    })

    expect(blankReason.errors.reason).toBeTruthy()
    expect(longReference.errors.reference).toBeTruthy()
  })

  it('rejects an unsupported movement type', () => {
    const result = validateMovementInput({ ...validMovement, movementType: 'transfer_in' })
    expect(result.errors.movementType).toBeTruthy()
  })

  it('validates category and location names', () => {
    expect(validateCategoryInput({ officeId, name: '  Supplies  ' }).values).toEqual({
      officeId,
      name: 'Supplies',
    })
    expect(validateCategoryInput({ officeId, name: '' }).errors.name).toBeTruthy()
    expect(validateLocationInput({ officeId, name: 'x'.repeat(121) }).errors.name).toBeTruthy()
  })

  it('parses quantities with at most three decimal places', () => {
    expect(parseQuantity('10')).toBe(10)
    expect(parseQuantity('0.5')).toBe(0.5)
    expect(parseQuantity('10.125')).toBe(10.125)
    expect(parseQuantity('0')).toBe(0)
    expect(parseQuantity('')).toBeNull()
    expect(parseQuantity('1.2345')).toBeNull()
  })

  it('recognizes UUIDs', () => {
    expect(isUuid(officeId)).toBe(true)
    expect(isUuid('not-a-uuid')).toBe(false)
  })
})
