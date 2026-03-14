import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scenario, ScenarioSummary } from '@/types/scenario'
import type { WizardState } from '@/types/wizard'
import { fractionStorage } from './fractionStorage'
import { useWizardStore } from './wizardStore'
import { useIndividualDistributionStore } from './individualDistributionStore'

export const MAX_SCENARIOS = 20

/**
 * Generate a human-readable name from wizard state heir counts.
 * Format: "2 Sons, 1 Daughter, 1 Wife -- Mar 13"
 */
export function generateScenarioName(state: WizardState): string {
  const parts: string[] = []

  if (state.sonCount > 0) {
    parts.push(`${state.sonCount} ${state.sonCount === 1 ? 'Son' : 'Sons'}`)
  }
  if (state.daughterCount > 0) {
    parts.push(
      `${state.daughterCount} ${state.daughterCount === 1 ? 'Daughter' : 'Daughters'}`,
    )
  }
  if (state.wifeCount > 0) {
    parts.push(
      `${state.wifeCount} ${state.wifeCount === 1 ? 'Wife' : 'Wives'}`,
    )
  }
  if (state.husbandPresent) {
    parts.push('Husband')
  }
  if (state.brotherFullCount > 0) {
    parts.push(
      `${state.brotherFullCount} ${state.brotherFullCount === 1 ? 'Brother (Full)' : 'Brothers (Full)'}`,
    )
  }
  if (state.brotherConsanguineCount > 0) {
    parts.push(
      `${state.brotherConsanguineCount} ${state.brotherConsanguineCount === 1 ? 'Brother (Cons.)' : 'Brothers (Cons.)'}`,
    )
  }
  if (state.brotherUterineCount > 0) {
    parts.push(
      `${state.brotherUterineCount} ${state.brotherUterineCount === 1 ? 'Brother (Uter.)' : 'Brothers (Uter.)'}`,
    )
  }
  if (state.sisterFullCount > 0) {
    parts.push(
      `${state.sisterFullCount} ${state.sisterFullCount === 1 ? 'Sister (Full)' : 'Sisters (Full)'}`,
    )
  }
  if (state.sisterConsanguineCount > 0) {
    parts.push(
      `${state.sisterConsanguineCount} ${state.sisterConsanguineCount === 1 ? 'Sister (Cons.)' : 'Sisters (Cons.)'}`,
    )
  }
  if (state.sisterUterineCount > 0) {
    parts.push(
      `${state.sisterUterineCount} ${state.sisterUterineCount === 1 ? 'Sister (Uter.)' : 'Sisters (Uter.)'}`,
    )
  }

  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return parts.length > 0
    ? parts.join(', ') + ' -- ' + date
    : 'Scenario -- ' + date
}

/**
 * Compute a deterministic fingerprint of the wizard state's key inputs.
 * Used for unsaved changes detection.
 */
export function computeStateFingerprint(state: WizardState): string {
  return JSON.stringify({
    r: state.relationship,
    dg: state.deceasedGender,
    ug: state.userGender,
    m: state.mfloEnabled,
    ma: state.motherAlive,
    wc: state.wifeCount,
    hp: state.husbandPresent,
    sc: state.sonCount,
    dc: state.daughterCount,
    bfc: state.brotherFullCount,
    bcc: state.brotherConsanguineCount,
    buc: state.brotherUterineCount,
    sfc: state.sisterFullCount,
    scc: state.sisterConsanguineCount,
    suc: state.sisterUterineCount,
    se: state.siblingTypeExpanded,
    p: state.properties.length,
    te: state.totalEstateValue,
    mac: state.movableAssets.length,
  })
}

/** Pick only WizardState data fields from a full store state. */
function pickWizardState(s: WizardState): WizardState {
  return {
    currentStep: s.currentStep,
    completedSteps: s.completedSteps,
    relationship: s.relationship,
    deceasedGender: s.deceasedGender,
    userGender: s.userGender,
    mfloEnabled: s.mfloEnabled,
    motherAlive: s.motherAlive,
    autoIncludes: s.autoIncludes,
    wifeCount: s.wifeCount,
    husbandPresent: s.husbandPresent,
    sonCount: s.sonCount,
    daughterCount: s.daughterCount,
    siblingTypeExpanded: s.siblingTypeExpanded,
    brotherFullCount: s.brotherFullCount,
    brotherConsanguineCount: s.brotherConsanguineCount,
    brotherUterineCount: s.brotherUterineCount,
    sisterFullCount: s.sisterFullCount,
    sisterConsanguineCount: s.sisterConsanguineCount,
    sisterUterineCount: s.sisterUterineCount,
    properties: s.properties,
    expandedPropertyId: s.expandedPropertyId,
    movableAssets: s.movableAssets,
    expandedAssetId: s.expandedAssetId,
    results: s.results,
    totalEstateValue: s.totalEstateValue,
    viewMode: s.viewMode,
    hasToggledMode: s.hasToggledMode,
  }
}

/** Build a ScenarioSummary from wizard state. */
function buildSummary(state: WizardState): ScenarioSummary {
  let heirCount = 0
  const parts: string[] = []

  // Count from the actual heir fields
  if (state.sonCount > 0) {
    heirCount += state.sonCount
    parts.push(`${state.sonCount}S`)
  }
  if (state.daughterCount > 0) {
    heirCount += state.daughterCount
    parts.push(`${state.daughterCount}D`)
  }
  if (state.wifeCount > 0) {
    heirCount += state.wifeCount
    parts.push(`${state.wifeCount}W`)
  }
  if (state.husbandPresent) {
    heirCount += 1
    parts.push('H')
  }

  const siblingTotal =
    state.brotherFullCount +
    state.brotherConsanguineCount +
    state.brotherUterineCount +
    state.sisterFullCount +
    state.sisterConsanguineCount +
    state.sisterUterineCount

  if (siblingTotal > 0) {
    heirCount += siblingTotal
    parts.push(`${siblingTotal}Sib`)
  }

  // Add auto-includes to count
  for (const ai of state.autoIncludes) {
    heirCount += ai.count
  }

  return {
    heirSummary: parts.join(', ') || 'No heirs',
    totalEstateValue: state.totalEstateValue,
    adjustment: state.results?.adjustment ?? 'none',
    heirCount,
  }
}

interface ScenariosState {
  scenarios: Scenario[]
  selectedIds: string[]
  isComparing: boolean
  lastSavedHash: string | null
}

interface ScenariosActions {
  saveScenario: (name?: string) => string | null
  loadScenario: (id: string) => WizardState | null
  deleteScenario: (id: string) => void
  clearAll: () => void
  duplicateScenario: (id: string) => string | null
  renameScenario: (id: string, name: string) => void
  toggleSelected: (id: string) => void
  startCompare: () => void
  stopCompare: () => void
  hasUnsavedChanges: () => boolean
  updateLastSavedHash: () => void
}

type ScenariosStore = ScenariosState & ScenariosActions

export const useScenariosStore = create<ScenariosStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      selectedIds: [],
      isComparing: false,
      lastSavedHash: null,

      saveScenario: (name?: string) => {
        const { scenarios } = get()
        if (scenarios.length >= MAX_SCENARIOS) return null

        const wizardState = pickWizardState(useWizardStore.getState())
        const now = new Date().toISOString()
        const scenario: Scenario = {
          id: crypto.randomUUID(),
          name: name ?? generateScenarioName(wizardState),
          createdAt: now,
          updatedAt: now,
          state: wizardState,
          summary: buildSummary(wizardState),
        }

        // Include individual distribution state if it was used
        const indState = useIndividualDistributionStore.getState()
        if (indState.hasBeenUsed) {
          scenario.individualDistribution = {
            individuals: indState.individuals,
            items: indState.items,
            customNames: indState.customNames,
            qurahUsed: indState.qurahUsed,
          }
        }

        const hash = computeStateFingerprint(wizardState)
        set({
          scenarios: [...scenarios, scenario],
          lastSavedHash: hash,
        })
        return scenario.id
      },

      loadScenario: (id: string) => {
        const scenario = get().scenarios.find((s) => s.id === id)
        if (!scenario) return null

        // Restore individual distribution state if saved
        if (scenario.individualDistribution) {
          useIndividualDistributionStore.setState({
            individuals: scenario.individualDistribution.individuals,
            items: scenario.individualDistribution.items,
            customNames: scenario.individualDistribution.customNames,
            qurahUsed: scenario.individualDistribution.qurahUsed,
            hasBeenUsed: true,
            previousSnapshot: null,
            // Reset reveal state
            revealedCount: 0,
            isRevealed: false,
          })
        } else {
          // Reset individual distribution when loading scenario without it
          useIndividualDistributionStore.getState().reset()
        }

        return scenario.state
      },

      deleteScenario: (id: string) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }))
      },

      clearAll: () => {
        set({ scenarios: [], selectedIds: [], isComparing: false })
      },

      duplicateScenario: (id: string) => {
        const { scenarios } = get()
        if (scenarios.length >= MAX_SCENARIOS) return null

        const original = scenarios.find((s) => s.id === id)
        if (!original) return null

        const now = new Date().toISOString()
        const copy: Scenario = {
          id: crypto.randomUUID(),
          name: original.name + ' (Copy)',
          createdAt: now,
          updatedAt: now,
          state: { ...original.state },
          summary: { ...original.summary },
        }

        set({ scenarios: [...scenarios, copy] })
        return copy.id
      },

      renameScenario: (id: string, name: string) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id
              ? { ...s, name, updatedAt: new Date().toISOString() }
              : s,
          ),
        }))
      },

      toggleSelected: (id: string) => {
        const { selectedIds } = get()
        if (selectedIds.includes(id)) {
          set({ selectedIds: selectedIds.filter((sid) => sid !== id) })
        } else if (selectedIds.length < 2) {
          set({ selectedIds: [...selectedIds, id] })
        } else {
          // Replace the first selected with the new one
          set({ selectedIds: [selectedIds[1], id] })
        }
      },

      startCompare: () => {
        if (get().selectedIds.length === 2) {
          set({ isComparing: true })
        }
      },

      stopCompare: () => {
        set({ isComparing: false, selectedIds: [] })
      },

      hasUnsavedChanges: () => {
        const { lastSavedHash } = get()
        const wizardState = useWizardStore.getState()
        if (lastSavedHash === null) {
          return wizardState.relationship !== null
        }
        return computeStateFingerprint(wizardState) !== lastSavedHash
      },

      updateLastSavedHash: () => {
        const wizardState = useWizardStore.getState()
        set({ lastSavedHash: computeStateFingerprint(wizardState) })
      },
    }),
    {
      name: 'jomi-bhag-scenarios',
      storage: fractionStorage,
      version: 1,
      partialize: (state) => ({
        scenarios: state.scenarios,
        selectedIds: state.selectedIds,
        isComparing: state.isComparing,
        lastSavedHash: state.lastSavedHash,
      }),
    },
  ),
)
