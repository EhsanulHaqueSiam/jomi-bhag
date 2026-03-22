import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { ShareResult } from '@/core/faraid/types'
import type { DistributionGroup, DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn } from '@/core/distribution/individual-types'
import {
  expandGroupsToIndividuals,
  subdivideGroupItems,
  splitParcel,
  mergeParcel,
  individualQurahShuffle,
  calculateIndividualCompensations,
  moveIndividualItem,
  computeIndividualFingerprint,
  initializeIndividualDistribution,
} from '@/core/distribution/individual-algorithm'
import type { WizardState } from '@/types/wizard'

// --- Helpers ---

function makeGroup(
  heirType: DistributionGroup['heirType'],
  count: number,
  targetValue: number,
  assignedItems: string[] = [],
  assignedValue = 0,
): DistributionGroup {
  return {
    heirType,
    label: heirType,
    count,
    targetValue,
    assignedItems,
    assignedValue,
    cashAdjustment: assignedValue - targetValue,
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

function makeItem(id: string, value: number, type: 'property' | 'movable' = 'property'): DistributionItem {
  return { id, type, category: 'land', label: `Item ${id}`, value }
}

function makeIndividual(
  id: string,
  heirType: IndividualColumn['heirType'],
  index: number,
  targetValue: number,
  assignedItems: string[] = [],
  assignedValue = 0,
): IndividualColumn {
  return {
    id,
    heirType,
    index,
    displayName: `${heirType} ${index + 1}`,
    customName: null,
    targetValue,
    sharePerHeir: new Fraction(1, 6).toFraction(),
    assignedItems,
    assignedValue,
    cashAdjustment: assignedValue - targetValue,
  }
}

// --- Tests ---

describe('expandGroupsToIndividuals', () => {
  it('should expand 3 sons + 2 daughters into 5 individuals with correct targets', () => {
    const groups = [
      makeGroup('son', 3, 600000),
      makeGroup('daughter', 2, 200000),
    ]
    const shares = [
      makeShare('son', 3, new Fraction(6, 10)),
      makeShare('daughter', 2, new Fraction(2, 10)),
    ]

    const result = expandGroupsToIndividuals(groups, shares)

    expect(result).toHaveLength(5)

    // 3 sons with 200000 each
    const sons = result.filter((i) => i.heirType === 'son')
    expect(sons).toHaveLength(3)
    for (const son of sons) {
      expect(son.targetValue).toBe(200000)
    }
    expect(sons[0].id).toBe('son_0')
    expect(sons[1].id).toBe('son_1')
    expect(sons[2].id).toBe('son_2')
    expect(sons[0].displayName).toBe('Son 1')
    expect(sons[1].displayName).toBe('Son 2')
    expect(sons[2].displayName).toBe('Son 3')

    // 2 daughters with 100000 each
    const daughters = result.filter((i) => i.heirType === 'daughter')
    expect(daughters).toHaveLength(2)
    for (const daughter of daughters) {
      expect(daughter.targetValue).toBe(100000)
    }
    expect(daughters[0].id).toBe('daughter_0')
    expect(daughters[0].displayName).toBe('Daughter 1')
  })

  it('should give single wife her own column', () => {
    const groups = [makeGroup('wife', 1, 125000)]
    const shares = [makeShare('wife', 1, new Fraction(1, 8))]

    const result = expandGroupsToIndividuals(groups, shares)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('wife_0')
    expect(result[0].displayName).toBe('Wife 1')
    expect(result[0].targetValue).toBe(125000)
  })

  it('should use HEIR_TYPE_LABELS for display names', () => {
    const groups = [makeGroup('brother_full', 2, 400000)]
    const shares = [makeShare('brother_full', 2, new Fraction(2, 5))]

    const result = expandGroupsToIndividuals(groups, shares)

    expect(result[0].displayName).toBe('Full Brother 1')
    expect(result[1].displayName).toBe('Full Brother 2')
  })

  it('should store serialized sharePerHeir from shares', () => {
    const groups = [makeGroup('son', 2, 500000)]
    const shares = [makeShare('son', 2, new Fraction(1, 2))]

    const result = expandGroupsToIndividuals(groups, shares)

    // sharePerHeir should be serialized fraction string for 1/4
    expect(result[0].sharePerHeir).toBe('1/4')
  })
})

describe('subdivideGroupItems', () => {
  it('should distribute items round-robin by value to individuals', () => {
    const items = [
      makeItem('a', 300),
      makeItem('b', 200),
      makeItem('c', 100),
    ]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 300),
      makeIndividual('son_1', 'son', 1, 300),
    ]

    const result = subdivideGroupItems(items, individuals, 'son')

    // Sorted by value desc: a(300), b(200), c(100)
    // Round-robin: a->son_0, b->son_1, c->son_0
    const son0 = result.find((i) => i.id === 'son_0')!
    const son1 = result.find((i) => i.id === 'son_1')!

    expect(son0.assignedItems).toContain('a')
    expect(son0.assignedItems).toContain('c')
    expect(son1.assignedItems).toContain('b')
    expect(son0.assignedValue).toBe(400)
    expect(son1.assignedValue).toBe(200)
  })

  it('should only distribute to individuals of matching heirType', () => {
    const items = [makeItem('a', 100)]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 200),
      makeIndividual('daughter_0', 'daughter', 0, 100),
    ]

    const result = subdivideGroupItems(items, individuals, 'son')

    const son0 = result.find((i) => i.id === 'son_0')!
    const daughter0 = result.find((i) => i.id === 'daughter_0')!

    expect(son0.assignedItems).toContain('a')
    expect(daughter0.assignedItems).toHaveLength(0)
  })
})

describe('splitParcel', () => {
  it('should split a parcel into sub-parcels with proportional values', () => {
    const original = makeItem('p1', 90000)
    original.label = 'Beki'

    const splits = [{ areaSqft: 500 }, { areaSqft: 400 }]
    const totalArea = 900

    const result = splitParcel(original, splits, totalArea)

    expect(result).toHaveLength(2)
    expect(result[0].value).toBe(50000)
    // Last sub-parcel gets remainder to prevent rounding drift
    expect(result[1].value).toBe(40000)
    // Values sum exactly to original
    expect(result[0].value + result[1].value).toBe(90000)
  })

  it('should prevent floating point drift with last-gets-remainder', () => {
    const original = makeItem('p2', 100000)
    original.label = 'Test'

    // 3-way split that might cause rounding issues
    const splits = [{ areaSqft: 333 }, { areaSqft: 333 }, { areaSqft: 334 }]
    const totalArea = 1000

    const result = splitParcel(original, splits, totalArea)

    const sum = result.reduce((s, item) => s + item.value, 0)
    expect(sum).toBe(100000) // Exact original value preserved
  })

  it('should create new items with labels including area annotation', () => {
    const original = makeItem('p3', 60000)
    original.label = 'Beki'

    const splits = [{ areaSqft: 2178 }, { areaSqft: 1089 }]
    const totalArea = 3267

    const result = splitParcel(original, splits, totalArea)

    expect(result).toHaveLength(2)
    // Each item should have a label with area annotation
    expect(result[0].label).toContain('Beki')
    expect(result[1].label).toContain('Beki')
    // Each should be a property type
    expect(result[0].type).toBe('property')
    expect(result[1].type).toBe('property')
  })

  it('should generate unique IDs for sub-parcels', () => {
    const original = makeItem('p4', 50000)
    const splits = [{ areaSqft: 250 }, { areaSqft: 250 }]

    const result = splitParcel(original, splits, 500)

    expect(result[0].id).not.toBe(result[1].id)
    expect(result[0].id).not.toBe('p4')
    expect(result[1].id).not.toBe('p4')
  })
})

describe('mergeParcel', () => {
  it('should restore original item from split items', () => {
    const original = makeItem('p1', 90000)
    original.label = 'Beki'
    original.category = 'residential'

    const splitItems = [
      { ...makeItem('sub1', 50000), category: 'residential' },
      { ...makeItem('sub2', 40000), category: 'residential' },
    ]

    const result = mergeParcel(splitItems, original)

    expect(result.removedIds).toContain('sub1')
    expect(result.removedIds).toContain('sub2')
    expect(result.restoredItem.id).toBe('p1')
    expect(result.restoredItem.value).toBe(90000)
    expect(result.restoredItem.label).toBe('Beki')
  })
})

describe('individualQurahShuffle', () => {
  it('should assign all items with no items lost', () => {
    const items = [
      makeItem('a', 300),
      makeItem('b', 200),
      makeItem('c', 100),
      makeItem('d', 50),
    ]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 325),
      makeIndividual('son_1', 'son', 1, 325),
    ]

    const result = individualQurahShuffle(items, individuals)

    const allAssigned = result.flatMap((i) => i.assignedItems)
    expect(allAssigned.sort()).toEqual(['a', 'b', 'c', 'd'])
    // No duplicates
    expect(new Set(allAssigned).size).toBe(4)
  })

  it('should recalculate assignedValue and cashAdjustment', () => {
    const items = [
      makeItem('a', 200),
      makeItem('b', 100),
    ]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 150),
      makeIndividual('son_1', 'son', 1, 150),
    ]

    const result = individualQurahShuffle(items, individuals)

    for (const ind of result) {
      const expectedValue = ind.assignedItems.reduce((sum, id) => {
        const item = items.find((i) => i.id === id)!
        return sum + item.value
      }, 0)
      expect(ind.assignedValue).toBe(expectedValue)
      expect(ind.cashAdjustment).toBe(Math.round(expectedValue - ind.targetValue))
    }
  })
})

describe('calculateIndividualCompensations', () => {
  it('should create compensations matching surplus with deficit', () => {
    const individuals = [
      makeIndividual('son_0', 'son', 0, 10000, ['a'], 10500), // +500
      makeIndividual('daughter_0', 'daughter', 0, 10000, ['b'], 9500), // -500
    ]

    const result = calculateIndividualCompensations(individuals)

    expect(result).toHaveLength(1)
    expect(result[0].fromId).toBe('son_0')
    expect(result[0].toId).toBe('daughter_0')
    expect(result[0].amount).toBe(500)
  })

  it('should minimize transfers with greedy matching', () => {
    // 3 surplus + 2 deficit = max 4 transfers
    const individuals = [
      makeIndividual('s0', 'son', 0, 10000, ['a'], 15000), // +5000
      makeIndividual('s1', 'son', 1, 10000, ['b'], 13000), // +3000
      makeIndividual('s2', 'son', 2, 10000, ['c'], 12000), // +2000
      makeIndividual('d0', 'daughter', 0, 10000, ['d'], 5000), // -5000
      makeIndividual('d1', 'daughter', 1, 10000, ['e'], 5000), // -5000
    ]

    const result = calculateIndividualCompensations(individuals)

    // Should not exceed 4 transfers (min of surplus count + deficit count)
    expect(result.length).toBeLessThanOrEqual(4)

    // Total transferred from surplus should match total deficit
    const totalFrom = result.reduce((s, c) => s + c.amount, 0)
    expect(totalFrom).toBe(10000) // 5000 + 5000
  })

  it('should filter out transfers below COMPENSATION_THRESHOLD', () => {
    const individuals = [
      makeIndividual('s0', 'son', 0, 1000, ['a'], 1050), // +50 (below threshold)
      makeIndividual('d0', 'daughter', 0, 1000, ['b'], 950), // -50 (below threshold)
    ]

    const result = calculateIndividualCompensations(individuals)

    // Amount 50 is below COMPENSATION_THRESHOLD (100), so no transfers
    expect(result).toHaveLength(0)
  })

  it('should include names in compensation entries', () => {
    const individuals = [
      { ...makeIndividual('son_0', 'son', 0, 100, ['a'], 200), displayName: 'Son 1' },
      { ...makeIndividual('daughter_0', 'daughter', 0, 100, ['b'], 0), displayName: 'Daughter 1' },
    ]

    const result = calculateIndividualCompensations(individuals)

    expect(result[0].fromName).toBe('Son 1')
    expect(result[0].toName).toBe('Daughter 1')
  })
})

describe('moveIndividualItem', () => {
  it('should move item between individuals and recalculate values', () => {
    const items = [makeItem('a', 100), makeItem('b', 200)]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 150, ['a', 'b'], 300),
      makeIndividual('son_1', 'son', 1, 150, [], 0),
    ]

    const result = moveIndividualItem(individuals, items, 'b', 'son_0', 'son_1')

    const from = result.find((i) => i.id === 'son_0')!
    const to = result.find((i) => i.id === 'son_1')!

    expect(from.assignedItems).toEqual(['a'])
    expect(from.assignedValue).toBe(100)
    expect(to.assignedItems).toEqual(['b'])
    expect(to.assignedValue).toBe(200)
  })

  it('should return original array if item not found in source', () => {
    const items = [makeItem('a', 100)]
    const individuals = [
      makeIndividual('son_0', 'son', 0, 100, ['a'], 100),
      makeIndividual('son_1', 'son', 1, 100, [], 0),
    ]

    const result = moveIndividualItem(individuals, items, 'nonexistent', 'son_0', 'son_1')

    expect(result).toEqual(individuals)
  })
})

describe('computeIndividualFingerprint', () => {
  const baseProperty = {
    id: 'p1',
    nickname: '',
    type: 'residential' as const,
    division: null,
    upazila: null,
    rateSource: 'manual' as const,
    landAreaSqft: 0,
    landInputUnit: 'decimal' as const,
    landValue: 100_000,
    house: null,
    trees: null,
    pond: null,
    settlement: null,
  }

  const baseAsset = {
    id: 'a1',
    category: 'cash' as const,
    value: 50_000,
    isIndivisible: false,
    indivisibleResolution: null,
  }

  it('should change when heir count changes', () => {
    const state1 = {
      properties: [baseProperty],
      movableAssets: [],
      sonCount: 3,
      daughterCount: 2,
      wifeCount: 1,
      husbandPresent: false,
      brotherFullCount: 0,
      brotherConsanguineCount: 0,
      brotherUterineCount: 0,
      sisterFullCount: 0,
      sisterConsanguineCount: 0,
      sisterUterineCount: 0,
    } as unknown as WizardState

    const state2 = {
      ...state1,
      sonCount: 4, // changed
    } as unknown as WizardState

    const fp1 = computeIndividualFingerprint(state1)
    const fp2 = computeIndividualFingerprint(state2)

    expect(fp1).not.toBe(fp2)
  })

  it('should include property and movable asset IDs and values', () => {
    const state1 = {
      properties: [baseProperty],
      movableAssets: [baseAsset],
      sonCount: 1,
      daughterCount: 0,
      wifeCount: 0,
      husbandPresent: false,
      brotherFullCount: 0,
      brotherConsanguineCount: 0,
      brotherUterineCount: 0,
      sisterFullCount: 0,
      sisterConsanguineCount: 0,
      sisterUterineCount: 0,
    } as unknown as WizardState

    const state2 = {
      ...state1,
      properties: [
        { ...baseProperty, landValue: 100_000 },
      ],
      movableAssets: [
        { ...baseAsset, value: 75_000 },
      ],
    } as unknown as WizardState

    const fp1 = computeIndividualFingerprint(state1)
    const fp2 = computeIndividualFingerprint(state2)

    expect(fp1).not.toBe(fp2)
  })
})

describe('initializeIndividualDistribution', () => {
  it('should produce correct individual distribution from group data', () => {
    const items = [
      makeItem('a', 300),
      makeItem('b', 200),
      makeItem('c', 100),
    ]
    const groups = [
      { ...makeGroup('son', 2, 400, ['a', 'b'], 500), },
      { ...makeGroup('daughter', 1, 200, ['c'], 100), },
    ]
    const shares = [
      makeShare('son', 2, new Fraction(2, 3)),
      makeShare('daughter', 1, new Fraction(1, 3)),
    ]

    const result = initializeIndividualDistribution(
      { groups, items, totalEstateValue: 600 },
      shares,
    )

    // Should have 3 individuals (2 sons + 1 daughter)
    expect(result.individuals).toHaveLength(3)
    expect(result.totalEstateValue).toBe(600)

    // All items should be assigned
    const allAssigned = result.individuals.flatMap((i) => i.assignedItems)
    expect(allAssigned.sort()).toEqual(['a', 'b', 'c'])
  })
})
