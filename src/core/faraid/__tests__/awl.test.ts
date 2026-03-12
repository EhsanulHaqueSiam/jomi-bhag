/**
 * Tests for Awl (Proportional Reduction) Algorithm
 *
 * When fixed shares sum > 1, Awl proportionally reduces all shares
 * so they sum to exactly 1. Base denominators are always 6, 12, or 24.
 */

import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import { applyAwl, applyAdjustment } from '../adjustments'
import type { ShareAssignment } from '../shares'
import {
  ONE,
  HALF,
  QUARTER,
  EIGHTH,
  TWO_THIRDS,
  ONE_THIRD,
  ONE_SIXTH,
  sumFractions,
} from '@/core/utils/fraction'

describe('applyAwl', () => {
  it('Husband(1/2) + 2 full sisters(2/3) = 7/6 -> Awl to 7: husband 3/7, sisters 4/7', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband gets 1/2',
        quranRef: '4:12',
      },
      {
        heirType: 'sister_full',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: '2 sisters get 2/3',
        quranRef: '4:176',
      },
    ]
    const { adjusted, explanation } = applyAwl(shares)
    const husband = adjusted.find((s) => s.heirType === 'husband')!
    const sisters = adjusted.find((s) => s.heirType === 'sister_full')!

    expect(husband.totalShare.equals(new Fraction(3, 7))).toBe(true)
    expect(sisters.totalShare.equals(new Fraction(4, 7))).toBe(true)
    expect(explanation).toBeDefined()
  })

  it('Husband(1/4) + 2 daughters(2/3) + mother(1/6) = 13/12 -> Awl to 13', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: QUARTER,
        totalShare: QUARTER,
        shareType: 'fard',
        explanation: 'Husband',
        quranRef: '4:12',
      },
      {
        heirType: 'daughter',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: '2 daughters',
        quranRef: '4:11',
      },
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_SIXTH,
        totalShare: ONE_SIXTH,
        shareType: 'fard',
        explanation: 'Mother',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyAwl(shares)
    // Base 12 -> Awl to 13
    // Husband: 3/12 -> 3/13, Daughters: 8/12 -> 8/13, Mother: 2/12 -> 2/13
    const husband = adjusted.find((s) => s.heirType === 'husband')!
    const daughters = adjusted.find((s) => s.heirType === 'daughter')!
    const mother = adjusted.find((s) => s.heirType === 'mother')!

    expect(husband.totalShare.equals(new Fraction(3, 13))).toBe(true)
    expect(daughters.totalShare.equals(new Fraction(8, 13))).toBe(true)
    expect(mother.totalShare.equals(new Fraction(2, 13))).toBe(true)
  })

  it('Wife(1/8) + 2 daughters(2/3) + father(1/6) + mother(1/6) = 27/24 -> Awl to 27', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'wife',
        count: 1,
        sharePerHeir: EIGHTH,
        totalShare: EIGHTH,
        shareType: 'fard',
        explanation: 'Wife',
        quranRef: '4:12',
      },
      {
        heirType: 'daughter',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: '2 daughters',
        quranRef: '4:11',
      },
      {
        heirType: 'father',
        count: 1,
        sharePerHeir: ONE_SIXTH,
        totalShare: ONE_SIXTH,
        shareType: 'fard',
        explanation: 'Father',
        quranRef: '4:11',
      },
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_SIXTH,
        totalShare: ONE_SIXTH,
        shareType: 'fard',
        explanation: 'Mother',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyAwl(shares)
    // Base 24: wife 3/24, daughters 16/24, father 4/24, mother 4/24 = 27/24
    // Awl to 27: wife 3/27 = 1/9, daughters 16/27, father 4/27, mother 4/27
    const wife = adjusted.find((s) => s.heirType === 'wife')!
    const daughters = adjusted.find((s) => s.heirType === 'daughter')!
    const father = adjusted.find((s) => s.heirType === 'father')!
    const mother = adjusted.find((s) => s.heirType === 'mother')!

    expect(wife.totalShare.equals(new Fraction(3, 27))).toBe(true)
    expect(daughters.totalShare.equals(new Fraction(16, 27))).toBe(true)
    expect(father.totalShare.equals(new Fraction(4, 27))).toBe(true)
    expect(mother.totalShare.equals(new Fraction(4, 27))).toBe(true)
  })

  it('after Awl, total shares sum to exactly 1', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband',
        quranRef: '4:12',
      },
      {
        heirType: 'sister_full',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: 'Sisters',
        quranRef: '4:176',
      },
    ]
    const { adjusted } = applyAwl(shares)
    const total = sumFractions(adjusted.map((s) => s.totalShare))
    expect(total.equals(ONE)).toBe(true)
  })

  it('shares that do not exceed 1 are returned unchanged', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband',
        quranRef: '4:12',
      },
    ]
    const { adjusted } = applyAwl(shares)
    expect(adjusted).toEqual(shares)
  })

  it('output includes explanation of original vs adjusted shares', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband',
        quranRef: '4:12',
      },
      {
        heirType: 'sister_full',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: 'Sisters',
        quranRef: '4:176',
      },
    ]
    const { explanation } = applyAwl(shares)
    expect(explanation).toBeDefined()
    expect(explanation!.description).toContain('Awl')
    expect(explanation!.detail.length).toBeGreaterThan(0)
  })
})

describe('applyAdjustment with Awl', () => {
  it('exceedsOne triggers Awl adjustment', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband',
        quranRef: '4:12',
      },
      {
        heirType: 'sister_full',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: 'Sisters',
        quranRef: '4:176',
      },
    ]
    const { adjustmentType, adjusted } = applyAdjustment(shares)
    expect(adjustmentType).toBe('awl')
    const total = sumFractions(adjusted.map((s) => s.totalShare))
    expect(total.equals(ONE)).toBe(true)
  })
})
