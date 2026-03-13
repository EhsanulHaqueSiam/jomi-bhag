import type { FaraidOutput } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import {
  fractionToString,
  fractionToPercent,
  fractionToBDT,
  HEIR_TYPE_LABELS,
  SHARE_TYPE_LABELS,
} from '@/core/utils/display'
import { getAllReferences } from '@/core/faraid/references'
import type { PdfData, PdfShareRow, PdfProperty, PdfReference } from './pdfTypes'

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Extract a serializable PdfData object from engine output and property data.
 * All Fraction objects are converted to pre-formatted strings.
 * No Zustand hooks, no DOM access -- pure data transformation.
 */
export function extractPdfData(
  results: FaraidOutput,
  properties: Property[],
  totalEstateValue: number,
  pieChartImage: string | null,
  barChartImage: string | null,
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
    pieChartImage,
    barChartImage,
    generatedAt: new Date(),
  }
}
