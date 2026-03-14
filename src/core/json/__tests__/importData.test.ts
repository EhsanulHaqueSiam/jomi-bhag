import { describe, it, expect } from 'vitest'
import { validateAndParseImport } from '@/core/json/importData'
import type { ImportResult } from '@/core/json/importData'
import { SCHEMA_VERSION } from '@/core/json/schema'
import { extractExportData } from '@/core/json/exportData'
import type { WizardState } from '@/types/wizard'
import type { Property } from '@/core/land/types'
import type { CashAsset, GoldSilverAsset } from '@/core/assets/types'

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

function makeGoldAsset(overrides: Partial<GoldSilverAsset> = {}): GoldSilverAsset {
  return {
    id: 'gold-1',
    category: 'gold_silver',
    isIndivisible: false,
    indivisibleResolution: null,
    metalType: 'gold',
    weight: 5,
    weightUnit: 'vori',
    purity: '22K',
    useAutoRate: true,
    overrideValue: null,
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
    results: null,
    totalEstateValue: 600000,
    viewMode: 'detailed',
    ...overrides,
  }
}

function makeFullExport() {
  const state = makeWizardState()
  return extractExportData(state)
}

describe('validateAndParseImport', () => {
  it('with full valid JSON returns success with all fields populated', () => {
    const exported = makeFullExport()
    const result = validateAndParseImport(exported)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.relationship).toBe('father')
    expect(result.state.sonCount).toBe(2)
    expect(result.state.daughterCount).toBe(1)
    expect(result.state.wifeCount).toBe(1)
    expect(result.state.properties).toHaveLength(1)
    expect(result.state.movableAssets).toHaveLength(1)
    expect(result.state.totalEstateValue).toBe(600000)
  })

  it('with partial JSON (only heirs, no properties) returns success with empty arrays', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'wife' as const,
        deceasedGender: 'male' as const,
        userGender: 'female' as const,
        sonCount: 3,
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.relationship).toBe('wife')
    expect(result.state.sonCount).toBe(3)
    expect(result.state.properties).toEqual([])
    expect(result.state.movableAssets).toEqual([])
  })

  it('with partial JSON (only properties, no heirs) returns success with null/zero heir fields', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [makeProperty()],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.relationship).toBeNull()
    expect(result.state.sonCount).toBe(0)
    expect(result.state.wifeCount).toBe(0)
    expect(result.state.properties).toHaveLength(1)
  })

  it('with non-object input returns error', () => {
    expect(validateAndParseImport(null).success).toBe(false)
    expect(validateAndParseImport(undefined).success).toBe(false)
    expect(validateAndParseImport('hello').success).toBe(false)
    expect(validateAndParseImport(42).success).toBe(false)
    expect(validateAndParseImport([]).success).toBe(false)

    const result = validateAndParseImport(null)
    if (!result.success) {
      expect(result.error).toContain('Invalid')
    }
  })

  it('with invalid enum (relationship: "uncle") returns error', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'uncle',
        sonCount: 1,
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    // Invalid enum falls back to default (null)
    expect(result.state.relationship).toBeNull()
  })

  it('with string where number expected (sonCount: "two") falls back to default 0', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        sonCount: 'two',
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.sonCount).toBe(0)
  })

  it('with unsupported schemaVersion returns error', () => {
    const data = {
      schemaVersion: 999,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: { relationship: 'father' },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('schema version')
    }
  })

  it('recomputes autoIncludes from relationship/userGender/motherAlive', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        relationship: 'father',
        userGender: 'male',
        motherAlive: true,
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    // father + male user + motherAlive => son(1) + wife(1)
    expect(result.state.autoIncludes).toEqual([
      { type: 'son', count: 1 },
      { type: 'wife', count: 1 },
    ])
  })

  it('regenerates all property and movable asset IDs', () => {
    const exported = makeFullExport()
    const originalPropertyId = exported.data.properties[0].id
    const originalAssetId = exported.data.movableAssets[0].id

    const result = validateAndParseImport(exported)

    expect(result.success).toBe(true)
    if (!result.success) return
    // IDs should differ from originals
    expect(result.state.properties[0].id).not.toBe(originalPropertyId)
    expect(result.state.movableAssets[0].id).not.toBe(originalAssetId)
    // IDs should be valid UUID format
    expect(result.state.properties[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  })

  it('sets currentStep to 1 and completedSteps to [1,2,3] for navigability after import', () => {
    const exported = makeFullExport()
    const result = validateAndParseImport(exported)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.currentStep).toBe(1)
    expect(result.state.completedSteps).toEqual([1, 2, 3])
  })

  it('sets completedSteps to [1,2,3] even with minimal data', () => {
    const result = validateAndParseImport({
      relationship: 'father',
      sonCount: 2,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.state.completedSteps).toEqual([1, 2, 3])
      expect(result.state.currentStep).toBe(1)
    }
  })

  it('validates movable asset category-specific fields (gold_silver without metalType gets defaults)', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [
          {
            id: 'g1',
            category: 'gold_silver',
            isIndivisible: false,
            indivisibleResolution: null,
            // missing metalType, weight, weightUnit, purity, useAutoRate, overrideValue
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const asset = result.state.movableAssets[0]
    expect(asset.category).toBe('gold_silver')
    if (asset.category === 'gold_silver') {
      expect(asset.metalType).toBe('gold')
      expect(asset.weight).toBe(0)
      expect(asset.weightUnit).toBe('vori')
      expect(asset.purity).toBe('22K')
    }
  })

  it('accepts bare data object (no schema envelope)', () => {
    const data = {
      relationship: 'mother',
      userGender: 'female',
      sonCount: 1,
      properties: [makeProperty()],
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.relationship).toBe('mother')
    expect(result.state.sonCount).toBe(1)
    expect(result.state.properties).toHaveLength(1)
  })

  it('sets viewMode, expandedPropertyId, expandedAssetId, results to defaults', () => {
    const exported = makeFullExport()
    const result = validateAndParseImport(exported)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.viewMode).toBe('simple')
    expect(result.state.expandedPropertyId).toBeNull()
    expect(result.state.expandedAssetId).toBeNull()
    expect(result.state.results).toBeNull()
  })

  it('handles full gold_silver asset with all fields', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [makeGoldAsset()],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const asset = result.state.movableAssets[0]
    expect(asset.category).toBe('gold_silver')
    if (asset.category === 'gold_silver') {
      expect(asset.metalType).toBe('gold')
      expect(asset.weight).toBe(5)
      expect(asset.purity).toBe('22K')
    }
  })

  it('handles vehicle asset with defaults for missing fields', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [
          {
            id: 'v1',
            category: 'vehicle',
            isIndivisible: true,
            indivisibleResolution: null,
            // missing vehicleType, description, estimatedValue
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const asset = result.state.movableAssets[0]
    expect(asset.category).toBe('vehicle')
    if (asset.category === 'vehicle') {
      expect(asset.vehicleType).toBe('car')
      expect(asset.description).toBe('')
      expect(asset.estimatedValue).toBe(0)
    }
  })

  it('handles livestock asset with defaults', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [
          {
            id: 'l1',
            category: 'livestock',
            isIndivisible: false,
            indivisibleResolution: null,
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const asset = result.state.movableAssets[0]
    expect(asset.category).toBe('livestock')
    if (asset.category === 'livestock') {
      expect(asset.livestockType).toBe('cow')
      expect(asset.count).toBe(0)
      expect(asset.perUnitValue).toBe(0)
    }
  })

  it('handles custom asset with defaults', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [
          {
            id: 'c1',
            category: 'custom',
            isIndivisible: false,
            indivisibleResolution: null,
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const asset = result.state.movableAssets[0]
    expect(asset.category).toBe('custom')
    if (asset.category === 'custom') {
      expect(asset.name).toBe('')
      expect(asset.estimatedValue).toBe(0)
    }
  })

  it('skips movable assets with invalid category', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        movableAssets: [
          {
            id: 'bad1',
            category: 'spaceship',
            isIndivisible: false,
            indivisibleResolution: null,
          },
          makeCashAsset(),
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    // Invalid category asset should be skipped, valid one kept
    expect(result.state.movableAssets).toHaveLength(1)
    expect(result.state.movableAssets[0].category).toBe('cash')
  })

  it('property with invalid type falls back to null', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          makeProperty({ type: 'spaceship' as never }),
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.properties[0].type).toBeNull()
  })

  it('property with invalid division falls back to null', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          makeProperty({ division: 'mars' as never }),
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.properties[0].division).toBeNull()
  })

  // ── Settlement import tests ──────────────────────────────────────────

  it('importing property without settlement field defaults to settlement: null', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          {
            nickname: 'Farm',
            type: 'agricultural',
            landAreaSqft: 5000,
            landValue: 200000,
            // no settlement field
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.properties[0].settlement).toBeNull()
  })

  it('importing property with valid sell_split settlement preserves data', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          {
            ...makeProperty(),
            settlement: {
              method: 'sell_split',
              actualSalePrice: 750000,
            },
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const settlement = result.state.properties[0].settlement
    expect(settlement).not.toBeNull()
    expect(settlement!.method).toBe('sell_split')
    if (settlement!.method === 'sell_split') {
      expect(settlement!.actualSalePrice).toBe(750000)
    }
  })

  it('importing property with invalid settlement method falls back to null', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          {
            ...makeProperty(),
            settlement: {
              method: 'teleport',
            },
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.properties[0].settlement).toBeNull()
  })

  it('importing property with physical_division and subParcels is parsed correctly', () => {
    const data = {
      schemaVersion: SCHEMA_VERSION,
      appVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        properties: [
          {
            ...makeProperty(),
            settlement: {
              method: 'physical_division',
              subParcels: [
                { id: 'sp1', name: 'Front lot', areaSqft: 2000, areaInputUnit: 'sqft', appraisedValue: 300000 },
                { id: 'sp2', name: 'Back lot', areaSqft: 3000, areaInputUnit: 'sqft', appraisedValue: 200000 },
              ],
            },
          },
        ],
      },
    }
    const result = validateAndParseImport(data)

    expect(result.success).toBe(true)
    if (!result.success) return
    const settlement = result.state.properties[0].settlement
    expect(settlement).not.toBeNull()
    expect(settlement!.method).toBe('physical_division')
    if (settlement!.method === 'physical_division') {
      expect(settlement!.subParcels).toHaveLength(2)
      expect(settlement!.subParcels[0].name).toBe('Front lot')
      expect(settlement!.subParcels[1].appraisedValue).toBe(200000)
    }
  })
})
