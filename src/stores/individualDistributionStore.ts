import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DistributionItem } from '@/core/distribution/types'
import type {
  IndividualColumn,
  IndividualCompensation,
} from '@/core/distribution/individual-types'
import {
  initializeIndividualDistribution,
  individualQurahShuffle,
  moveIndividualItem,
  splitParcel,
  mergeParcel,
  calculateIndividualCompensations,
  computeIndividualFingerprint,
} from '@/core/distribution/individual-algorithm'
import { getEquilibriumStatus } from '@/core/distribution/algorithm'
import { useDistributionStore } from './distributionStore'
import { useWizardStore } from './wizardStore'
import { fractionStorage } from './fractionStorage'

// Stable empty constants to prevent Zustand selector infinite rerender
const EMPTY_INDIVIDUALS: IndividualColumn[] = []
const EMPTY_ITEMS: DistributionItem[] = []
const EMPTY_COMPENSATIONS: IndividualCompensation[] = []

interface IndividualDistributionState {
  individuals: IndividualColumn[]
  items: DistributionItem[]
  compensations: IndividualCompensation[]
  customNames: Record<string, string>
  previousSnapshot: { individuals: IndividualColumn[]; items: DistributionItem[] } | null
  fingerprint: string | null
  qurahUsed: boolean
  hasBeenUsed: boolean
  revealedCount: number
  isRevealed: boolean
  // Track split parcel origins for merging
  splitOrigins: Record<string, DistributionItem> // parentId -> originalItem
}

interface IndividualDistributionActions {
  initialize: () => void
  moveItem: (itemId: string, fromId: string, toId: string) => void
  qurahShuffle: () => void
  undo: () => void
  splitItem: (itemId: string, splits: { areaSqft: number }[], totalAreaSqft: number) => void
  mergeItem: (parentId: string) => void
  renameIndividual: (individualId: string, name: string) => void
  isStale: () => boolean
  getEquilibriumSummary: () => { balanced: number; total: number }
  reset: () => void
}

type IndividualDistributionStore = IndividualDistributionState & IndividualDistributionActions

export const useIndividualDistributionStore = create<IndividualDistributionStore>()(
  persist(
    (set, get) => ({
      // State
      individuals: EMPTY_INDIVIDUALS,
      items: EMPTY_ITEMS,
      compensations: EMPTY_COMPENSATIONS,
      customNames: {},
      previousSnapshot: null,
      fingerprint: null,
      qurahUsed: false,
      hasBeenUsed: false,
      revealedCount: 0,
      isRevealed: false,
      splitOrigins: {},

      // Actions

      initialize: () => {
        const distState = useDistributionStore.getState()
        let distResult = distState.distributionResult

        // If group distribution doesn't exist, compute it first
        if (!distResult) {
          useDistributionStore.getState().computeDistribution()
          distResult = useDistributionStore.getState().distributionResult
        }

        if (!distResult) return

        const wizardState = useWizardStore.getState()
        const shares = wizardState.results?.shares ?? []

        const result = initializeIndividualDistribution(distResult, shares)
        const fingerprint = computeIndividualFingerprint(wizardState)

        set({
          individuals: result.individuals,
          items: result.items,
          compensations: result.compensations,
          fingerprint,
          hasBeenUsed: true,
          previousSnapshot: null,
          qurahUsed: false,
          revealedCount: 0,
          isRevealed: false,
          splitOrigins: {},
        })
      },

      moveItem: (itemId, fromId, toId) => {
        const { individuals, items } = get()
        if (individuals.length === 0) return

        // Save snapshot for undo
        const previousSnapshot = {
          individuals: structuredClone(individuals),
          items: structuredClone(items),
        }

        const newIndividuals = moveIndividualItem(individuals, items, itemId, fromId, toId)
        const compensations = calculateIndividualCompensations(newIndividuals)

        set({
          individuals: newIndividuals,
          compensations,
          previousSnapshot,
        })
      },

      qurahShuffle: () => {
        const { individuals, items } = get()
        if (individuals.length === 0) return

        // Save snapshot for undo
        const previousSnapshot = {
          individuals: structuredClone(individuals),
          items: structuredClone(items),
        }

        const newIndividuals = individualQurahShuffle(items, individuals)
        const compensations = calculateIndividualCompensations(newIndividuals)

        set({
          individuals: newIndividuals,
          compensations,
          previousSnapshot,
          qurahUsed: true,
          revealedCount: 0,
          isRevealed: false,
        })
      },

      undo: () => {
        const { previousSnapshot } = get()
        if (!previousSnapshot) return

        const compensations = calculateIndividualCompensations(previousSnapshot.individuals)

        set({
          individuals: previousSnapshot.individuals,
          items: previousSnapshot.items,
          compensations,
          previousSnapshot: null,
        })
      },

      splitItem: (itemId, splits, totalAreaSqft) => {
        const { individuals, items, splitOrigins } = get()

        // Find the original item
        const originalItem = items.find((i) => i.id === itemId)
        if (!originalItem) return

        // Create sub-items
        const subItems = splitParcel(originalItem, splits, totalAreaSqft)

        // Replace original item with sub-items in items array
        const newItems = items.filter((i) => i.id !== itemId).concat(subItems)

        // Update the individual that had this item
        const newIndividuals = individuals.map((ind) => {
          if (!ind.assignedItems.includes(itemId)) return ind

          const newAssigned = ind.assignedItems
            .filter((id) => id !== itemId)
            .concat(subItems.map((s) => s.id))

          const newAssignedValue = newAssigned.reduce((sum, id) => {
            const item = newItems.find((i) => i.id === id)
            return sum + (item ? item.value : 0)
          }, 0)

          return {
            ...ind,
            assignedItems: newAssigned,
            assignedValue: newAssignedValue,
            cashAdjustment: Math.round(newAssignedValue - ind.targetValue),
          }
        })

        // Track the original for potential merge
        const newSplitOrigins = { ...splitOrigins }
        newSplitOrigins[itemId] = originalItem

        const compensations = calculateIndividualCompensations(newIndividuals)

        set({
          individuals: newIndividuals,
          items: newItems,
          compensations,
          splitOrigins: newSplitOrigins,
        })
      },

      mergeItem: (parentId) => {
        const { individuals, items, splitOrigins } = get()

        const originalItem = splitOrigins[parentId]
        if (!originalItem) return

        // Find all sub-items for this parent (they won't have a direct parentId field,
        // but we can find them by checking they are NOT in the original items list
        // and were created by splitItem replacing parentId)
        // Approach: use mergeParcel which takes splitItems and originalItem
        // The sub-items are the ones that replaced the original

        // Identify sub-items: all items that are NOT the original and are not in the
        // original items set (before split). Since we can't easily track this,
        // we'll find items whose labels contain the original label pattern from split.
        // Better approach: find all item IDs assigned that aren't in our known item IDs
        // Actually, the simplest approach: the sub-items are the ones that we added
        // when we called splitItem. We can identify them by finding items whose labels
        // start with the original label + " (" pattern.

        // Find sub-items by label prefix matching
        const subItems = items.filter(
          (i) => i.label.startsWith(originalItem.label + ' (') && i.id !== parentId,
        )

        const { removedIds, restoredItem } = mergeParcel(subItems, originalItem)

        // Remove sub-items, add back original
        const newItems = items.filter((i) => !removedIds.includes(i.id)).concat([restoredItem])

        // Update individuals: replace sub-item IDs with original ID
        const removedSet = new Set(removedIds)
        const newIndividuals = individuals.map((ind) => {
          const hadSubItems = ind.assignedItems.some((id) => removedSet.has(id))
          if (!hadSubItems) return ind

          const newAssigned = ind.assignedItems
            .filter((id) => !removedSet.has(id))
            .concat([restoredItem.id])

          const newAssignedValue = newAssigned.reduce((sum, id) => {
            const item = newItems.find((i) => i.id === id)
            return sum + (item ? item.value : 0)
          }, 0)

          return {
            ...ind,
            assignedItems: newAssigned,
            assignedValue: newAssignedValue,
            cashAdjustment: Math.round(newAssignedValue - ind.targetValue),
          }
        })

        // Remove from split origins
        const { [parentId]: _, ...newSplitOrigins } = splitOrigins

        const compensations = calculateIndividualCompensations(newIndividuals)

        set({
          individuals: newIndividuals,
          items: newItems,
          compensations,
          splitOrigins: newSplitOrigins,
        })
      },

      renameIndividual: (individualId, name) => {
        set((state) => ({
          customNames: { ...state.customNames, [individualId]: name },
        }))
      },

      isStale: () => {
        const { fingerprint } = get()
        if (fingerprint === null) return false

        const currentFingerprint = computeIndividualFingerprint(useWizardStore.getState())
        return currentFingerprint !== fingerprint
      },

      getEquilibriumSummary: () => {
        const { individuals } = get()
        if (individuals.length === 0) return { balanced: 0, total: 0 }

        let balanced = 0
        for (const ind of individuals) {
          const result = getEquilibriumStatus(ind.assignedValue, ind.targetValue)
          if (result.status === 'balanced') balanced++
        }

        return { balanced, total: individuals.length }
      },

      reset: () => {
        set({
          individuals: EMPTY_INDIVIDUALS,
          items: EMPTY_ITEMS,
          compensations: EMPTY_COMPENSATIONS,
          customNames: {},
          previousSnapshot: null,
          fingerprint: null,
          qurahUsed: false,
          hasBeenUsed: false,
          revealedCount: 0,
          isRevealed: false,
          splitOrigins: {},
        })
      },
    }),
    {
      name: 'jomi-bhag-individual-distribution',
      storage: fractionStorage,
      partialize: (state) => ({
        individuals: state.individuals,
        items: state.items,
        compensations: state.compensations,
        customNames: state.customNames,
        fingerprint: state.fingerprint,
        hasBeenUsed: state.hasBeenUsed,
        qurahUsed: state.qurahUsed,
        splitOrigins: state.splitOrigins,
      }),
    },
  ),
)
