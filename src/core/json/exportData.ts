import type { WizardState } from '@/types/wizard'
import type { ExportSchema, ExportData } from '@/core/json/schema'
import { SCHEMA_VERSION, APP_VERSION } from '@/core/json/schema'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'

/**
 * Extract export-ready data from wizard state.
 *
 * Includes only user INPUT fields -- excludes computed results,
 * navigation state, UI state, and derived fields (autoIncludes).
 */
export function extractExportData(state: WizardState): ExportSchema {
  const data: ExportData = {
    // Step 1
    relationship: state.relationship,
    deceasedGender: state.deceasedGender,
    userGender: state.userGender,
    mfloEnabled: state.mfloEnabled,
    motherAlive: state.motherAlive,

    // Step 2
    wifeCount: state.wifeCount,
    husbandPresent: state.husbandPresent,
    sonCount: state.sonCount,
    daughterCount: state.daughterCount,

    // Step 3
    siblingTypeExpanded: state.siblingTypeExpanded,
    brotherFullCount: state.brotherFullCount,
    brotherConsanguineCount: state.brotherConsanguineCount,
    brotherUterineCount: state.brotherUterineCount,
    sisterFullCount: state.sisterFullCount,
    sisterConsanguineCount: state.sisterConsanguineCount,
    sisterUterineCount: state.sisterUterineCount,

    // Step 4
    properties: state.properties,
    movableAssets: state.movableAssets,

    // Estate value
    totalEstateValue: state.totalEstateValue,
  }

  // Include individual distribution data if individual view was used
  const indState = useIndividualDistributionStore.getState()
  if (indState.hasBeenUsed) {
    const customNames = indState.customNames
    if (Object.keys(customNames).length > 0) {
      data.customHeirNames = customNames
    }

    data.individualDistribution = {
      assignments: indState.individuals.map((ind) => ({
        individualId: ind.id,
        assignedItemIds: [...ind.assignedItems],
      })),
      qurahUsed: indState.qurahUsed,
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportDate: new Date().toISOString(),
    data,
  }
}

/**
 * Generate a descriptive export filename from wizard state heir counts.
 *
 * Format: "2-sons-1-wife-2026-03-13.json"
 * No heirs: "scenario-2026-03-13.json"
 * Single: "1-son-2026-03-13.json" (singular)
 */
export function generateExportFilename(state: WizardState): string {
  const parts: string[] = []

  if (state.sonCount > 0) {
    parts.push(`${state.sonCount}-${state.sonCount === 1 ? 'son' : 'sons'}`)
  }
  if (state.daughterCount > 0) {
    parts.push(
      `${state.daughterCount}-${state.daughterCount === 1 ? 'daughter' : 'daughters'}`,
    )
  }
  if (state.wifeCount > 0) {
    parts.push(
      `${state.wifeCount}-${state.wifeCount === 1 ? 'wife' : 'wives'}`,
    )
  }
  if (state.husbandPresent) {
    parts.push('husband')
  }
  if (state.brotherFullCount > 0) {
    parts.push(
      `${state.brotherFullCount}-${state.brotherFullCount === 1 ? 'brother-full' : 'brothers-full'}`,
    )
  }
  if (state.brotherConsanguineCount > 0) {
    parts.push(
      `${state.brotherConsanguineCount}-${state.brotherConsanguineCount === 1 ? 'brother-cons' : 'brothers-cons'}`,
    )
  }
  if (state.brotherUterineCount > 0) {
    parts.push(
      `${state.brotherUterineCount}-${state.brotherUterineCount === 1 ? 'brother-uter' : 'brothers-uter'}`,
    )
  }
  if (state.sisterFullCount > 0) {
    parts.push(
      `${state.sisterFullCount}-${state.sisterFullCount === 1 ? 'sister-full' : 'sisters-full'}`,
    )
  }
  if (state.sisterConsanguineCount > 0) {
    parts.push(
      `${state.sisterConsanguineCount}-${state.sisterConsanguineCount === 1 ? 'sister-cons' : 'sisters-cons'}`,
    )
  }
  if (state.sisterUterineCount > 0) {
    parts.push(
      `${state.sisterUterineCount}-${state.sisterUterineCount === 1 ? 'sister-uter' : 'sisters-uter'}`,
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  if (parts.length === 0) {
    return `scenario-${today}.json`
  }

  return `${parts.join('-')}-${today}.json`
}
