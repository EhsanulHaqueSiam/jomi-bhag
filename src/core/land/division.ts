import type { Property } from '@/core/land/types'
import { computePropertyTotal } from '@/core/land/types'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

// --- Types ---

export interface DivisionGroup {
  heirType: HeirType
  label: string
  count: number
  targetValue: number
  assignedProperties: string[]
  assignedValue: number
  cashAdjustment: number
}

export interface CashCompensation {
  fromGroup: HeirType
  toGroup: HeirType
  amount: number
}

export interface DivisionResult {
  groups: DivisionGroup[]
  totalEstateValue: number
  compensations: CashCompensation[]
}

// --- Functions ---

/**
 * Greedy best-fit decreasing: sort properties by value (largest first),
 * assign each to the group most under-filled relative to its target.
 */
export function divideParcels(
  properties: Property[],
  shares: ShareResult[],
  totalEstateValue: number,
): DivisionResult {
  // 1. Create groups from active (non-blocked) shares
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')
  const groups: DivisionGroup[] = activeShares.map((share) => ({
    heirType: share.heirType,
    label: HEIR_TYPE_LABELS[share.heirType],
    count: share.count,
    targetValue: Math.round(share.totalShare.valueOf() * totalEstateValue),
    assignedProperties: [],
    assignedValue: 0,
    cashAdjustment: 0,
  }))

  // 2. Sort properties by value descending (largest first)
  const sorted = [...properties].sort(
    (a, b) => computePropertyTotal(b) - computePropertyTotal(a),
  )

  // 3. For each property, find the group with the largest remaining capacity
  for (const property of sorted) {
    const value = computePropertyTotal(property)

    let bestIdx = 0
    let bestGap = -Infinity
    for (let i = 0; i < groups.length; i++) {
      const gap = groups[i].targetValue - groups[i].assignedValue
      if (gap > bestGap) {
        bestGap = gap
        bestIdx = i
      }
    }

    groups[bestIdx].assignedProperties.push(property.id)
    groups[bestIdx].assignedValue += value
  }

  // 4. Calculate cash adjustments
  for (const group of groups) {
    group.cashAdjustment = Math.round(group.assignedValue - group.targetValue)
  }

  // 5. Calculate compensations
  const compensations = calculateCompensations(groups)

  return { groups, totalEstateValue, compensations }
}

/**
 * Calculate cash compensation pairs between overfilled and underfilled groups.
 * Greedily matches overfilled to underfilled: for each overfilled group,
 * distribute its surplus to underfilled groups.
 */
export function calculateCompensations(
  groups: DivisionGroup[],
): CashCompensation[] {
  const compensations: CashCompensation[] = []

  // Work with copies of cashAdjustment values to avoid mutation
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
 * Qurah shuffle: randomize which heir type gets which pre-computed group.
 * Only shuffles groups with matching targetValue (same share fraction).
 * Groups with unique fractions stay fixed.
 */
export function qurahShuffle(
  groups: DivisionGroup[],
): Map<number, HeirType> {
  // Group indices by target value (groups with same target are interchangeable)
  const byTarget = new Map<number, number[]>()
  for (let i = 0; i < groups.length; i++) {
    const key = groups[i].targetValue
    const arr = byTarget.get(key) ?? []
    arr.push(i)
    byTarget.set(key, arr)
  }

  // For each set of same-target groups, shuffle the heir type assignments
  const assignment = new Map<number, HeirType>()
  for (const indices of byTarget.values()) {
    const heirTypes = indices.map((i) => groups[i].heirType)

    // Fisher-Yates shuffle
    for (let i = heirTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[heirTypes[i], heirTypes[j]] = [heirTypes[j], heirTypes[i]]
    }

    indices.forEach((idx, i) => assignment.set(idx, heirTypes[i]))
  }

  return assignment
}

/**
 * Move a parcel from one group to another. Returns a new DivisionResult (immutable).
 * If propertyId is not found in fromGroup, returns the original result unchanged.
 */
export function moveParcel(
  result: DivisionResult,
  propertyId: string,
  fromHeirType: HeirType,
  toHeirType: HeirType,
  properties: Property[],
): DivisionResult {
  const fromGroup = result.groups.find((g) => g.heirType === fromHeirType)
  const toGroup = result.groups.find((g) => g.heirType === toHeirType)

  if (!fromGroup || !toGroup) return result
  if (!fromGroup.assignedProperties.includes(propertyId)) return result

  // Build property lookup map
  const propertyMap = new Map(properties.map((p) => [p.id, p]))

  // Create new groups array (deep copy)
  const newGroups = result.groups.map((g) => ({
    ...g,
    assignedProperties: [...g.assignedProperties],
  }))

  const newFrom = newGroups.find((g) => g.heirType === fromHeirType)!
  const newTo = newGroups.find((g) => g.heirType === toHeirType)!

  // Remove from source
  newFrom.assignedProperties = newFrom.assignedProperties.filter(
    (id) => id !== propertyId,
  )

  // Add to target
  newTo.assignedProperties.push(propertyId)

  // Recalculate assignedValue for both groups
  for (const group of newGroups) {
    group.assignedValue = group.assignedProperties.reduce((sum, id) => {
      const prop = propertyMap.get(id)
      return sum + (prop ? computePropertyTotal(prop) : 0)
    }, 0)
    group.cashAdjustment = Math.round(group.assignedValue - group.targetValue)
  }

  // Recalculate compensations
  const compensations = calculateCompensations(newGroups)

  return {
    groups: newGroups,
    totalEstateValue: result.totalEstateValue,
    compensations,
  }
}
