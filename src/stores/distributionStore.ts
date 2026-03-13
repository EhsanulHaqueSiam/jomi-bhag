import { create } from 'zustand'
import type { HeirType } from '@/core/faraid/types'
import type { DistributionResult, DistributionGroup } from '@/core/distribution/types'
import {
  initializeDistribution,
  smartShuffle,
  moveItem as moveItemFn,
  calculateDistributionCompensations,
  getEquilibriumStatus,
} from '@/core/distribution/algorithm'
import { computePropertyTotal } from '@/core/land/types'
import { computeAssetValue } from '@/core/assets/valuation'
import { useWizardStore } from './wizardStore'

interface DistributionState {
  distributionResult: DistributionResult | null
  previousSnapshot: DistributionGroup[] | null
  fingerprint: string | null
}

interface DistributionActions {
  computeDistribution: () => void
  randomize: () => void
  moveItem: (itemId: string, fromHeirType: HeirType, toHeirType: HeirType) => void
  undo: () => void
  isStale: () => boolean
  getEquilibriumSummary: () => { balanced: number; total: number }
  resetDistribution: () => void
}

type DistributionStore = DistributionState & DistributionActions

/**
 * Compute fingerprint from properties and movable assets.
 * Includes both property and movable asset IDs + values for staleness detection.
 */
function computeFingerprint(): string {
  const { properties, movableAssets } = useWizardStore.getState()
  return JSON.stringify([
    ...properties.map((p) => ({ id: p.id, v: computePropertyTotal(p) })),
    ...movableAssets.map((a) => ({ id: a.id, v: computeAssetValue(a) })),
  ])
}

export const useDistributionStore = create<DistributionStore>()((set, get) => ({
  // State
  distributionResult: null,
  previousSnapshot: null,
  fingerprint: null,

  // Actions

  computeDistribution: () => {
    const { properties, movableAssets, results, totalEstateValue } =
      useWizardStore.getState()

    if (!results) return

    const distributionResult = initializeDistribution(
      properties,
      movableAssets,
      results.shares,
      totalEstateValue,
    )
    const fingerprint = computeFingerprint()

    set({
      distributionResult,
      previousSnapshot: null,
      fingerprint,
    })
  },

  randomize: () => {
    const { distributionResult } = get()
    if (!distributionResult) return

    // Save current groups as previousSnapshot (one-level undo)
    const previousSnapshot = structuredClone(distributionResult.groups)

    // Reset groups and re-shuffle
    const resetGroups: DistributionGroup[] = distributionResult.groups.map((g) => ({
      ...g,
      assignedItems: [],
      assignedValue: 0,
      cashAdjustment: 0,
    }))

    const newGroups = smartShuffle(distributionResult.items, resetGroups)
    const compensations = calculateDistributionCompensations(newGroups)

    set({
      distributionResult: {
        ...distributionResult,
        groups: newGroups,
        compensations,
      },
      previousSnapshot,
    })
  },

  moveItem: (itemId, fromHeirType, toHeirType) => {
    const { distributionResult } = get()
    if (!distributionResult) return

    // Save current groups as previousSnapshot
    const previousSnapshot = structuredClone(distributionResult.groups)

    const newGroups = moveItemFn(
      distributionResult.groups,
      distributionResult.items,
      itemId,
      fromHeirType,
      toHeirType,
    )

    const compensations = calculateDistributionCompensations(newGroups)

    set({
      distributionResult: {
        ...distributionResult,
        groups: newGroups,
        compensations,
      },
      previousSnapshot,
    })
  },

  undo: () => {
    const { previousSnapshot, distributionResult } = get()
    if (!previousSnapshot || !distributionResult) return

    const compensations = calculateDistributionCompensations(previousSnapshot)

    set({
      distributionResult: {
        ...distributionResult,
        groups: previousSnapshot,
        compensations,
      },
      previousSnapshot: null,
    })
  },

  isStale: () => {
    const { fingerprint } = get()
    if (fingerprint === null) return false

    const currentFingerprint = computeFingerprint()
    return currentFingerprint !== fingerprint
  },

  getEquilibriumSummary: () => {
    const { distributionResult } = get()
    if (!distributionResult) return { balanced: 0, total: 0 }

    const groups = distributionResult.groups
    let balanced = 0
    for (const group of groups) {
      const result = getEquilibriumStatus(group.assignedValue, group.targetValue)
      if (result.status === 'balanced') balanced++
    }

    return { balanced, total: groups.length }
  },

  resetDistribution: () => {
    set({
      distributionResult: null,
      previousSnapshot: null,
      fingerprint: null,
    })
  },
}))
