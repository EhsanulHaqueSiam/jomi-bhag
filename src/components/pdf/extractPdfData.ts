import type { FaraidOutput } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
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
import type { DistributionResult } from '@/core/distribution/types'
import {
  calculateSellSplit,
  calculatePhysicalDivisionCompensation,
  computeSubParcelTargets,
  calculateLandBuyout,
  calculateOwnershipShares,
  calculateIncomeDistribution,
} from '@/core/land/settlement'
import { fromSqft } from '@/core/land/units'
import type { PdfData, PdfShareRow, PdfProperty, PdfReference, PdfMovableAsset, PdfDistribution, PdfDistributionItem, PdfSettlement, PdfSettlementDetail, PdfIndividualDistribution, PdfIndividualHeir } from './pdfTypes'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'
import { getEquilibriumStatus } from '@/core/distribution/algorithm'

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Sanitize text for PDF rendering by stripping characters from Unicode blocks
 * not supported by registered PDF fonts (Inter + Noto Naskh Arabic).
 *
 * Keeps: ASCII (U+0000-U+007F), Latin Extended (U+0080-U+024F), Arabic (U+0600-U+06FF).
 * Strips: Bengali (U+0980-U+09FF), Devanagari, CJK, and all other unsupported scripts.
 *
 * This prevents @react-pdf/renderer from crashing with "Cannot read properties of null
 * (reading 'xCoordinate')" when Inter font's OpenType GPOS engine encounters unsupported glyphs.
 */
export function sanitizeForPdf(str: string): string {
  return str
    .replace(/[^\u0000-\u024F\u0600-\u06FF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
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
      return sanitizeForPdf(asset.name || 'Custom Item')
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
  movableAssets?: MovableAsset[],
  distributionResult?: DistributionResult | null,
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
    nickname: sanitizeForPdf(prop.nickname),
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

  // Extract settlement data from properties with non-null settlement
  const settledProperties = properties.filter((p) => p.settlement != null)
  const settlements: PdfSettlement[] = settledProperties.map((prop) => {
    const settlement = prop.settlement!
    const propValue = computePropertyTotal(prop)
    let detail: PdfSettlementDetail

    switch (settlement.method) {
      case 'sell_split': {
        const effectivePrice = settlement.actualSalePrice ?? propValue
        const payouts = calculateSellSplit(effectivePrice, results.shares)
        detail = {
          method: 'sell_split',
          effectivePrice,
          isOverridden: settlement.actualSalePrice !== null,
          payouts: payouts.map((p) => ({
            heirType: HEIR_TYPE_LABELS[p.heirType],
            amount: p.amount,
          })),
        }
        break
      }
      case 'physical_division': {
        const targets = computeSubParcelTargets(propValue, results.shares)
        const comp = calculatePhysicalDivisionCompensation(
          settlement.subParcels,
          targets,
        )
        const areaUnit = settlement.subParcels[0]?.areaInputUnit ?? 'decimal'
        const division = prop.division ?? 'dhaka'
        detail = {
          method: 'physical_division',
          subParcels: settlement.subParcels.map((sp) => ({
            name: sanitizeForPdf(sp.name),
            area: `${Math.round(fromSqft(sp.areaSqft, areaUnit, division) * 100) / 100} ${areaUnit}`,
            appraisedValue: sp.appraisedValue,
          })),
          totalSubParcelValue: comp.totalSubParcelValue,
          propertyValue: propValue,
          compensation: comp.difference,
        }
        break
      }
      case 'buyout': {
        const buyoutResult = calculateLandBuyout(
          propValue,
          settlement.buyerHeirType,
          results.shares,
          settlement.useInstallments,
          settlement.installmentCount,
        )
        detail = {
          method: 'buyout',
          buyer: HEIR_TYPE_LABELS[settlement.buyerHeirType],
          compensationOwed: buyoutResult.compensationOwed,
          perGroupPayments: buyoutResult.perGroupPayments.map((p) => ({
            heirType: HEIR_TYPE_LABELS[p.heirType],
            amount: p.amount,
          })),
          installmentPlan: buyoutResult.installmentPlan
            ? {
                perInstallment: buyoutResult.installmentPlan.perInstallment,
                count: buyoutResult.installmentPlan.count,
              }
            : null,
        }
        break
      }
      case 'joint_ownership': {
        const ownershipShares = calculateOwnershipShares(results.shares)
        const incomeTypeLabel =
          settlement.incomeType === 'rent' ? 'Rent' : 'Crop Income'
        const incomePeriodLabel =
          settlement.incomePeriod === 'monthly' ? 'Monthly' : 'Yearly'
        let income: {
          type: string
          period: string
          amount: number
          distribution: { heirType: string; amount: number }[]
        } | null = null
        if (
          settlement.incomeAmount !== null &&
          settlement.incomeAmount > 0 &&
          settlement.incomeType !== null &&
          settlement.incomePeriod !== null
        ) {
          const dist = calculateIncomeDistribution(
            settlement.incomeAmount,
            results.shares,
          )
          income = {
            type: incomeTypeLabel,
            period: incomePeriodLabel,
            amount: settlement.incomeAmount,
            distribution: dist.map((d) => ({
              heirType: HEIR_TYPE_LABELS[d.heirType],
              amount: d.amount,
            })),
          }
        }
        detail = {
          method: 'joint_ownership',
          ownershipShares: ownershipShares.map((s) => ({
            heirType: HEIR_TYPE_LABELS[s.heirType],
            percentage: s.percentage,
          })),
          income,
        }
        break
      }
    }

    return {
      propertyName: sanitizeForPdf(prop.nickname),
      propertyValue: propValue,
      detail,
    }
  })

  // Map distribution result to PdfDistribution (optional)
  let distribution: PdfDistribution | undefined
  if (distributionResult) {
    const itemMap = new Map(distributionResult.items.map((item) => [item.id, item]))
    distribution = {
      groups: distributionResult.groups.map((group) => {
        const assignedItems: PdfDistributionItem[] = group.assignedItems
          .map((itemId) => {
            const item = itemMap.get(itemId)
            if (!item) return null
            return {
              label: item.label,
              category: item.category,
              type: item.type,
              value: item.value,
            }
          })
          .filter((item): item is PdfDistributionItem => item !== null)
          .sort((a, b) => b.value - a.value) // sort by value descending

        return {
          heirType: HEIR_TYPE_LABELS[group.heirType],
          count: group.count,
          targetValue: Math.round(group.targetValue),
          assignedItems,
          assignedValue: Math.round(group.assignedValue),
          cashAdjustment: Math.round(group.cashAdjustment),
        }
      }),
      compensations: distributionResult.compensations.map((comp) => ({
        from: HEIR_TYPE_LABELS[comp.fromGroup],
        to: HEIR_TYPE_LABELS[comp.toGroup],
        amount: Math.round(comp.amount),
      })),
      totalEstateValue: distributionResult.totalEstateValue,
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

  // Extract individual distribution data (Phase 14, optional)
  let individualDistribution: PdfIndividualDistribution | undefined
  const indivState = useIndividualDistributionStore.getState()
  if (indivState.hasBeenUsed && indivState.individuals.length > 0) {
    const itemMap = new Map(indivState.items.map((item) => [item.id, item]))

    // Group individuals by heir type
    const heirTypeGroups = new Map<string, PdfIndividualHeir[]>()
    let totalBalanced = 0

    for (const individual of indivState.individuals) {
      const heirTypeLabel = HEIR_TYPE_LABELS[individual.heirType]
      const customName = indivState.customNames[individual.id]
      const displayName = customName || individual.displayName
      const subtitle = customName ? individual.displayName : null

      const equilibrium = getEquilibriumStatus(individual.assignedValue, individual.targetValue)
      if (equilibrium.status === 'balanced') totalBalanced++

      // Map assigned item IDs to PdfDistributionItem objects
      const items: PdfDistributionItem[] = individual.assignedItems
        .map((itemId) => {
          const item = itemMap.get(itemId)
          if (!item) return null
          return {
            label: item.label,
            category: item.category,
            type: item.type,
            value: item.value,
          }
        })
        .filter((item): item is PdfDistributionItem => item !== null)
        .sort((a, b) => b.value - a.value)

      const heir: PdfIndividualHeir = {
        id: individual.id,
        displayName: sanitizeForPdf(displayName),
        subtitle: subtitle ? sanitizeForPdf(subtitle) : null,
        heirType: heirTypeLabel,
        targetValue: Math.round(individual.targetValue),
        assignedValue: Math.round(individual.assignedValue),
        equilibriumStatus: equilibrium.status,
        equilibriumPercentage: equilibrium.percentage,
        items,
        cashAdjustment: Math.round(individual.cashAdjustment),
      }

      if (!heirTypeGroups.has(heirTypeLabel)) {
        heirTypeGroups.set(heirTypeLabel, [])
      }
      heirTypeGroups.get(heirTypeLabel)!.push(heir)
    }

    const heirsByType = Array.from(heirTypeGroups.entries()).map(([typeName, heirs]) => ({
      typeName,
      heirs,
    }))

    const compensations = indivState.compensations.map((comp) => ({
      fromName: sanitizeForPdf(indivState.customNames[comp.fromId] || comp.fromName),
      toName: sanitizeForPdf(indivState.customNames[comp.toId] || comp.toName),
      amount: Math.round(comp.amount),
    }))

    individualDistribution = {
      heirsByType,
      compensations,
      totalBalanced,
      totalHeirs: indivState.individuals.length,
      totalEstateValue: totalEstateValue,
      qurahUsed: indivState.qurahUsed,
    }
  }

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
    distribution,
    ...(settlements.length > 0 ? { settlements } : {}),
    individualDistribution,
    generatedAt: new Date(),
  }
}
