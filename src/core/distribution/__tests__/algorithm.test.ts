import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { Property } from '@/core/land/types'
import type { MovableAsset, GoldSilverAsset, VehicleAsset } from '@/core/assets/types'
import type { ShareResult } from '@/core/faraid/types'
import {
  buildDistributionItems,
  getEquilibriumStatus,
  smartShuffle,
  moveItem,
  calculateDistributionCompensations,
  initializeDistribution,
} from '@/core/distribution/algorithm'
import type { DistributionGroup } from '@/core/distribution/types'

// --- Helpers ---

function makeProperty(id: string, landValue: number, nickname = ''): Property {
  return {
    id,
    nickname,
    type: 'residential',
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

function makeGoldAsset(id: string): GoldSilverAsset {
  return {
    id,
    category: 'gold_silver',
    metalType: 'gold',
    weight: 5,
    weightUnit: 'vori',
    purity: '22K',
    useAutoRate: true,
    overrideValue: 665_000, // 5 vori * 133k
    isIndivisible: false,
    indivisibleResolution: null,
  }
}

function makeVehicleAsset(id: string, value: number): VehicleAsset {
  return {
    id,
    category: 'vehicle',
    vehicleType: 'car',
    description: 'Toyota Corolla',
    estimatedValue: value,
    isIndivisible: true,
    indivisibleResolution: null,
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

function makeGroup(
  heirType: DistributionGroup['heirType'],
  targetValue: number,
  assignedItems: string[] = [],
  assignedValue = 0,
): DistributionGroup {
  return {
    heirType,
    label: heirType,
    count: 1,
    targetValue,
    assignedItems,
    assignedValue,
    cashAdjustment: assignedValue - targetValue,
  }
}

// --- Tests ---

describe('buildDistributionItems', () => {
  it('converts properties and movable assets into DistributionItem array', () => {
    const properties = [makeProperty('p1', 500_000, 'Main House')]
    const goldAsset = makeGoldAsset('a1')
    const vehicleAsset = makeVehicleAsset('a2', 300_000)

    const items = buildDistributionItems(properties, [goldAsset, vehicleAsset])

    expect(items).toHaveLength(3)

    const propItem = items.find((i) => i.id === 'p1')!
    expect(propItem.type).toBe('property')
    expect(propItem.category).toBe('residential')
    expect(propItem.label).toBe('Main House')
    expect(propItem.value).toBe(500_000)

    const goldItem = items.find((i) => i.id === 'a1')!
    expect(goldItem.type).toBe('movable')
    expect(goldItem.category).toBe('gold_silver')
    expect(goldItem.value).toBe(665_000)

    const vehicleItem = items.find((i) => i.id === 'a2')!
    expect(vehicleItem.type).toBe('movable')
    expect(vehicleItem.category).toBe('vehicle')
    expect(vehicleItem.value).toBe(300_000)
  })

  it('returns empty array for empty inputs', () => {
    const items = buildDistributionItems([], [])
    expect(items).toEqual([])
  })

  it('uses fallback label for properties without nickname', () => {
    const properties = [makeProperty('p1', 100_000)]
    const items = buildDistributionItems(properties, [])
    expect(items[0].label).toBe('Property #1')
  })
})

describe('getEquilibriumStatus', () => {
  it('returns balanced for within 2% deviation', () => {
    const result = getEquilibriumStatus(98_000, 100_000)
    expect(result.status).toBe('balanced')
    expect(result.percentage).toBe(98)
    expect(result.delta).toBe(-2_000)
  })

  it('returns close for within 5% deviation (but beyond 2%)', () => {
    const result = getEquilibriumStatus(96_000, 100_000)
    expect(result.status).toBe('close')
    expect(result.percentage).toBe(96)
    expect(result.delta).toBe(-4_000)
  })

  it('returns off for beyond 5% deviation', () => {
    const result = getEquilibriumStatus(80_000, 100_000)
    expect(result.status).toBe('off')
    expect(result.percentage).toBe(80)
    expect(result.delta).toBe(-20_000)
  })

  it('returns off for over-allocation beyond 5%', () => {
    const result = getEquilibriumStatus(110_000, 100_000)
    expect(result.status).toBe('off')
    expect(result.percentage).toBe(110)
    expect(result.delta).toBe(10_000)
  })

  it('returns balanced for zero target', () => {
    const result = getEquilibriumStatus(0, 0)
    expect(result.status).toBe('balanced')
    expect(result.percentage).toBe(100)
    expect(result.delta).toBe(0)
  })
})

describe('smartShuffle', () => {
  it('distributes items across groups so no group is empty (basic sanity)', () => {
    const items = [
      { id: 'i1', type: 'property' as const, category: 'residential', label: 'A', value: 200_000 },
      { id: 'i2', type: 'property' as const, category: 'residential', label: 'B', value: 150_000 },
      { id: 'i3', type: 'movable' as const, category: 'vehicle', label: 'C', value: 100_000 },
      { id: 'i4', type: 'movable' as const, category: 'gold_silver', label: 'D', value: 50_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 250_000),
      makeGroup('daughter', 250_000),
    ]

    const result = smartShuffle(items, groups)

    // Each group should have at least one item assigned
    for (const group of result) {
      expect(group.assignedItems.length).toBeGreaterThan(0)
    }
  })

  it('assigns larger items to most under-filled groups first (weighted)', () => {
    const items = [
      { id: 'big', type: 'property' as const, category: 'residential', label: 'Big', value: 500_000 },
      { id: 'small', type: 'movable' as const, category: 'cash', label: 'Small', value: 10_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 300_000),
      makeGroup('daughter', 210_000),
    ]

    const result = smartShuffle(items, groups)

    // The larger item (500k) should go to the group with more capacity (son: 300k > daughter: 210k)
    const sonGroup = result.find((g) => g.heirType === 'son')!
    expect(sonGroup.assignedItems).toContain('big')
  })

  it('recalculates assignedValue and cashAdjustment for all groups', () => {
    const items = [
      { id: 'i1', type: 'property' as const, category: 'residential', label: 'A', value: 100_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 80_000),
      makeGroup('daughter', 20_000),
    ]

    const result = smartShuffle(items, groups)

    // One group gets the item, the other doesn't
    const total = result.reduce((sum, g) => sum + g.assignedValue, 0)
    expect(total).toBe(100_000)

    // Cash adjustments should be computed
    for (const group of result) {
      expect(group.cashAdjustment).toBe(Math.round(group.assignedValue - group.targetValue))
    }
  })
})

describe('moveItem', () => {
  it('moves an item from one group to another, recalculates values', () => {
    const items = [
      { id: 'i1', type: 'property' as const, category: 'residential', label: 'A', value: 200_000 },
      { id: 'i2', type: 'movable' as const, category: 'vehicle', label: 'B', value: 100_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 150_000, ['i1', 'i2'], 300_000),
      makeGroup('daughter', 150_000, [], 0),
    ]

    const result = moveItem(groups, items, 'i2', 'son', 'daughter')

    const sonGroup = result.find((g) => g.heirType === 'son')!
    const daughterGroup = result.find((g) => g.heirType === 'daughter')!

    expect(sonGroup.assignedItems).not.toContain('i2')
    expect(sonGroup.assignedItems).toContain('i1')
    expect(sonGroup.assignedValue).toBe(200_000)

    expect(daughterGroup.assignedItems).toContain('i2')
    expect(daughterGroup.assignedValue).toBe(100_000)

    // Cash adjustments recalculated
    expect(sonGroup.cashAdjustment).toBe(200_000 - 150_000)
    expect(daughterGroup.cashAdjustment).toBe(100_000 - 150_000)
  })

  it('returns unchanged groups for invalid itemId', () => {
    const items = [
      { id: 'i1', type: 'property' as const, category: 'residential', label: 'A', value: 100_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 50_000, ['i1'], 100_000),
      makeGroup('daughter', 50_000, [], 0),
    ]

    const result = moveItem(groups, items, 'NONEXISTENT', 'son', 'daughter')

    // Should be unchanged
    expect(result).toEqual(groups)
  })

  it('is immutable - does not modify original groups', () => {
    const items = [
      { id: 'i1', type: 'property' as const, category: 'residential', label: 'A', value: 100_000 },
    ]
    const groups: DistributionGroup[] = [
      makeGroup('son', 50_000, ['i1'], 100_000),
      makeGroup('daughter', 50_000, [], 0),
    ]

    const originalSonItems = [...groups[0].assignedItems]
    moveItem(groups, items, 'i1', 'son', 'daughter')

    // Original should not be mutated
    expect(groups[0].assignedItems).toEqual(originalSonItems)
  })
})

describe('calculateDistributionCompensations', () => {
  it('pairs overfilled with underfilled groups', () => {
    const groups: DistributionGroup[] = [
      makeGroup('son', 300_000, ['i1'], 400_000),
      makeGroup('daughter', 150_000, ['i2'], 100_000),
      makeGroup('wife', 150_000, [], 100_000),
    ]
    // Update cashAdjustments
    groups[0].cashAdjustment = 100_000
    groups[1].cashAdjustment = -50_000
    groups[2].cashAdjustment = -50_000

    const compensations = calculateDistributionCompensations(groups)

    expect(compensations.length).toBeGreaterThan(0)

    const totalCompensation = compensations.reduce((sum, c) => sum + c.amount, 0)
    expect(totalCompensation).toBeLessThanOrEqual(100_000)

    for (const c of compensations) {
      expect(c.amount).toBeGreaterThan(0)
    }
  })
})

describe('initializeDistribution', () => {
  it('creates a complete DistributionResult from properties, assets, shares, and total', () => {
    const properties = [makeProperty('p1', 300_000, 'House')]
    const movableAssets: MovableAsset[] = [makeVehicleAsset('a1', 200_000)]
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    const totalEstateValue = 500_000

    const result = initializeDistribution(properties, movableAssets, shares, totalEstateValue)

    expect(result.items).toHaveLength(2)
    expect(result.groups).toHaveLength(2)
    expect(result.totalEstateValue).toBe(500_000)

    // All items should be assigned
    const allAssigned = result.groups.flatMap((g) => g.assignedItems)
    expect(allAssigned).toHaveLength(2)
    expect(allAssigned).toContain('p1')
    expect(allAssigned).toContain('a1')
  })
})
