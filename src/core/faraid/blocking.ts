/**
 * Hajb (Blocking) Module
 *
 * Implements all 16 Hajb Hirman (total blocking) rules and 5 Hajb Nuqsan
 * (partial reduction) rules under Hanafi jurisprudence.
 *
 * Blocking MUST run before share assignment (pipeline requirement).
 * Rules are data-driven for auditability and testability.
 */

import type { HeirType, HeirInput, HeirContext, BlockingRule } from '@/core/faraid/types'
import Fraction from 'fraction.js'
import { HALF, QUARTER, EIGHTH, ONE_THIRD, ONE_SIXTH } from '@/core/utils/fraction'

// ─────────────────────────────────────────────────────────
// Hajb Hirman: 16 Total Blocking Rules (Hanafi)
// ─────────────────────────────────────────────────────────

/**
 * Complete table of 16 total blocking rules under Hanafi jurisprudence.
 * Each rule specifies which heir(s) block which other heir(s) completely.
 */
export const TOTAL_BLOCKING_RULES: BlockingRule[] = [
  // Rule 1: Son blocks son's son (nearer excludes remoter)
  {
    blocker: 'son',
    blocked: 'son_of_son',
    type: 'total',
    note: 'Nearer male descendant excludes remoter',
  },

  // Rule 2: Son's son blocks deeper grandsons (not modeled beyond son_of_son)
  // Included for completeness; no HeirType for son_of_son_of_son exists.

  // Rule 3: Son blocks daughter(s) of son
  {
    blocker: 'son',
    blocked: 'daughter_of_son',
    type: 'total',
    note: 'Son blocks granddaughters',
  },

  // Rule 4: Son's son blocks daughters of deeper grandsons (not modeled)
  // No HeirType for daughter_of_son_of_son exists.

  // Rule 5: Two+ daughters block daughter(s) of son (UNLESS son's son present)
  {
    blocker: 'daughter',
    blocked: 'daughter_of_son',
    type: 'total',
    condition: 'Two or more daughters present AND no son\'s son to make daughter of son Asaba bi-ghayrihi',
    note: 'If son\'s son is present, daughter of son becomes Asaba bi-ghayrihi and is NOT blocked',
  },

  // Rule 6: Father blocks paternal grandfather (nearer excludes remoter)
  {
    blocker: 'father',
    blocked: 'paternal_grandfather',
    type: 'total',
    note: 'Nearer male ascendant excludes remoter',
  },

  // Rule 7: Father blocks all siblings (full, consanguine, uterine)
  {
    blocker: 'father',
    blocked: ['brother_full', 'sister_full', 'brother_consanguine', 'sister_consanguine', 'brother_uterine', 'sister_uterine'],
    type: 'total',
    note: 'Father blocks all siblings',
  },

  // Rule 8: Paternal grandfather blocks all siblings (HANAFI SPECIFIC)
  {
    blocker: 'paternal_grandfather',
    blocked: ['brother_full', 'sister_full', 'brother_consanguine', 'sister_consanguine', 'brother_uterine', 'sister_uterine'],
    type: 'total',
    note: 'Hanafi specific -- Shafi\'i and Maliki schools differ. In those schools, grandfather shares with siblings.',
  },

  // Rule 9: Full brother blocks consanguine brother
  {
    blocker: 'brother_full',
    blocked: 'brother_consanguine',
    type: 'total',
    note: 'Full blood over half-blood (paternal)',
  },

  // Rule 10: Full brother blocks consanguine sister
  {
    blocker: 'brother_full',
    blocked: 'sister_consanguine',
    type: 'total',
    note: 'Full blood over half-blood (paternal)',
  },

  // Rule 11: Full sister as Asaba ma'a ghayrihi blocks consanguine siblings
  {
    blocker: 'sister_full',
    blocked: ['brother_consanguine', 'sister_consanguine'],
    type: 'total',
    condition: 'Full sister becomes Asaba ma\'a ghayrihi with daughters (no sons, no father, no grandfather)',
    note: 'When full sister acts as residuary with daughters, she blocks consanguine siblings',
  },

  // Rule 12: Children/father block uterine siblings
  {
    blocker: ['son', 'daughter', 'son_of_son', 'daughter_of_son', 'father'],
    blocked: ['brother_uterine', 'sister_uterine'],
    type: 'total',
    note: 'Children, grandchildren, or father block maternal half-siblings',
  },

  // Rule 13: Paternal grandfather blocks uterine siblings
  {
    blocker: 'paternal_grandfather',
    blocked: ['brother_uterine', 'sister_uterine'],
    type: 'total',
    note: 'Grandfather blocks maternal half-siblings',
  },

  // Rule 14: Mother blocks maternal grandmother
  {
    blocker: 'mother',
    blocked: 'maternal_grandmother',
    type: 'total',
    note: 'Nearer female ascendant blocks remoter',
  },

  // Rule 15: Mother blocks paternal grandmother
  {
    blocker: 'mother',
    blocked: 'paternal_grandmother',
    type: 'total',
    note: 'Mother blocks all grandmothers',
  },

  // Rule 16: Father blocks paternal grandmother (HANAFI SPECIFIC)
  {
    blocker: 'father',
    blocked: 'paternal_grandmother',
    type: 'total',
    note: 'Hanafi specific -- father blocks his own mother. Other schools may differ.',
  },
]

// ─────────────────────────────────────────────────────────
// Hajb Nuqsan: 5 Partial Reduction Rules
// ─────────────────────────────────────────────────────────

/** A partial reduction rule: heir's share is reduced (not eliminated) by a trigger condition. */
export interface PartialReductionRule {
  heir: HeirType
  originalShare: Fraction
  reducedShare: Fraction
  trigger: string
  predicate: (ctx: HeirContext) => boolean
}

/**
 * Complete table of 5 Hajb Nuqsan rules.
 * These do not remove heirs -- they reduce their share when certain conditions are met.
 */
export const PARTIAL_REDUCTION_RULES: PartialReductionRule[] = [
  // Rule 1: Husband 1/2 -> 1/4 when children/grandchildren exist
  {
    heir: 'husband',
    originalShare: HALF,
    reducedShare: QUARTER,
    trigger: 'Children or grandchildren of deceased',
    predicate: (ctx: HeirContext) => ctx.hasChildren || ctx.hasGrandchildren,
  },

  // Rule 2: Wife 1/4 -> 1/8 when children/grandchildren exist
  {
    heir: 'wife',
    originalShare: QUARTER,
    reducedShare: EIGHTH,
    trigger: 'Children or grandchildren of deceased',
    predicate: (ctx: HeirContext) => ctx.hasChildren || ctx.hasGrandchildren,
  },

  // Rule 3: Mother 1/3 -> 1/6 when children, grandchildren, or 2+ siblings
  {
    heir: 'mother',
    originalShare: ONE_THIRD,
    reducedShare: ONE_SIXTH,
    trigger: 'Children, grandchildren, or 2+ siblings of any type',
    predicate: (ctx: HeirContext) =>
      ctx.hasChildren || ctx.hasGrandchildren || ctx.siblingCount >= 2,
  },

  // Rule 4: Single daughter of son 1/2 -> 1/6 when single daughter present
  {
    heir: 'daughter_of_son',
    originalShare: HALF,
    reducedShare: ONE_SIXTH,
    trigger: 'Presence of single daughter (completing 2/3 together)',
    predicate: (ctx: HeirContext) =>
      ctx.daughters === 1 && ctx.daughtersOfSon >= 1 && ctx.sons === 0 && ctx.sonsOfSon === 0,
  },

  // Rule 5: Single consanguine sister 1/2 -> 1/6 when single full sister present
  {
    heir: 'sister_consanguine',
    originalShare: HALF,
    reducedShare: ONE_SIXTH,
    trigger: 'Presence of single full sister (completing 2/3 together)',
    predicate: (ctx: HeirContext) =>
      ctx.sistersFull === 1 &&
      ctx.sistersConsanguine >= 1 &&
      ctx.brothersFull === 0 &&
      ctx.brothersConsanguine === 0 &&
      ctx.isKalalah,
  },
]

// ─────────────────────────────────────────────────────────
// Blocking Application Logic
// ─────────────────────────────────────────────────────────

/** Information about a blocked heir. */
export interface BlockedInfo {
  heirType: HeirType
  blockedBy: HeirType
  rule: string
}

/** Information about a partial reduction. */
export interface ReductionInfo {
  heirType: HeirType
  from: Fraction
  to: Fraction
  reason: string
}

/** Result of applying Hajb rules. */
export interface HajbResult {
  activeHeirs: HeirInput[]
  blocked: BlockedInfo[]
  reductions: ReductionInfo[]
}

/**
 * Check if a given heir type is present in the heir list.
 */
function isHeirPresent(heirs: HeirInput[], heirType: HeirType): boolean {
  return heirs.some((h) => h.type === heirType && h.count > 0)
}

/**
 * Get the count of a specific heir type from the list.
 */
function getHeirCount(heirs: HeirInput[], heirType: HeirType): number {
  const heir = heirs.find((h) => h.type === heirType)
  return heir ? heir.count : 0
}

/**
 * Apply all Hajb (blocking) rules to the heir list.
 *
 * Process:
 * 1. Iterate TOTAL_BLOCKING_RULES: if blocker is present AND blocked is present,
 *    remove blocked from active heirs (unless a special exception applies).
 * 2. Build reduction list from PARTIAL_REDUCTION_RULES for share assignment phase.
 *
 * @param heirs - The original list of heir inputs
 * @param ctx - The heir context with derived flags and counts
 * @returns Object with active heirs (not blocked), list of blocked heirs, and pending reductions
 */
export function applyHajb(heirs: HeirInput[], ctx: HeirContext): HajbResult {
  const blocked: BlockedInfo[] = []
  const blockedTypes = new Set<HeirType>()

  // Process each total blocking rule
  for (const rule of TOTAL_BLOCKING_RULES) {
    const blockers = Array.isArray(rule.blocker) ? rule.blocker : [rule.blocker]
    const blockedList = Array.isArray(rule.blocked) ? rule.blocked : [rule.blocked]

    // Check if any blocker is present
    const activeBlocker = blockers.find((b) => isHeirPresent(heirs, b))
    if (!activeBlocker) continue

    // Rule 5 special condition: 2+ daughters block daughter_of_son
    // UNLESS son_of_son is present (making her Asaba bi-ghayrihi)
    if (
      rule.blocker === 'daughter' &&
      blockedList.includes('daughter_of_son')
    ) {
      // Only block if 2+ daughters AND no son_of_son
      const daughterCount = getHeirCount(heirs, 'daughter')
      if (daughterCount < 2 || isHeirPresent(heirs, 'son_of_son')) {
        continue
      }
    }

    // Rule 11 special condition: full sister blocks consanguine siblings
    // ONLY when she is Asaba ma'a ghayrihi (with daughters, no sons, no father, no grandfather)
    if (
      rule.blocker === 'sister_full' &&
      rule.condition?.includes('Asaba')
    ) {
      const isAsabaMaaGhayrihi =
        !ctx.hasSons &&
        ctx.sons === 0 &&
        ctx.sonsOfSon === 0 &&
        (ctx.daughters > 0 || ctx.daughtersOfSon > 0) &&
        !ctx.hasFather &&
        !ctx.hasGrandfather
      if (!isAsabaMaaGhayrihi) {
        continue
      }
    }

    // Apply blocking to each blocked heir type
    for (const blockedType of blockedList) {
      if (isHeirPresent(heirs, blockedType) && !blockedTypes.has(blockedType)) {
        blockedTypes.add(blockedType)
        blocked.push({
          heirType: blockedType,
          blockedBy: activeBlocker,
          rule: rule.note || `${activeBlocker} blocks ${blockedType}`,
        })
      }
    }
  }

  // Filter out blocked heirs
  const activeHeirs = heirs.filter((h) => !blockedTypes.has(h.type))

  // Process partial reduction rules
  const reductions: ReductionInfo[] = []
  for (const rule of PARTIAL_REDUCTION_RULES) {
    // Only add reduction if the heir is active (not totally blocked)
    if (isHeirPresent(activeHeirs, rule.heir) && rule.predicate(ctx)) {
      reductions.push({
        heirType: rule.heir,
        from: rule.originalShare,
        to: rule.reducedShare,
        reason: rule.trigger,
      })
    }
  }

  return { activeHeirs, blocked, reductions }
}
