/**
 * Tests for Radd (Surplus Redistribution) Algorithm
 *
 * When fixed shares sum < 1 and no Asaba heirs exist, Radd redistributes
 * the surplus to eligible heirs (spouses excluded per Hanafi).
 */

import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import { applyRadd, applyAdjustment } from '../adjustments'
import type { ShareAssignment } from '../shares'
import {
  ONE,
  HALF,
  QUARTER,
  EIGHTH,
  ONE_THIRD,
  ONE_SIXTH,
  sumFractions,
} from '@/core/utils/fraction'

describe('applyRadd', () => {
  it('mother(1/3) + daughter(1/2) = 5/6 -> Radd distributes 1/6 proportionally to both', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_THIRD,
        totalShare: ONE_THIRD,
        shareType: 'fard',
        explanation: 'Mother gets 1/3',
        quranRef: '4:11',
      },
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Daughter gets 1/2',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyRadd(shares)
    const mother = adjusted.find((s) => s.heirType === 'mother')!
    const daughter = adjusted.find((s) => s.heirType === 'daughter')!

    // Total eligible = 1/3 + 1/2 = 5/6, remainder = 1/6
    // Mother's proportion: (1/3) / (5/6) = 2/5
    // Daughter's proportion: (1/2) / (5/6) = 3/5
    // Mother's Radd: 1/6 * 2/5 = 2/30 = 1/15 -> total = 1/3 + 1/15 = 6/15 = 2/5
    // Daughter's Radd: 1/6 * 3/5 = 3/30 = 1/10 -> total = 1/2 + 1/10 = 6/10 = 3/5
    expect(mother.totalShare.equals(new Fraction(2, 5))).toBe(true)
    expect(daughter.totalShare.equals(new Fraction(3, 5))).toBe(true)
  })

  it('wife(1/4) + mother(1/3) -> Radd to mother only (spouse excluded per Hanafi)', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'wife',
        count: 1,
        sharePerHeir: QUARTER,
        totalShare: QUARTER,
        shareType: 'fard',
        explanation: 'Wife gets 1/4',
        quranRef: '4:12',
      },
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_THIRD,
        totalShare: ONE_THIRD,
        shareType: 'fard',
        explanation: 'Mother gets 1/3',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyRadd(shares)
    const wife = adjusted.find((s) => s.heirType === 'wife')!
    const mother = adjusted.find((s) => s.heirType === 'mother')!

    // Wife keeps 1/4 (excluded from Radd)
    expect(wife.totalShare.equals(QUARTER)).toBe(true)
    // Mother gets all remainder: 1 - 1/4 = 3/4
    expect(mother.totalShare.equals(new Fraction(3, 4))).toBe(true)
  })

  it('wife(1/4) only heir -> wife keeps 1/4, remainder noted as Bait-ul-Maal', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'wife',
        count: 1,
        sharePerHeir: QUARTER,
        totalShare: QUARTER,
        shareType: 'fard',
        explanation: 'Wife gets 1/4',
        quranRef: '4:12',
      },
    ]
    const result = applyRadd(shares)
    const wife = result.adjusted.find((s) => s.heirType === 'wife')!

    // Wife keeps 1/4
    expect(wife.totalShare.equals(QUARTER)).toBe(true)
    // Total is still 1/4, not 1 (remainder to Bait-ul-Maal)
    const total = sumFractions(result.adjusted.map((s) => s.totalShare))
    expect(total.equals(QUARTER)).toBe(true)
  })

  it('after Radd, total shares sum to exactly 1', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_THIRD,
        totalShare: ONE_THIRD,
        shareType: 'fard',
        explanation: 'Mother',
        quranRef: '4:11',
      },
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Daughter',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyRadd(shares)
    const total = sumFractions(adjusted.map((s) => s.totalShare))
    expect(total.equals(ONE)).toBe(true)
  })

  it("output includes adjustment='radd' with explanation of Hanafi spouse exclusion", () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'wife',
        count: 1,
        sharePerHeir: QUARTER,
        totalShare: QUARTER,
        shareType: 'fard',
        explanation: 'Wife',
        quranRef: '4:12',
      },
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_THIRD,
        totalShare: ONE_THIRD,
        shareType: 'fard',
        explanation: 'Mother',
        quranRef: '4:11',
      },
    ]
    const { explanation } = applyRadd(shares)
    expect(explanation).toBeDefined()
    expect(explanation!.detail).toContain('Hanafi')
    expect(explanation!.detail).toContain('spouse')
  })

  it('Radd never gives spouse more than their Quranic share', () => {
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
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_SIXTH,
        totalShare: ONE_SIXTH,
        shareType: 'fard',
        explanation: 'Mother gets 1/6',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyRadd(shares)
    const husband = adjusted.find((s) => s.heirType === 'husband')!

    // Husband should keep exactly 1/2 (not increase through Radd)
    expect(husband.totalShare.equals(HALF)).toBe(true)
  })

  it('shares that sum to 1 or more are returned unchanged', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ONE,
        totalShare: ONE,
        shareType: 'asaba',
        explanation: 'Son gets everything',
        quranRef: '4:11',
      },
    ]
    const { adjusted } = applyRadd(shares)
    expect(adjusted).toEqual(shares)
  })
})

describe('applyAdjustment with Radd', () => {
  it('lessThanOne with no Asaba triggers Radd', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'mother',
        count: 1,
        sharePerHeir: ONE_THIRD,
        totalShare: ONE_THIRD,
        shareType: 'fard',
        explanation: 'Mother',
        quranRef: '4:11',
      },
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Daughter',
        quranRef: '4:11',
      },
    ]
    const { adjustmentType } = applyAdjustment(shares)
    expect(adjustmentType).toBe('radd')
  })

  it('exact sum of 1 returns adjustment none', () => {
    const shares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ONE,
        totalShare: ONE,
        shareType: 'asaba',
        explanation: 'Son',
        quranRef: '4:11',
      },
    ]
    const { adjustmentType } = applyAdjustment(shares)
    expect(adjustmentType).toBe('none')
  })

  it('less than 1 but Asaba present returns none (Asaba took remainder)', () => {
    // This simulates a scenario where Asaba already claimed remainder
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
        heirType: 'son',
        count: 1,
        sharePerHeir: new Fraction(7, 8),
        totalShare: new Fraction(7, 8),
        shareType: 'asaba',
        explanation: 'Son',
        quranRef: '4:11',
      },
    ]
    const { adjustmentType } = applyAdjustment(shares)
    expect(adjustmentType).toBe('none')
  })
})
