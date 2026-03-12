import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import type { HeirInput, FaraidInput } from '@/core/faraid/types'
import { buildHeirContext, assignFixedShares } from '@/core/faraid/shares'
import { applyHajb } from '@/core/faraid/blocking'
import {
  HALF,
  QUARTER,
  EIGHTH,
  TWO_THIRDS,
  ONE_THIRD,
  ONE_SIXTH,
  ZERO,
} from '@/core/utils/fraction'

/**
 * Helper: run the full blocking -> share assignment pipeline.
 */
function getShares(heirs: HeirInput[], deceasedGender: 'male' | 'female' = 'male') {
  const input: FaraidInput = { deceasedGender, heirs }
  const ctx = buildHeirContext(input)
  const { activeHeirs, reductions } = applyHajb(heirs, ctx)
  return assignFixedShares(activeHeirs, ctx, reductions)
}

function findShare(shares: ReturnType<typeof getShares>, heirType: string) {
  return shares.find((s) => s.heirType === heirType)
}

describe('Fixed Share Assignment - Daughters', () => {
  it('Single daughter, no sons -> gets 1/2', () => {
    const shares = getShares([{ type: 'daughter', count: 1 }])
    const daughter = findShare(shares, 'daughter')
    expect(daughter).toBeDefined()
    expect(daughter!.totalShare.equals(HALF)).toBe(true)
    expect(daughter!.sharePerHeir.equals(HALF)).toBe(true)
  })

  it('Two daughters, no sons -> get 2/3 (shared)', () => {
    const shares = getShares([{ type: 'daughter', count: 2 }])
    const daughter = findShare(shares, 'daughter')
    expect(daughter).toBeDefined()
    expect(daughter!.totalShare.equals(TWO_THIRDS)).toBe(true)
    expect(daughter!.sharePerHeir.equals(ONE_THIRD)).toBe(true)
  })
})

describe('Fixed Share Assignment - Husband', () => {
  it('Husband, no children -> gets 1/2', () => {
    const shares = getShares(
      [{ type: 'husband', count: 1 }],
      'female',
    )
    const husband = findShare(shares, 'husband')
    expect(husband).toBeDefined()
    expect(husband!.totalShare.equals(HALF)).toBe(true)
  })

  it('Husband, with children -> gets 1/4', () => {
    const shares = getShares(
      [
        { type: 'husband', count: 1 },
        { type: 'son', count: 1 },
      ],
      'female',
    )
    const husband = findShare(shares, 'husband')
    expect(husband).toBeDefined()
    expect(husband!.totalShare.equals(QUARTER)).toBe(true)
  })
})

describe('Fixed Share Assignment - Wife', () => {
  it('Wife, no children -> gets 1/4', () => {
    const shares = getShares([{ type: 'wife', count: 1 }])
    const wife = findShare(shares, 'wife')
    expect(wife).toBeDefined()
    expect(wife!.totalShare.equals(QUARTER)).toBe(true)
  })

  it('Wife, with children -> gets 1/8', () => {
    const shares = getShares([
      { type: 'wife', count: 1 },
      { type: 'son', count: 1 },
    ])
    const wife = findShare(shares, 'wife')
    expect(wife).toBeDefined()
    expect(wife!.totalShare.equals(EIGHTH)).toBe(true)
  })

  it('Two wives, with children -> each gets 1/16 (1/8 divided equally)', () => {
    const shares = getShares([
      { type: 'wife', count: 2 },
      { type: 'son', count: 1 },
    ])
    const wife = findShare(shares, 'wife')
    expect(wife).toBeDefined()
    expect(wife!.totalShare.equals(EIGHTH)).toBe(true)
    expect(wife!.sharePerHeir.equals(new Fraction(1, 16))).toBe(true)
    expect(wife!.count).toBe(2)
  })
})

describe('Fixed Share Assignment - Mother', () => {
  it('Mother, no children, 0-1 siblings -> gets 1/3', () => {
    const shares = getShares([{ type: 'mother', count: 1 }])
    const mother = findShare(shares, 'mother')
    expect(mother).toBeDefined()
    expect(mother!.totalShare.equals(ONE_THIRD)).toBe(true)
  })

  it('Mother, with children -> gets 1/6', () => {
    const shares = getShares([
      { type: 'mother', count: 1 },
      { type: 'son', count: 1 },
    ])
    const mother = findShare(shares, 'mother')
    expect(mother).toBeDefined()
    expect(mother!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })

  it('Mother, no children, 2+ siblings -> gets 1/6', () => {
    const shares = getShares([
      { type: 'mother', count: 1 },
      { type: 'brother_full', count: 2 },
    ])
    const mother = findShare(shares, 'mother')
    expect(mother).toBeDefined()
    expect(mother!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })
})

describe('Fixed Share Assignment - Father', () => {
  it('Father, with sons -> gets 1/6', () => {
    const shares = getShares([
      { type: 'father', count: 1 },
      { type: 'son', count: 1 },
    ])
    const father = findShare(shares, 'father')
    expect(father).toBeDefined()
    expect(father!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })

  it('Father, with daughters only (no sons) -> gets 1/6 (+ residuary in Plan 03)', () => {
    const shares = getShares([
      { type: 'father', count: 1 },
      { type: 'daughter', count: 1 },
    ])
    const father = findShare(shares, 'father')
    expect(father).toBeDefined()
    expect(father!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })

  it('Father, no children -> Asaba only (ZERO fixed share)', () => {
    const shares = getShares([{ type: 'father', count: 1 }])
    const father = findShare(shares, 'father')
    expect(father).toBeDefined()
    expect(father!.totalShare.equals(ZERO)).toBe(true)
    expect(father!.shareType).toMatch(/asaba/)
  })
})

describe('Fixed Share Assignment - Sisters', () => {
  it('Single full sister, no children, no father -> gets 1/2', () => {
    const shares = getShares([{ type: 'sister_full', count: 1 }])
    const sister = findShare(shares, 'sister_full')
    expect(sister).toBeDefined()
    expect(sister!.totalShare.equals(HALF)).toBe(true)
  })

  it('Two+ full sisters, same conditions -> get 2/3 (shared)', () => {
    const shares = getShares([{ type: 'sister_full', count: 2 }])
    const sister = findShare(shares, 'sister_full')
    expect(sister).toBeDefined()
    expect(sister!.totalShare.equals(TWO_THIRDS)).toBe(true)
    expect(sister!.sharePerHeir.equals(ONE_THIRD)).toBe(true)
  })

  it('Single consanguine sister, no full siblings -> gets 1/2', () => {
    const shares = getShares([{ type: 'sister_consanguine', count: 1 }])
    const sister = findShare(shares, 'sister_consanguine')
    expect(sister).toBeDefined()
    expect(sister!.totalShare.equals(HALF)).toBe(true)
  })

  it('Consanguine sister with one full sister -> gets 1/6 (completing 2/3)', () => {
    const shares = getShares([
      { type: 'sister_full', count: 1 },
      { type: 'sister_consanguine', count: 1 },
    ])
    const cs = findShare(shares, 'sister_consanguine')
    expect(cs).toBeDefined()
    expect(cs!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })
})

describe('Fixed Share Assignment - Uterine Siblings (Kalalah)', () => {
  it('Single uterine brother, Kalalah -> gets 1/6', () => {
    const shares = getShares([{ type: 'brother_uterine', count: 1 }])
    const ub = findShare(shares, 'brother_uterine')
    expect(ub).toBeDefined()
    expect(ub!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })

  it('Two+ uterine siblings, Kalalah -> share 1/3', () => {
    const shares = getShares([
      { type: 'brother_uterine', count: 1 },
      { type: 'sister_uterine', count: 1 },
    ])
    const ub = findShare(shares, 'brother_uterine')
    const us = findShare(shares, 'sister_uterine')
    expect(ub).toBeDefined()
    expect(us).toBeDefined()
    // Both get 1/3 as their share type (shared equally among all uterine siblings)
    expect(ub!.totalShare.equals(ONE_THIRD)).toBe(true)
    expect(us!.totalShare.equals(ONE_THIRD)).toBe(true)
  })
})

describe('Fixed Share Assignment - Grandmother', () => {
  it('Paternal grandmother (no mother, no father) -> gets 1/6', () => {
    const shares = getShares([{ type: 'paternal_grandmother', count: 1 }])
    const pgm = findShare(shares, 'paternal_grandmother')
    expect(pgm).toBeDefined()
    expect(pgm!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })

  it('Maternal grandmother (no mother) -> gets 1/6', () => {
    const shares = getShares([{ type: 'maternal_grandmother', count: 1 }])
    const mgm = findShare(shares, 'maternal_grandmother')
    expect(mgm).toBeDefined()
    expect(mgm!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })
})

describe('buildHeirContext', () => {
  it('correctly sets isKalalah when no children and no father', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [{ type: 'wife', count: 1 }, { type: 'brother_full', count: 1 }],
    })
    expect(ctx.isKalalah).toBe(true)
  })

  it('isKalalah false when children present', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [{ type: 'son', count: 1 }],
    })
    expect(ctx.isKalalah).toBe(false)
  })

  it('correctly counts siblings', () => {
    const ctx = buildHeirContext({
      deceasedGender: 'male',
      heirs: [
        { type: 'brother_full', count: 2 },
        { type: 'sister_uterine', count: 1 },
      ],
    })
    expect(ctx.siblingCount).toBe(3)
    expect(ctx.hasSiblings).toBe(true)
  })
})
