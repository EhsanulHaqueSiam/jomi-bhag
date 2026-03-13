import { describe, it, expect, beforeEach, vi } from 'vitest'
import Fraction from 'fraction.js'
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

/** Set up wizardStore with test data and compute distribution */
function setupWithTestData(
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

  // Compute distribution
  useDistributionStore.getState().computeDistribution()
}

// --- Setup ---

beforeEach(() => {
  localStorage.clear()
  useWizardStore.persist.clearStorage()
  // Reset both stores
  useWizardStore.setState({
    properties: [],
    movableAssets: [],
    totalEstateValue: 0,
    results: null,
  })
  useDistributionStore.setState({
    distributionResult: null,
    previousSnapshot: null,
    fingerprint: null,
  })
})

// --- Tests ---

describe('computeDistribution', () => {
  it('creates groups from wizardStore state', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 300_000)],
      [makeVehicleAsset('a1', 200_000)],
      500_000,
      shares,
    )

    const state = useDistributionStore.getState()
    expect(state.distributionResult).not.toBeNull()
    expect(state.distributionResult!.groups).toHaveLength(2)
    expect(state.distributionResult!.items).toHaveLength(2)
  })

  it('sets fingerprint after computation', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    const state = useDistributionStore.getState()
    expect(state.fingerprint).not.toBeNull()
    expect(typeof state.fingerprint).toBe('string')
  })

  it('clears previousSnapshot on compute', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]

    // Set a previousSnapshot
    useDistributionStore.setState({ previousSnapshot: [] })

    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    const state = useDistributionStore.getState()
    expect(state.previousSnapshot).toBeNull()
  })
})

describe('randomize', () => {
  it('produces a new distribution and sets previousSnapshot', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 300_000), makeProperty('p2', 200_000)],
      [makeVehicleAsset('a1', 100_000)],
      600_000,
      shares,
    )

    const beforeGroups = useDistributionStore.getState().distributionResult!.groups
    useDistributionStore.getState().randomize()

    const afterState = useDistributionStore.getState()

    // previousSnapshot should be set to pre-randomize groups
    expect(afterState.previousSnapshot).not.toBeNull()
    expect(afterState.previousSnapshot).toHaveLength(beforeGroups.length)

    // New groups should exist
    expect(afterState.distributionResult!.groups).toHaveLength(2)

    // All items should still be assigned
    const allAssigned = afterState.distributionResult!.groups.flatMap((g) => g.assignedItems)
    expect(allAssigned).toHaveLength(3)
  })
})

describe('moveItem', () => {
  it('updates groups and sets previousSnapshot', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 300_000)],
      [makeVehicleAsset('a1', 200_000)],
      500_000,
      shares,
    )

    const state = useDistributionStore.getState()
    const groups = state.distributionResult!.groups

    // Find which group has p1
    const groupWithP1 = groups.find((g) => g.assignedItems.includes('p1'))!
    const otherGroup = groups.find((g) => g.heirType !== groupWithP1.heirType)!

    state.moveItem('p1', groupWithP1.heirType, otherGroup.heirType)

    const afterState = useDistributionStore.getState()

    // previousSnapshot should be set
    expect(afterState.previousSnapshot).not.toBeNull()

    // p1 should now be in the other group
    const newOtherGroup = afterState.distributionResult!.groups.find(
      (g) => g.heirType === otherGroup.heirType,
    )!
    expect(newOtherGroup.assignedItems).toContain('p1')
  })
})

describe('undo', () => {
  it('restores previous groups after moveItem', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 300_000)],
      [makeVehicleAsset('a1', 200_000)],
      500_000,
      shares,
    )

    const state = useDistributionStore.getState()
    const originalGroups = state.distributionResult!.groups
    const groupWithP1 = originalGroups.find((g) => g.assignedItems.includes('p1'))!
    const otherGroup = originalGroups.find((g) => g.heirType !== groupWithP1.heirType)!

    // Move then undo
    state.moveItem('p1', groupWithP1.heirType, otherGroup.heirType)
    useDistributionStore.getState().undo()

    const afterUndo = useDistributionStore.getState()

    // p1 should be back in original group
    const restoredGroup = afterUndo.distributionResult!.groups.find(
      (g) => g.heirType === groupWithP1.heirType,
    )!
    expect(restoredGroup.assignedItems).toContain('p1')

    // previousSnapshot should be cleared
    expect(afterUndo.previousSnapshot).toBeNull()
  })

  it('second undo is a no-op (one-level only)', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 300_000)],
      [makeVehicleAsset('a1', 200_000)],
      500_000,
      shares,
    )

    const state = useDistributionStore.getState()
    const groups = state.distributionResult!.groups
    const groupWithP1 = groups.find((g) => g.assignedItems.includes('p1'))!
    const otherGroup = groups.find((g) => g.heirType !== groupWithP1.heirType)!

    // Move, undo, undo again
    state.moveItem('p1', groupWithP1.heirType, otherGroup.heirType)
    useDistributionStore.getState().undo()
    const afterFirstUndo = useDistributionStore.getState().distributionResult!.groups

    useDistributionStore.getState().undo()
    const afterSecondUndo = useDistributionStore.getState().distributionResult!.groups

    // Groups should be identical after second undo (no-op)
    expect(afterSecondUndo).toEqual(afterFirstUndo)
  })
})

describe('isStale', () => {
  it('returns false when data has not changed', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    expect(useDistributionStore.getState().isStale()).toBe(false)
  })

  it('returns true when wizardStore properties change', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    // Change property value in wizardStore
    useWizardStore.setState({
      properties: [makeProperty('p1', 200_000)],
    })

    expect(useDistributionStore.getState().isStale()).toBe(true)
  })

  it('returns true when wizardStore movableAssets change', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [makeVehicleAsset('a1', 50_000)],
      150_000,
      shares,
    )

    // Change movable asset value in wizardStore
    useWizardStore.setState({
      movableAssets: [makeVehicleAsset('a1', 100_000)],
    })

    expect(useDistributionStore.getState().isStale()).toBe(true)
  })
})

describe('getEquilibriumSummary', () => {
  it('returns count of balanced groups and total', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 250_000), makeProperty('p2', 250_000)],
      [],
      500_000,
      shares,
    )

    const summary = useDistributionStore.getState().getEquilibriumSummary()
    expect(summary.total).toBe(2)
    // balanced count depends on distribution; at minimum it should be a number
    expect(typeof summary.balanced).toBe('number')
    expect(summary.balanced).toBeLessThanOrEqual(summary.total)
  })
})

describe('resetDistribution', () => {
  it('clears all state', () => {
    const shares: ShareResult[] = [
      makeShare('son', 1, new Fraction(1, 2)),
      makeShare('daughter', 1, new Fraction(1, 2)),
    ]
    setupWithTestData(
      [makeProperty('p1', 100_000)],
      [],
      100_000,
      shares,
    )

    useDistributionStore.getState().resetDistribution()

    const state = useDistributionStore.getState()
    expect(state.distributionResult).toBeNull()
    expect(state.previousSnapshot).toBeNull()
    expect(state.fingerprint).toBeNull()
  })
})
