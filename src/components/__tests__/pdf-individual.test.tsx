import { describe, expect, it, vi, beforeEach } from 'vitest'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { DistributionResult, DistributionGroup, DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn, IndividualCompensation } from '@/core/distribution/individual-types'
import type { CashCompensation } from '@/core/land/division'

// ---------------------------------------------------------------------------
// Mock @react-pdf/renderer -- PDF primitives as simple passthroughs
// ---------------------------------------------------------------------------

vi.mock('@react-pdf/renderer', () => {
  const React = require('react')
  return {
    Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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
// Mock individualDistributionStore
// ---------------------------------------------------------------------------

const mockIndividualState = {
  individuals: [] as IndividualColumn[],
  items: [] as DistributionItem[],
  compensations: [] as IndividualCompensation[],
  customNames: {} as Record<string, string>,
  hasBeenUsed: false,
  qurahUsed: false,
}

vi.mock('@/stores/individualDistributionStore', () => ({
  useIndividualDistributionStore: {
    getState: () => mockIndividualState,
  },
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { extractPdfData } from '@/components/pdf/extractPdfData'
import { PdfIndividualSection } from '@/components/pdf/PdfIndividualSection'
import type { PdfIndividualDistribution } from '@/components/pdf/pdfTypes'

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
        sharePerHeir: new Fraction(1, 8),
        totalShare: new Fraction(1, 8),
      }),
      makeShare({
        heirType: 'son',
        count: 3,
        sharePerHeir: new Fraction(7, 24),
        totalShare: new Fraction(7, 8),
        shareType: 'asaba',
        explanation: 'Sons take remainder as asaba',
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

function makeIndividualItems(): DistributionItem[] {
  return [
    { id: 'prop-1', type: 'property', category: 'Land', label: 'Main House', value: 400000 },
    { id: 'prop-2', type: 'property', category: 'Land', label: 'Farm Land', value: 300000 },
    { id: 'mov-1', type: 'movable', category: 'Gold/Silver', label: 'Gold 5 vori 22K', value: 200000 },
    { id: 'mov-2', type: 'movable', category: 'Vehicle', label: 'Toyota Corolla', value: 100000 },
  ]
}

function makeIndividuals(): IndividualColumn[] {
  return [
    {
      id: 'son_0',
      heirType: 'son',
      index: 0,
      displayName: 'Son 1',
      customName: null,
      targetValue: 291667,
      sharePerHeir: '7/24',
      assignedItems: ['prop-1'],
      assignedValue: 400000,
      cashAdjustment: 108333,
    },
    {
      id: 'son_1',
      heirType: 'son',
      index: 1,
      displayName: 'Son 2',
      customName: null,
      targetValue: 291667,
      sharePerHeir: '7/24',
      assignedItems: ['prop-2'],
      assignedValue: 300000,
      cashAdjustment: 8333,
    },
    {
      id: 'son_2',
      heirType: 'son',
      index: 2,
      displayName: 'Son 3',
      customName: null,
      targetValue: 291667,
      sharePerHeir: '7/24',
      assignedItems: ['mov-1', 'mov-2'],
      assignedValue: 300000,
      cashAdjustment: 8333,
    },
  ]
}

function makeIndividualCompensations(): IndividualCompensation[] {
  return [
    {
      fromId: 'son_0',
      fromName: 'Son 1',
      toId: 'son_1',
      toName: 'Son 2',
      amount: 50000,
    },
    {
      fromId: 'son_0',
      fromName: 'Son 1',
      toId: 'son_2',
      toName: 'Son 3',
      amount: 50000,
    },
  ]
}

function setMockIndividualState(overrides: Partial<typeof mockIndividualState>) {
  Object.assign(mockIndividualState, {
    individuals: [],
    items: [],
    compensations: [],
    customNames: {},
    hasBeenUsed: false,
    qurahUsed: false,
    ...overrides,
  })
}

function makeMockPdfIndividualDistribution(): PdfIndividualDistribution {
  return {
    heirsByType: [
      {
        typeName: 'Son',
        heirs: [
          {
            id: 'son_0',
            displayName: 'Son 1',
            subtitle: null,
            heirType: 'Son',
            targetValue: 291667,
            assignedValue: 400000,
            equilibriumStatus: 'off',
            equilibriumPercentage: 137.14,
            items: [
              { label: 'Main House', category: 'Land', type: 'property', value: 400000 },
            ],
            cashAdjustment: 108333,
          },
          {
            id: 'son_1',
            displayName: 'Son 2',
            subtitle: null,
            heirType: 'Son',
            targetValue: 291667,
            assignedValue: 300000,
            equilibriumStatus: 'close',
            equilibriumPercentage: 102.86,
            items: [
              { label: 'Farm Land', category: 'Land', type: 'property', value: 300000 },
            ],
            cashAdjustment: 8333,
          },
        ],
      },
      {
        typeName: 'Daughter',
        heirs: [
          {
            id: 'daughter_0',
            displayName: 'Fatima',
            subtitle: 'Daughter 1',
            heirType: 'Daughter',
            targetValue: 125000,
            assignedValue: 125000,
            equilibriumStatus: 'balanced',
            equilibriumPercentage: 100,
            items: [
              { label: 'Gold 5 vori 22K', category: 'Gold/Silver', type: 'movable', value: 125000 },
            ],
            cashAdjustment: 0,
          },
        ],
      },
    ],
    compensations: [
      { fromName: 'Son 1', toName: 'Daughter 1', amount: 30000 },
    ],
    totalBalanced: 1,
    totalHeirs: 3,
    totalEstateValue: 1000000,
    qurahUsed: true,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('extractPdfData with individual distribution', () => {
  const output = makeBasicOutput()

  beforeEach(() => {
    setMockIndividualState({})
  })

  it('includes individualDistribution when store hasBeenUsed=true', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: makeIndividualCompensations(),
      qurahUsed: true,
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution).toBeDefined()
    expect(result.individualDistribution!.heirsByType).toHaveLength(1) // all sons
    expect(result.individualDistribution!.heirsByType[0].typeName).toBe('Son')
    expect(result.individualDistribution!.heirsByType[0].heirs).toHaveLength(3)
  })

  it('excludes individualDistribution when store hasBeenUsed=false', () => {
    setMockIndividualState({
      hasBeenUsed: false,
      individuals: [],
      items: [],
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution).toBeUndefined()
  })

  it('correctly groups heirs by type', () => {
    const individuals = makeIndividuals()
    // Add a daughter
    individuals.push({
      id: 'daughter_0',
      heirType: 'daughter',
      index: 0,
      displayName: 'Daughter 1',
      customName: null,
      targetValue: 125000,
      sharePerHeir: '1/8',
      assignedItems: [],
      assignedValue: 0,
      cashAdjustment: -125000,
    })

    setMockIndividualState({
      hasBeenUsed: true,
      individuals,
      items: makeIndividualItems(),
      compensations: [],
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution!.heirsByType).toHaveLength(2)
    expect(result.individualDistribution!.heirsByType[0].typeName).toBe('Son')
    expect(result.individualDistribution!.heirsByType[0].heirs).toHaveLength(3)
    expect(result.individualDistribution!.heirsByType[1].typeName).toBe('Daughter')
    expect(result.individualDistribution!.heirsByType[1].heirs).toHaveLength(1)
  })

  it('uses custom names as displayName with original as subtitle', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
      customNames: { son_0: 'Ahmed' },
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    const heir = result.individualDistribution!.heirsByType[0].heirs[0]
    expect(heir.displayName).toBe('Ahmed')
    expect(heir.subtitle).toBe('Son 1')
  })

  it('sets subtitle to null when no custom name', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
      customNames: {},
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    const heir = result.individualDistribution!.heirsByType[0].heirs[0]
    expect(heir.displayName).toBe('Son 1')
    expect(heir.subtitle).toBeNull()
  })

  it('calculates equilibrium status correctly', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    // Son 1: 400000/291667 = ~137% -> off (>5% deviation)
    const son1 = result.individualDistribution!.heirsByType[0].heirs[0]
    expect(son1.equilibriumStatus).toBe('off')

    // Son 2: 300000/291667 = ~102.86% -> close (2-5% deviation)
    const son2 = result.individualDistribution!.heirsByType[0].heirs[1]
    expect(son2.equilibriumStatus).toBe('close')

    // Son 3: 300000/291667 = ~102.86% -> close
    const son3 = result.individualDistribution!.heirsByType[0].heirs[2]
    expect(son3.equilibriumStatus).toBe('close')
  })

  it('maps compensations with custom names', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: makeIndividualCompensations(),
      customNames: { son_0: 'Ahmed' },
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution!.compensations).toHaveLength(2)
    expect(result.individualDistribution!.compensations[0].fromName).toBe('Ahmed')
    expect(result.individualDistribution!.compensations[0].toName).toBe('Son 2')
    expect(result.individualDistribution!.compensations[0].amount).toBe(50000)
  })

  it('counts balanced heirs correctly', () => {
    // Make all individuals balanced (assignedValue === targetValue)
    const balanced: IndividualColumn[] = [
      {
        id: 'son_0',
        heirType: 'son',
        index: 0,
        displayName: 'Son 1',
        customName: null,
        targetValue: 500000,
        sharePerHeir: '1/2',
        assignedItems: ['prop-1'],
        assignedValue: 500000,
        cashAdjustment: 0,
      },
      {
        id: 'son_1',
        heirType: 'son',
        index: 1,
        displayName: 'Son 2',
        customName: null,
        targetValue: 500000,
        sharePerHeir: '1/2',
        assignedItems: ['prop-2'],
        assignedValue: 500000,
        cashAdjustment: 0,
      },
    ]

    setMockIndividualState({
      hasBeenUsed: true,
      individuals: balanced,
      items: [
        { id: 'prop-1', type: 'property', category: 'Land', label: 'Plot A', value: 500000 },
        { id: 'prop-2', type: 'property', category: 'Land', label: 'Plot B', value: 500000 },
      ],
      compensations: [],
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution!.totalBalanced).toBe(2)
    expect(result.individualDistribution!.totalHeirs).toBe(2)
  })

  it('includes qurahUsed flag', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
      qurahUsed: true,
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    expect(result.individualDistribution!.qurahUsed).toBe(true)
  })

  it('maps assigned items correctly with value descending sort', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
    })

    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    // Son 3 has mov-1 (200000) and mov-2 (100000)
    const son3 = result.individualDistribution!.heirsByType[0].heirs[2]
    expect(son3.items).toHaveLength(2)
    expect(son3.items[0].value).toBe(200000) // sorted desc
    expect(son3.items[1].value).toBe(100000)
    expect(son3.items[0].label).toBe('Gold 5 vori 22K')
    expect(son3.items[1].label).toBe('Toyota Corolla')
  })
})

describe('PdfIndividualSection smoke test', () => {
  it('can be instantiated without throwing', () => {
    const data = makeMockPdfIndividualDistribution()

    // Smoke test: creating the component should not throw
    expect(() => {
      PdfIndividualSection({ individualDistribution: data })
    }).not.toThrow()
  })

  it('renders with qurahUsed=false without throwing', () => {
    const data = makeMockPdfIndividualDistribution()
    data.qurahUsed = false

    expect(() => {
      PdfIndividualSection({ individualDistribution: data })
    }).not.toThrow()
  })

  it('renders with empty compensations without throwing', () => {
    const data = makeMockPdfIndividualDistribution()
    data.compensations = []

    expect(() => {
      PdfIndividualSection({ individualDistribution: data })
    }).not.toThrow()
  })

  it('renders with heir having no items without throwing', () => {
    const data = makeMockPdfIndividualDistribution()
    data.heirsByType[0].heirs[0].items = []

    expect(() => {
      PdfIndividualSection({ individualDistribution: data })
    }).not.toThrow()
  })
})

describe('Round-trip integration: store state -> PDF data', () => {
  it('individual section data matches store state', () => {
    const individuals = makeIndividuals()
    const items = makeIndividualItems()
    const compensations = makeIndividualCompensations()

    setMockIndividualState({
      hasBeenUsed: true,
      individuals,
      items,
      compensations,
      qurahUsed: false,
      customNames: { son_1: 'Bashir' },
    })

    const output = makeBasicOutput()
    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    const indiv = result.individualDistribution!

    // Verify structure
    expect(indiv.heirsByType).toHaveLength(1)
    expect(indiv.totalHeirs).toBe(3)
    expect(indiv.qurahUsed).toBe(false)

    // Verify custom name applied
    const son2 = indiv.heirsByType[0].heirs[1]
    expect(son2.displayName).toBe('Bashir')
    expect(son2.subtitle).toBe('Son 2')

    // Verify compensation names use custom names
    expect(indiv.compensations[0].fromName).toBe('Son 1') // no custom name
    expect(indiv.compensations[0].toName).toBe('Bashir') // custom name for son_1

    // Verify all items accounted for
    const totalItems = indiv.heirsByType.flatMap((g) => g.heirs).flatMap((h) => h.items)
    expect(totalItems).toHaveLength(4) // 1 + 1 + 2
  })

  it('equilibrium percentages match algorithm output', () => {
    setMockIndividualState({
      hasBeenUsed: true,
      individuals: makeIndividuals(),
      items: makeIndividualItems(),
      compensations: [],
    })

    const output = makeBasicOutput()
    const result = extractPdfData(
      output, [], 1000000, null, null,
      null, [],
      null,
    )

    const heirs = result.individualDistribution!.heirsByType[0].heirs

    // Son 1: 400000/291667 * 100 = ~137.14%
    expect(heirs[0].equilibriumPercentage).toBeGreaterThan(130)
    expect(heirs[0].equilibriumPercentage).toBeLessThan(140)

    // Son 2 and Son 3: 300000/291667 * 100 = ~102.86%
    expect(heirs[1].equilibriumPercentage).toBeGreaterThan(100)
    expect(heirs[1].equilibriumPercentage).toBeLessThan(105)
    expect(heirs[2].equilibriumPercentage).toBeGreaterThan(100)
    expect(heirs[2].equilibriumPercentage).toBeLessThan(105)
  })
})
