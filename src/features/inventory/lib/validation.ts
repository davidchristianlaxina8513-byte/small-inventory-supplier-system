import { MOVEMENT_TYPES, TRACKING_TYPES, type MovementType, type TrackingType } from './tracking'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?$/
const MAX_QUANTITY = 100000000000

export type ItemInput = {
  officeId: string
  categoryId: string
  itemCode: string
  name: string
  description: string
  unitOfMeasure: string
  trackingType: string
  reorderLevel: string
}

export type ItemValues = {
  officeId: string
  categoryId: string
  itemCode: string
  name: string
  description: string | null
  unitOfMeasure: string
  trackingType: TrackingType
  reorderLevel: number | null
}

export type ItemErrors = Partial<Record<keyof ItemInput, string>>

export type MovementInput = {
  itemId: string
  locationId: string
  movementType: string
  quantity: string
  reason: string
  reference: string
}

export type MovementValues = {
  itemId: string
  locationId: string
  movementType: MovementType
  quantity: number
  reason: string
  reference: string | null
}

export type MovementErrors = Partial<Record<keyof MovementInput, string>>

export type NamedEntityInput = {
  officeId: string
  name: string
}

export type NamedEntityValues = {
  officeId: string
  name: string
}

export function validateItemInput(input: ItemInput): {
  errors: ItemErrors
  values: ItemValues | null
} {
  const errors: ItemErrors = {}
  const itemCode = input.itemCode.trim()
  const name = input.name.trim()
  const description = input.description.trim()
  const unitOfMeasure = input.unitOfMeasure.trim()

  if (!isUuid(input.officeId)) errors.officeId = 'Select a valid office.'
  if (!isUuid(input.categoryId)) errors.categoryId = 'Select a valid category.'
  if (itemCode.length < 1 || itemCode.length > 64) {
    errors.itemCode = 'Item code must be between 1 and 64 characters.'
  }
  if (name.length < 1 || name.length > 160) {
    errors.name = 'Item name must be between 1 and 160 characters.'
  }
  if (description.length > 2000) {
    errors.description = 'Description must be 2,000 characters or fewer.'
  }
  if (unitOfMeasure.length < 1 || unitOfMeasure.length > 32) {
    errors.unitOfMeasure = 'Unit must be between 1 and 32 characters.'
  }
  if (!TRACKING_TYPES.includes(input.trackingType as TrackingType)) {
    errors.trackingType = 'Select a valid tracking type.'
  }

  let reorderLevel: number | null = null
  if (input.reorderLevel.trim() !== '') {
    reorderLevel = parseQuantity(input.reorderLevel)
    if (reorderLevel === null || reorderLevel >= MAX_QUANTITY) {
      errors.reorderLevel = 'Reorder level must be a non-negative number with up to three decimals.'
      reorderLevel = null
    }
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }

  return {
    errors,
    values: {
      officeId: input.officeId,
      categoryId: input.categoryId,
      itemCode,
      name,
      description: description === '' ? null : description,
      unitOfMeasure,
      trackingType: input.trackingType as TrackingType,
      reorderLevel,
    },
  }
}

export function validateMovementInput(input: MovementInput): {
  errors: MovementErrors
  values: MovementValues | null
} {
  const errors: MovementErrors = {}
  const reason = input.reason.trim()
  const reference = input.reference.trim()
  const quantity = parseQuantity(input.quantity)

  if (!isUuid(input.itemId)) errors.itemId = 'Select a valid item.'
  if (!isUuid(input.locationId)) errors.locationId = 'Select a valid location.'
  if (!MOVEMENT_TYPES.includes(input.movementType as MovementType)) {
    errors.movementType = 'Select a valid movement type.'
  }
  if (quantity === null || quantity <= 0 || quantity >= MAX_QUANTITY) {
    errors.quantity =
      'Quantity must be greater than zero, fit the inventory range, and use at most three decimals.'
  }
  if (reason.length < 1 || reason.length > 500) {
    errors.reason = 'A reason between 1 and 500 characters is required.'
  }
  if (reference.length > 120) {
    errors.reference = 'Reference must be 120 characters or fewer.'
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }

  return {
    errors,
    values: {
      itemId: input.itemId,
      locationId: input.locationId,
      movementType: input.movementType as MovementType,
      quantity: quantity as number,
      reason,
      reference: reference === '' ? null : reference,
    },
  }
}

export function validateCategoryInput(input: NamedEntityInput): {
  errors: Partial<Record<keyof NamedEntityInput, string>>
  values: NamedEntityValues | null
} {
  return validateNamedEntity(input)
}

export function validateLocationInput(input: NamedEntityInput): {
  errors: Partial<Record<keyof NamedEntityInput, string>>
  values: NamedEntityValues | null
} {
  return validateNamedEntity(input)
}

export function parseQuantity(value: string): number | null {
  const normalized = value.trim()
  if (!DECIMAL_PATTERN.test(normalized)) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

function validateNamedEntity(input: NamedEntityInput): {
  errors: Partial<Record<keyof NamedEntityInput, string>>
  values: NamedEntityValues | null
} {
  const errors: Partial<Record<keyof NamedEntityInput, string>> = {}
  const name = input.name.trim()

  if (!isUuid(input.officeId)) errors.officeId = 'Select a valid office.'
  if (name.length < 1 || name.length > 120) {
    errors.name = 'Name must be between 1 and 120 characters.'
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }

  return { errors, values: { officeId: input.officeId, name } }
}
