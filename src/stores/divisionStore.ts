import { create } from 'zustand'
import type { HeirType } from '@/core/faraid/types'
import type { DivisionResult, DivisionGroup } from '@/core/land/division'
import {
  divideParcels,
  qurahShuffle,
  moveParcel as moveParcelFn,
  calculateCompensations,
} from '@/core/land/division'
import { computePropertyTotal } from '@/core/land/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import { useWizardStore } from './wizardStore'

interface DivisionState {
  divisionResult: DivisionResult | null
  qurahMap: Map<number, HeirType> | null
  isRevealed: boolean
  revealedGroupCount: number
  propertyFingerprint: string | null
}

interface DivisionActions {
  computeDivision: () => void
  performQurah: () => void
  revealNextGroup: () => void
  revealAll: () => void
  moveParcel: (
    propertyId: string,
    fromHeirType: HeirType,
    toHeirType: HeirType,
  ) => void
  resetDivision: () => void
  getDisplayGroups: () => DivisionGroup[]
  isStale: () => boolean
}

type DivisionStore = DivisionState & DivisionActions

function computeFingerprint(): string {
  const { properties } = useWizardStore.getState()
  return JSON.stringify(
    properties.map((p) => ({ id: p.id, v: computePropertyTotal(p) })),
  )
}

export const useDivisionStore = create<DivisionStore>()((set, get) => ({
  // State
  divisionResult: null,
  qurahMap: null,
  isRevealed: false,
  revealedGroupCount: 0,
  propertyFingerprint: null,

  // Actions

  computeDivision: () => {
    const { properties, results, totalEstateValue } =
      useWizardStore.getState()

    if (!results) return

    const divisionResult = divideParcels(
      properties,
      results.shares,
      totalEstateValue,
    )
    const fingerprint = computeFingerprint()

    set({
      divisionResult,
      qurahMap: null,
      isRevealed: false,
      revealedGroupCount: 0,
      propertyFingerprint: fingerprint,
    })
  },

  performQurah: () => {
    const { divisionResult } = get()
    if (!divisionResult) return

    const qurahMap = qurahShuffle(divisionResult.groups)

    set({
      qurahMap,
      isRevealed: false,
      revealedGroupCount: 0,
    })
  },

  revealNextGroup: () => {
    const { revealedGroupCount, divisionResult } = get()
    if (!divisionResult) return

    const maxGroups = divisionResult.groups.length
    if (revealedGroupCount < maxGroups) {
      set({
        revealedGroupCount: revealedGroupCount + 1,
        isRevealed: revealedGroupCount + 1 >= maxGroups,
      })
    }
  },

  revealAll: () => {
    const { divisionResult } = get()
    if (!divisionResult) return

    set({
      revealedGroupCount: divisionResult.groups.length,
      isRevealed: true,
    })
  },

  moveParcel: (propertyId, fromHeirType, toHeirType) => {
    const { divisionResult } = get()
    if (!divisionResult) return

    const { properties } = useWizardStore.getState()
    const newResult = moveParcelFn(
      divisionResult,
      propertyId,
      fromHeirType,
      toHeirType,
      properties,
    )

    set({
      divisionResult: newResult,
      // Manual assignment invalidates Qurah
      qurahMap: null,
      isRevealed: false,
      revealedGroupCount: 0,
    })
  },

  resetDivision: () => {
    set({
      divisionResult: null,
      qurahMap: null,
      isRevealed: false,
      revealedGroupCount: 0,
      propertyFingerprint: null,
    })
  },

  getDisplayGroups: () => {
    const { divisionResult, qurahMap } = get()
    if (!divisionResult) return []

    const { groups } = divisionResult

    if (!qurahMap) return groups

    // Apply Qurah mapping: remap heirType, label, count
    return groups.map((group, idx) => {
      const newHeirType = qurahMap.get(idx)
      if (!newHeirType || newHeirType === group.heirType) return group

      // Find the original group that had this heirType for count
      const originalGroup = groups.find((g) => g.heirType === newHeirType)

      return {
        ...group,
        heirType: newHeirType,
        label: HEIR_TYPE_LABELS[newHeirType],
        count: originalGroup?.count ?? group.count,
      }
    })
  },

  isStale: () => {
    const { propertyFingerprint } = get()
    if (propertyFingerprint === null) return false

    const currentFingerprint = computeFingerprint()
    return currentFingerprint !== propertyFingerprint
  },
}))
