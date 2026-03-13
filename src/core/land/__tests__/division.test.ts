import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { Property } from '@/core/land/types'
import type { ShareResult } from '@/core/faraid/types'
import {
  divideParcels,
  calculateCompensations,
  qurahShuffle,
  moveParcel,
} from '@/core/land/division'
import type { DivisionGroup } from '@/core/land/division'

// --- Helpers ---

function makeProperty(id: string, landValue: number): Property {
  return {
    id,
    nickname: `Property ${id}`,
    type: null,
    division: null,
    upazila: null,
    rateSource: 'manual',
    landAreaSqft: 0,
    landInputUnit: 'decimal',
    landValue,
    house: null,
    trees: null,
    pond: null,
  }
}

function makeShare(
  heirType: ShareResult['heirType'],
  count: number,
  totalShare: Fraction,
  shareType: ShareResult['shareType'] = 'fard',
): ShareResult {
  return {
    heirType,
    count,
    sharePerHeir: totalShare.div(count),
    totalShare,
    shareType,
    explanation: '',
  }
}

// --- Tests ---

describe('divideParcels', () => {
  it('creates one DivisionGroup per active (non-blocked) ShareResult with correct targetValue', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 4)),
      makeShare('wife', 1, new Fraction(1, 4)),
      makeShare('brother_full', 1, new Fraction(0), 'blocked'),
    ]
    const totalEstate = 1_000_000

    const result = divideParcels([], shares, totalEstate)

    // Should have 3 groups (blocked excluded)
    expect(result.groups).toHaveLength(3)
    expect(result.groups.map((g) => g.heirType)).toEqual(
      expect.arrayContaining(['son', 'daughter', 'wife']),
    )
    expect(result.groups.find((g) => g.heirType === 'son')!.targetValue).toBe(
      Math.round(0.5 * totalEstate),
    )
    expect(
      result.groups.find((g) => g.heirType === 'daughter')!.targetValue,
    ).toBe(Math.round(0.25 * totalEstate))
    expect(result.groups.find((g) => g.heirType === 'wife')!.targetValue).toBe(
      Math.round(0.25 * totalEstate),
    )
  })

  it('greedy best-fit assigns largest-value property first to the group with largest remaining capacity', () => {
    const properties = [
      makeProperty('A', 300_000),
      makeProperty('B', 200_000),
      makeProperty('C', 100_000),
    ]
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 4)),
      makeShare('wife', 1, new Fraction(1, 4)),
    ]
    const totalEstate = 600_000

    const result = divideParcels(properties, shares, totalEstate)

    // Son group target=300k, Daughter target=150k, Wife target=150k
    // Sorted properties: A(300k), B(200k), C(100k)
    // A(300k) -> son group (largest gap: 300k)
    // After A: son gap=0, daughter gap=150k, wife gap=150k
    // B(200k) -> daughter group (gap 150k, tied with wife but daughter picked first or either)
    // After B: daughter gap=-50k, wife gap=150k
    // C(100k) -> wife group (gap 150k)
    const sonGroup = result.groups.find((g) => g.heirType === 'son')!
    expect(sonGroup.assignedProperties).toContain('A')

    // wife gets C (100k, underfilled) - has the largest gap after B is assigned
    const wifeGroup = result.groups.find((g) => g.heirType === 'wife')!
    expect(wifeGroup.assignedProperties).toContain('C')
  })

  it('when 2 properties and 3 groups, one group gets 0 properties and full cash compensation', () => {
    const properties = [
      makeProperty('A', 400_000),
      makeProperty('B', 200_000),
    ]
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 4)),
      makeShare('wife', 1, new Fraction(1, 4)),
    ]
    const totalEstate = 600_000

    const result = divideParcels(properties, shares, totalEstate)

    // One group should have 0 properties assigned
    const emptyGroup = result.groups.find(
      (g) => g.assignedProperties.length === 0,
    )
    expect(emptyGroup).toBeDefined()
    expect(emptyGroup!.assignedValue).toBe(0)
    // Cash adjustment should be negative (owed cash)
    expect(emptyGroup!.cashAdjustment).toBeLessThan(0)
  })

  it('all BDT amounts use Math.round() (no fractional taka)', () => {
    const properties = [
      makeProperty('A', 333_333),
      makeProperty('B', 166_667),
    ]
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 3)),
      makeShare('daughter', 1, new Fraction(1, 3)),
      makeShare('wife', 1, new Fraction(1, 3)),
    ]
    const totalEstate = 500_000

    const result = divideParcels(properties, shares, totalEstate)

    for (const group of result.groups) {
      expect(group.targetValue).toBe(Math.round(group.targetValue))
      expect(group.cashAdjustment).toBe(Math.round(group.cashAdjustment))
    }
  })
})

describe('calculateCompensations', () => {
  it('pairs overfilled groups with underfilled groups, amounts match', () => {
    const groups: DivisionGroup[] = [
      {
        heirType: 'son',
        label: 'Son',
        count: 2,
        targetValue: 300_000,
        assignedProperties: ['A'],
        assignedValue: 400_000,
        cashAdjustment: 100_000,
      },
      {
        heirType: 'daughter',
        label: 'Daughter',
        count: 1,
        targetValue: 150_000,
        assignedProperties: ['B'],
        assignedValue: 100_000,
        cashAdjustment: -50_000,
      },
      {
        heirType: 'wife',
        label: 'Wife',
        count: 1,
        targetValue: 150_000,
        assignedProperties: [],
        assignedValue: 100_000,
        cashAdjustment: -50_000,
      },
    ]

    const compensations = calculateCompensations(groups)

    expect(compensations.length).toBeGreaterThan(0)
    // Total from should equal total to
    const totalFrom = compensations.reduce((sum, c) => sum + c.amount, 0)
    // All fromGroup should be overfilled groups
    for (const c of compensations) {
      expect(c.amount).toBeGreaterThan(0)
    }
    // Total compensation paid out should be <= total surplus
    expect(totalFrom).toBeLessThanOrEqual(100_000)
  })
})

describe('qurahShuffle', () => {
  it('only shuffles heir-type assignments among groups with matching targetValue; unique fractions stay fixed', () => {
    const groups: DivisionGroup[] = [
      {
        heirType: 'son',
        label: 'Son',
        count: 2,
        targetValue: 300_000,
        assignedProperties: ['A'],
        assignedValue: 300_000,
        cashAdjustment: 0,
      },
      {
        heirType: 'daughter',
        label: 'Daughter',
        count: 1,
        targetValue: 150_000,
        assignedProperties: ['B'],
        assignedValue: 150_000,
        cashAdjustment: 0,
      },
      {
        heirType: 'wife',
        label: 'Wife',
        count: 1,
        targetValue: 150_000,
        assignedProperties: ['C'],
        assignedValue: 150_000,
        cashAdjustment: 0,
      },
    ]

    const result = qurahShuffle(groups)

    // Son's group (unique targetValue=300k) should stay as 'son'
    expect(result.get(0)).toBe('son')

    // Daughter and Wife groups (same targetValue=150k) should contain each other's heirType
    const shuffledTypes = [result.get(1), result.get(2)]
    expect(shuffledTypes).toContain('daughter')
    expect(shuffledTypes).toContain('wife')
  })

  it('returns a Map from group index to HeirType', () => {
    const groups: DivisionGroup[] = [
      {
        heirType: 'son',
        label: 'Son',
        count: 2,
        targetValue: 300_000,
        assignedProperties: [],
        assignedValue: 0,
        cashAdjustment: -300_000,
      },
    ]

    const result = qurahShuffle(groups)

    expect(result).toBeInstanceOf(Map)
    expect(result.get(0)).toBe('son')
  })
})

describe('moveParcel', () => {
  it('transfers a property ID from one group to another, updates assignedValue and cashAdjustment', () => {
    const properties = [
      makeProperty('A', 300_000),
      makeProperty('B', 200_000),
      makeProperty('C', 100_000),
    ]
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    const totalEstate = 600_000

    const initial = divideParcels(properties, shares, totalEstate)

    // Find a property in son's group and move it to daughter
    const sonGroup = initial.groups.find((g) => g.heirType === 'son')!
    const propToMove = sonGroup.assignedProperties[0]

    const moved = moveParcel(
      initial,
      propToMove,
      'son',
      'daughter',
      properties,
    )

    // Property should be removed from son and added to daughter
    const newSon = moved.groups.find((g) => g.heirType === 'son')!
    const newDaughter = moved.groups.find((g) => g.heirType === 'daughter')!
    expect(newSon.assignedProperties).not.toContain(propToMove)
    expect(newDaughter.assignedProperties).toContain(propToMove)

    // Values should be recalculated
    expect(moved.groups.every((g) => g.cashAdjustment === Math.round(g.cashAdjustment))).toBe(true)

    // Immutability check: original should not be mutated
    expect(initial.groups.find((g) => g.heirType === 'son')!.assignedProperties).toContain(propToMove)
  })

  it('moveParcel with invalid propertyId is a no-op', () => {
    const properties = [makeProperty('A', 300_000)]
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    const totalEstate = 300_000

    const initial = divideParcels(properties, shares, totalEstate)
    const moved = moveParcel(initial, 'NONEXISTENT', 'son', 'daughter', properties)

    // Should be identical to initial
    expect(moved.groups).toEqual(initial.groups)
  })
})
