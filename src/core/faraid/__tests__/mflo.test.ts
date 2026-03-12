/**
 * Tests for MFLO Section 4 (Orphaned Grandchildren)
 *
 * MFLO Section 4: "In the event of death of any son or daughter of the
 * propositus before the opening of succession, the children of such son or
 * daughter, if any, living at the time the succession opens, shall per stirpes
 * receive a share equivalent to the share which such son or daughter would have
 * received if alive."
 */

import { describe, it, expect } from 'vitest'
import { applyMFLO } from '../mflo'
import { buildHeirContext } from '../shares'
import type { FaraidInput } from '../types'
import { ONE_THIRD, ONE_SIXTH } from '@/core/utils/fraction'

describe('applyMFLO', () => {
  it('mfloEnabled=false returns null (pure Hanafi)', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1 },
        { type: 'son_of_son', count: 1 },
      ],
      mfloEnabled: false,
    }
    const ctx = buildHeirContext(input)
    const result = applyMFLO(input, ctx)
    expect(result).toBeNull()
  })

  it('mfloEnabled=true with predeceased son gives grandson per stirpes share', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1 },
      ],
      mfloEnabled: true,
      predeceasedChildren: [
        {
          gender: 'male',
          livingChildren: [{ type: 'son_of_son', count: 1 }],
        },
      ],
    }
    const ctx = buildHeirContext(input)
    const result = applyMFLO(input, ctx)

    expect(result).not.toBeNull()
    expect(result!.mfloShares.length).toBeGreaterThan(0)
    expect(result!.explanation).toBeDefined()
    expect(result!.explanation.detail).toContain('MFLO Section 4')
  })

  it('mfloEnabled=true with no predeceased children has no effect', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 2 },
      ],
      mfloEnabled: true,
    }
    const ctx = buildHeirContext(input)
    const result = applyMFLO(input, ctx)
    expect(result).toBeNull()
  })

  it('MFLO warning annotation present', () => {
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1 },
      ],
      mfloEnabled: true,
      predeceasedChildren: [
        {
          gender: 'male',
          livingChildren: [{ type: 'son_of_son', count: 1 }],
        },
      ],
    }
    const ctx = buildHeirContext(input)
    const result = applyMFLO(input, ctx)

    expect(result).not.toBeNull()
    expect(result!.explanation.detail).toContain(
      'MFLO Section 4 applied',
    )
    expect(result!.explanation.detail).toContain(
      'modifies classical Faraid rules',
    )
  })

  it('MFLO per stirpes distributes predeceased share at 2:1 male/female ratio', () => {
    // Predeceased son had 1 son and 1 daughter as children
    // Living son gets 1/2 of estate, predeceased son would have gotten 1/2
    // Grandson gets 2/3 of that 1/2 = 1/3
    // Granddaughter gets 1/3 of that 1/2 = 1/6
    const input: FaraidInput = {
      deceasedGender: 'male',
      heirs: [
        { type: 'son', count: 1 },
      ],
      mfloEnabled: true,
      predeceasedChildren: [
        {
          gender: 'male',
          livingChildren: [
            { type: 'son_of_son', count: 1 },
            { type: 'daughter_of_son', count: 1 },
          ],
        },
      ],
    }
    const ctx = buildHeirContext(input)
    const result = applyMFLO(input, ctx)

    expect(result).not.toBeNull()
    // The predeceased son would have gotten 1/2 (since there are 2 sons total if alive)
    // Son_of_son gets 2/3 of 1/2 = 1/3
    // Daughter_of_son gets 1/3 of 1/2 = 1/6
    const grandson = result!.mfloShares.find((s) => s.heirType === 'son_of_son')
    const granddaughter = result!.mfloShares.find((s) => s.heirType === 'daughter_of_son')
    expect(grandson).toBeDefined()
    expect(granddaughter).toBeDefined()
    expect(grandson!.totalShare.equals(ONE_THIRD)).toBe(true)
    expect(granddaughter!.totalShare.equals(ONE_SIXTH)).toBe(true)
  })
})
