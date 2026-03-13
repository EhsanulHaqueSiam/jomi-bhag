import { describe, it, expect } from 'vitest'
import {
  computeGoldValue,
  convertToVori,
  computeAssetValue,
  computeMovableAssetsTotal,
} from '@/core/assets/valuation'
import { GOLD_RATES, SILVER_RATES, GOLD_UNIT_CONVERSIONS, VEHICLE_TYPES, LIVESTOCK_TYPES, ASSET_CATEGORIES } from '@/data/movable-asset-data'
import type {
  GoldSilverAsset,
  CashAsset,
  VehicleAsset,
  LivestockAsset,
  CustomAsset,
  JewelryAsset,
  FurnitureAsset,
  MovableAsset,
} from '@/core/assets/types'

function makeGoldAsset(overrides: Partial<GoldSilverAsset> = {}): GoldSilverAsset {
  return {
    id: 'gold-1',
    category: 'gold_silver',
    isIndivisible: false,
    indivisibleResolution: null,
    metalType: 'gold',
    weight: 0,
    weightUnit: 'vori',
    purity: '22K',
    useAutoRate: true,
    overrideValue: null,
    ...overrides,
  }
}

describe('convertToVori', () => {
  it('returns weight unchanged for vori', () => {
    expect(convertToVori(1, 'vori')).toBe(1.0)
  })

  it('converts grams to vori (11.664 grams = 1 vori)', () => {
    const result = convertToVori(11.664, 'gram')
    expect(result).toBeCloseTo(1.0, 4)
  })

  it('converts tola to vori (1 tola ~ 1 vori in BD)', () => {
    const result = convertToVori(1, 'tola')
    expect(result).toBeCloseTo(1.0, 1)
  })
})

describe('computeGoldValue', () => {
  it('computes gold value with weight, purity, and auto rate', () => {
    const asset = makeGoldAsset({ weight: 5.5, purity: '22K' })
    const result = computeGoldValue(asset)
    // 5.5 vori * 133000 BDT/vori = 731500
    expect(result).toBe(731500)
  })

  it('returns overrideValue when set', () => {
    const asset = makeGoldAsset({ weight: 5.5, purity: '22K', overrideValue: 800000 })
    expect(computeGoldValue(asset)).toBe(800000)
  })

  it('computes silver value using silver rates', () => {
    const asset = makeGoldAsset({ metalType: 'silver', weight: 10, purity: '22K' })
    const result = computeGoldValue(asset)
    // 10 vori * 3200 BDT/vori = 32000
    expect(result).toBe(32000)
  })

  it('computes 24K gold at higher rate than 22K', () => {
    const gold24 = makeGoldAsset({ weight: 1, purity: '24K' })
    const gold22 = makeGoldAsset({ weight: 1, purity: '22K' })
    expect(computeGoldValue(gold24)).toBeGreaterThan(computeGoldValue(gold22))
  })

  it('rounds result to integer', () => {
    // Use grams to get a non-integer intermediate
    const asset = makeGoldAsset({ weight: 10, weightUnit: 'gram', purity: '22K' })
    const result = computeGoldValue(asset)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('computeAssetValue', () => {
  it('cash asset returns its value', () => {
    const asset: CashAsset = {
      id: 'c1', category: 'cash', isIndivisible: false,
      indivisibleResolution: null, value: 500000,
    }
    expect(computeAssetValue(asset)).toBe(500000)
  })

  it('vehicle asset returns estimatedValue', () => {
    const asset: VehicleAsset = {
      id: 'v1', category: 'vehicle', isIndivisible: true,
      indivisibleResolution: null, vehicleType: 'car',
      description: 'Toyota', estimatedValue: 300000,
    }
    expect(computeAssetValue(asset)).toBe(300000)
  })

  it('livestock asset returns count * perUnitValue', () => {
    const asset: LivestockAsset = {
      id: 'l1', category: 'livestock', isIndivisible: true,
      indivisibleResolution: null, livestockType: 'cow',
      count: 3, perUnitValue: 150000,
    }
    expect(computeAssetValue(asset)).toBe(450000)
  })

  it('custom asset returns estimatedValue', () => {
    const asset: CustomAsset = {
      id: 'x1', category: 'custom', isIndivisible: true,
      indivisibleResolution: null, name: 'Generator',
      estimatedValue: 40000,
    }
    expect(computeAssetValue(asset)).toBe(40000)
  })

  it('jewelry asset returns value', () => {
    const asset: JewelryAsset = {
      id: 'j1', category: 'jewelry', isIndivisible: true,
      indivisibleResolution: null, value: 25000,
    }
    expect(computeAssetValue(asset)).toBe(25000)
  })

  it('furniture asset returns value', () => {
    const asset: FurnitureAsset = {
      id: 'f1', category: 'furniture', isIndivisible: false,
      indivisibleResolution: null, value: 80000,
    }
    expect(computeAssetValue(asset)).toBe(80000)
  })

  it('gold_silver asset delegates to computeGoldValue', () => {
    const asset = makeGoldAsset({ weight: 5.5, purity: '22K' })
    expect(computeAssetValue(asset)).toBe(731500)
  })
})

describe('computeMovableAssetsTotal', () => {
  it('sums all asset values correctly', () => {
    const assets: MovableAsset[] = [
      { id: 'c1', category: 'cash', isIndivisible: false, indivisibleResolution: null, value: 500000 },
      { id: 'v1', category: 'vehicle', isIndivisible: true, indivisibleResolution: null, vehicleType: 'car', description: '', estimatedValue: 300000 },
      makeGoldAsset({ weight: 5.5, purity: '22K' }),
    ]
    // 500000 + 300000 + 731500 = 1531500
    expect(computeMovableAssetsTotal(assets)).toBe(1531500)
  })

  it('returns 0 for empty array', () => {
    expect(computeMovableAssetsTotal([])).toBe(0)
  })
})

describe('data constants', () => {
  it('24K gold rate is higher than 22K rate', () => {
    expect(GOLD_RATES['24K']).toBeGreaterThan(GOLD_RATES['22K'])
  })

  it('silver rates are lower than gold rates', () => {
    expect(SILVER_RATES['24K']).toBeLessThan(GOLD_RATES['24K'])
    expect(SILVER_RATES['22K']).toBeLessThan(GOLD_RATES['22K'])
    expect(SILVER_RATES['18K']).toBeLessThan(GOLD_RATES['18K'])
  })

  it('ASSET_CATEGORIES has 7 entries with correct defaultIndivisible flags', () => {
    expect(ASSET_CATEGORIES).toHaveLength(7)
    const findCat = (v: string) => ASSET_CATEGORIES.find(c => c.value === v)
    expect(findCat('gold_silver')?.defaultIndivisible).toBe(false)
    expect(findCat('cash')?.defaultIndivisible).toBe(false)
    expect(findCat('furniture')?.defaultIndivisible).toBe(false)
    expect(findCat('vehicle')?.defaultIndivisible).toBe(true)
    expect(findCat('jewelry')?.defaultIndivisible).toBe(true)
    expect(findCat('livestock')?.defaultIndivisible).toBe(true)
    expect(findCat('custom')?.defaultIndivisible).toBe(true)
  })

  it('VEHICLE_TYPES has 6 entries', () => {
    expect(VEHICLE_TYPES).toHaveLength(6)
    const values = VEHICLE_TYPES.map(v => v.value)
    expect(values).toContain('car')
    expect(values).toContain('motorcycle')
    expect(values).toContain('cng_rickshaw')
    expect(values).toContain('truck')
    expect(values).toContain('bicycle')
    expect(values).toContain('boat')
  })

  it('LIVESTOCK_TYPES has 6 entries', () => {
    expect(LIVESTOCK_TYPES).toHaveLength(6)
    const values = LIVESTOCK_TYPES.map(v => v.value)
    expect(values).toContain('cow')
    expect(values).toContain('goat')
    expect(values).toContain('chicken')
    expect(values).toContain('duck')
    expect(values).toContain('pigeon')
    expect(values).toContain('fish_pond')
  })

  it('GOLD_UNIT_CONVERSIONS has correct vori_to_gram value', () => {
    expect(GOLD_UNIT_CONVERSIONS.vori_to_gram).toBe(11.664)
  })
})
