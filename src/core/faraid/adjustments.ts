/**
 * Awl (Proportional Reduction) and Radd (Surplus Redistribution) Module
 *
 * Awl: When total fixed shares > 1, proportionally reduce all shares so they sum to exactly 1.
 * Radd: When total fixed shares < 1 and no Asaba exists, redistribute surplus to eligible heirs.
 *
 * Hanafi ruling: Spouses are excluded from Radd.
 */

import type { AdjustmentType, CalculationStep } from '@/core/faraid/types'
import type { ShareAssignment } from '@/core/faraid/shares'
import Fraction from 'fraction.js'
import {
  ONE,
  ZERO,
  sumFractions,
  exceedsOne,
  lessThanOne,
} from '@/core/utils/fraction'

// ─────────────────────────────────────────────────────────
// Spouse Type Detection
// ─────────────────────────────────────────────────────────

function isSpouseType(heirType: string): boolean {
  return heirType === 'husband' || heirType === 'wife'
}

// ─────────────────────────────────────────────────────────
// Awl (Proportional Reduction)
// ─────────────────────────────────────────────────────────

/**
 * Apply Awl (proportional reduction) when fixed shares exceed 1.
 *
 * Algorithm:
 * 1. Find LCM of all share denominators (will be 6, 12, or 24)
 * 2. Convert all shares to this common denominator
 * 3. Sum all numerators -> this is the Awl denominator
 * 4. Each heir's adjusted share = their numerator / Awl denominator
 * 5. Verify: sum of adjusted shares = 1 exactly
 *
 * Per locked decision: "show full explanation -- original shares, why they exceed 100%,
 * proportional reduction with math"
 */
export function applyAwl(shares: ShareAssignment[]): {
  adjusted: ShareAssignment[]
  explanation?: CalculationStep
} {
  const total = sumFractions(shares.map((s) => s.totalShare))

  if (!exceedsOne(total)) {
    return { adjusted: shares }
  }

  // Find the LCM of all share denominators
  // Faraid denominators are always from {2, 3, 4, 6, 8} so LCM will be 6, 12, or 24
  let lcmDenom = new Fraction(1)
  for (const share of shares) {
    if (!share.totalShare.equals(ZERO)) {
      lcmDenom = lcm(lcmDenom, new Fraction(1, Number(share.totalShare.d)))
    }
  }
  // Actually, we need the LCM of the denominators directly
  let commonDenom = 1n
  for (const share of shares) {
    if (!share.totalShare.equals(ZERO)) {
      const d = share.totalShare.d
      commonDenom = lcmBigInt(commonDenom, d)
    }
  }
  const commonDenomNum = Number(commonDenom)

  // Convert each share to common denominator and get numerators
  const numerators: { share: ShareAssignment; numerator: number }[] = []
  let awlDenom = 0

  for (const share of shares) {
    const num = Number(share.totalShare.n) * (commonDenomNum / Number(share.totalShare.d))
    numerators.push({ share, numerator: num })
    awlDenom += num
  }

  // Build original shares description for explanation
  const originalDesc = shares
    .map((s) => `${s.heirType}: ${s.totalShare.toFraction()}`)
    .join(', ')

  // Adjust each share: numerator / awlDenom
  const adjusted = numerators.map(({ share, numerator }) => {
    const adjustedTotal = new Fraction(numerator, awlDenom)
    const adjustedPerHeir = share.count > 1 ? adjustedTotal.div(share.count) : adjustedTotal
    return {
      ...share,
      totalShare: adjustedTotal,
      sharePerHeir: adjustedPerHeir,
      notes: [
        ...(share.notes || []),
        `Awl applied: original share ${share.totalShare.toFraction()} adjusted to ${adjustedTotal.toFraction()}`,
      ],
    }
  })

  const explanation: CalculationStep = {
    step: 0, // Will be renumbered by engine
    description: 'Awl (Proportional Reduction) Applied',
    detail:
      `Total prescribed shares (${originalDesc}) sum to ${total.toFraction()} (${(total.valueOf() * 100).toFixed(1)}%), ` +
      `which exceeds the estate. Base denominator ${commonDenomNum} increases to Awl denominator ${awlDenom}. ` +
      `All shares proportionally reduced so they sum to exactly 1. ` +
      adjusted.map((s) => `${s.heirType}: ${s.totalShare.toFraction()}`).join(', ') +
      '.',
  }

  return { adjusted, explanation }
}

// ─────────────────────────────────────────────────────────
// Radd (Surplus Redistribution)
// ─────────────────────────────────────────────────────────

/**
 * Apply Radd (surplus redistribution) when fixed shares are less than 1 and no Asaba exists.
 *
 * Hanafi ruling: Spouses are EXCLUDED from Radd.
 * Remainder is distributed proportionally to blood-relative fixed-share heirs only.
 * If only spouses exist, remainder goes to Bait-ul-Maal (not redistributed).
 *
 * Per locked decision: "explain Hanafi ruling that spouses are excluded from surplus
 * redistribution, note why"
 */
export function applyRadd(shares: ShareAssignment[]): {
  adjusted: ShareAssignment[]
  explanation?: CalculationStep
} {
  const total = sumFractions(shares.map((s) => s.totalShare))

  if (!lessThanOne(total)) {
    return { adjusted: shares }
  }

  const remainder = ONE.sub(total)

  // Identify Radd-eligible heirs (all non-spouse fixed-share heirs)
  const eligible = shares.filter(
    (s) => !isSpouseType(s.heirType) && !s.totalShare.equals(ZERO),
  )

  // If no Radd-eligible heirs, remainder goes to Bait-ul-Maal
  if (eligible.length === 0) {
    return {
      adjusted: shares,
      explanation: {
        step: 0,
        description: 'Radd Not Applied -- Remainder to Bait-ul-Maal',
        detail:
          `Total shares sum to ${total.toFraction()}. ` +
          `Remainder of ${remainder.toFraction()} cannot be redistributed as only spouse heir(s) exist. ` +
          'Per Hanafi ruling, spouses are excluded from Radd. ' +
          'The remainder would be directed to Bait-ul-Maal (public treasury).',
      },
    }
  }

  // Sum of eligible shares
  const eligibleTotal = sumFractions(eligible.map((s) => s.totalShare))

  // Distribute remainder proportionally
  const adjusted = shares.map((s) => {
    if (isSpouseType(s.heirType)) {
      // Spouse keeps their original share (excluded from Radd)
      return s
    }

    if (s.totalShare.equals(ZERO)) {
      return s
    }

    // Radd portion: remainder * (their_share / sum_eligible_shares)
    const proportion = s.totalShare.div(eligibleTotal)
    const raddPortion = remainder.mul(proportion)
    const newTotal = s.totalShare.add(raddPortion)
    const newPerHeir = s.count > 1 ? newTotal.div(s.count) : newTotal

    return {
      ...s,
      totalShare: newTotal,
      sharePerHeir: newPerHeir,
      notes: [
        ...(s.notes || []),
        `Radd applied: original ${s.totalShare.toFraction()} + surplus ${raddPortion.toFraction()} = ${newTotal.toFraction()}`,
      ],
    }
  })

  const spouseHeirNames = shares
    .filter((s) => isSpouseType(s.heirType))
    .map((s) => s.heirType)
  const spouseNote =
    spouseHeirNames.length > 0
      ? ` ${spouseHeirNames.join(', ')} excluded from Radd (spouse share fixed by Quran).`
      : ''

  const explanation: CalculationStep = {
    step: 0,
    description: 'Radd (Surplus Redistribution) Applied',
    detail:
      `Total fixed shares sum to ${total.toFraction()}, leaving a remainder of ${remainder.toFraction()}. ` +
      `Hanafi ruling: spouses are excluded from surplus redistribution because their shares are fixed by Quranic text and do not increase through Radd.${spouseNote} ` +
      `Remainder distributed proportionally to blood-relative fixed-share heirs: ` +
      adjusted
        .filter((s) => !isSpouseType(s.heirType) && !s.totalShare.equals(ZERO))
        .map((s) => `${s.heirType}: ${s.totalShare.toFraction()}`)
        .join(', ') +
      '.',
  }

  return { adjusted, explanation }
}

// ─────────────────────────────────────────────────────────
// Unified Adjustment
// ─────────────────────────────────────────────────────────

/**
 * Apply the appropriate adjustment (Awl or Radd) based on share totals.
 *
 * - If shares > 1: Awl (proportional reduction)
 * - If shares < 1 AND no Asaba shares: Radd (surplus redistribution)
 * - Otherwise: no adjustment needed
 */
export function applyAdjustment(shares: ShareAssignment[]): {
  adjusted: ShareAssignment[]
  adjustmentType: AdjustmentType
  explanation?: CalculationStep
} {
  const total = sumFractions(shares.map((s) => s.totalShare))

  if (exceedsOne(total)) {
    const { adjusted, explanation } = applyAwl(shares)
    return { adjusted, adjustmentType: 'awl', explanation }
  }

  // Check if any Asaba shares are present (non-zero Asaba means they took remainder)
  const hasAsaba = shares.some(
    (s) => s.shareType === 'asaba' && !s.totalShare.equals(ZERO),
  )

  if (lessThanOne(total) && !hasAsaba) {
    const { adjusted, explanation } = applyRadd(shares)
    return { adjusted, adjustmentType: 'radd', explanation }
  }

  return { adjusted: shares, adjustmentType: 'none' }
}

// ─────────────────────────────────────────────────────────
// Utility: BigInt LCM
// ─────────────────────────────────────────────────────────

function gcdBigInt(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b > 0n) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function lcmBigInt(a: bigint, b: bigint): bigint {
  return (a / gcdBigInt(a, b)) * b
}

function lcm(a: Fraction, b: Fraction): Fraction {
  // LCM of two fractions: lcm(a, b) = |a * b| / gcd(a, b)
  return a.mul(b).div(a.gcd(b))
}
