import { describe, it, expect } from 'vitest'
import {
  deriveDeceasedGender,
  deriveUserGender,
  getAutoIncludes,
} from '@/types/wizard'

describe('deriveDeceasedGender', () => {
  it('returns male for father', () => {
    expect(deriveDeceasedGender('father')).toBe('male')
  })

  it('returns female for mother', () => {
    expect(deriveDeceasedGender('mother')).toBe('female')
  })

  it('returns female for husband (user is male, deceased is female)', () => {
    expect(deriveDeceasedGender('husband')).toBe('female')
  })

  it('returns male for wife (user is female, deceased is male)', () => {
    expect(deriveDeceasedGender('wife')).toBe('male')
  })

  it('returns male for brother', () => {
    expect(deriveDeceasedGender('brother')).toBe('male')
  })

  it('returns female for sister', () => {
    expect(deriveDeceasedGender('sister')).toBe('female')
  })

  it('returns null for other', () => {
    expect(deriveDeceasedGender('other')).toBeNull()
  })
})

describe('deriveUserGender', () => {
  it('returns male for husband', () => {
    expect(deriveUserGender('husband')).toBe('male')
  })

  it('returns female for wife', () => {
    expect(deriveUserGender('wife')).toBe('female')
  })

  it('returns null for father (ambiguous)', () => {
    expect(deriveUserGender('father')).toBeNull()
  })

  it('returns null for mother (ambiguous)', () => {
    expect(deriveUserGender('mother')).toBeNull()
  })

  it('returns null for brother', () => {
    expect(deriveUserGender('brother')).toBeNull()
  })

  it('returns null for sister', () => {
    expect(deriveUserGender('sister')).toBeNull()
  })

  it('returns null for other', () => {
    expect(deriveUserGender('other')).toBeNull()
  })
})

describe('getAutoIncludes', () => {
  it('adds son when relationship is father and userGender is male', () => {
    const result = getAutoIncludes('father', 'male', null)
    expect(result).toEqual([{ type: 'son', count: 1 }])
  })

  it('adds daughter when relationship is father and userGender is female', () => {
    const result = getAutoIncludes('father', 'female', null)
    expect(result).toEqual([{ type: 'daughter', count: 1 }])
  })

  it('adds son and wife when relationship is father, userGender male, motherAlive true', () => {
    const result = getAutoIncludes('father', 'male', true)
    expect(result).toEqual([
      { type: 'son', count: 1 },
      { type: 'wife', count: 1 },
    ])
  })

  it('does not add wife when relationship is father and motherAlive is false', () => {
    const result = getAutoIncludes('father', 'male', false)
    expect(result).toEqual([{ type: 'son', count: 1 }])
  })

  it('adds no child when relationship is father and userGender is null', () => {
    const result = getAutoIncludes('father', null, null)
    expect(result).toEqual([])
  })

  it('adds son when relationship is mother and userGender is male', () => {
    const result = getAutoIncludes('mother', 'male', null)
    expect(result).toEqual([{ type: 'son', count: 1 }])
  })

  it('adds daughter when relationship is mother and userGender is female', () => {
    const result = getAutoIncludes('mother', 'female', null)
    expect(result).toEqual([{ type: 'daughter', count: 1 }])
  })

  it('adds husband when relationship is husband', () => {
    const result = getAutoIncludes('husband', 'male', null)
    expect(result).toEqual([{ type: 'husband', count: 1 }])
  })

  it('adds wife when relationship is wife', () => {
    const result = getAutoIncludes('wife', 'female', null)
    expect(result).toEqual([{ type: 'wife', count: 1 }])
  })

  it('adds brother_full when relationship is brother', () => {
    const result = getAutoIncludes('brother', null, null)
    expect(result).toEqual([{ type: 'brother_full', count: 1 }])
  })

  it('adds sister_full when relationship is sister', () => {
    const result = getAutoIncludes('sister', null, null)
    expect(result).toEqual([{ type: 'sister_full', count: 1 }])
  })

  it('returns empty for other', () => {
    const result = getAutoIncludes('other', null, null)
    expect(result).toEqual([])
  })
})
