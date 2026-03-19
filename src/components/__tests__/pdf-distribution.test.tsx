import { describe, expect, it, vi } from 'vitest'
import Fraction from 'fraction.js'
import type { ReactNode } from 'react'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { DistributionResult, DistributionGroup, DistributionItem } from '@/core/distribution/types'
import type { CashCompensation } from '@/core/land/division'

// ---------------------------------------------------------------------------
// Mock @react-pdf/renderer -- PDF primitives as simple passthroughs
// ---------------------------------------------------------------------------

vi.mock('@react-pdf/renderer', () => {
  return {
    Document: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Image: ({ src }: { src: string }) => <img src={src} alt="" />,
    StyleSheet: {
      create: <T extends Record<string, unknown>>(styles: T): T => styles,
    },
    Font: {
      register: () => undefined,
    },
  }
})

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { extractPdfData } from '@/components/pdf/extractPdfData'

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeShare(
  overrides: Partial<ShareResult> & { heirType: ShareResult['heirType'] },
): ShareResult {
  return {
    count: 1,
    sharePerHeir: new Fraction(1, 4),
    totalShare: new Fraction(1, 4),
    shareType: 'fard',
    explanation: 'Test explanation',
    ...overrides,
  }
}

function makeBasicOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({
        heirType: 'wife',
        sharePerHeir: new Fraction(1, 4),
        totalShare: new Fraction(1, 4),
      }),
      makeShare({
        heirType: 'son',
        count: 2,
        sharePerHeir: new Fraction(3, 8),
        totalShare: new Fraction(3, 4),
        shareType: 'asaba',
        explanation: 'Son takes remainder as asaba',
      }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [
      { step: 1, description: 'Identify heirs', detail: 'Wife and sons present' },
    ],
    references: [],
  }
}

function makeDistributionItems(): DistributionItem[] {
  return [
    { id: 'prop-1', type: 'property', category: 'Land', label: 'Main House', value: 500000 },
    { id: 'mov-1', type: 'movable', category: 'Gold/Silver', label: 'Gold 10 vori 22K', value: 300000 },
    { id: 'mov-2', type: 'movable', category: 'Vehicle', label: 'Toyota Corolla', value: 200000 },
  ]
}

function makeDistributionResult(): DistributionResult {
  const items = makeDistributionItems()
  const compensations: CashCompensation[] = [
    { fromGroup: 'son', toGroup: 'daughter', amount: 50000 },
  ]
  const groups: DistributionGroup[] = [
    {
      heirType: 'son',
      label: 'Son',
      count: 2,
      targetValue: 600000,
      assignedItems: ['prop-1', 'mov-1'],  // 500000 + 300000 = 800000
      assignedValue: 800000,
      cashAdjustment: 200000,  // over-allocated
    },
    {
      heirType: 'daughter',
      label: 'Daughter',
      count: 1,
      targetValue: 400000,
      assignedItems: ['mov-2'],  // 200000
      assignedValue: 200000,
      cashAdjustment: -200000,  // under-allocated
    },
  ]
  return {
    groups,
    items,
    totalEstateValue: 1000000,
    compensations,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('extractPdfData with distributionResult', () => {
  const output = makeBasicOutput()

  it('produces PdfData.distribution with correct group count', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      makeDistributionResult(),
    )

    expect(result.distribution).toBeDefined()
    expect(result.distribution!.groups).toHaveLength(2)
  })

  it('maps items correctly with label, category, type, and value', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      makeDistributionResult(),
    )

    const sonGroup = result.distribution!.groups[0]
    expect(sonGroup.assignedItems).toHaveLength(2)

    // Items should include both the property and the movable
    const labels = sonGroup.assignedItems.map((i) => i.label)
    expect(labels).toContain('Main House')
    expect(labels).toContain('Gold 10 vori 22K')

    const house = sonGroup.assignedItems.find((i) => i.label === 'Main House')!
    expect(house.type).toBe('property')
    expect(house.category).toBe('Land')
    expect(house.value).toBe(500000)

    const gold = sonGroup.assignedItems.find((i) => i.label === 'Gold 10 vori 22K')!
    expect(gold.type).toBe('movable')
    expect(gold.category).toBe('Gold/Silver')
    expect(gold.value).toBe(300000)
  })

  it('maps compensations with display labels', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      makeDistributionResult(),
    )

    expect(result.distribution!.compensations).toHaveLength(1)
    expect(result.distribution!.compensations[0]).toEqual({
      from: 'Son',
      to: 'Daughter',
      amount: 50000,
    })
  })

  it('does NOT set distribution when distributionResult is absent', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      // no distributionResult
    )

    expect(result.distribution).toBeUndefined()
  })

  it('sorts group items by value descending', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      makeDistributionResult(),
    )

    const sonGroup = result.distribution!.groups[0]
    // Son has Main House (500000) and Gold (300000) -- should be sorted desc
    expect(sonGroup.assignedItems[0].value).toBe(500000)
    expect(sonGroup.assignedItems[1].value).toBe(300000)
  })

  it('cash adjustment reflects over/under-allocation per group', () => {
    const result = extractPdfData(
      output, [], 1000000, null, null,
      [],
      makeDistributionResult(),
    )

    const sonGroup = result.distribution!.groups.find((g) => g.heirType === 'Son')!
    const daughterGroup = result.distribution!.groups.find((g) => g.heirType === 'Daughter')!

    // Son: assigned 800000, target 600000 -> over-allocated by 200000
    expect(sonGroup.cashAdjustment).toBe(200000)
    expect(sonGroup.assignedValue).toBe(800000)
    expect(sonGroup.targetValue).toBe(600000)

    // Daughter: assigned 200000, target 400000 -> under-allocated by 200000
    expect(daughterGroup.cashAdjustment).toBe(-200000)
    expect(daughterGroup.assignedValue).toBe(200000)
    expect(daughterGroup.targetValue).toBe(400000)
  })
})
