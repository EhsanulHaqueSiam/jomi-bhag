import { describe, it, expect } from 'vitest'
import { toSqft, fromSqft, getConversions, KATHA_SQFT } from '@/core/land/units'
import { computePropertyTotal } from '@/core/land/types'
import type { Property } from '@/core/land/types'

describe('PROP-01: Land unit conversion (fixed units)', () => {
  it('toSqft(1, "decimal", "dhaka") === 435.6', () => {
    expect(toSqft(1, 'decimal', 'dhaka')).toBe(435.6)
  })

  it('toSqft(1, "katha", "dhaka") === 720', () => {
    expect(toSqft(1, 'katha', 'dhaka')).toBe(720)
  })

  it('toSqft(1, "bigha", "dhaka") === 14400', () => {
    expect(toSqft(1, 'bigha', 'dhaka')).toBe(14400)
  })

  it('toSqft(1, "sqft", "dhaka") === 1', () => {
    expect(toSqft(1, 'sqft', 'dhaka')).toBe(1)
  })

  it('fromSqft(435.6, "decimal", "dhaka") === 1', () => {
    expect(fromSqft(435.6, 'decimal', 'dhaka')).toBe(1)
  })

  it('fromSqft(720, "katha", "dhaka") === 1', () => {
    expect(fromSqft(720, 'katha', 'dhaka')).toBe(1)
  })

  it('getConversions returns array of 4 conversion objects', () => {
    const conversions = getConversions(720, 'dhaka')
    expect(conversions).toHaveLength(4)
    expect(conversions.map((c) => c.unit)).toEqual(['decimal', 'katha', 'sqft', 'bigha'])
  })

  it('toSqft(0, "decimal", "dhaka") === 0 (edge: zero area)', () => {
    expect(toSqft(0, 'decimal', 'dhaka')).toBe(0)
  })

  it('toSqft handles very large values', () => {
    expect(toSqft(10000, 'decimal', 'dhaka')).toBe(4356000)
  })

  it('round-trip: fromSqft(toSqft(x)) === x for decimal', () => {
    const original = 5.5
    const sqft = toSqft(original, 'decimal', 'dhaka')
    expect(fromSqft(sqft, 'decimal', 'dhaka')).toBeCloseTo(original, 10)
  })

  it('round-trip: fromSqft(toSqft(x)) === x for katha', () => {
    const original = 3.25
    const sqft = toSqft(original, 'katha', 'dhaka')
    expect(fromSqft(sqft, 'katha', 'dhaka')).toBeCloseTo(original, 10)
  })
})

describe('PROP-06: Regional katha/bigha variations', () => {
  it('toSqft(1, "katha", "rajshahi") === 1620', () => {
    expect(toSqft(1, 'katha', 'rajshahi')).toBe(1620)
  })

  it('toSqft(1, "katha", "khulna") === 1620', () => {
    expect(toSqft(1, 'katha', 'khulna')).toBe(1620)
  })

  it('toSqft(1, "katha", "rangpur") === 1620', () => {
    expect(toSqft(1, 'katha', 'rangpur')).toBe(1620)
  })

  it('toSqft(1, "bigha", "rajshahi") === 32400', () => {
    expect(toSqft(1, 'bigha', 'rajshahi')).toBe(32400)
  })

  it('fromSqft(1620, "katha", "rajshahi") === 1', () => {
    expect(fromSqft(1620, 'katha', 'rajshahi')).toBe(1)
  })

  it('KATHA_SQFT has correct values for all 8 divisions', () => {
    expect(KATHA_SQFT.dhaka).toBe(720)
    expect(KATHA_SQFT.chittagong).toBe(720)
    expect(KATHA_SQFT.sylhet).toBe(720)
    expect(KATHA_SQFT.barisal).toBe(720)
    expect(KATHA_SQFT.mymensingh).toBe(720)
    expect(KATHA_SQFT.rajshahi).toBe(1620)
    expect(KATHA_SQFT.khulna).toBe(1620)
    expect(KATHA_SQFT.rangpur).toBe(1620)
  })

  it('getConversions for 720 sqft in dhaka shows 1 katha', () => {
    const conversions = getConversions(720, 'dhaka')
    const katha = conversions.find((c) => c.unit === 'katha')
    expect(katha!.value).toBe(1)
  })

  it('getConversions for 720 sqft in rajshahi shows ~0.44 katha', () => {
    const conversions = getConversions(720, 'rajshahi')
    const katha = conversions.find((c) => c.unit === 'katha')
    expect(katha!.value).toBeCloseTo(0.44, 2)
  })

  it('getConversions values are rounded to 2 decimal places', () => {
    const conversions = getConversions(1000, 'dhaka')
    for (const c of conversions) {
      const decimals = String(c.value).split('.')[1]
      if (decimals) {
        expect(decimals.length).toBeLessThanOrEqual(2)
      }
    }
  })
})

describe('computePropertyTotal', () => {
  const makeProperty = (overrides: Partial<Property> = {}): Property => ({
    id: 'test',
    nickname: '',
    type: null,
    division: null,
    landAreaSqft: 0,
    landInputUnit: 'decimal',
    landValue: 0,
    house: null,
    trees: null,
    pond: null,
    ...overrides,
  })

  it('sums land + house + trees (total) + pond values', () => {
    const p = makeProperty({
      landValue: 100000,
      house: { estimatedValue: 50000, areaSqft: null, constructionType: null, floors: null, condition: null },
      trees: { totalEstimatedValue: 20000, items: [], isItemized: false },
      pond: { areaSqft: 100, areaInputUnit: 'sqft', estimatedValue: 30000 },
    })
    expect(computePropertyTotal(p)).toBe(200000)
  })

  it('sums itemized tree values when isItemized is true', () => {
    const p = makeProperty({
      landValue: 10000,
      trees: {
        totalEstimatedValue: 0,
        items: [
          { species: 'mango', count: 5, estimatedValue: 5000 },
          { species: 'coconut', count: 3, estimatedValue: 3000 },
        ],
        isItemized: true,
      },
    })
    expect(computePropertyTotal(p)).toBe(18000)
  })

  it('returns 0 for property with all null sub-items and 0 land value', () => {
    const p = makeProperty()
    expect(computePropertyTotal(p)).toBe(0)
  })

  it('handles property with only land value', () => {
    const p = makeProperty({ landValue: 500000 })
    expect(computePropertyTotal(p)).toBe(500000)
  })
})
