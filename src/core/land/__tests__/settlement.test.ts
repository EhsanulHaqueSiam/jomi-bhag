import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import {
  calculateSellSplit,
  computeSubParcelTargets,
  calculatePhysicalDivisionCompensation,
  calculateLandBuyout,
  calculateInstallments,
  calculateOwnershipShares,
  calculateIncomeDistribution,
} from '@/core/land/settlement'
import type { SubParcel } from '@/core/land/settlement-types'

// ── Mock ShareResult helpers ─────────────────────────────────────────

function makeShare(
  heirType: HeirType,
  count: number,
  totalShare: string,
  shareType: ShareResult['shareType'] = 'fard',
): ShareResult {
  const total = new Fraction(totalShare)
  return {
    heirType,
    count,
    totalShare: total,
    sharePerHeir: total.div(count),
    shareType,
    explanation: `${heirType} share`,
  }
}

// ── Test data ────────────────────────────────────────────────────────

// Scenario: wife gets 1/8, son gets 7/8
const shares2Heirs: ShareResult[] = [
  makeShare('wife', 1, '1/8'),
  makeShare('son', 2, '7/8', 'asaba'),
]

// Scenario: wife 1/8, son 7/16, daughter 7/16
const shares3Heirs: ShareResult[] = [
  makeShare('wife', 1, '1/8'),
  makeShare('son', 1, '7/16', 'asaba'),
  makeShare('daughter', 1, '7/16', 'asaba'),
]

// Includes a blocked heir
const sharesWithBlocked: ShareResult[] = [
  makeShare('wife', 1, '1/4'),
  makeShare('son', 1, '3/4', 'asaba'),
  makeShare('brother_full', 1, '0', 'blocked'),
]

describe('calculateSellSplit', () => {
  it('returns per-heir-group BDT amounts proportional to Faraid fractions', () => {
    const result = calculateSellSplit(500000, shares2Heirs)

    expect(result).toHaveLength(2)
    const wife = result.find((r) => r.heirType === 'wife')!
    const son = result.find((r) => r.heirType === 'son')!
    expect(wife.amount).toBe(Math.round(500000 * (1 / 8)))
    expect(son.amount).toBe(Math.round(500000 * (7 / 8)))
  })

  it('with actualSalePrice override uses the override value', () => {
    const result = calculateSellSplit(600000, shares2Heirs)

    const wife = result.find((r) => r.heirType === 'wife')!
    const son = result.find((r) => r.heirType === 'son')!
    expect(wife.amount).toBe(Math.round(600000 * (1 / 8)))
    expect(son.amount).toBe(Math.round(600000 * (7 / 8)))
  })

  it('excludes blocked shares from the result', () => {
    const result = calculateSellSplit(500000, sharesWithBlocked)

    expect(result).toHaveLength(2)
    expect(result.find((r) => r.heirType === 'brother_full')).toBeUndefined()
  })
})

describe('computeSubParcelTargets', () => {
  it('returns target values summing to property value', () => {
    const result = computeSubParcelTargets(1000000, shares3Heirs)

    expect(result).toHaveLength(3)
    const sum = result.reduce((s, r) => s + r.targetValue, 0)
    // Due to rounding, allow 1 BDT tolerance per heir group
    expect(Math.abs(sum - 1000000)).toBeLessThanOrEqual(3)
  })

  it('each target is proportional to Faraid share', () => {
    const result = computeSubParcelTargets(1000000, shares3Heirs)

    const wife = result.find((r) => r.heirType === 'wife')!
    expect(wife.targetValue).toBe(Math.round(1000000 * (1 / 8)))
  })

  it('excludes blocked shares', () => {
    const result = computeSubParcelTargets(1000000, sharesWithBlocked)
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.heirType === 'brother_full')).toBeUndefined()
  })
})

describe('calculatePhysicalDivisionCompensation', () => {
  it('computes difference between sub-parcel total and property value target', () => {
    const subParcels: SubParcel[] = [
      { id: '1', name: 'Front plot', areaSqft: 2000, areaInputUnit: 'sqft', appraisedValue: 600000 },
      { id: '2', name: 'Back plot', areaSqft: 3000, areaInputUnit: 'sqft', appraisedValue: 350000 },
    ]
    const targets = [
      { heirType: 'wife' as HeirType, targetValue: 125000 },
      { heirType: 'son' as HeirType, targetValue: 875000 },
    ]

    const result = calculatePhysicalDivisionCompensation(subParcels, targets)

    expect(result.totalSubParcelValue).toBe(950000)
    expect(result.targetTotal).toBe(1000000)
    expect(result.difference).toBe(-50000) // sub-parcels undervalued by 50k
  })

  it('returns zero difference when sub-parcel values match target total', () => {
    const subParcels: SubParcel[] = [
      { id: '1', name: 'Plot A', areaSqft: 1000, areaInputUnit: 'sqft', appraisedValue: 500000 },
      { id: '2', name: 'Plot B', areaSqft: 1000, areaInputUnit: 'sqft', appraisedValue: 500000 },
    ]
    const targets = [
      { heirType: 'wife' as HeirType, targetValue: 250000 },
      { heirType: 'son' as HeirType, targetValue: 750000 },
    ]

    const result = calculatePhysicalDivisionCompensation(subParcels, targets)

    expect(result.difference).toBe(0)
  })
})

describe('calculateLandBuyout', () => {
  it('returns BuyoutCalculation with compensation owed to other heirs', () => {
    const result = calculateLandBuyout(500000, 'son', shares2Heirs, false, 1)

    expect(result.assetValue).toBe(500000)
    expect(result.buyerHeirType).toBe('son')
    expect(result.buyerShare).toBeCloseTo(7 / 8, 6)
    expect(result.compensationOwed).toBe(Math.round(500000 * (1 / 8)))
    expect(result.perGroupPayments).toHaveLength(1)
    expect(result.perGroupPayments[0].heirType).toBe('wife')
    expect(result.perGroupPayments[0].amount).toBe(Math.round(500000 * (1 / 8)))
    expect(result.installmentPlan).toBeNull()
  })

  it('includes installment plan when useInstallments is true', () => {
    const result = calculateLandBuyout(500000, 'son', shares2Heirs, true, 6)

    expect(result.installmentPlan).not.toBeNull()
    expect(result.installmentPlan!.count).toBe(6)
    expect(result.installmentPlan!.totalOwed).toBe(result.compensationOwed)
  })

  it('throws when buyer heir type is not in shares', () => {
    expect(() =>
      calculateLandBuyout(500000, 'father', shares2Heirs, false, 1),
    ).toThrow()
  })
})

describe('calculateInstallments', () => {
  it('divides total evenly (no interest)', () => {
    const result = calculateInstallments(300000, 6)

    expect(result.perInstallment).toBe(50000)
    expect(result.count).toBe(6)
    expect(result.totalOwed).toBe(300000)
  })

  it('handles remainder correctly', () => {
    const result = calculateInstallments(100000, 3)

    expect(result.perInstallment).toBe(Math.round(100000 / 3))
    expect(result.count).toBe(3)
    expect(result.totalOwed).toBe(100000)
  })

  it('single installment equals total', () => {
    const result = calculateInstallments(250000, 1)

    expect(result.perInstallment).toBe(250000)
    expect(result.totalOwed).toBe(250000)
  })
})

describe('calculateOwnershipShares', () => {
  it('returns percentages summing to approximately 100%', () => {
    const result = calculateOwnershipShares(shares2Heirs)

    expect(result).toHaveLength(2)
    const sum = result.reduce((s, r) => s + r.percentage, 0)
    expect(sum).toBeCloseTo(100, 0)
  })

  it('returns correct percentages matching Faraid shares', () => {
    const result = calculateOwnershipShares(shares2Heirs)

    const wife = result.find((r) => r.heirType === 'wife')!
    const son = result.find((r) => r.heirType === 'son')!
    expect(wife.percentage).toBe(12.5) // 1/8 = 12.5%
    expect(son.percentage).toBe(87.5) // 7/8 = 87.5%
  })

  it('excludes blocked shares', () => {
    const result = calculateOwnershipShares(sharesWithBlocked)
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.heirType === 'brother_full')).toBeUndefined()
  })
})

describe('calculateIncomeDistribution', () => {
  it('distributes income proportionally to Faraid shares', () => {
    const result = calculateIncomeDistribution(120000, shares2Heirs)

    expect(result).toHaveLength(2)
    const wife = result.find((r) => r.heirType === 'wife')!
    const son = result.find((r) => r.heirType === 'son')!
    expect(wife.amount).toBe(Math.round(120000 * (1 / 8)))
    expect(son.amount).toBe(Math.round(120000 * (7 / 8)))
  })

  it('includes percentage for each heir group', () => {
    const result = calculateIncomeDistribution(120000, shares2Heirs)

    const wife = result.find((r) => r.heirType === 'wife')!
    expect(wife.percentage).toBe(12.5)
  })

  it('excludes blocked shares', () => {
    const result = calculateIncomeDistribution(120000, sharesWithBlocked)
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.heirType === 'brother_full')).toBeUndefined()
  })
})
