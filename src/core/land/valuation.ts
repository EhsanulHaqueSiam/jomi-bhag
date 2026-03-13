import type { Property } from './types'
import { computePropertyTotal } from './types'

export interface EstateBreakdown {
  land: number
  structures: number
  trees: number
  ponds: number
  movableAssets: number
  total: number
  byProperty: {
    property: Property
    land: number
    structures: number
    trees: number
    ponds: number
    total: number
  }[]
}

/**
 * Compute estate breakdown from an array of properties.
 * Returns category totals (land, structures, trees, ponds) and per-property breakdown.
 * Handles itemized vs non-itemized trees consistently with computePropertyTotal.
 */
export function computeEstateBreakdown(properties: Property[], movableAssetsTotal?: number): EstateBreakdown {
  const byProperty = properties.map((p) => {
    const treesVal = p.trees
      ? p.trees.isItemized
        ? p.trees.items.reduce((s, i) => s + i.estimatedValue, 0)
        : p.trees.totalEstimatedValue
      : 0

    return {
      property: p,
      land: p.landValue,
      structures: p.house?.estimatedValue ?? 0,
      trees: treesVal,
      ponds: p.pond?.estimatedValue ?? 0,
      total: computePropertyTotal(p),
    }
  })

  const propTotal = byProperty.reduce((s, p) => s + p.total, 0)

  return {
    land: byProperty.reduce((s, p) => s + p.land, 0),
    structures: byProperty.reduce((s, p) => s + p.structures, 0),
    trees: byProperty.reduce((s, p) => s + p.trees, 0),
    ponds: byProperty.reduce((s, p) => s + p.ponds, 0),
    movableAssets: movableAssetsTotal ?? 0,
    total: propTotal + (movableAssetsTotal ?? 0),
    byProperty,
  }
}
