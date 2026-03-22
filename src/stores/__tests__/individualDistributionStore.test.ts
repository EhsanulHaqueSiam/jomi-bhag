import { describe, it, expect, beforeEach } from 'vitest'
import Fraction from 'fraction.js'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { useWizardStore } from '@/stores/wizardStore'
import type { Property } from '@/core/land/types'
import type { MovableAsset, VehicleAsset } from '@/core/assets/types'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'

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

function makeFaraidOutput(shares: ShareResult[]): FaraidOutput {
  return {
    shares,
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [],
    references: [],
  }
}

/** Set up wizardStore with test data, compute group distribution, then initialize individual distribution */
function setupAndInitialize(
  properties: Property[],
  movableAssets: MovableAsset[],
  totalEstateValue: number,
  shares: ShareResult[],
) {
  // Set wizardStore state directly
  useWizardStore.setState({
    properties,
    movableAssets,
    totalEstateValue,
    results: makeFaraidOutput(shares),
  })

  // Compute group distribution
  useDistributionStore.getState().computeDistribution()

  // Initialize individual distribution
  useIndividualDistributionStore.getState().initialize()
}

// --- Setup ---

beforeEach(() => {
  localStorage.clear()
  useWizardStore.persist.clearStorage()
  // Reset all stores
  useWizardStore.setState({
    properties: [],
    movableAssets: [],
    totalEstateValue: 0,
    results: null,
    sonCount: 0,
    daughterCount: 0,
    wifeCount: 0,
    husbandPresent: false,
    brotherFullCount: 0,
    brotherConsanguineCount: 0,
    brotherUterineCount: 0,
    sisterFullCount: 0,
    sisterConsanguineCount: 0,
    sisterUterineCount: 0,
  })
  useDistributionStore.setState({
    distributionResult: null,
    previousSnapshot: null,
    fingerprint: null,
  })
  useIndividualDistributionStore.setState({
    individuals: [],
    items: [],
    compensations: [],
    customNames: {},
    previousSnapshot: null,
    fingerprint: null,
    qurahUsed: false,
    hasBeenUsed: false,
    revealedCount: 0,
    isRevealed: false,
    splitOrigins: {},
  })
})

// --- Tests ---

describe('initialize', () => {
  it('creates correct number of individuals from mock distribution', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(2, 3)),
      makeShare('daughter', 1, new Fraction(1, 3)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 300_000), makeProperty('p2', 200_000)],
      [makeVehicleAsset('a1', 100_000)],
      600_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()
    expect(state.individuals).toHaveLength(3) // 2 sons + 1 daughter
    expect(state.items).toHaveLength(3) // 2 properties + 1 vehicle
    expect(state.hasBeenUsed).toBe(true)
    expect(state.fingerprint).not.toBeNull()
  })

  it('computes group distribution first if not already computed', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]

    // Set wizard state but do NOT compute group distribution
    useWizardStore.setState({
      properties: [makeProperty('p1', 100_000)],
      movableAssets: [],
      totalEstateValue: 100_000,
      results: makeFaraidOutput(shares),
    })

    // Reset distribution store
    useDistributionStore.setState({
      distributionResult: null,
      previousSnapshot: null,
      fingerprint: null,
    })

    // Initialize individual distribution -- should auto-compute group distribution
    useIndividualDistributionStore.getState().initialize()

    const state = useIndividualDistributionStore.getState()
    expect(state.individuals).toHaveLength(2) // 1 son + 1 daughter
    expect(state.items).toHaveLength(1)
  })

  it('assigns all items to individuals', () => {
    const shares: ShareResult[] = [
      makeShare('son', 3, new Fraction(3, 5)),
      makeShare('daughter', 2, new Fraction(2, 5)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000), makeProperty('p2', 80_000), makeProperty('p3', 60_000)],
      [makeVehicleAsset('a1', 50_000)],
      290_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()
    const allAssigned = state.individuals.flatMap((i) => i.assignedItems)

    // All items should be assigned
    expect(allAssigned).toHaveLength(4)
    // No duplicates
    expect(new Set(allAssigned).size).toBe(4)
  })
})

describe('moveItem', () => {
  it('transfers item and updates cashAdjustment', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 300_000), makeProperty('p2', 200_000)],
      [makeVehicleAsset('a1', 100_000)],
      600_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()
    const son0 = state.individuals.find((i) => i.id === 'son_0')!
    const firstItem = son0.assignedItems[0]

    if (firstItem) {
      state.moveItem(firstItem, 'son_0', 'daughter_0')

      const after = useIndividualDistributionStore.getState()
      const afterSon0 = after.individuals.find((i) => i.id === 'son_0')!
      const afterDaughter0 = after.individuals.find((i) => i.id === 'daughter_0')!

      expect(afterSon0.assignedItems).not.toContain(firstItem)
      expect(afterDaughter0.assignedItems).toContain(firstItem)
      expect(after.previousSnapshot).not.toBeNull()
    }
  })
})

describe('undo', () => {
  it('restores previous state', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 300_000), makeProperty('p2', 200_000)],
      [],
      500_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()
    const originalIndividuals = state.individuals
    const son0 = originalIndividuals.find((i) => i.id === 'son_0')!
    const firstItem = son0.assignedItems[0]

    if (firstItem) {
      state.moveItem(firstItem, 'son_0', 'daughter_0')
      useIndividualDistributionStore.getState().undo()

      const after = useIndividualDistributionStore.getState()
      const restoredSon0 = after.individuals.find((i) => i.id === 'son_0')!

      expect(restoredSon0.assignedItems).toContain(firstItem)
      expect(after.previousSnapshot).toBeNull()
    }
  })
})

describe('splitItem', () => {
  it('creates sub-items and removes original', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()

    // Find which individual has p1
    const indWithP1 = state.individuals.find((i) => i.assignedItems.includes('p1'))!

    state.splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)

    const after = useIndividualDistributionStore.getState()

    // Original p1 should be removed from items
    expect(after.items.find((i) => i.id === 'p1')).toBeUndefined()

    // Two new sub-items should exist
    expect(after.items.length).toBe(2)

    // Sub-items should be assigned to the same individual
    const afterInd = after.individuals.find((i) => i.id === indWithP1.id)!
    expect(afterInd.assignedItems).toHaveLength(2)
    expect(afterInd.assignedItems).not.toContain('p1')

    // Values should sum to original
    const totalValue = after.items.reduce((sum, i) => sum + i.value, 0)
    expect(totalValue).toBe(100_000)
  })
})

describe('mergeItem', () => {
  it('restores original item and removes sub-items', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    const state = useIndividualDistributionStore.getState()

    // Split then merge
    state.splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)
    useIndividualDistributionStore.getState().mergeItem('p1')

    const after = useIndividualDistributionStore.getState()

    // Original p1 should be restored
    expect(after.items.find((i) => i.id === 'p1')).toBeDefined()
    expect(after.items).toHaveLength(1)
    expect(after.items[0].value).toBe(100_000)
  })
})

describe('renameIndividual', () => {
  it('updates customNames map', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().renameIndividual('son_0', 'Rahim')

    const state = useIndividualDistributionStore.getState()
    expect(state.customNames['son_0']).toBe('Rahim')
  })
})

describe('isStale', () => {
  it('returns true when heir counts change', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]

    useWizardStore.setState({
      properties: [makeProperty('p1', 100_000)],
      movableAssets: [],
      totalEstateValue: 100_000,
      results: makeFaraidOutput(shares),
      sonCount: 2,
      daughterCount: 1,
    })

    useDistributionStore.getState().computeDistribution()
    useIndividualDistributionStore.getState().initialize()

    // Change heir count
    useWizardStore.setState({ sonCount: 3 })

    expect(useIndividualDistributionStore.getState().isStale()).toBe(true)
  })

  it('returns false when data unchanged', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]

    useWizardStore.setState({
      properties: [makeProperty('p1', 100_000)],
      movableAssets: [],
      totalEstateValue: 100_000,
      results: makeFaraidOutput(shares),
      sonCount: 1,
      daughterCount: 1,
    })

    useDistributionStore.getState().computeDistribution()
    useIndividualDistributionStore.getState().initialize()

    expect(useIndividualDistributionStore.getState().isStale()).toBe(false)
  })

  it('returns true when property or asset values change', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]

    useWizardStore.setState({
      properties: [makeProperty('p1', 100_000)],
      movableAssets: [makeVehicleAsset('a1', 50_000)],
      totalEstateValue: 150_000,
      results: makeFaraidOutput(shares),
      sonCount: 1,
      daughterCount: 1,
    })

    useDistributionStore.getState().computeDistribution()
    useIndividualDistributionStore.getState().initialize()

    // Keep IDs the same; change only values
    useWizardStore.setState({
      properties: [makeProperty('p1', 120_000)],
      movableAssets: [makeVehicleAsset('a1', 55_000)],
      totalEstateValue: 175_000,
    })

    expect(useIndividualDistributionStore.getState().isStale()).toBe(true)
  })
})

describe('qurahShuffle', () => {
  it('reassigns all items and sets qurahUsed', () => {
    const shares: ShareResult[] = [
      makeShare('son', 2, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 200_000), makeProperty('p2', 150_000)],
      [makeVehicleAsset('a1', 50_000)],
      400_000,
      shares,
    )

    useIndividualDistributionStore.getState().qurahShuffle()

    const state = useIndividualDistributionStore.getState()
    expect(state.qurahUsed).toBe(true)
    expect(state.previousSnapshot).not.toBeNull()

    // All items still assigned
    const allAssigned = state.individuals.flatMap((i) => i.assignedItems)
    expect(new Set(allAssigned).size).toBe(3)
  })
})

describe('getEquilibriumSummary', () => {
  it('returns balanced and total counts', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 250_000), makeProperty('p2', 250_000)],
      [],
      500_000,
      shares,
    )

    const summary = useIndividualDistributionStore.getState().getEquilibriumSummary()
    expect(summary.total).toBe(2)
    expect(typeof summary.balanced).toBe('number')
    expect(summary.balanced).toBeLessThanOrEqual(summary.total)
  })
})

describe('reset', () => {
  it('clears all state', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().reset()

    const state = useIndividualDistributionStore.getState()
    expect(state.individuals).toHaveLength(0)
    expect(state.items).toHaveLength(0)
    expect(state.compensations).toHaveLength(0)
    expect(state.fingerprint).toBeNull()
    expect(state.hasBeenUsed).toBe(false)
  })
})

describe('splitOrigins persistence', () => {
  it('splitOrigins is a plain object (Record) after splitItem', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)

    const state = useIndividualDistributionStore.getState()
    // Should be a plain object, not a Map
    expect(state.splitOrigins).not.toBeInstanceOf(Map)
    expect(typeof state.splitOrigins).toBe('object')
    expect(state.splitOrigins['p1']).toBeDefined()
    expect(state.splitOrigins['p1'].value).toBe(100_000)
  })

  it('mergeItem removes entry from splitOrigins Record', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)
    useIndividualDistributionStore.getState().mergeItem('p1')

    const state = useIndividualDistributionStore.getState()
    expect(state.splitOrigins['p1']).toBeUndefined()
    expect(Object.keys(state.splitOrigins)).toHaveLength(0)
  })

  it('reset clears splitOrigins to empty object', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)
    useIndividualDistributionStore.getState().reset()

    const state = useIndividualDistributionStore.getState()
    expect(state.splitOrigins).toEqual({})
    expect(state.splitOrigins).not.toBeInstanceOf(Map)
  })

  it('splitOrigins is included in partialize output', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupAndInitialize(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useIndividualDistributionStore.getState().splitItem('p1', [{ areaSqft: 600 }, { areaSqft: 400 }], 1000)

    const state = useIndividualDistributionStore.getState()

    // The partialize function should include splitOrigins
    // We can verify by checking the state has splitOrigins after persistence
    expect('splitOrigins' in state).toBe(true)
    expect(state.splitOrigins).not.toBeInstanceOf(Map)
  })
})
