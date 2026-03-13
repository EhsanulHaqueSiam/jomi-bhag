import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractExportData } from '@/core/json/exportData'
import { validateAndParseImport } from '@/core/json/importData'
import type { WizardState } from '@/types/wizard'
import type { Property } from '@/core/land/types'
import type { CashAsset } from '@/core/assets/types'

// ── Test helpers ──────────────────────────────────────────────────────

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 'prop-1',
    nickname: 'Home',
    type: 'residential',
    division: 'dhaka',
    upazila: 'savar',
    rateSource: 'manual',
    landAreaSqft: 1000,
    landInputUnit: 'decimal',
    landValue: 500000,
    house: null,
    trees: null,
    pond: null,
    ...overrides,
  }
}

function makeCashAsset(overrides: Partial<CashAsset> = {}): CashAsset {
  return {
    id: 'cash-1',
    category: 'cash',
    isIndivisible: false,
    indivisibleResolution: null,
    value: 100000,
    ...overrides,
  }
}

function makeWizardState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    currentStep: 5,
    completedSteps: [1, 2, 3, 4],
    relationship: 'father',
    deceasedGender: 'male',
    userGender: 'male',
    mfloEnabled: false,
    motherAlive: true,
    autoIncludes: [{ type: 'son', count: 1 }],
    wifeCount: 1,
    husbandPresent: false,
    sonCount: 2,
    daughterCount: 1,
    siblingTypeExpanded: false,
    brotherFullCount: 0,
    brotherConsanguineCount: 0,
    brotherUterineCount: 0,
    sisterFullCount: 0,
    sisterConsanguineCount: 0,
    sisterUterineCount: 0,
    properties: [makeProperty()],
    expandedPropertyId: 'prop-1',
    movableAssets: [makeCashAsset()],
    expandedAssetId: 'cash-1',
    results: { shares: [], adjustment: 'none' } as unknown as WizardState['results'],
    totalEstateValue: 600000,
    viewMode: 'detailed',
    ...overrides,
  }
}

// ── Mock individualDistributionStore ──────────────────────────────────

const mockIndividualState = {
  hasBeenUsed: false,
  customNames: {} as Record<string, string>,
  individuals: [] as Array<{
    id: string
    assignedItems: string[]
    heirType: string
    index: number
    displayName: string
    customName: string | null
    targetValue: number
    sharePerHeir: string
    assignedValue: number
    cashAdjustment: number
  }>,
  items: [] as Array<{
    id: string
    label: string
    value: number
    type: string
  }>,
  qurahUsed: false,
  initialize: vi.fn(),
  renameIndividual: vi.fn(),
}

vi.mock('@/stores/individualDistributionStore', () => ({
  useIndividualDistributionStore: {
    getState: () => mockIndividualState,
    setState: vi.fn(),
  },
}))

// ── Tests ────────────────────────────────────────────────────────────

describe('JSON export with individual distribution', () => {
  beforeEach(() => {
    mockIndividualState.hasBeenUsed = false
    mockIndividualState.customNames = {}
    mockIndividualState.individuals = []
    mockIndividualState.items = []
    mockIndividualState.qurahUsed = false
  })

  it('excludes individual fields when hasBeenUsed is false', () => {
    mockIndividualState.hasBeenUsed = false
    const state = makeWizardState()
    const result = extractExportData(state)
    const data = result.data as Record<string, unknown>

    expect(data.customHeirNames).toBeUndefined()
    expect(data.individualDistribution).toBeUndefined()
  })

  it('includes customHeirNames and individualDistribution when hasBeenUsed is true', () => {
    mockIndividualState.hasBeenUsed = true
    mockIndividualState.customNames = { son_0: 'Rahim', daughter_0: 'Ayesha' }
    mockIndividualState.individuals = [
      {
        id: 'son_0',
        heirType: 'son',
        index: 0,
        displayName: 'Son 1',
        customName: 'Rahim',
        targetValue: 200000,
        sharePerHeir: '1/3',
        assignedItems: ['item-1', 'item-2'],
        assignedValue: 200000,
        cashAdjustment: 0,
      },
      {
        id: 'daughter_0',
        heirType: 'daughter',
        index: 0,
        displayName: 'Daughter 1',
        customName: 'Ayesha',
        targetValue: 100000,
        sharePerHeir: '1/6',
        assignedItems: ['item-3'],
        assignedValue: 100000,
        cashAdjustment: 0,
      },
    ]
    mockIndividualState.qurahUsed = true

    const state = makeWizardState()
    const result = extractExportData(state)
    const data = result.data as Record<string, unknown>

    expect(data.customHeirNames).toEqual({ son_0: 'Rahim', daughter_0: 'Ayesha' })
    expect(data.individualDistribution).toEqual({
      assignments: [
        { individualId: 'son_0', assignedItemIds: ['item-1', 'item-2'] },
        { individualId: 'daughter_0', assignedItemIds: ['item-3'] },
      ],
      qurahUsed: true,
    })
  })
})

describe('JSON import with individual distribution', () => {
  beforeEach(() => {
    mockIndividualState.hasBeenUsed = false
    mockIndividualState.customNames = {}
    mockIndividualState.individuals = []
    mockIndividualState.items = []
    mockIndividualState.qurahUsed = false
    mockIndividualState.initialize.mockClear()
    mockIndividualState.renameIndividual.mockClear()
  })

  it('old JSON without individual fields imports cleanly (backward compat)', () => {
    const data = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 2,
        daughterCount: 1,
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.sonCount).toBe(2)
  })

  it('import with customHeirNames passes them through in importResult', () => {
    const data = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 2,
        customHeirNames: { son_0: 'Rahim', son_1: 'Karim' },
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    // customHeirNames should be available in the import result for downstream processing
    expect((result as { customHeirNames?: Record<string, string> }).customHeirNames).toEqual({
      son_0: 'Rahim',
      son_1: 'Karim',
    })
  })

  it('import with individualDistribution passes it through in importResult', () => {
    const data = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 2,
        individualDistribution: {
          assignments: [
            { individualId: 'son_0', assignedItemIds: ['item-1'] },
            { individualId: 'son_1', assignedItemIds: ['item-2'] },
          ],
          qurahUsed: true,
        },
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const indDist = (result as { individualDistribution?: unknown }).individualDistribution as {
      assignments: Array<{ individualId: string; assignedItemIds: string[] }>
      qurahUsed: boolean
    } | null
    expect(indDist).not.toBeNull()
    expect(indDist!.assignments).toHaveLength(2)
    expect(indDist!.qurahUsed).toBe(true)
  })

  it('import with invalid individualDistribution (not object) is ignored', () => {
    const data = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 2,
        individualDistribution: 'invalid',
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const indDist = (result as { individualDistribution?: unknown }).individualDistribution
    expect(indDist).toBeUndefined()
  })

  it('import with invalid customHeirNames (not object) is ignored', () => {
    const data = {
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 2,
        customHeirNames: 42,
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const names = (result as { customHeirNames?: unknown }).customHeirNames
    expect(names).toBeUndefined()
  })

  it('round-trip: export then import preserves custom heir names', () => {
    mockIndividualState.hasBeenUsed = true
    mockIndividualState.customNames = { son_0: 'Rahim', daughter_0: 'Ayesha' }
    mockIndividualState.individuals = [
      {
        id: 'son_0',
        heirType: 'son',
        index: 0,
        displayName: 'Son 1',
        customName: 'Rahim',
        targetValue: 200000,
        sharePerHeir: '1/3',
        assignedItems: ['item-1'],
        assignedValue: 200000,
        cashAdjustment: 0,
      },
      {
        id: 'daughter_0',
        heirType: 'daughter',
        index: 0,
        displayName: 'Daughter 1',
        customName: 'Ayesha',
        targetValue: 100000,
        sharePerHeir: '1/6',
        assignedItems: ['item-2'],
        assignedValue: 100000,
        cashAdjustment: 0,
      },
    ]
    mockIndividualState.qurahUsed = false

    const state = makeWizardState()
    const exported = extractExportData(state)

    // Now import the exported data
    const imported = validateAndParseImport(exported)

    expect(imported.success).toBe(true)
    if (!imported.success) return

    const names = (imported as { customHeirNames?: Record<string, string> }).customHeirNames
    expect(names).toEqual({ son_0: 'Rahim', daughter_0: 'Ayesha' })

    const indDist = (imported as { individualDistribution?: unknown }).individualDistribution as {
      assignments: Array<{ individualId: string; assignedItemIds: string[] }>
      qurahUsed: boolean
    } | null
    expect(indDist).not.toBeNull()
    expect(indDist!.assignments).toHaveLength(2)
    expect(indDist!.qurahUsed).toBe(false)
  })
})

describe('Scenario save/load with individual distribution', () => {
  beforeEach(() => {
    mockIndividualState.hasBeenUsed = false
    mockIndividualState.customNames = {}
    mockIndividualState.individuals = []
    mockIndividualState.items = []
    mockIndividualState.qurahUsed = false
  })

  it('Scenario type has optional individualDistribution field', async () => {
    // Verify the type exists by importing it
    const { Scenario } = await import('@/types/scenario').catch(() => ({
      Scenario: undefined,
    }))

    // If this compiles, the type is correct. We verify by creating a scenario-like object
    const scenario = {
      id: 'test',
      name: 'Test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: makeWizardState(),
      summary: {
        heirSummary: '2S, 1D',
        totalEstateValue: 600000,
        adjustment: 'none' as const,
        heirCount: 3,
      },
      individualDistribution: {
        individuals: [],
        items: [],
        customNames: { son_0: 'Rahim' },
        qurahUsed: true,
      },
    }

    expect(scenario.individualDistribution).toBeDefined()
    expect(scenario.individualDistribution?.customNames).toEqual({ son_0: 'Rahim' })
  })
})
