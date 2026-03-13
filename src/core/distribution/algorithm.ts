import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { MovableAsset } from '@/core/assets/types'
import { computeAssetValue } from '@/core/assets/valuation'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import type {
  DistributionItem,
  EquilibriumResult,
  DistributionGroup,
  DistributionResult,
} from '@/core/distribution/types'
import type { CashCompensation } from '@/core/land/division'

// --- Asset Label Helpers ---

function getAssetLabel(asset: MovableAsset): string {
  switch (asset.category) {
    case 'gold_silver': {
      const metal = asset.metalType === 'gold' ? 'Gold' : 'Silver'
      return `${metal} ${asset.weight} ${asset.weightUnit} ${asset.purity}`
    }
    case 'cash':
      return 'Cash'
    case 'vehicle':
      return asset.description || asset.vehicleType
    case 'jewelry':
      return 'Jewelry'
    case 'furniture':
      return 'Furniture'
    case 'livestock':
      return `${asset.livestockType} x${asset.count}`
    case 'custom':
      return asset.name || 'Custom Asset'
  }
}

// --- Core Functions ---

/**
 * Convert Property[] and MovableAsset[] into a unified DistributionItem[].
 */
export function buildDistributionItems(
  properties: Property[],
  movableAssets: MovableAsset[],
): DistributionItem[] {
  const propertyItems: DistributionItem[] = properties.map((p, i) => ({
    id: p.id,
    type: 'property' as const,
    category: p.type ?? 'land',
    label: p.nickname || `Property #${i + 1}`,
    value: computePropertyTotal(p),
  }))

  const assetItems: DistributionItem[] = movableAssets.map((a) => ({
    id: a.id,
    type: 'movable' as const,
    category: a.category,
    label: getAssetLabel(a),
    value: computeAssetValue(a),
  }))

  return [...propertyItems, ...assetItems]
}

/**
 * Compute equilibrium status for a group's assigned vs target value.
 * balanced = within +/-2%, close = within +/-5%, off = beyond +/-5%.
 */
export function getEquilibriumStatus(
  assignedValue: number,
  targetValue: number,
): EquilibriumResult {
  if (targetValue === 0) {
    return { status: 'balanced', percentage: 100, delta: 0 }
  }

  const rawPercentage = (assignedValue / targetValue) * 100
  const percentage = Math.round(rawPercentage * 100) / 100 // 2 decimal places
  const deviation = Math.abs(percentage - 100)
  const delta = assignedValue - targetValue

  if (deviation <= 2) return { status: 'balanced', percentage, delta }
  if (deviation <= 5) return { status: 'close', percentage, delta }
  return { status: 'off', percentage, delta }
}

/**
 * Smart shuffle: distribute items weighted toward equilibrium.
 * Sort items by value descending; for each, pick randomly from top candidates
 * (groups within 80% of best remaining gap). Returns new groups array.
 */
export function smartShuffle(
  items: DistributionItem[],
  groups: DistributionGroup[],
): DistributionGroup[] {
  // Build item value lookup
  const itemMap = new Map(items.map((i) => [i.id, i]))

  // Sort items by value descending (largest first)
  const sorted = [...items].sort((a, b) => b.value - a.value)

  // Reset all group assignments
  const newGroups: DistributionGroup[] = groups.map((g) => ({
    ...g,
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: 0,
  }))

  // Track current assigned value per group
  const groupValues = new Map<HeirType, number>()
  for (const g of newGroups) {
    groupValues.set(g.heirType, 0)
  }

  // For each item, find groups with most remaining capacity, pick randomly among top
  for (const item of sorted) {
    const candidates = newGroups
      .map((g) => ({
        heirType: g.heirType,
        gap: g.targetValue - (groupValues.get(g.heirType) ?? 0),
      }))
      .sort((a, b) => b.gap - a.gap)

    const bestGap = candidates[0].gap
    // Pick randomly from candidates within 80% of best gap
    const threshold = bestGap * 0.8
    const topCandidates = candidates.filter((c) => c.gap >= threshold)

    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)]

    // Assign item to chosen group
    const group = newGroups.find((g) => g.heirType === chosen.heirType)!
    group.assignedItems.push(item.id)
    groupValues.set(chosen.heirType, (groupValues.get(chosen.heirType) ?? 0) + item.value)
  }

  // Recalculate assignedValue and cashAdjustment for all groups
  for (const group of newGroups) {
    group.assignedValue = group.assignedItems.reduce((sum, id) => {
      const item = itemMap.get(id)
      return sum + (item ? item.value : 0)
    }, 0)
    group.cashAdjustment = Math.round(group.assignedValue - group.targetValue)
  }

  return newGroups
}

/**
 * Move an item from one group to another. Returns new groups array (immutable).
 * If itemId not found in source group, returns original groups unchanged.
 */
export function moveItem(
  groups: DistributionGroup[],
  items: DistributionItem[],
  itemId: string,
  fromHeirType: HeirType,
  toHeirType: HeirType,
): DistributionGroup[] {
  const fromGroup = groups.find((g) => g.heirType === fromHeirType)
  const toGroup = groups.find((g) => g.heirType === toHeirType)

  if (!fromGroup || !toGroup) return groups
  if (!fromGroup.assignedItems.includes(itemId)) return groups

  const itemMap = new Map(items.map((i) => [i.id, i]))

  // Create new groups array (deep copy)
  const newGroups = groups.map((g) => ({
    ...g,
    assignedItems: [...g.assignedItems],
  }))

  const newFrom = newGroups.find((g) => g.heirType === fromHeirType)!
  const newTo = newGroups.find((g) => g.heirType === toHeirType)!

  // Remove from source
  newFrom.assignedItems = newFrom.assignedItems.filter((id) => id !== itemId)

  // Add to target
  newTo.assignedItems.push(itemId)

  // Recalculate assignedValue and cashAdjustment for ALL groups
  for (const group of newGroups) {
    group.assignedValue = group.assignedItems.reduce((sum, id) => {
      const item = itemMap.get(id)
      return sum + (item ? item.value : 0)
    }, 0)
    group.cashAdjustment = Math.round(group.assignedValue - group.targetValue)
  }

  return newGroups
}

/**
 * Calculate cash compensation pairs between overfilled and underfilled groups.
 * Same pattern as Phase 9's calculateCompensations.
 */
export function calculateDistributionCompensations(
  groups: DistributionGroup[],
): CashCompensation[] {
  const compensations: CashCompensation[] = []

  // Work with copies to avoid mutation
  const surpluses = groups.map((g) => ({
    heirType: g.heirType,
    remaining: g.cashAdjustment,
  }))

  const overfilled = surpluses.filter((s) => s.remaining > 0)
  const underfilled = surpluses.filter((s) => s.remaining < 0)

  for (const over of overfilled) {
    for (const under of underfilled) {
      if (over.remaining <= 0) break
      if (under.remaining >= 0) continue

      const amount = Math.min(over.remaining, Math.abs(under.remaining))
      if (amount > 0) {
        compensations.push({
          fromGroup: over.heirType,
          toGroup: under.heirType,
          amount,
        })
        over.remaining -= amount
        under.remaining += amount
      }
    }
  }

  return compensations
}

/**
 * Initialize a complete distribution from source data.
 * Builds items, creates groups from shares, runs smartShuffle.
 */
export function initializeDistribution(
  properties: Property[],
  movableAssets: MovableAsset[],
  shares: ShareResult[],
  totalEstateValue: number,
): DistributionResult {
  const items = buildDistributionItems(properties, movableAssets)

  // Create groups from active (non-blocked) shares
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')
  const groups: DistributionGroup[] = activeShares.map((share) => ({
    heirType: share.heirType,
    label: HEIR_TYPE_LABELS[share.heirType],
    count: share.count,
    targetValue: Math.round(share.totalShare.valueOf() * totalEstateValue),
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: 0,
  }))

  // Run smart shuffle for initial assignment
  const shuffledGroups = smartShuffle(items, groups)

  // Calculate compensations
  const compensations = calculateDistributionCompensations(shuffledGroups)

  return {
    groups: shuffledGroups,
    items,
    totalEstateValue,
    compensations,
  }
}
