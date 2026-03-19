/**
 * Asaba (Residuary) Distribution Module
 *
 * Distributes the remainder of the estate after fixed shares are assigned.
 * Implements three types of Asaba:
 * - bi-nafsihi (by himself): male heirs in priority order
 * - bi-ghayrihi (through another): female heirs who become residuary with their male counterparts
 * - ma'a ghayrihi (along with another): sisters who become residuary with daughters
 *
 * Reference: Quran 4:11 "for the male, twice the share of the female"
 */

import type {
  HeirType,
  HeirInput,
  HeirContext,
  AsabaType,
} from '@/core/faraid/types'
import type { ShareAssignment } from '@/core/faraid/shares'
import Fraction from 'fraction.js'
import { ONE, ZERO, sumFractions } from '@/core/utils/fraction'

// ─────────────────────────────────────────────────────────
// Asaba Classification
// ─────────────────────────────────────────────────────────

/** Asaba classification result with type and priority ranking. */
export interface AsabaClassification {
  type: AsabaType
  priority: number
}

/**
 * Asaba bi-nafsihi priority order (lower number = higher priority).
 * Only male heirs can be Asaba bi-nafsihi.
 */
const ASABA_BI_NAFSIHI_PRIORITY: Partial<Record<HeirType, number>> = {
  son: 1,
  son_of_son: 2,
  father: 3,
  paternal_grandfather: 4,
  brother_full: 5,
  brother_consanguine: 6,
  // son_of_full_brother: 7, son_of_consanguine_brother: 8,
  // full_paternal_uncle: 9, consanguine_paternal_uncle: 10
  // Not modeled in HeirType taxonomy
}

/**
 * Classify whether an heir is Asaba and which type.
 * Returns null if the heir is not Asaba in the current context.
 */
export function classifyAsaba(
  heirType: HeirType,
  ctx: HeirContext,
): AsabaClassification | null {
  // Check Asaba bi-ghayrihi first (female heirs with their male counterparts)
  if (heirType === 'daughter' && ctx.sons > 0) {
    return { type: 'bi_ghayrihi', priority: 1 }
  }
  if (heirType === 'daughter_of_son' && ctx.sonsOfSon > 0) {
    return { type: 'bi_ghayrihi', priority: 2 }
  }
  if (heirType === 'sister_full' && ctx.brothersFull > 0) {
    return { type: 'bi_ghayrihi', priority: 5 }
  }
  if (heirType === 'sister_consanguine' && ctx.brothersConsanguine > 0) {
    return { type: 'bi_ghayrihi', priority: 6 }
  }

  // Check Asaba ma'a ghayrihi (sisters with daughters, no sons/father/grandfather)
  if (
    heirType === 'sister_full' &&
    ctx.brothersFull === 0 &&
    ctx.sons === 0 &&
    ctx.sonsOfSon === 0 &&
    (ctx.daughters > 0 || ctx.daughtersOfSon > 0)
  ) {
    return { type: 'ma_a_ghayrihi', priority: 5 }
  }
  if (
    heirType === 'sister_consanguine' &&
    ctx.brothersConsanguine === 0 &&
    ctx.brothersFull === 0 &&
    ctx.sistersFull === 0 &&
    ctx.sons === 0 &&
    ctx.sonsOfSon === 0 &&
    (ctx.daughters > 0 || ctx.daughtersOfSon > 0)
  ) {
    return { type: 'ma_a_ghayrihi', priority: 6 }
  }

  // Check Asaba bi-nafsihi
  const priority = ASABA_BI_NAFSIHI_PRIORITY[heirType]
  if (priority !== undefined) {
    return { type: 'bi_nafsihi', priority }
  }

  return null
}

// ─────────────────────────────────────────────────────────
// Residuary Distribution
// ─────────────────────────────────────────────────────────

/**
 * Assign residuary (Asaba) shares to heirs after fixed shares.
 *
 * Algorithm:
 * 1. Calculate remainder = ONE - sum of all fixed shares (non-zero shares)
 * 2. If remainder <= 0, return unchanged (Awl will handle)
 * 3. Identify Asaba heirs and classify them
 * 4. Distribute remainder to highest-priority tier:
 *    - bi-nafsihi: highest priority gets entire remainder (split if multiple at same priority)
 *    - bi-ghayrihi: male 2x female (Quran 4:11)
 *    - ma'a ghayrihi: sister(s) take entire remainder
 * 5. Handle father special case: fard_and_asaba
 */
export function assignResiduary(
  activeHeirs: HeirInput[],
  fixedShares: ShareAssignment[],
  ctx: HeirContext,
): ShareAssignment[] {
  // Calculate remainder after fixed (non-zero) shares
  const fixedTotal = sumFractions(
    fixedShares
      .filter((s) => !s.totalShare.equals(ZERO))
      .map((s) => s.totalShare),
  )
  const remainder = ONE.sub(fixedTotal)

  // If no remainder or negative (Awl case), return unchanged
  if (remainder.compare(ZERO) <= 0) {
    return fixedShares
  }

  // Classify all Asaba heirs
  const asabaHeirs: {
    heir: HeirInput
    assignment: ShareAssignment
    classification: AsabaClassification
  }[] = []

  for (const share of fixedShares) {
    if (
      share.shareType === 'asaba' ||
      share.shareType === 'fard_and_asaba'
    ) {
      const heir = activeHeirs.find((h) => h.type === share.heirType)
      if (!heir) continue
      const classification = classifyAsaba(share.heirType, ctx)
      if (classification) {
        asabaHeirs.push({ heir, assignment: share, classification })
      }
    }
  }

  // If no Asaba heirs, return unchanged (Radd will handle)
  if (asabaHeirs.length === 0) {
    return fixedShares
  }

  // Find highest priority (lowest number)
  const highestPriority = Math.min(
    ...asabaHeirs.map((a) => a.classification.priority),
  )

  // Get all Asaba at highest priority tier
  const topTier = asabaHeirs.filter(
    (a) => a.classification.priority === highestPriority,
  )

  // Build the share map for updating
  const shareMap = new Map<HeirType, ShareAssignment>()
  for (const share of fixedShares) {
    shareMap.set(share.heirType, { ...share })
  }

  // Determine actual remainder for Asaba (account for fard_and_asaba fixed portions)
  const asabaRemainder = remainder

  // For fard_and_asaba heirs, remainder is calculated after their fard portion
  // The fard portion is already counted in fixedTotal above
  // So asabaRemainder is already correct

  // Distribute based on the top tier's Asaba type
  const topType = topTier[0].classification.type

  if (topType === 'bi_nafsihi') {
    // All at same priority share equally
    // But first check for bi-ghayrihi at same priority (son + daughter)
    const biGhayrihiAtPriority = asabaHeirs.filter(
      (a) =>
        a.classification.priority === highestPriority &&
        a.classification.type === 'bi_ghayrihi',
    )

    if (biGhayrihiAtPriority.length > 0) {
      // We have both bi-nafsihi and bi-ghayrihi at same priority
      // This means male + female pair (e.g., son + daughter)
      distributeBiGhayrihi(topTier, biGhayrihiAtPriority, asabaRemainder, shareMap)
    } else {
      // Pure bi-nafsihi: split equally among males at same priority
      const totalCount = topTier.reduce((sum, a) => sum + a.heir.count, 0)
      for (const asaba of topTier) {
        const updated = shareMap.get(asaba.heir.type)!
        const heirShare = asabaRemainder.mul(asaba.heir.count).div(totalCount)
        if (updated.shareType === 'fard_and_asaba') {
          // Add remainder to existing fard share
          updated.totalShare = updated.totalShare.add(heirShare)
          updated.sharePerHeir = updated.totalShare.div(asaba.heir.count)
        } else {
          updated.totalShare = heirShare
          updated.sharePerHeir = heirShare.div(asaba.heir.count)
        }
        updated.explanation = `Asaba bi-nafsihi: receives remainder of ${asabaRemainder.toFraction()}`
      }
    }

    // Zero out lower priority Asaba
    for (const asaba of asabaHeirs) {
      if (asaba.classification.priority > highestPriority) {
        const updated = shareMap.get(asaba.heir.type)!
        if (updated.shareType !== 'fard_and_asaba') {
          updated.totalShare = ZERO
          updated.sharePerHeir = ZERO
          updated.explanation = 'No remainder: higher-priority Asaba received the residue'
        }
      }
    }
  } else if (topType === 'bi_ghayrihi') {
    // bi_ghayrihi: male gets 2x female share
    distributeBiGhayrihi(topTier, topTier, asabaRemainder, shareMap)
  } else if (topType === 'ma_a_ghayrihi') {
    // ma'a ghayrihi: sister(s) take entire remainder
    const totalCount = topTier.reduce((sum, a) => sum + a.heir.count, 0)
    for (const asaba of topTier) {
      const updated = shareMap.get(asaba.heir.type)!
      const heirShare = asabaRemainder.mul(asaba.heir.count).div(totalCount)
      updated.totalShare = heirShare
      updated.sharePerHeir = heirShare.div(asaba.heir.count)
      updated.shareType = 'asaba'
      updated.explanation = `Asaba ma'a ghayrihi: takes remainder of ${asabaRemainder.toFraction()} alongside daughters`
    }
  }

  return fixedShares.map((s) => shareMap.get(s.heirType) || s)
}

/**
 * Distribute remainder using bi-ghayrihi rule: male gets 2x female share.
 * Quran 4:11: "for the male, twice the share of the female"
 */
function distributeBiGhayrihi(
  allTier: { heir: HeirInput; assignment: ShareAssignment; classification: AsabaClassification }[],
  _biGhayrihi: { heir: HeirInput; assignment: ShareAssignment; classification: AsabaClassification }[],
  remainder: Fraction,
  shareMap: Map<HeirType, ShareAssignment>,
): void {
  // Separate males (bi-nafsihi) and females (bi-ghayrihi) in the tier
  const males = allTier.filter((a) => a.classification.type === 'bi_nafsihi')
  const females = allTier.filter((a) => a.classification.type === 'bi_ghayrihi')

  // Count parts: each male counts as 2, each female counts as 1
  let totalParts = 0
  for (const m of males) totalParts += m.heir.count * 2
  for (const f of females) totalParts += f.heir.count * 1

  const partValue = remainder.div(totalParts)

  for (const m of males) {
    const updated = shareMap.get(m.heir.type)!
    const heirTotal = partValue.mul(m.heir.count * 2)
    if (updated.shareType === 'fard_and_asaba') {
      updated.totalShare = updated.totalShare.add(heirTotal)
      updated.sharePerHeir = updated.totalShare.div(m.heir.count)
    } else {
      updated.totalShare = heirTotal
      updated.sharePerHeir = heirTotal.div(m.heir.count)
    }
    updated.explanation = `Asaba bi-ghayrihi: male receives 2x female share of remainder ${remainder.toFraction()}`
  }

  for (const f of females) {
    const updated = shareMap.get(f.heir.type)!
    const heirTotal = partValue.mul(f.heir.count)
    if (updated.shareType === 'fard_and_asaba') {
      updated.totalShare = updated.totalShare.add(heirTotal)
      updated.sharePerHeir = updated.totalShare.div(f.heir.count)
    } else {
      updated.totalShare = heirTotal
      updated.sharePerHeir = heirTotal.div(f.heir.count)
    }
    updated.shareType = 'asaba'
    updated.explanation = `Asaba bi-ghayrihi: female receives 1x share of remainder ${remainder.toFraction()}`
  }
}
