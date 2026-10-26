import { describe, it, expect } from 'vitest'
import {
  generate6DigitCode,
  hashVerificationCode,
  CODE_EXPIRATION_MINUTES,
  MAX_VERIFICATION_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
} from './verification'

describe('Verification Service Helpers', () => {
  it('generates a 6-digit numeric string', () => {
    const code = generate6DigitCode()
    expect(code).toMatch(/^\d{6}$/)
    const num = parseInt(code, 10)
    expect(num).toBeGreaterThanOrEqual(100000)
    expect(num).toBeLessThan(1000000)
  })

  it('hashes code consistently with SHA-256', () => {
    const code = '123456'
    const hash1 = hashVerificationCode(code)
    const hash2 = hashVerificationCode(code)
    expect(hash1).toEqual(hash2)
    expect(hash1).toHaveLength(64) // 64 hex characters for SHA-256
    expect(hashVerificationCode(' 123456 ')).toEqual(hash1)
  })

  it('verifies configuration constraints', () => {
    expect(CODE_EXPIRATION_MINUTES).toBe(10)
    expect(MAX_VERIFICATION_ATTEMPTS).toBe(5)
    expect(RESEND_COOLDOWN_SECONDS).toBe(60)
  })
})

