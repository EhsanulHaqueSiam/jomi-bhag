/**
 * MFLO Section 4: Orphaned Grandchildren Per Stirpes Calculation
 *
 * "In the event of death of any son or daughter of the propositus before
 * the opening of succession, the children of such son or daughter, if any,
 * living at the time the succession opens, shall per stirpes receive a share
 * equivalent to the share which such son or daughter would have received if alive."
 *
 * This module is an OPT-IN toggle. When mfloEnabled=false, pure Hanafi rules apply
 * (sons block grandsons). When mfloEnabled=true, orphaned grandchildren receive
 * their predeceased parent's share.
 *
 * Per locked decision: "MFLO Section 4 applied -- this modifies classical Faraid rules"
 */

import type {
  FaraidInput,
  HeirContext,
  HeirInput,
  CalculationStep,
} from '@/core/faraid/types'
import type { ShareAssignment } from '@/core/faraid/shares'
import Fraction from 'fraction.js'

/**
 * Apply MFLO Section 4: orphaned grandchildren per stirpes calculation.
 *
 * @param input - The full Faraid input including predeceasedChildren
 * @param ctx - The heir context
 * @returns null if MFLO not applicable, otherwise the MFLO shares and explanation
 */
export function applyMFLO(
  input: FaraidInput,
  ctx: HeirContext,
): {
  modifiedHeirs: HeirInput[]
  mfloShares: ShareAssignment[]
  explanation: CalculationStep
} | null {
  void ctx

  // MFLO must be explicitly enabled
  if (!input.mfloEnabled) {
    return null
  }

  // Must have predeceased children with living children
  if (
    !input.predeceasedChildren ||
    input.predeceasedChildren.length === 0
  ) {
    return null
  }

  // Filter to predeceased children who actually have living children
  const applicable = input.predeceasedChildren.filter(
    (pc) => pc.livingChildren.length > 0,
  )
  if (applicable.length === 0) {
    return null
  }

  // Calculate what each predeceased child would have received if alive
  // Total "children" = living children + predeceased children count
  const livingChildHeirs = input.heirs.filter(
    (h) => h.type === 'son' || h.type === 'daughter',
  )

  let totalMales = 0
  let totalFemales = 0

  // Count living children
  for (const heir of livingChildHeirs) {
    if (heir.type === 'son') totalMales += heir.count
    if (heir.type === 'daughter') totalFemales += heir.count
  }

  // Count predeceased children as if alive
  for (const pc of applicable) {
    if (pc.gender === 'male') totalMales++
    if (pc.gender === 'female') totalFemales++
  }

  // Total parts: males get 2x, females get 1x
  const totalParts = totalMales * 2 + totalFemales * 1

  // Remainder for children (after spouse, parents, etc.)
  // For simplicity, calculate the hypothetical share of the predeceased child
  // based on the total parts among all children (as if all were alive)
  // This is the portion of the ESTATE available to children
  // We model this as: predeceased child's share = (their parts / total parts) * childRemainder
  // where childRemainder is whatever sons/daughters would collectively receive

  // For now, we calculate each predeceased child's fractional share of the children's pool
  const mfloShares: ShareAssignment[] = []
  const mfloDetails: string[] = []

  for (const pc of applicable) {
    const pcParts = pc.gender === 'male' ? 2 : 1
    // This is the fraction of children's pool this predeceased child would get
    const pcPoolShare = new Fraction(pcParts, totalParts)

    // Distribute this share per stirpes to their living children
    const gcMales = pc.livingChildren.filter(
      (c) => c.type === 'son_of_son',
    )
    const gcFemales = pc.livingChildren.filter(
      (c) => c.type === 'daughter_of_son',
    )
    const gcMaleCount = gcMales.reduce((sum, c) => sum + c.count, 0)
    const gcFemaleCount = gcFemales.reduce((sum, c) => sum + c.count, 0)
    const gcTotalParts = gcMaleCount * 2 + gcFemaleCount * 1

    if (gcTotalParts === 0) continue

    // Each grandchild gets their share of the predeceased parent's share
    // This is relative to the children's pool, not the total estate
    // The engine will apply this as a fraction of whatever children collectively receive
    for (const gc of pc.livingChildren) {
      const childParts =
        gc.type === 'son_of_son' ? gc.count * 2 : gc.count * 1
      const gcShare = pcPoolShare.mul(new Fraction(childParts, gcTotalParts))
      const gcSharePerHeir = gcShare.div(gc.count)

      mfloShares.push({
        heirType: gc.type,
        count: gc.count,
        sharePerHeir: gcSharePerHeir,
        totalShare: gcShare,
        shareType: 'asaba',
        explanation: `MFLO Section 4: inherits per stirpes share of predeceased ${pc.gender === 'male' ? 'father' : 'mother'}`,
        quranRef: '4:11',
        notes: [
          'MFLO Section 4 applied -- this modifies classical Faraid rules',
          `Predeceased ${pc.gender === 'male' ? 'son' : 'daughter'} would have received ${pcPoolShare.toFraction()} of children's share`,
        ],
      })

      mfloDetails.push(
        `${gc.type} (${gc.count}): ${gcShare.toFraction()} of children's pool from predeceased ${pc.gender}`,
      )
    }
  }

  if (mfloShares.length === 0) {
    return null
  }

  const explanation: CalculationStep = {
    step: 0,
    description: 'MFLO Section 4 Applied',
    detail:
      'MFLO Section 4 applied -- this modifies classical Faraid rules. ' +
      `Orphaned grandchildren inherit per stirpes: ${mfloDetails.join('; ')}. ` +
      'Under pure Faraid, these grandchildren would be blocked by living sons. ' +
      'MFLO overrides this to give them their predeceased parent\'s share.',
  }

  return {
    modifiedHeirs: input.heirs,
    mfloShares,
    explanation,
  }
}
