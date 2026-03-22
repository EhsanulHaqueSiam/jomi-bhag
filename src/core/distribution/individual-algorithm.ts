import type { DistributionItem, DistributionGroup } from '@/core/distribution/types'
import type {
  IndividualColumn,
  IndividualCompensation,
  IndividualDistributionResult,
} from '@/core/distribution/individual-types'
import { COMPENSATION_THRESHOLD } from '@/core/distribution/individual-types'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import type { WizardState } from '@/types/wizard'
import { computePropertyTotal } from '@/core/land/types'
import { computeAssetValue } from '@/core/assets/valuation'

const SPLIT_ITEM_SEPARATOR = '__split__'

export function createSplitItemId(parentId: string, index: number): string {
  return `${parentId}${SPLIT_ITEM_SEPARATOR}${index + 1}_${crypto.randomUUID()}`
}

export function getSplitParentIdFromItemId(itemId: string): string | null {
  const splitIndex = itemId.indexOf(SPLIT_ITEM_SEPARATOR)
  if (splitIndex <= 0) return null
  return itemId.slice(0, splitIndex)
}

/**
 * Expand each DistributionGroup into per-individual IndividualColumn objects.
 * E.g. group {heirType:'son', count:3, targetValue:600000} becomes
 * son_0 (200000), son_1 (200000), son_2 (200000).
 */
export function expandGroupsToIndividuals(
  groups: DistributionGroup[],
  shares: ShareResult[],
): IndividualColumn[] {
  const individuals: IndividualColumn[] = []
  const shareMap = new Map(shares.map((s) => [s.heirType, s]))

  for (const group of groups) {
    const share = shareMap.get(group.heirType)
    const perHeirTarget = Math.round(group.targetValue / group.count)
    const label = HEIR_TYPE_LABELS[group.heirType]

    for (let i = 0; i < group.count; i++) {
      individuals.push({
        id: `${group.heirType}_${i}`,
        heirType: group.heirType,
        index: i,
        displayName: `${label} ${i + 1}`,
        customName: null,
        targetValue: perHeirTarget,
        sharePerHeir: share ? share.sharePerHeir.toFraction() : '0',
        assignedItems: [],
        assignedValue: 0,
        cashAdjustment: -perHeirTarget,
      })
    }
  }

  return individuals
}

/**
 * For a single group's items, distribute among that group's individuals.
 * Sort items by value descending, round-robin assignment.
 */
export function subdivideGroupItems(
  items: DistributionItem[],
  individuals: IndividualColumn[],
  groupHeirType: HeirType,
): IndividualColumn[] {
  const itemMap = new Map(items.map((i) => [i.id, i]))
  const groupIndividuals = individuals.filter((ind) => ind.heirType === groupHeirType)
  const otherIndividuals = individuals.filter((ind) => ind.heirType !== groupHeirType)

  // Sort items by value descending
  const sorted = [...items].sort((a, b) => b.value - a.value)

  // Deep clone group individuals
  const updated = groupIndividuals.map((ind) => ({
    ...ind,
    assignedItems: [...ind.assignedItems],
  }))

  // Round-robin assignment
  let idx = 0
  for (const item of sorted) {
    updated[idx % updated.length].assignedItems.push(item.id)
    idx++
  }

  // Recalculate assignedValue and cashAdjustment
  for (const ind of updated) {
    ind.assignedValue = ind.assignedItems.reduce((sum, id) => {
      const item = itemMap.get(id)
      return sum + (item ? item.value : 0)
    }, 0)
    ind.cashAdjustment = Math.round(ind.assignedValue - ind.targetValue)
  }

  return [...updated, ...otherIndividuals]
}

/**
 * Format area in sqft as a human-readable annotation.
 * Uses sqft as canonical display for split labels.
 */
function formatArea(areaSqft: number): string {
  return `${areaSqft} sqft`
}

/**
 * Split a parcel into sub-parcels with proportional values.
 * Last sub-parcel gets remainder to prevent rounding drift.
 */
export function splitParcel(
  originalItem: DistributionItem,
  splits: { areaSqft: number }[],
  totalAreaSqft: number,
): DistributionItem[] {
  const results: DistributionItem[] = []
  let usedValue = 0

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i]
    const isLast = i === splits.length - 1

    // Last sub-parcel gets remainder to prevent rounding drift
    const value = isLast
      ? originalItem.value - usedValue
      : Math.round((split.areaSqft / totalAreaSqft) * originalItem.value)

    usedValue += value

    results.push({
      id: crypto.randomUUID(),
      type: originalItem.type,
      category: originalItem.category,
      label: `${originalItem.label} (${formatArea(split.areaSqft)})`,
      value,
    })
  }

  return results
}

/**
 * Merge split items back into the original item.
 * Returns the IDs to remove and the restored original.
 */
export function mergeParcel(
  splitItems: DistributionItem[],
  originalItem: DistributionItem,
): { removedIds: string[]; restoredItem: DistributionItem } {
  return {
    removedIds: splitItems.map((item) => item.id),
    restoredItem: { ...originalItem },
  }
}

/**
 * Qurah shuffle for individuals: redistribute ALL items across ALL individuals
 * using smartShuffle-like weighted random (80% threshold of best gap).
 */
export function individualQurahShuffle(
  items: DistributionItem[],
  individuals: IndividualColumn[],
): IndividualColumn[] {
  const itemMap = new Map(items.map((i) => [i.id, i]))

  // Sort items by value descending (largest first)
  const sorted = [...items].sort((a, b) => b.value - a.value)

  // Reset all individual assignments
  const newIndividuals: IndividualColumn[] = individuals.map((ind) => ({
    ...ind,
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: 0,
  }))

  // Track current assigned value per individual
  const indValues = new Map<string, number>()
  for (const ind of newIndividuals) {
    indValues.set(ind.id, 0)
  }

  // For each item, find individuals with most remaining gap, pick randomly among top
  for (const item of sorted) {
    const candidates = newIndividuals
      .map((ind) => ({
        id: ind.id,
        gap: ind.targetValue - (indValues.get(ind.id) ?? 0),
      }))
      .sort((a, b) => b.gap - a.gap)

    const bestGap = candidates[0].gap
    const threshold = bestGap * 0.8
    const topCandidates = candidates.filter((c) => c.gap >= threshold)

    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

    const ind = newIndividuals.find((i) => i.id === chosen.id)!
    ind.assignedItems.push(item.id)
    indValues.set(chosen.id, (indValues.get(chosen.id) ?? 0) + item.value)
  }

  // Recalculate assignedValue and cashAdjustment for all individuals
  for (const ind of newIndividuals) {
    ind.assignedValue = ind.assignedItems.reduce((sum, id) => {
      const item = itemMap.get(id)
      return sum + (item ? item.value : 0)
    }, 0)
    ind.cashAdjustment = Math.round(ind.assignedValue - ind.targetValue)
  }

  return newIndividuals
}

/**
 * Calculate pairwise cash compensations between individuals.
 * Greedy min-transfer algorithm: match largest surplus with largest deficit.
 * Filters out transfers below COMPENSATION_THRESHOLD.
 */
export function calculateIndividualCompensations(
  individuals: IndividualColumn[],
): IndividualCompensation[] {
  const compensations: IndividualCompensation[] = []

  // Build surplus/deficit lists with copies
  const surpluses = individuals
    .filter((ind) => ind.cashAdjustment > 0)
    .map((ind) => ({ id: ind.id, name: ind.customName ?? ind.displayName, remaining: ind.cashAdjustment }))
    .sort((a, b) => b.remaining - a.remaining)

  const deficits = individuals
    .filter((ind) => ind.cashAdjustment < 0)
    .map((ind) => ({ id: ind.id, name: ind.customName ?? ind.displayName, remaining: Math.abs(ind.cashAdjustment) }))
    .sort((a, b) => b.remaining - a.remaining)

  // Greedy matching: largest surplus with largest deficit
  let si = 0
  let di = 0
  while (si < surpluses.length && di < deficits.length) {
    const surplus = surpluses[si]
    const deficit = deficits[di]

    if (surplus.remaining <= 0) { si++; continue }
    if (deficit.remaining <= 0) { di++; continue }

    const amount = Math.min(surplus.remaining, deficit.remaining)

    if (amount >= COMPENSATION_THRESHOLD) {
      compensations.push({
        fromId: surplus.id,
        fromName: surplus.name,
        toId: deficit.id,
        toName: deficit.name,
        amount,
      })
    }

    surplus.remaining -= amount
    deficit.remaining -= amount

    if (surplus.remaining <= 0) si++
    if (deficit.remaining <= 0) di++
  }

  return compensations
}

/**
 * Move an item between individuals (by individual id).
 * Returns new individuals array with recalculated values (immutable).
 */
export function moveIndividualItem(
  individuals: IndividualColumn[],
  items: DistributionItem[],
  itemId: string,
  fromId: string,
  toId: string,
): IndividualColumn[] {
  const fromInd = individuals.find((i) => i.id === fromId)
  const toInd = individuals.find((i) => i.id === toId)

  if (!fromInd || !toInd) return individuals
  if (!fromInd.assignedItems.includes(itemId)) return individuals

  const itemMap = new Map(items.map((i) => [i.id, i]))

  const newIndividuals = individuals.map((ind) => ({
    ...ind,
    assignedItems: [...ind.assignedItems],
  }))

  const newFrom = newIndividuals.find((i) => i.id === fromId)!
  const newTo = newIndividuals.find((i) => i.id === toId)!

  // Remove from source
  newFrom.assignedItems = newFrom.assignedItems.filter((id) => id !== itemId)

  // Add to target
  newTo.assignedItems.push(itemId)

  // Recalculate assignedValue and cashAdjustment for ALL individuals
  for (const ind of newIndividuals) {
    ind.assignedValue = ind.assignedItems.reduce((sum, id) => {
      const item = itemMap.get(id)
      return sum + (item ? item.value : 0)
    }, 0)
    ind.cashAdjustment = Math.round(ind.assignedValue - ind.targetValue)
  }

  return newIndividuals
}

/**
 * Compute fingerprint that includes property IDs+values, movable asset IDs+values,
 * AND heir type counts so heir changes invalidate state.
 */
export function computeIndividualFingerprint(
  wizardState: WizardState,
): string {
  return JSON.stringify({
    properties: (wizardState.properties ?? []).map((p) => ({
      id: p.id,
      value: computePropertyTotal(p),
    })),
    movableAssets: (wizardState.movableAssets ?? []).map((a) => ({
      id: a.id,
      value: computeAssetValue(a),
    })),
    heirs: {
      sonCount: wizardState.sonCount,
      daughterCount: wizardState.daughterCount,
      wifeCount: wizardState.wifeCount,
      husbandPresent: wizardState.husbandPresent,
      brotherFullCount: wizardState.brotherFullCount,
      brotherConsanguineCount: wizardState.brotherConsanguineCount,
      brotherUterineCount: wizardState.brotherUterineCount,
      sisterFullCount: wizardState.sisterFullCount,
      sisterConsanguineCount: wizardState.sisterConsanguineCount,
      sisterUterineCount: wizardState.sisterUterineCount,
    },
  })
}

/**
 * Orchestrator: expand groups to individuals, subdivide each group's items,
 * calculate compensations. Returns complete IndividualDistributionResult.
 */
export function initializeIndividualDistribution(
  distributionResult: { groups: DistributionGroup[]; items: DistributionItem[]; totalEstateValue: number },
  shares: ShareResult[],
): IndividualDistributionResult {
  const { groups, items, totalEstateValue } = distributionResult

  // Step 1: expand groups to individuals
  let individuals = expandGroupsToIndividuals(groups, shares)

  // Step 2: for each group, subdivide its assigned items among its individuals
  const itemMap = new Map(items.map((i) => [i.id, i]))
  for (const group of groups) {
    const groupItems = group.assignedItems
      .map((id) => itemMap.get(id))
      .filter((item): item is DistributionItem => item !== undefined)

    if (groupItems.length > 0) {
      individuals = subdivideGroupItems(groupItems, individuals, group.heirType)
    }
  }

  // Step 3: calculate compensations
  const compensations = calculateIndividualCompensations(individuals)

  return {
    individuals,
    items,
    compensations,
    totalEstateValue,
  }
}
