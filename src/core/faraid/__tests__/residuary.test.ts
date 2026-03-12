/**
 * Tests for Asaba (Residuary) Distribution
 *
 * Tests the three types of Asaba inheritance:
 * - Asaba bi-nafsihi (by himself): son, father, full brother, etc.
 * - Asaba bi-ghayrihi (through another): daughter with son, sister with brother
 * - Asaba ma'a ghayrihi (along with another): sister with daughter
 */

import { describe, it, expect } from 'vitest'
import Fraction from 'fraction.js'
import { classifyAsaba, assignResiduary } from '../residuary'
import { buildHeirContext } from '../shares'
import type { ShareAssignment } from '../shares'
import type { HeirInput, HeirContext } from '../types'
import {
  ZERO,
  ONE,
  HALF,
  EIGHTH,
  TWO_THIRDS,
  ONE_SIXTH,
  ONE_THIRD,
} from '@/core/utils/fraction'

// Helper to build context from heirs
function makeCtx(
  deceasedGender: 'male' | 'female',
  heirs: HeirInput[],
): HeirContext {
  return buildHeirContext({ deceasedGender, heirs })
}

describe('classifyAsaba', () => {
  it('son is Asaba bi-nafsihi with priority 1', () => {
    const ctx = makeCtx('male', [{ type: 'son', count: 1 }])
    const result = classifyAsaba('son', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_nafsihi')
    expect(result!.priority).toBe(1)
  })

  it("son's son is Asaba bi-nafsihi with priority 2", () => {
    const ctx = makeCtx('male', [{ type: 'son_of_son', count: 1 }])
    const result = classifyAsaba('son_of_son', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_nafsihi')
    expect(result!.priority).toBe(2)
  })

  it('father is Asaba bi-nafsihi with priority 3 when no sons', () => {
    const ctx = makeCtx('male', [{ type: 'father', count: 1 }])
    const result = classifyAsaba('father', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_nafsihi')
    expect(result!.priority).toBe(3)
  })

  it('full brother is Asaba bi-nafsihi with priority 5', () => {
    const ctx = makeCtx('male', [{ type: 'brother_full', count: 1 }])
    const result = classifyAsaba('brother_full', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_nafsihi')
    expect(result!.priority).toBe(5)
  })

  it('consanguine brother is Asaba bi-nafsihi with priority 6', () => {
    const ctx = makeCtx('male', [{ type: 'brother_consanguine', count: 1 }])
    const result = classifyAsaba('brother_consanguine', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_nafsihi')
    expect(result!.priority).toBe(6)
  })

  it('daughter with son is Asaba bi-ghayrihi', () => {
    const ctx = makeCtx('male', [
      { type: 'son', count: 1 },
      { type: 'daughter', count: 1 },
    ])
    const result = classifyAsaba('daughter', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_ghayrihi')
  })

  it("daughter of son with son's son is Asaba bi-ghayrihi", () => {
    const ctx = makeCtx('male', [
      { type: 'son_of_son', count: 1 },
      { type: 'daughter_of_son', count: 1 },
    ])
    const result = classifyAsaba('daughter_of_son', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_ghayrihi')
  })

  it('full sister with full brother is Asaba bi-ghayrihi', () => {
    const ctx = makeCtx('male', [
      { type: 'brother_full', count: 1 },
      { type: 'sister_full', count: 1 },
    ])
    const result = classifyAsaba('sister_full', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('bi_ghayrihi')
  })

  it("full sister with daughter(s) is Asaba ma'a ghayrihi", () => {
    const ctx = makeCtx('male', [
      { type: 'daughter', count: 1 },
      { type: 'sister_full', count: 1 },
    ])
    const result = classifyAsaba('sister_full', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('ma_a_ghayrihi')
  })

  it("consanguine sister with daughter is Asaba ma'a ghayrihi when no full siblings", () => {
    const ctx = makeCtx('male', [
      { type: 'daughter', count: 1 },
      { type: 'sister_consanguine', count: 1 },
    ])
    const result = classifyAsaba('sister_consanguine', ctx)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('ma_a_ghayrihi')
  })

  it('wife is never Asaba', () => {
    const ctx = makeCtx('male', [{ type: 'wife', count: 1 }])
    const result = classifyAsaba('wife', ctx)
    expect(result).toBeNull()
  })

  it('mother is never Asaba', () => {
    const ctx = makeCtx('male', [{ type: 'mother', count: 1 }])
    const result = classifyAsaba('mother', ctx)
    expect(result).toBeNull()
  })
})

describe('assignResiduary', () => {
  it('son alone gets entire estate (1/1) as Asaba bi-nafsihi', () => {
    const heirs: HeirInput[] = [{ type: 'son', count: 1 }]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Son inherits as Asaba',
        quranRef: '4:11',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sonShare = result.find((s) => s.heirType === 'son')
    expect(sonShare).toBeDefined()
    expect(sonShare!.totalShare.equals(ONE)).toBe(true)
    expect(sonShare!.shareType).toBe('asaba')
  })

  it('son + daughter -> son 2/3, daughter 1/3 (2:1 ratio, Asaba bi-ghayrihi)', () => {
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'daughter', count: 1 },
    ]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Son inherits as Asaba',
        quranRef: '4:11',
      },
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Daughter Asaba bi-ghayrihi with son',
        quranRef: '4:11',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sonShare = result.find((s) => s.heirType === 'son')
    const daughterShare = result.find((s) => s.heirType === 'daughter')
    expect(sonShare!.totalShare.equals(TWO_THIRDS)).toBe(true)
    expect(daughterShare!.totalShare.equals(ONE_THIRD)).toBe(true)
  })

  it('wife(1/8) + son + daughter -> correct remainder distribution', () => {
    // Wife gets 1/8, remainder 7/8. Son gets 2 parts, daughter 1 part = 3 parts total
    // Son: 7/8 * 2/3 = 7/12, Daughter: 7/8 * 1/3 = 7/24
    const heirs: HeirInput[] = [
      { type: 'wife', count: 1 },
      { type: 'son', count: 1 },
      { type: 'daughter', count: 1 },
    ]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'wife',
        count: 1,
        sharePerHeir: EIGHTH,
        totalShare: EIGHTH,
        shareType: 'fard',
        explanation: 'Wife gets 1/8',
        quranRef: '4:12',
      },
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Son Asaba',
        quranRef: '4:11',
      },
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Daughter Asaba bi-ghayrihi',
        quranRef: '4:11',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sonShare = result.find((s) => s.heirType === 'son')
    const daughterShare = result.find((s) => s.heirType === 'daughter')
    // Son: 7/8 * 2/3 = 14/24 = 7/12
    expect(sonShare!.totalShare.equals(new Fraction(7, 12))).toBe(true)
    // Daughter: 7/8 * 1/3 = 7/24
    expect(daughterShare!.totalShare.equals(new Fraction(7, 24))).toBe(true)
  })

  it("daughter(1/2) + full sister -> full sister gets 1/2 as Asaba ma'a ghayrihi", () => {
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 1 },
      { type: 'sister_full', count: 1 },
    ]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'One daughter, no sons',
        quranRef: '4:11',
      },
      {
        heirType: 'sister_full',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: "Asaba ma'a ghayrihi",
        quranRef: '4:176',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sisterShare = result.find((s) => s.heirType === 'sister_full')
    expect(sisterShare!.totalShare.equals(HALF)).toBe(true)
    expect(sisterShare!.shareType).toBe('asaba')
  })

  it('father with daughters only -> father gets 1/6 fard + remainder as Asaba', () => {
    // Daughter gets 1/2, father gets 1/6 fard + remainder
    // remainder = 1 - 1/2 - 1/6 = 2/6 = 1/3
    // Total father share = 1/6 + 1/3 = 1/2
    const heirs: HeirInput[] = [
      { type: 'daughter', count: 1 },
      { type: 'father', count: 1 },
    ]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'daughter',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'One daughter, no sons',
        quranRef: '4:11',
      },
      {
        heirType: 'father',
        count: 1,
        sharePerHeir: ONE_SIXTH,
        totalShare: ONE_SIXTH,
        shareType: 'fard_and_asaba',
        explanation: 'Father gets 1/6 fard + remainder',
        quranRef: '4:11',
        hadithRef: 'bukhari-6732',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const fatherShare = result.find((s) => s.heirType === 'father')
    // Father total: 1/6 + (1 - 1/2 - 1/6) = 1/6 + 1/3 = 1/2
    expect(fatherShare!.totalShare.equals(HALF)).toBe(true)
    expect(fatherShare!.shareType).toBe('fard_and_asaba')
  })

  it('full brother as Asaba bi-nafsihi when no closer male relative', () => {
    // In Kalalah: full brother gets entire estate
    const heirs: HeirInput[] = [{ type: 'brother_full', count: 1 }]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'brother_full',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Full brother Asaba',
        quranRef: '4:176',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const brotherShare = result.find((s) => s.heirType === 'brother_full')
    expect(brotherShare!.totalShare.equals(ONE)).toBe(true)
  })

  it('multiple sons -> remainder divided equally', () => {
    // 3 sons share entire estate equally: each gets 1/3
    const heirs: HeirInput[] = [{ type: 'son', count: 3 }]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 3,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Sons as Asaba',
        quranRef: '4:11',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sonShare = result.find((s) => s.heirType === 'son')
    expect(sonShare!.totalShare.equals(ONE)).toBe(true)
    expect(sonShare!.sharePerHeir.equals(ONE_THIRD)).toBe(true)
  })

  it('Asaba priority: son takes over son_of_son', () => {
    // Son present: son gets remainder, son_of_son should get nothing (blocked, but
    // if both are marked as active Asaba, son takes precedence by priority)
    const heirs: HeirInput[] = [
      { type: 'son', count: 1 },
      { type: 'son_of_son', count: 1 },
    ]
    const ctx = makeCtx('male', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'son',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Son Asaba',
        quranRef: '4:11',
      },
      {
        heirType: 'son_of_son',
        count: 1,
        sharePerHeir: ZERO,
        totalShare: ZERO,
        shareType: 'asaba',
        explanation: 'Son of son Asaba',
        quranRef: '4:11',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    const sonShare = result.find((s) => s.heirType === 'son')
    const grandsonShare = result.find((s) => s.heirType === 'son_of_son')
    expect(sonShare!.totalShare.equals(ONE)).toBe(true)
    // Grandson gets nothing -- Asaba priority ensures son takes all
    expect(grandsonShare!.totalShare.equals(ZERO)).toBe(true)
  })

  it('no remainder returns fixedShares unchanged (Awl will handle)', () => {
    // Fixed shares sum to more than 1 -- no room for Asaba
    const heirs: HeirInput[] = [
      { type: 'husband', count: 1 },
      { type: 'sister_full', count: 2 },
    ]
    const ctx = makeCtx('female', heirs)
    const fixedShares: ShareAssignment[] = [
      {
        heirType: 'husband',
        count: 1,
        sharePerHeir: HALF,
        totalShare: HALF,
        shareType: 'fard',
        explanation: 'Husband gets 1/2',
        quranRef: '4:12',
      },
      {
        heirType: 'sister_full',
        count: 2,
        sharePerHeir: ONE_THIRD,
        totalShare: TWO_THIRDS,
        shareType: 'fard',
        explanation: '2 sisters get 2/3',
        quranRef: '4:176',
      },
    ]
    const result = assignResiduary(heirs, fixedShares, ctx)
    // Shares should be unchanged; Awl handles over-allocation
    expect(result).toEqual(fixedShares)
  })
})
