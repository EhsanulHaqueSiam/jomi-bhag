/**
 * Fixed Share (Fard) Assignment Module
 *
 * Assigns Quranic shares to Dhawul Furud heirs based on conditions
 * from the declarative rule table. Runs AFTER blocking (Hajb).
 *
 * Share assignment consumes:
 * - Active heirs (after blocking)
 * - HeirContext (for predicate evaluation)
 * - Reduction info from Hajb Nuqsan
 * - Rule table from src/data/faraid-rules.ts
 */

import type {
  HeirType,
  HeirInput,
  HeirContext,
  FaraidInput,
  ShareCondition,
} from '@/core/faraid/types'
import type { ReductionInfo } from '@/core/faraid/blocking'
import Fraction from 'fraction.js'
import { ZERO } from '@/core/utils/fraction'
import { FARAID_RULES } from '@/data/faraid-rules'

// ─────────────────────────────────────────────────────────
// HeirContext Builder
// ─────────────────────────────────────────────────────────

/**
 * Build a HeirContext from FaraidInput for predicate evaluation.
 * Converts the heir list into a flat object with boolean flags and counts.
 */
export function buildHeirContext(input: FaraidInput): HeirContext {
  const countOf = (type: HeirType): number => {
    const heir = input.heirs.find((h) => h.type === type)
    return heir ? heir.count : 0
  }

  const sons = countOf('son')
  const daughters = countOf('daughter')
  const sonsOfSon = countOf('son_of_son')
  const daughtersOfSon = countOf('daughter_of_son')
  const fathers = countOf('father')
  const paternalGrandfathers = countOf('paternal_grandfather')
  const mothers = countOf('mother')
  const brothersFull = countOf('brother_full')
  const brothersConsanguine = countOf('brother_consanguine')
  const brothersUterine = countOf('brother_uterine')
  const sistersFull = countOf('sister_full')
  const sistersConsanguine = countOf('sister_consanguine')
  const sistersUterine = countOf('sister_uterine')

  const hasChildren = sons > 0 || daughters > 0
  const hasGrandchildren = sonsOfSon > 0 || daughtersOfSon > 0
  const hasFather = fathers > 0
  const hasGrandfather = paternalGrandfathers > 0

  const siblingCount =
    brothersFull +
    brothersConsanguine +
    brothersUterine +
    sistersFull +
    sistersConsanguine +
    sistersUterine

  return {
    deceasedGender: input.deceasedGender,
    husbands: countOf('husband'),
    wives: countOf('wife'),
    sons,
    daughters,
    sonsOfSon,
    daughtersOfSon,
    fathers,
    paternalGrandfathers,
    mothers,
    paternalGrandmothers: countOf('paternal_grandmother'),
    maternalGrandmothers: countOf('maternal_grandmother'),
    brothersFull,
    brothersConsanguine,
    brothersUterine,
    sistersFull,
    sistersConsanguine,
    sistersUterine,
    hasChildren,
    hasGrandchildren,
    hasSons: sons > 0,
    hasDaughters: daughters > 0,
    hasFather,
    hasMother: mothers > 0,
    hasGrandfather,
    hasSiblings: siblingCount > 0,
    siblingCount,
    isKalalah: !hasChildren && !hasGrandchildren && !hasFather && !hasGrandfather,
  }
}

// ─────────────────────────────────────────────────────────
// Share Assignment Types
// ─────────────────────────────────────────────────────────

/** Result of share assignment for a single heir group. */
export interface ShareAssignment {
  heirType: HeirType
  count: number
  sharePerHeir: Fraction
  totalShare: Fraction
  shareType: 'fard' | 'asaba' | 'fard_and_asaba'
  explanation: string
  quranRef?: string
  hadithRef?: string
  notes?: string[]
}

// ─────────────────────────────────────────────────────────
// Fixed Share Assignment
// ─────────────────────────────────────────────────────────

/**
 * Assign fixed (fard) shares to active heirs using the declarative rule table.
 *
 * For each heir:
 * 1. Look up their FaraidRule
 * 2. Evaluate conditions in order (first match wins)
 * 3. Apply any Hajb Nuqsan reductions
 * 4. Handle polygamy (wife share divided among all wives)
 * 5. Mark Asaba heirs (they get remainder in Plan 03)
 *
 * @returns ShareAssignment[] with per-heir fractions (NOT yet adjusted for Awl/Radd)
 */
export function assignFixedShares(
  activeHeirs: HeirInput[],
  ctx: HeirContext,
  reductions: ReductionInfo[],
): ShareAssignment[] {
  const assignments: ShareAssignment[] = []

  for (const heir of activeHeirs) {
    const rule = FARAID_RULES.find((r) => r.heirType === heir.type)
    if (!rule) continue

    // Find first matching condition
    let matchedCondition: ShareCondition | undefined
    for (const condition of rule.conditions) {
      if (condition.predicate(ctx)) {
        matchedCondition = condition
        break
      }
    }

    if (!matchedCondition) continue

    let share = matchedCondition.share
    let explanation = matchedCondition.when
    const notes: string[] = []

    // Check for Hajb Nuqsan reduction
    const reduction = reductions.find((r) => r.heirType === heir.type)
    if (reduction) {
      share = reduction.to
      explanation += ` (reduced from ${reduction.from.toFraction()} to ${reduction.to.toFraction()}: ${reduction.reason})`
      notes.push(`Hajb Nuqsan: ${reduction.reason}`)
    }

    // Handle Asaba heirs (share = ZERO means residuary)
    if (share.equals(ZERO)) {
      assignments.push({
        heirType: heir.type,
        count: heir.count,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: rule.shareType === 'asaba' ? 'asaba' : 'fard_and_asaba',
        explanation,
        quranRef: rule.quranRef,
        hadithRef: rule.hadithRef,
        notes: notes.length > 0 ? notes : undefined,
      })
      continue
    }

    // Handle polygamy: wife share divided equally among all wives
    let sharePerHeir: Fraction
    let totalShare: Fraction

    if (heir.type === 'wife' && heir.count > 1) {
      // Total wife share is the matched share (1/4 or 1/8)
      // Each wife gets an equal portion
      totalShare = share
      sharePerHeir = share.div(heir.count)
      notes.push(`${heir.count} wives share the ${share.toFraction()} equally`)
    } else if (heir.count > 1 && (heir.type === 'daughter' || heir.type === 'daughter_of_son' ||
      heir.type === 'sister_full' || heir.type === 'sister_consanguine')) {
      // Multiple daughters/sisters share their collective share
      totalShare = share
      sharePerHeir = share.div(heir.count)
    } else {
      totalShare = share
      sharePerHeir = share
    }

    assignments.push({
      heirType: heir.type,
      count: heir.count,
      sharePerHeir,
      totalShare,
      shareType: rule.shareType === 'asaba' ? 'asaba' : 'fard',
      explanation,
      quranRef: rule.quranRef,
      hadithRef: rule.hadithRef,
      notes: notes.length > 0 ? notes : undefined,
    })
  }

  return assignments
}
