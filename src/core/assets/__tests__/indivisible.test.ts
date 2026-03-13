import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import { calculateBuyout } from '@/core/assets/indivisible'
import type { ShareResult } from '@/core/faraid/types'

function makeShare(heirType: string, totalShare: string, count = 1): ShareResult {
  return {
    heirType: heirType as ShareResult['heirType'],
    count,
    sharePerHeir: new Fraction(totalShare).div(count),
    totalShare: new Fraction(totalShare),
    shareType: 'fard',
    explanation: 'test',
  }
}

describe('calculateBuyout', () => {
  it('calculates correct compensation for a son buying a car', () => {
    // 100000 car, son has 1/3, daughter has 1/6, wife has 1/8, remainder to others
    const shares: ShareResult[] = [
      makeShare('son', '1/3'),
      makeShare('daughter', '1/6'),
      makeShare('wife', '1/2'),
    ]

    const result = calculateBuyout(100000, 'son', shares)

    // Buyer is son with 1/3 share
    expect(result.buyerHeirType).toBe('son')
    expect(result.buyerShare).toBeCloseTo(1 / 3, 4)

    // compensationOwed = 100000 * (1 - 1/3) = 66667
    expect(result.compensationOwed).toBe(66667)

    // Distributed proportionally to daughter (1/6) and wife (1/2)
    // Other total = 1/6 + 1/2 = 2/3
    // daughter gets: 66667 * (1/6) / (2/3) = 66667 * 0.25 = 16667
    // wife gets: 66667 * (1/2) / (2/3) = 66667 * 0.75 = 50000
    expect(result.perGroupPayments).toHaveLength(2)

    const daughterPayment = result.perGroupPayments.find(p => p.heirType === 'daughter')
    expect(daughterPayment?.amount).toBe(16667)

    const wifePayment = result.perGroupPayments.find(p => p.heirType === 'wife')
    expect(wifePayment?.amount).toBe(50000)
  })

  it('throws if buyerHeirType not found in shares', () => {
    const shares: ShareResult[] = [
      makeShare('son', '1/2'),
      makeShare('daughter', '1/2'),
    ]

    expect(() => calculateBuyout(100000, 'wife', shares)).toThrow(
      'Buyer wife not found in shares',
    )
  })

  it('filters out blocked shares', () => {
    const shares: ShareResult[] = [
      makeShare('son', '2/3'),
      makeShare('daughter', '1/3'),
      {
        ...makeShare('brother_full', '0'),
        shareType: 'blocked',
      },
    ]

    const result = calculateBuyout(100000, 'son', shares)
    // Only daughter should receive payment (brother is blocked)
    expect(result.perGroupPayments).toHaveLength(1)
    expect(result.perGroupPayments[0].heirType).toBe('daughter')
  })

  it('returns correct assetValue in result', () => {
    const shares: ShareResult[] = [
      makeShare('son', '1/2'),
      makeShare('daughter', '1/2'),
    ]

    const result = calculateBuyout(200000, 'son', shares)
    expect(result.assetValue).toBe(200000)
    expect(result.compensationOwed).toBe(100000)
  })
})
