import { describe, test, expect } from 'vitest'
import { computeEstateBreakdown } from '@/core/land/valuation'
import type { Property } from '@/core/land/types'

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: crypto.randomUUID(),
    nickname: '',
    type: null,
    division: null,
    upazila: null,
    rateSource: 'manual',
    landAreaSqft: 0,
    landInputUnit: 'decimal',
    landValue: 0,
    house: null,
    trees: null,
    pond: null,
    ...overrides,
  }
}

describe('computeEstateBreakdown', () => {
  test('returns zeros for empty properties array', () => {
    const result = computeEstateBreakdown([])
    expect(result.land).toBe(0)
    expect(result.structures).toBe(0)
    expect(result.trees).toBe(0)
    expect(result.ponds).toBe(0)
    expect(result.total).toBe(0)
    expect(result.byProperty).toHaveLength(0)
  })

  test('correctly breaks down single property with all sections', () => {
    const p = makeProperty({
      landValue: 1000000,
      house: { estimatedValue: 500000, areaSqft: null, constructionType: null, floors: null, condition: null },
      trees: { totalEstimatedValue: 200000, items: [], isItemized: false },
      pond: { areaSqft: 1000, areaInputUnit: 'decimal', estimatedValue: 100000 },
    })

    const result = computeEstateBreakdown([p])
    expect(result.land).toBe(1000000)
    expect(result.structures).toBe(500000)
    expect(result.trees).toBe(200000)
    expect(result.ponds).toBe(100000)
    expect(result.total).toBe(1800000)
    expect(result.byProperty).toHaveLength(1)
    expect(result.byProperty[0].total).toBe(1800000)
  })

  test('correctly sums across multiple properties', () => {
    const p1 = makeProperty({ landValue: 500000 })
    const p2 = makeProperty({
      landValue: 300000,
      house: { estimatedValue: 200000, areaSqft: null, constructionType: null, floors: null, condition: null },
    })

    const result = computeEstateBreakdown([p1, p2])
    expect(result.land).toBe(800000)
    expect(result.structures).toBe(200000)
    expect(result.trees).toBe(0)
    expect(result.ponds).toBe(0)
    expect(result.total).toBe(1000000)
    expect(result.byProperty).toHaveLength(2)
  })

  test('handles properties with null sub-sections (zeros)', () => {
    const p = makeProperty({ landValue: 1000000 })
    const result = computeEstateBreakdown([p])
    expect(result.structures).toBe(0)
    expect(result.trees).toBe(0)
    expect(result.ponds).toBe(0)
    expect(result.total).toBe(1000000)
  })

  test('handles itemized trees correctly', () => {
    const p = makeProperty({
      landValue: 0,
      trees: {
        totalEstimatedValue: 0,
        items: [
          { species: 'mango', count: 5, estimatedValue: 50000 },
          { species: 'jackfruit', count: 3, estimatedValue: 30000 },
        ],
        isItemized: true,
      },
    })

    const result = computeEstateBreakdown([p])
    expect(result.trees).toBe(80000)
    expect(result.total).toBe(80000)
  })

  test('handles non-itemized trees correctly', () => {
    const p = makeProperty({
      landValue: 0,
      trees: {
        totalEstimatedValue: 150000,
        items: [],
        isItemized: false,
      },
    })

    const result = computeEstateBreakdown([p])
    expect(result.trees).toBe(150000)
    expect(result.total).toBe(150000)
  })

  test('per-property breakdown matches property totals', () => {
    const p1 = makeProperty({
      landValue: 1000000,
      house: { estimatedValue: 500000, areaSqft: null, constructionType: null, floors: null, condition: null },
    })
    const p2 = makeProperty({
      landValue: 2000000,
      pond: { areaSqft: 2000, areaInputUnit: 'decimal', estimatedValue: 300000 },
    })

    const result = computeEstateBreakdown([p1, p2])
    expect(result.byProperty[0].land).toBe(1000000)
    expect(result.byProperty[0].structures).toBe(500000)
    expect(result.byProperty[0].total).toBe(1500000)
    expect(result.byProperty[1].land).toBe(2000000)
    expect(result.byProperty[1].ponds).toBe(300000)
    expect(result.byProperty[1].total).toBe(2300000)
  })
})
