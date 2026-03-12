import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { HeirInput, HeirContext } from '@/core/faraid/types'
import { applyHajb, TOTAL_BLOCKING_RULES, PARTIAL_REDUCTION_RULES } from '@/core/faraid/blocking'
import { buildHeirContext } from '@/core/faraid/shares'

/**
 * Helper to build context from a minimal heir list.
 * Assumes male deceased unless overridden.
 */
function makeContext(heirs: HeirInput[], deceasedGender: 'male' | 'female' = 'male'): HeirContext {
  return buildHeirContext({ deceasedGender, heirs })
}

describe('Hajb Hirman (Total Blocking) Rules', () => {
  // Rule 1: Son blocks son's son
  it('Rule 1: Son present -> son\'s son blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'son_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'son_of_son')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'son_of_son' && b.blockedBy === 'son')).toBe(true)
  })

  // Rule 2: Son's son blocks son's son's son (not modeled beyond son_of_son, so skip if not applicable)
  // Since we don't have a 'son_of_son_of_son' type, this test validates son_of_son doesn't block itself
  it('Rule 2: Son\'s son does NOT self-block (no deeper grandson type modeled)', () => {
    const heirs: HeirInput[] = [
      { type: 'son_of_son', count: 2 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'son_of_son')).toBeDefined()
  })

  // Rule 3: Son blocks daughter(s) of son
  it('Rule 3: Son present -> daughter(s) of son blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'daughter_of_son', count: 2 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'daughter_of_son')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'daughter_of_son' && b.blockedBy === 'son')).toBe(true)
  })

  // Rule 4: Son's son blocks daughter(s) of son's son (not modeled deeper, test son_of_son with daughter_of_son)
  // Since daughter_of_son is at same level as son_of_son, son_of_son does NOT block daughter_of_son
  // (she becomes Asaba bi-ghayrihi through him). This is correct behavior.
  it('Rule 4: Son\'s son does NOT block daughter of son (she becomes Asaba bi-ghayrihi)', () => {
    const heirs: HeirInput[] = [
      { type: 'son_of_son', count: 1 },
      { type: 'daughter_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    // daughter_of_son is NOT blocked by son_of_son at the same level
    expect(result.activeHeirs.find((h) => h.type === 'daughter_of_son')).toBeDefined()
  })

  // Rule 5: Two+ daughters block daughter(s) of son (UNLESS son's son present)
  it('Rule 5: Two+ daughters, no son\'s son -> daughter(s) of son blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 2 },
      { type: 'daughter_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'daughter_of_son')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'daughter_of_son')).toBe(true)
  })

  // Rule 5 exception: Two+ daughters + son's son -> daughter of son NOT blocked
  it('Rule 5 exception: Two+ daughters + son\'s son -> daughter of son NOT blocked (Asaba)', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 2 },
      { type: 'daughter_of_son', count: 1 },
      { type: 'son_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    // daughter_of_son becomes Asaba bi-ghayrihi through son_of_son, NOT blocked
    expect(result.activeHeirs.find((h) => h.type === 'daughter_of_son')).toBeDefined()
  })

  // Rule 6: Father blocks paternal grandfather
  it('Rule 6: Father present -> paternal grandfather blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'father', count: 1 },
      { type: 'paternal_grandfather', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'paternal_grandfather')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'paternal_grandfather' && b.blockedBy === 'father')).toBe(true)
  })

  // Rule 7: Father blocks all siblings (full, consanguine, uterine)
  it('Rule 7: Father present -> all siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'father', count: 1 },
      { type: 'brother_full', count: 1 },
      { type: 'sister_full', count: 1 },
      { type: 'brother_consanguine', count: 1 },
      { type: 'sister_consanguine', count: 1 },
      { type: 'brother_uterine', count: 1 },
      { type: 'sister_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const siblingTypes = ['brother_full', 'sister_full', 'brother_consanguine', 'sister_consanguine', 'brother_uterine', 'sister_uterine']
    for (const sib of siblingTypes) {
      expect(result.activeHeirs.find((h) => h.type === sib)).toBeUndefined()
      expect(result.blocked.some((b) => b.heirType === sib)).toBe(true)
    }
  })

  // Rule 8: Paternal grandfather blocks all siblings (HANAFI SPECIFIC)
  it('Rule 8: Paternal grandfather present -> all siblings blocked (Hanafi specific)', () => {
    const heirs: HeirInput[] = [
      { type: 'paternal_grandfather', count: 1 },
      { type: 'brother_full', count: 2 },
      { type: 'sister_consanguine', count: 1 },
      { type: 'brother_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_full')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'sister_consanguine')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()

    // Rule 8 must have a Hanafi annotation
    const rule8Blocked = result.blocked.find((b) => b.heirType === 'brother_full' && b.blockedBy === 'paternal_grandfather')
    expect(rule8Blocked).toBeDefined()
    expect(rule8Blocked!.rule).toContain('Hanafi')
  })

  // Rule 9: Full brother blocks consanguine brother
  it('Rule 9: Full brother present -> consanguine brother blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'brother_full', count: 1 },
      { type: 'brother_consanguine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_consanguine')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'brother_consanguine' && b.blockedBy === 'brother_full')).toBe(true)
  })

  // Rule 10: Full brother blocks consanguine sister
  it('Rule 10: Full brother present -> consanguine sister blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'brother_full', count: 1 },
      { type: 'sister_consanguine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'sister_consanguine')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'sister_consanguine' && b.blockedBy === 'brother_full')).toBe(true)
  })

  // Rule 11: Full sister as Asaba ma'a ghayrihi blocks consanguine siblings
  it('Rule 11: Full sister (with daughters, no sons/father) -> consanguine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 1 },
      { type: 'sister_full', count: 1 },
      { type: 'brother_consanguine', count: 1 },
      { type: 'sister_consanguine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_consanguine')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'sister_consanguine')).toBeUndefined()
  })

  // Rule 12: Son/daughter/father blocks uterine siblings
  it('Rule 12: Son present -> uterine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'brother_uterine', count: 1 },
      { type: 'sister_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'sister_uterine')).toBeUndefined()
  })

  it('Rule 12: Daughter present -> uterine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 1 },
      { type: 'brother_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()
  })

  it('Rule 12: Father present -> uterine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'father', count: 1 },
      { type: 'brother_uterine', count: 2 },
      { type: 'sister_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'sister_uterine')).toBeUndefined()
  })

  it('Rule 12: Daughter of son present -> uterine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter_of_son', count: 1 },
      { type: 'brother_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()
  })

  // Rule 13: Paternal grandfather blocks uterine siblings
  it('Rule 13: Paternal grandfather present -> uterine siblings blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'paternal_grandfather', count: 1 },
      { type: 'brother_uterine', count: 1 },
      { type: 'sister_uterine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'brother_uterine')).toBeUndefined()
    expect(result.activeHeirs.find((h) => h.type === 'sister_uterine')).toBeUndefined()
  })

  // Rule 14: Mother blocks maternal grandmother
  it('Rule 14: Mother present -> maternal grandmother blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'mother', count: 1 },
      { type: 'maternal_grandmother', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'maternal_grandmother')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'maternal_grandmother' && b.blockedBy === 'mother')).toBe(true)
  })

  // Rule 15: Mother blocks paternal grandmother
  it('Rule 15: Mother present -> paternal grandmother blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'mother', count: 1 },
      { type: 'paternal_grandmother', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'paternal_grandmother')).toBeUndefined()
    expect(result.blocked.some((b) => b.heirType === 'paternal_grandmother' && b.blockedBy === 'mother')).toBe(true)
  })

  // Rule 16: Father blocks paternal grandmother (HANAFI SPECIFIC)
  it('Rule 16: Father present -> paternal grandmother blocked (Hanafi specific)', () => {
    const heirs: HeirInput[] = [
      { type: 'father', count: 1 },
      { type: 'paternal_grandmother', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'paternal_grandmother')).toBeUndefined()
    const rule16Blocked = result.blocked.find((b) => b.heirType === 'paternal_grandmother' && b.blockedBy === 'father')
    expect(rule16Blocked).toBeDefined()
    expect(rule16Blocked!.rule).toContain('Hanafi')
  })
})

describe('Hajb Nuqsan (Partial Reduction) Rules', () => {
  // Test 17: Husband reduced from 1/2 to 1/4 when children/grandchildren exist
  it('Test 17: Husband reduced from 1/2 to 1/4 when children exist', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'son', count: 1 },
    ]
    const ctx = makeContext(heirs, 'female')
    const result = applyHajb(heirs, ctx)

    const husbandReduction = result.reductions.find((r) => r.heirType === 'husband')
    expect(husbandReduction).toBeDefined()
    expect(husbandReduction!.from.equals(new Fraction(1, 2))).toBe(true)
    expect(husbandReduction!.to.equals(new Fraction(1, 4))).toBe(true)
  })

  // Test 18: Wife reduced from 1/4 to 1/8 when children/grandchildren exist
  it('Test 18: Wife reduced from 1/4 to 1/8 when children exist', () => {
    const heirs: HeirInput[] = [
      { type: 'wife', count: 1 },
      { type: 'daughter', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const wifeReduction = result.reductions.find((r) => r.heirType === 'wife')
    expect(wifeReduction).toBeDefined()
    expect(wifeReduction!.from.equals(new Fraction(1, 4))).toBe(true)
    expect(wifeReduction!.to.equals(new Fraction(1, 8))).toBe(true)
  })

  // Test 19: Mother reduced from 1/3 to 1/6 when children or 2+ siblings exist
  it('Test 19: Mother reduced from 1/3 to 1/6 when children exist', () => {
    const heirs: HeirInput[] = [
      { type: 'mother', count: 1 },
      { type: 'son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const motherReduction = result.reductions.find((r) => r.heirType === 'mother')
    expect(motherReduction).toBeDefined()
    expect(motherReduction!.from.equals(new Fraction(1, 3))).toBe(true)
    expect(motherReduction!.to.equals(new Fraction(1, 6))).toBe(true)
  })

  it('Test 19b: Mother reduced from 1/3 to 1/6 when 2+ siblings exist', () => {
    const heirs: HeirInput[] = [
      { type: 'mother', count: 1 },
      { type: 'brother_full', count: 2 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const motherReduction = result.reductions.find((r) => r.heirType === 'mother')
    expect(motherReduction).toBeDefined()
    expect(motherReduction!.from.equals(new Fraction(1, 3))).toBe(true)
    expect(motherReduction!.to.equals(new Fraction(1, 6))).toBe(true)
  })

  // Test 20: Single daughter of son reduced from 1/2 to 1/6 when single daughter present
  it('Test 20: Daughter of son reduced from 1/2 to 1/6 when single daughter present', () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 1 },
      { type: 'daughter_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const dosReduction = result.reductions.find((r) => r.heirType === 'daughter_of_son')
    expect(dosReduction).toBeDefined()
    expect(dosReduction!.from.equals(new Fraction(1, 2))).toBe(true)
    expect(dosReduction!.to.equals(new Fraction(1, 6))).toBe(true)
  })

  // Test 21: Single consanguine sister reduced from 1/2 to 1/6 when single full sister present
  it('Test 21: Consanguine sister reduced from 1/2 to 1/6 when single full sister present', () => {
    const heirs: HeirInput[] = [
      { type: 'sister_full', count: 1 },
      { type: 'sister_consanguine', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    const csReduction = result.reductions.find((r) => r.heirType === 'sister_consanguine')
    expect(csReduction).toBeDefined()
    expect(csReduction!.from.equals(new Fraction(1, 2))).toBe(true)
    expect(csReduction!.to.equals(new Fraction(1, 6))).toBe(true)
  })
})

describe('Edge Cases', () => {
  // Test 22: Heir not present is NOT listed as blocked
  it('Test 22: Heir not present in input is NOT listed as blocked', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      // son_of_son is NOT in heirs
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.blocked.find((b) => b.heirType === 'son_of_son')).toBeUndefined()
  })

  // Test 23: Multiple blocking rules applied simultaneously
  it('Test 23: Multiple blocking rules applied simultaneously', () => {
    const heirs: HeirInput[] = [
      { type: 'father', count: 1 },
      { type: 'paternal_grandfather', count: 1 }, // blocked by father (rule 6)
      { type: 'brother_full', count: 1 },          // blocked by father (rule 7)
      { type: 'sister_uterine', count: 1 },        // blocked by father (rule 7)
      { type: 'paternal_grandmother', count: 1 },  // blocked by father (rule 16)
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.length).toBe(1) // only father remains
    expect(result.activeHeirs[0].type).toBe('father')
    expect(result.blocked.length).toBe(4)
  })

  // Test 24: Blocking does NOT affect the blocker's own share
  it('Test 24: Blocking does NOT affect the blocker\'s own share', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'son_of_son', count: 1 },
    ]
    const ctx = makeContext(heirs)
    const result = applyHajb(heirs, ctx)

    expect(result.activeHeirs.find((h) => h.type === 'son')).toBeDefined()
    expect(result.activeHeirs.find((h) => h.type === 'son')!.count).toBe(1)
  })
})

describe('Data Structure Integrity', () => {
  it('TOTAL_BLOCKING_RULES covers all applicable rules (14 entries for 16 logical rules)', () => {
    // 16 logical rules, but rules 2 and 4 operate on heir types not in our model
    // (son_of_son_of_son, daughter_of_son_of_son). So 14 actual rule entries.
    expect(TOTAL_BLOCKING_RULES.length).toBe(14)
  })

  it('PARTIAL_REDUCTION_RULES contains all 5 rules', () => {
    expect(PARTIAL_REDUCTION_RULES.length).toBe(5)
  })

  it('All blocking rules have type "total"', () => {
    for (const rule of TOTAL_BLOCKING_RULES) {
      expect(rule.type).toBe('total')
    }
  })

  it('Hanafi-specific rules have annotation notes', () => {
    // Rule 8: grandfather blocks siblings
    const rule8 = TOTAL_BLOCKING_RULES.find(
      (r) => {
        const blocker = Array.isArray(r.blocker) ? r.blocker : [r.blocker]
        return blocker.includes('paternal_grandfather') && r.note?.includes('Hanafi')
      }
    )
    expect(rule8).toBeDefined()

    // Rule 16: father blocks paternal grandmother
    const rule16 = TOTAL_BLOCKING_RULES.find(
      (r) => {
        const blocker = Array.isArray(r.blocker) ? r.blocker : [r.blocker]
        const blocked = Array.isArray(r.blocked) ? r.blocked : [r.blocked]
        return blocker.includes('father') && blocked.includes('paternal_grandmother') && r.note?.includes('Hanafi')
      }
    )
    expect(rule16).toBeDefined()
  })
})
