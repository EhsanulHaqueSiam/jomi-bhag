import { describe, it, expect } from 'vitest'
import { validateHeirInput } from '@/core/faraid/validation'
import type { FaraidInput } from '@/core/faraid/types'

describe('validateHeirInput', () => {
  it('valid basic heir set returns { valid: true }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'wife', count: 1 },
        { type: 'son', count: 2 },
        { type: 'daughter', count: 1 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('negative counts returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: -1 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('more than 4 wives returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'wife', count: 5 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('wife') || e.includes('wives'))).toBe(true)
  })

  it('more than 1 husband returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'female',
      heirs: [
        { type: 'husband', count: 2 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('husband'))).toBe(true)
  })

  it('male deceased with husband returns { valid: false } (gender-spouse mismatch)', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'husband', count: 1 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('gender') || e.includes('male'))).toBe(true)
  })

  it('female deceased with wife returns { valid: false } (gender-spouse mismatch)', () => {
    const input: FaraidInput = {
      deceasedGender: 'female',
      heirs: [
        { type: 'wife', count: 1 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('gender') || e.includes('female'))).toBe(true)
  })

  it('no heirs returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('heir'))).toBe(true)
  })

  it('zero count heirs (effectively no heirs) returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 0 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
  })

  it('fractional count returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1.5 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('integer') || e.includes('whole'))).toBe(true)
  })

  it('valid complex heir set returns { valid: true }', () => {
    const input: FaraidInput = {
      deceasedGender: 'female',
      heirs: [
        { type: 'husband', count: 1 },
        { type: 'son', count: 3 },
        { type: 'daughter', count: 2 },
        { type: 'mother', count: 1 },
        { type: 'father', count: 1 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('more than 1 father returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'father', count: 2 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
  })

  it('more than 1 mother returns { valid: false }', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'mother', count: 2 },
      ],
    }
    const result = validateHeirInput(input)
    expect(result.valid).toBe(false)
  })
})
