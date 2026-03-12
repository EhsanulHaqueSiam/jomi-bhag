import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import {
  HALF,
  QUARTER,
  EIGHTH,
  TWO_THIRDS,
  ONE_THIRD,
  ONE_SIXTH,
  ZERO,
  ONE,
  sumFractions,
  exceedsOne,
  lessThanOne,
  formatShare,
} from '@/core/utils/fraction'
import type { HeirType } from '@/core/faraid/types'
import { FARAID_RULES } from '@/data/faraid-rules'

describe('Fraction Constants', () => {
  it('HALF equals 1/2', () => {
    expect(HALF.equals(new Fraction(1, 2))).toBe(true)
  })

  it('QUARTER equals 1/4', () => {
    expect(QUARTER.equals(new Fraction(1, 4))).toBe(true)
  })

  it('EIGHTH equals 1/8', () => {
    expect(EIGHTH.equals(new Fraction(1, 8))).toBe(true)
  })

  it('TWO_THIRDS equals 2/3', () => {
    expect(TWO_THIRDS.equals(new Fraction(2, 3))).toBe(true)
  })

  it('ONE_THIRD equals 1/3', () => {
    expect(ONE_THIRD.equals(new Fraction(1, 3))).toBe(true)
  })

  it('ONE_SIXTH equals 1/6', () => {
    expect(ONE_SIXTH.equals(new Fraction(1, 6))).toBe(true)
  })

  it('ZERO equals 0', () => {
    expect(ZERO.equals(new Fraction(0))).toBe(true)
  })

  it('ONE equals 1', () => {
    expect(ONE.equals(new Fraction(1))).toBe(true)
  })
})

describe('Fraction Helpers', () => {
  it('sumFractions([HALF, QUARTER, EIGHTH]) equals 7/8', () => {
    const result = sumFractions([HALF, QUARTER, EIGHTH])
    expect(result.equals(new Fraction(7, 8))).toBe(true)
  })

  it('sumFractions of empty array equals ZERO', () => {
    const result = sumFractions([])
    expect(result.equals(ZERO)).toBe(true)
  })

  it('exceedsOne returns true for 7/6', () => {
    expect(exceedsOne(new Fraction(7, 6))).toBe(true)
  })

  it('exceedsOne returns false for 1', () => {
    expect(exceedsOne(ONE)).toBe(false)
  })

  it('exceedsOne returns false for 5/6', () => {
    expect(exceedsOne(new Fraction(5, 6))).toBe(false)
  })

  it('lessThanOne returns true for 7/12', () => {
    expect(lessThanOne(new Fraction(7, 12))).toBe(true)
  })

  it('lessThanOne returns false for 1', () => {
    expect(lessThanOne(ONE)).toBe(false)
  })

  it('lessThanOne returns false for 7/6', () => {
    expect(lessThanOne(new Fraction(7, 6))).toBe(false)
  })

  it('formatShare(ONE_THIRD) returns "1/3 (33.33%)"', () => {
    expect(formatShare(ONE_THIRD)).toBe('1/3 (33.33%)')
  })

  it('formatShare(HALF) returns "1/2 (50.00%)"', () => {
    expect(formatShare(HALF)).toBe('1/2 (50.00%)')
  })

  it('formatShare(ONE_SIXTH) returns "1/6 (16.67%)"', () => {
    expect(formatShare(ONE_SIXTH)).toBe('1/6 (16.67%)')
  })
})

describe('Faraid Rules Completeness', () => {
  const allHeirTypes: HeirType[] = [
    'husband',
    'wife',
    'son',
    'daughter',
    'son_of_son',
    'daughter_of_son',
    'father',
    'paternal_grandfather',
    'mother',
    'paternal_grandmother',
    'maternal_grandmother',
    'brother_full',
    'brother_consanguine',
    'brother_uterine',
    'sister_full',
    'sister_consanguine',
    'sister_uterine',
  ]

  it('every HeirType enum value has at least one entry in FARAID_RULES', () => {
    for (const heirType of allHeirTypes) {
      const rule = FARAID_RULES.find((r) => r.heirType === heirType)
      expect(rule, `Missing rule for ${heirType}`).toBeDefined()
    }
  })

  it('every rule in FARAID_RULES has a quranRef or hadithRef', () => {
    for (const rule of FARAID_RULES) {
      const hasRef = rule.quranRef || rule.hadithRef
      expect(hasRef, `Rule for ${rule.heirType} has no quranRef or hadithRef`).toBeTruthy()
    }
  })

  it('every rule has at least one condition', () => {
    for (const rule of FARAID_RULES) {
      expect(
        rule.conditions.length,
        `Rule for ${rule.heirType} has no conditions`
      ).toBeGreaterThan(0)
    }
  })

  it('all condition shares use Fraction objects (not raw numbers)', () => {
    for (const rule of FARAID_RULES) {
      for (const condition of rule.conditions) {
        expect(
          condition.share instanceof Fraction,
          `Condition "${condition.when}" in ${rule.heirType} does not use Fraction for share`
        ).toBe(true)
      }
    }
  })
})
