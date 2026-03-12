/**
 * Special Cases Module
 *
 * Handles three important special cases in Islamic inheritance:
 * 1. Umariyyatayn (Two Omari Cases) - mother gets 1/3 of remainder, not 1/3 of estate
 * 2. Mushtarakah (Shared Case) - full siblings blocked in Hanafi when uterine siblings present
 * 3. Kalalah - deceased has no children and no father
 *
 * These run AFTER share assignment and modify the results.
 */

import type { HeirContext } from '@/core/faraid/types'
import type { ShareAssignment } from '@/core/faraid/shares'
import Fraction from 'fraction.js'
import { ONE, ZERO, ONE_THIRD, HALF, QUARTER, ONE_SIXTH } from '@/core/utils/fraction'

// ─────────────────────────────────────────────────────────
// Kalalah Detection
// ─────────────────────────────────────────────────────────

/**
 * Check if the deceased's estate is in a Kalalah state.
 * Kalalah: the deceased has no children (sons/daughters/grandchildren)
 * AND no father (and no grandfather in Hanafi).
 *
 * This affects uterine sibling shares (4:12) and full/consanguine sibling rules (4:176).
 */
export function isKalalah(ctx: HeirContext): boolean {
  return ctx.isKalalah
}

// ─────────────────────────────────────────────────────────
// Special Case Detection
// ─────────────────────────────────────────────────────────

/**
 * Detect which special cases apply to the current heir configuration.
 * Returns an array of detected case names.
 */
export function detectSpecialCases(ctx: HeirContext): string[] {
  const cases: string[] = []

  if (ctx.isKalalah) {
    cases.push('kalalah')
  }

  if (isUmariyyatayn(ctx)) {
    cases.push('umariyyatayn')
  }

  if (isMushtarakah(ctx)) {
    cases.push('mushtarakah')
  }

  return cases
}

// ─────────────────────────────────────────────────────────
// Umariyyatayn (Two Omari Cases)
// ─────────────────────────────────────────────────────────

/**
 * Check if the Umariyyatayn special case applies.
 *
 * Pattern: spouse + mother + father, NO children, NO grandchildren.
 * In Hanafi, father blocks all siblings, so even if siblings are in the input,
 * they are blocked and don't prevent Umariyyatayn.
 *
 * The strict detection: spouse present, mother present, father present,
 * no children, no grandchildren.
 */
function isUmariyyatayn(ctx: HeirContext): boolean {
  const hasSpouse = ctx.husbands > 0 || ctx.wives > 0
  const hasMother = ctx.mothers > 0
  const hasFather = ctx.fathers > 0

  return (
    hasSpouse &&
    hasMother &&
    hasFather &&
    !ctx.hasChildren &&
    !ctx.hasGrandchildren
  )
}

/**
 * Apply Umariyyatayn adjustment to share assignments.
 *
 * Omar's (RA) ruling: mother receives 1/3 of the REMAINDER after spouse's share,
 * not 1/3 of the entire estate. Father takes what remains.
 *
 * Case 1 (husband): husband = 1/2, remainder = 1/2
 *   mother = 1/3 * 1/2 = 1/6, father = 1 - 1/2 - 1/6 = 1/3
 *
 * Case 2 (wife): wife = 1/4, remainder = 3/4
 *   mother = 1/3 * 3/4 = 1/4, father = 1 - 1/4 - 1/4 = 1/2
 */
export function applyUmariyyatayn(
  shares: ShareAssignment[],
  ctx: HeirContext,
): ShareAssignment[] {
  if (!isUmariyyatayn(ctx)) {
    return shares
  }

  // Find spouse share
  const spouseShare = shares.find(
    (s) => s.heirType === 'husband' || s.heirType === 'wife',
  )
  if (!spouseShare) return shares

  // Calculate remainder after spouse
  const remainder = ONE.sub(spouseShare.totalShare)

  // Mother gets 1/3 of remainder
  const motherShare = ONE_THIRD.mul(remainder)

  // Father gets the rest
  const fatherShare = ONE.sub(spouseShare.totalShare).sub(motherShare)

  return shares.map((s) => {
    if (s.heirType === 'mother') {
      return {
        ...s,
        totalShare: motherShare,
        sharePerHeir: motherShare,
        explanation: `Umariyyatayn: per Omar's (RA) ruling, mother receives 1/3 of remainder after spouse's share (${remainder.toFraction()}) = ${motherShare.toFraction()}`,
        notes: [
          ...(s.notes || []),
          "Umariyyatayn: per Omar's (RA) ruling, mother receives 1/3 of remainder after spouse's share, not 1/3 of the entire estate",
        ],
      }
    }
    if (s.heirType === 'father') {
      return {
        ...s,
        totalShare: fatherShare,
        sharePerHeir: fatherShare,
        shareType: 'fard_and_asaba' as const,
        explanation: `Umariyyatayn: father receives remainder after spouse (${spouseShare.totalShare.toFraction()}) and mother (${motherShare.toFraction()}) = ${fatherShare.toFraction()}`,
        notes: [
          ...(s.notes || []),
          'Umariyyatayn: father takes the remainder after spouse and mother',
        ],
      }
    }
    return s
  })
}

// ─────────────────────────────────────────────────────────
// Mushtarakah (Shared Case)
// ─────────────────────────────────────────────────────────

/**
 * Check if the Mushtarakah special case applies.
 *
 * Pattern: husband + mother (or grandmother) + 2+ uterine siblings + full siblings present.
 * In this scenario, under Hanafi jurisprudence, the full siblings get NOTHING because
 * they are Asaba and there is no remainder after fard shares are distributed.
 */
function isMushtarakah(ctx: HeirContext): boolean {
  const hasHusband = ctx.husbands > 0
  const hasMotherOrGrandmother =
    ctx.mothers > 0 || ctx.maternalGrandmothers > 0 || ctx.paternalGrandmothers > 0
  const hasUterineSiblings = ctx.brothersUterine + ctx.sistersUterine >= 2
  const hasFullSiblings = ctx.brothersFull + ctx.sistersFull > 0

  return hasHusband && hasMotherOrGrandmother && hasUterineSiblings && hasFullSiblings
}

/**
 * Apply Mushtarakah adjustment to share assignments.
 *
 * Hanafi ruling: Full siblings get NOTHING.
 * Uterine siblings take their 1/3, husband takes his share, mother takes hers.
 * Full siblings, as Asaba, get only remainder -- which is zero.
 *
 * Output includes a note about the Shafi'i/Maliki alternative where full siblings
 * would share in the uterine siblings' 1/3 portion.
 */
export function applyMushtarakah(
  shares: ShareAssignment[],
  ctx: HeirContext,
): ShareAssignment[] {
  if (!isMushtarakah(ctx)) {
    return shares
  }

  return shares.map((s) => {
    if (s.heirType === 'brother_full' || s.heirType === 'sister_full') {
      return {
        ...s,
        totalShare: ZERO,
        sharePerHeir: ZERO,
        shareType: 'asaba' as const,
        explanation:
          'Mushtarakah: full siblings receive nothing as Asaba with no remainder (Hanafi)',
        notes: [
          ...(s.notes || []),
          "Shafi'i and Maliki alternative: full siblings share in the uterine siblings' 1/3 portion. This tool follows the Hanafi ruling.",
        ],
      }
    }

    // Add note to uterine siblings about the alternative opinion
    if (s.heirType === 'brother_uterine' || s.heirType === 'sister_uterine') {
      return {
        ...s,
        notes: [
          ...(s.notes || []),
          "Mushtarakah case: Shafi'i and Maliki alternative would have full siblings share in this 1/3 portion. This tool follows the Hanafi ruling.",
        ],
      }
    }

    return s
  })
}
