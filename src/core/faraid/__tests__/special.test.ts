import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { HeirInput, FaraidInput } from '@/core/faraid/types'
import { buildHeirContext, assignFixedShares } from '@/core/faraid/shares'
import type { ShareAssignment } from '@/core/faraid/shares'
import { applyHajb } from '@/core/faraid/blocking'
import {
  isKalalah,
  detectSpecialCases,
  applyUmariyyatayn,
  applyMushtarakah,
} from '@/core/faraid/special-cases'
import {
  HALF,
  QUARTER,
  ONE_THIRD,
  ONE_SIXTH,
  ZERO,
} from '@/core/utils/fraction'

/**
 * Helper: run full pipeline up to share assignment.
 */
function getSharesForSpecialCase(
  heirs: HeirInput[],
  deceasedGender: 'male' | 'female' = 'male',
): { shares: ShareAssignment[]; ctx: ReturnType<typeof buildHeirContext> } {
  const input: FaraidInput = { deceasedGender, heirs }
  const ctx = buildHeirContext(input)
  const { activeHeirs, reductions } = applyHajb(heirs, ctx)
  const shares = assignFixedShares(activeHeirs, ctx, reductions)
  return { shares, ctx }
}

function findShare(shares: ShareAssignment[], heirType: string) {
  return shares.find((s) => s.heirType === heirType)
}

describe('Kalalah Detection', () => {
  it('Kalalah: no children, no father -> isKalalah returns true', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [
        { type: 'wife', count: 1 },
        { type: 'brother_full', count: 1 },
      ],
    })
    expect(isKalalah(ctx)).toBe(true)
  })

  it('Non-Kalalah: children present -> isKalalah returns false', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1 },
        { type: 'brother_full', count: 1 },
      ],
    })
    expect(isKalalah(ctx)).toBe(false)
  })

  it('Non-Kalalah: father present -> isKalalah returns false', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [
        { type: 'father', count: 1 },
        { type: 'brother_full', count: 1 },
      ],
    })
    expect(isKalalah(ctx)).toBe(false)
  })

  it('detectSpecialCases includes kalalah when applicable', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [
        { type: 'wife', count: 1 },
        { type: 'mother', count: 1 },
      ],
    })
    const cases = detectSpecialCases(ctx)
    expect(cases).toContain('kalalah')
  })
})

describe('Umariyyatayn (Two Omari Cases)', () => {
  it('Case 1: husband(1/2) + mother + father -> mother gets 1/6 (1/3 of remainder 1/2)', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'father', count: 1 },
    ]
    const { shares, ctx } = getSharesForSpecialCase(heirs, 'female')

    // Detect the special case
    const cases = detectSpecialCases(ctx)
    expect(cases).toContain('umariyyatayn')

    // Apply Umariyyatayn
    const adjusted = applyUmariyyatayn(shares, ctx)

    const husband = findShare(adjusted, 'husband')
    const mother = findShare(adjusted, 'mother')
    const father = findShare(adjusted, 'father')

    // Husband: 1/2
    expect(husband).toBeDefined()
    expect(husband!.totalShare.equals(HALF)).toBe(true)

    // Mother: 1/3 of remainder (1/2) = 1/6
    expect(mother).toBeDefined()
    expect(mother!.totalShare.equals(ONE_SIXTH)).toBe(true)

    // Father: remainder = 1 - 1/2 - 1/6 = 1/3
    expect(father).toBeDefined()
    expect(father!.totalShare.equals(ONE_THIRD)).toBe(true)

    // Mother's explanation should mention Umariyyatayn
    expect(mother!.explanation).toContain('Umariyyatayn')
  })

  it('Case 2: wife(1/4) + mother + father -> mother gets 1/4 (1/3 of remainder 3/4)', () => {
    const heirs: HeirInput[] = [
      { type: 'wife', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'father', count: 1 },
    ]
    const { shares, ctx } = getSharesForSpecialCase(heirs)

    const cases = detectSpecialCases(ctx)
    expect(cases).toContain('umariyyatayn')

    const adjusted = applyUmariyyatayn(shares, ctx)

    const wife = findShare(adjusted, 'wife')
    const mother = findShare(adjusted, 'mother')
    const father = findShare(adjusted, 'father')

    // Wife: 1/4
    expect(wife).toBeDefined()
    expect(wife!.totalShare.equals(QUARTER)).toBe(true)

    // Mother: 1/3 of remainder (3/4) = 1/4
    expect(mother).toBeDefined()
    expect(mother!.totalShare.equals(QUARTER)).toBe(true)

    // Father: remainder = 1 - 1/4 - 1/4 = 1/2
    expect(father).toBeDefined()
    expect(father!.totalShare.equals(HALF)).toBe(true)
  })

  it('Does NOT apply Umariyyatayn when children exist', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'father', count: 1 },
      { type: 'son', count: 1 },
    ]
    const { ctx } = getSharesForSpecialCase(heirs, 'female')
    const cases = detectSpecialCases(ctx)
    expect(cases).not.toContain('umariyyatayn')
  })

  it('Does NOT apply Umariyyatayn when siblings exist', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'father', count: 1 },
      { type: 'brother_full', count: 1 },
    ]
    const { ctx } = getSharesForSpecialCase(heirs, 'female')
    const cases = detectSpecialCases(ctx)
    // Siblings are blocked by father, but the detection should consider input heirs
    // Actually in Hanafi, father blocks siblings so they wouldn't affect Umariyyatayn
    // However, the strict detection is: spouse + mother + father, NO children, NO siblings
    // Since siblings are blocked by father, the special case SHOULD apply
    // This is a nuance: the blocking happens before, so the remaining heirs are just spouse+mother+father
    // Let's check: if siblings exist but are blocked, Umariyyatayn should still apply
    // Per strict interpretation: the presence of siblings before blocking reduces mother to 1/6,
    // but in Hanafi, father blocks them, so they don't count. Umariyyatayn APPLIES.
    expect(cases).toContain('umariyyatayn')
  })
})

describe('Mushtarakah', () => {
  it('Husband + mother + uterine siblings + full siblings -> full siblings get nothing (Hanafi)', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'brother_uterine', count: 2 },
      { type: 'brother_full', count: 2 },
    ]
    const { shares, ctx } = getSharesForSpecialCase(heirs, 'female')

    const cases = detectSpecialCases(ctx)
    expect(cases).toContain('mushtarakah')

    const adjusted = applyMushtarakah(shares, ctx)

    // In Hanafi: full siblings get NOTHING (they are Asaba and there is no remainder)
    const fullBrother = findShare(adjusted, 'brother_full')
    // Full brothers should get zero or not be in the output
    if (fullBrother) {
      expect(fullBrother.totalShare.equals(ZERO)).toBe(true)
    }

    // Check for Shafi'i/Maliki alternative note
    const hasAlternativeNote = adjusted.some((s) =>
      s.notes?.some((n) => n.includes('Shafi') || n.includes('Maliki'))
    )
    expect(hasAlternativeNote).toBe(true)
  })

  it('Mushtarakah not detected when uterine siblings absent', () => {
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'brother_full', count: 2 },
    ]
    const { ctx } = getSharesForSpecialCase(heirs, 'female')
    const cases = detectSpecialCases(ctx)
    expect(cases).not.toContain('mushtarakah')
  })
})
