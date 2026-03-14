import { describe, it, expect } from 'vitest'
import { extractExportData, generateExportFilename } from '@/core/json/exportData'
import { SCHEMA_VERSION } from '@/core/json/schema'
import type { WizardState } from '@/types/wizard'
import type { Property } from '@/core/land/types'
import type { CashAsset } from '@/core/assets/types'

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
    currentStep: 4,
    completedSteps: [1, 2, 3],
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

describe('extractExportData', () => {
  it('returns object with schemaVersion, appVersion, and exportDate', () => {
    const state = makeWizardState()
    const result = extractExportData(state)

    expect(result.schemaVersion).toBe(SCHEMA_VERSION)
    expect(typeof result.appVersion).toBe('string')
    expect(result.appVersion.length).toBeGreaterThan(0)
    // exportDate should be ISO 8601
    expect(new Date(result.exportDate).toISOString()).toBe(result.exportDate)
  })

  it('includes all heir input fields', () => {
    const state = makeWizardState()
    const result = extractExportData(state)
    const { data } = result

    expect(data.relationship).toBe('father')
    expect(data.deceasedGender).toBe('male')
    expect(data.userGender).toBe('male')
    expect(data.mfloEnabled).toBe(false)
    expect(data.motherAlive).toBe(true)
    expect(data.wifeCount).toBe(1)
    expect(data.husbandPresent).toBe(false)
    expect(data.sonCount).toBe(2)
    expect(data.daughterCount).toBe(1)
    expect(data.siblingTypeExpanded).toBe(false)
    expect(data.brotherFullCount).toBe(0)
    expect(data.brotherConsanguineCount).toBe(0)
    expect(data.brotherUterineCount).toBe(0)
    expect(data.sisterFullCount).toBe(0)
    expect(data.sisterConsanguineCount).toBe(0)
    expect(data.sisterUterineCount).toBe(0)
  })

  it('includes properties, movableAssets, and totalEstateValue', () => {
    const state = makeWizardState()
    const result = extractExportData(state)

    expect(result.data.properties).toHaveLength(1)
    expect(result.data.properties[0].nickname).toBe('Home')
    expect(result.data.movableAssets).toHaveLength(1)
    expect(result.data.movableAssets[0].category).toBe('cash')
    expect(result.data.totalEstateValue).toBe(600000)
  })

  it('does NOT include results, currentStep, completedSteps, viewMode, expandedPropertyId, expandedAssetId, autoIncludes', () => {
    const state = makeWizardState()
    const result = extractExportData(state)
    const data = result.data as Record<string, unknown>

    expect(data).not.toHaveProperty('results')
    expect(data).not.toHaveProperty('currentStep')
    expect(data).not.toHaveProperty('completedSteps')
    expect(data).not.toHaveProperty('viewMode')
    expect(data).not.toHaveProperty('expandedPropertyId')
    expect(data).not.toHaveProperty('expandedAssetId')
    expect(data).not.toHaveProperty('autoIncludes')
  })

  it('output is JSON.stringify-able with no loss', () => {
    const state = makeWizardState()
    const result = extractExportData(state)
    const json = JSON.stringify(result)
    const parsed = JSON.parse(json)

    expect(parsed).toEqual(result)
  })
})

describe('generateExportFilename', () => {
  it('produces hyphenated filename with heir counts and date', () => {
    const state = makeWizardState({ sonCount: 2, wifeCount: 1 })
    const filename = generateExportFilename(state)

    // Should contain "2-sons" and "1-wife" and end with date + .json
    expect(filename).toMatch(/2-sons/)
    expect(filename).toMatch(/1-wife/)
    expect(filename).toMatch(/\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('uses singular form for count of 1', () => {
    const state = makeWizardState({
      sonCount: 1,
      daughterCount: 0,
      wifeCount: 0,
      husbandPresent: false,
    })
    const filename = generateExportFilename(state)

    expect(filename).toMatch(/1-son-/)
    expect(filename).not.toMatch(/1-sons/)
  })

  it('produces "scenario-YYYY-MM-DD.json" with no heirs', () => {
    const state = makeWizardState({
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
    const filename = generateExportFilename(state)

    expect(filename).toMatch(/^scenario-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('includes daughter and husband in filename', () => {
    const state = makeWizardState({
      sonCount: 0,
      daughterCount: 2,
      wifeCount: 0,
      husbandPresent: true,
    })
    const filename = generateExportFilename(state)

    expect(filename).toMatch(/2-daughters/)
    expect(filename).toMatch(/husband/)
  })

  it('includes sibling types', () => {
    const state = makeWizardState({
      sonCount: 0,
      daughterCount: 0,
      wifeCount: 0,
      husbandPresent: false,
      brotherFullCount: 3,
      sisterConsanguineCount: 1,
    })
    const filename = generateExportFilename(state)

    expect(filename).toMatch(/3-brothers-full/)
    expect(filename).toMatch(/1-sister-cons/)
  })
})
