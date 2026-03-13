import type { FaraidOutput } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { DivisionResult } from '@/core/land/division'
import type { MovableAsset } from '@/core/assets/types'
import { computeAssetValue, computeMovableAssetsTotal } from '@/core/assets/valuation'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'
import { LIVESTOCK_TYPES, VEHICLE_TYPES } from '@/data/movable-asset-data'
import {
  fractionToString,
  fractionToPercent,
  fractionToBDT,
  HEIR_TYPE_LABELS,
  SHARE_TYPE_LABELS,
} from '@/core/utils/display'
import { getAllReferences } from '@/core/faraid/references'
import type { PdfData, PdfShareRow, PdfProperty, PdfReference, PdfLotDivision, PdfMovableAsset } from './pdfTypes'

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Extract a serializable PdfData object from engine output and property data.
 * All Fraction objects are converted to pre-formatted strings.
 * No Zustand hooks, no DOM access -- pure data transformation.
 */
/** Generate a display name for a movable asset */
function getAssetItemName(asset: MovableAsset): string {
  switch (asset.category) {
    case 'gold_silver': {
      const metal = asset.metalType === 'gold' ? 'Gold' : 'Silver'
      const weight = asset.weight > 0 ? ` ${asset.weight} ${asset.weightUnit}` : ''
      const purity = asset.purity ? ` ${asset.purity}` : ''
      return `${metal}${weight}${purity}`
    }
    case 'vehicle': {
      if (asset.description) return asset.description
      const vType = VEHICLE_TYPES.find((v) => v.value === asset.vehicleType)
      return vType?.label ?? 'Vehicle'
    }
    case 'livestock': {
      const lType = LIVESTOCK_TYPES.find((l) => l.value === asset.livestockType)
      const label = lType?.label ?? 'Livestock'
      return asset.count > 1 ? `${asset.count} ${label}` : label
    }
    case 'custom':
      return asset.name || 'Custom Item'
    case 'cash':
      return 'Cash/Bank Deposits'
    case 'jewelry':
      return 'Jewelry (non-gold)'
    case 'furniture':
      return 'Furniture/Household'
  }
}

/** Map resolution to a display string */
function getResolutionLabel(asset: MovableAsset): string | null {
  const res = asset.indivisibleResolution
  if (!res) return null
  switch (res.method) {
    case 'sell_divide':
      return 'Sell & Divide'
    case 'buyout':
      return `Buyout by ${HEIR_TYPE_LABELS[res.buyerHeirType]}`
    case 'qurah':
      return res.assignedHeirType
        ? `Qurah - ${HEIR_TYPE_LABELS[res.assignedHeirType]}`
        : 'Qurah'
  }
}

export function extractPdfData(
  results: FaraidOutput,
  properties: Property[],
  totalEstateValue: number,
  pieChartImage: string | null,
  barChartImage: string | null,
  divisionResult?: DivisionResult | null,
  movableAssets?: MovableAsset[],
): PdfData {
  // Map all shares to PdfShareRow
  const shares: PdfShareRow[] = results.shares.map((share) => ({
    heirType: HEIR_TYPE_LABELS[share.heirType],
    count: share.count,
    fraction: fractionToString(share.totalShare),
    percentage: fractionToPercent(share.totalShare),
    perHeirBdt: fractionToBDT(share.sharePerHeir, totalEstateValue),
    totalBdt: fractionToBDT(share.totalShare, totalEstateValue),
    shareType: SHARE_TYPE_LABELS[share.shareType] ?? share.shareType,
    explanation: share.explanation,
    quranRef: share.quranRef,
    hadithRef: share.hadithRef,
  }))

  // Filter active shares (non-blocked)
  const activeShares = shares.filter(
    (_, i) => results.shares[i].shareType !== 'blocked',
  )

  // Map blocked heirs to display labels
  const blockedHeirs = results.blockedHeirs.map((bh) => ({
    heirType: HEIR_TYPE_LABELS[bh.heirType],
    blockedBy: HEIR_TYPE_LABELS[bh.blockedBy],
    rule: bh.rule,
  }))

  // Map references to PdfReference
  const allRefs = getAllReferences(results)
  const references: PdfReference[] = allRefs.map((ref) => ({
    type: ref.type,
    reference: ref.reference,
    arabicText: ref.arabicText,
    englishText: ref.englishText,
    appliesTo: ref.appliesTo.map((ht) => HEIR_TYPE_LABELS[ht]),
  }))

  // Map properties to PdfProperty
  const pdfProperties: PdfProperty[] = properties.map((prop) => ({
    nickname: prop.nickname,
    type: capitalize(prop.type ?? ''),
    division: prop.division ? capitalize(prop.division) : null,
    upazila: prop.upazila,
    rateSource: prop.rateSource,
    landAreaSqft: prop.landAreaSqft,
    landValue: prop.landValue,
    houseValue: prop.house ? prop.house.estimatedValue : null,
    treesValue: prop.trees
      ? prop.trees.isItemized
        ? prop.trees.items.reduce((sum, item) => sum + item.estimatedValue, 0)
        : prop.trees.totalEstimatedValue
      : null,
    pondValue: prop.pond ? prop.pond.estimatedValue : null,
    totalValue: computePropertyTotal(prop),
  }))

  // Map division result to PdfLotDivision (optional)
  let lotDivision: PdfLotDivision | undefined
  if (divisionResult) {
    const propMap = new Map(properties.map((p) => [p.id, p]))
    lotDivision = {
      groups: divisionResult.groups.map((group) => ({
        heirType: HEIR_TYPE_LABELS[group.heirType],
        count: group.count,
        targetValue: Math.round(group.targetValue),
        assignedProperties: group.assignedProperties.map((id) => {
          const prop = propMap.get(id)
          return {
            nickname: prop?.nickname || id,
            value: prop ? computePropertyTotal(prop) : 0,
          }
        }),
        assignedValue: Math.round(group.assignedValue),
        cashAdjustment: Math.round(group.cashAdjustment),
      })),
      compensations: divisionResult.compensations.map((comp) => ({
        from: HEIR_TYPE_LABELS[comp.fromGroup],
        to: HEIR_TYPE_LABELS[comp.toGroup],
        amount: Math.round(comp.amount),
      })),
      totalEstateValue: divisionResult.totalEstateValue,
    }
  }

  // Map movable assets to PdfMovableAsset
  const pdfMovableAssets: PdfMovableAsset[] = (movableAssets ?? []).map((asset) => {
    const catMeta = ASSET_CATEGORIES.find((c) => c.value === asset.category)
    return {
      category: catMeta?.label ?? asset.category,
      itemName: getAssetItemName(asset),
      value: computeAssetValue(asset),
      isIndivisible: asset.isIndivisible,
      resolution: asset.isIndivisible ? getResolutionLabel(asset) : null,
    }
  })
  const movableAssetsTotalValue = computeMovableAssetsTotal(movableAssets ?? [])

  return {
    shares,
    activeShares,
    adjustment: results.adjustment,
    totalBeforeAdjustment: fractionToString(results.totalBeforeAdjustment),
    blockedHeirs,
    specialCases: results.specialCases,
    steps: results.steps.map((s) => ({
      step: s.step,
      description: s.description,
      detail: s.detail,
    })),
    references,
    properties: pdfProperties,
    totalEstateValue,
    movableAssets: pdfMovableAssets,
    movableAssetsTotal: movableAssetsTotalValue,
    pieChartImage,
    barChartImage,
    lotDivision,
    generatedAt: new Date(),
  }
}
