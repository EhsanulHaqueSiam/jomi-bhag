import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import type { DistributionGroup, DistributionItem } from '@/core/distribution/types'
import type { IndividualColumn } from '@/core/distribution/individual-types'
import { useWizardStore } from '@/stores/wizardStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'
import { ViewToggle } from '@/components/distribution/ViewToggle'
import { InlineRename } from '@/components/distribution/InlineRename'
import { DistributionPage } from '@/components/distribution/DistributionPage'

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

function makeSimpleOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({
        heirType: 'son',
        count: 2,
        totalShare: new Fraction(2, 3),
        sharePerHeir: new Fraction(1, 3),
        shareType: 'asaba',
      }),
      makeShare({
        heirType: 'daughter',
        count: 1,
        totalShare: new Fraction(1, 3),
        sharePerHeir: new Fraction(1, 3),
      }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [],
    references: [],
  }
}

function makeProperty(
  overrides: Partial<Property> & { id: string },
): Property {
  return {
    nickname: '',
    type: 'residential',
    division: 'dhaka',
    upazila: null,
    rateSource: 'manual',
    landAreaSqft: 4356,
    landInputUnit: 'decimal',
    landValue: 500000,
    house: null,
    trees: null,
    pond: null,
    ...overrides,
  }
}

const testProperties: Property[] = [
  makeProperty({ id: 'p1', nickname: 'Bari-er Jomi', landValue: 600000 }),
]

const testGroups: DistributionGroup[] = [
  {
    heirType: 'son',
    label: 'Son',
    count: 2,
    targetValue: 400000,
    assignedItems: ['p1'],
    assignedValue: 600000,
    cashAdjustment: 200000,
  },
  {
    heirType: 'daughter',
    label: 'Daughter',
    count: 1,
    targetValue: 200000,
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: -200000,
  },
]

const testItems: DistributionItem[] = [
  { id: 'p1', type: 'property', category: 'residential', label: 'Bari-er Jomi', value: 600000 },
]

const testIndividuals: IndividualColumn[] = [
  {
    id: 'son_0',
    heirType: 'son',
    index: 0,
    displayName: 'Son 1',
    customName: null,
    targetValue: 200000,
    sharePerHeir: '1/3',
    assignedItems: ['p1'],
    assignedValue: 600000,
    cashAdjustment: 400000,
  },
  {
    id: 'son_1',
    heirType: 'son',
    index: 1,
    displayName: 'Son 2',
    customName: null,
    targetValue: 200000,
    sharePerHeir: '1/3',
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: -200000,
  },
  {
    id: 'daughter_0',
    heirType: 'daughter',
    index: 0,
    displayName: 'Daughter 1',
    customName: null,
    targetValue: 200000,
    sharePerHeir: '1/3',
    assignedItems: [],
    assignedValue: 0,
    cashAdjustment: -200000,
  },
]

const baseStoreState = {
  currentStep: 5,
  completedSteps: [1, 2, 3, 4],
  relationship: 'father' as const,
  deceasedGender: 'male' as const,
  userGender: 'male' as const,
  mfloEnabled: false,
  motherAlive: null,
  autoIncludes: [],
  wifeCount: 0,
  husbandPresent: false,
  sonCount: 2,
  daughterCount: 1,
  siblingTypeExpanded: false,
  brotherFullCount: 0,
  brotherConsanguineCount: 0,
  brotherUterineCount: 0,
  sisterFullCount: 0,
  sisterConsanguineCount: 0,
  sisterUterineCount: 0,
  totalEstateValue: 0,
  viewMode: 'simple' as const,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ViewToggle', () => {
  it('renders both tab buttons with correct ARIA attributes', () => {
    render(<ViewToggle view="group" onViewChange={() => {}} />)

    const tablist = screen.getByRole('tablist')
    expect(tablist).toBeInTheDocument()

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)

    // Group tab is selected
    expect(tabs[0]).toHaveTextContent('By Group')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

    // Individual tab is not selected
    expect(tabs[1]).toHaveTextContent('By Individual')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('switches active state on click', () => {
    const onViewChange = vi.fn()
    render(<ViewToggle view="group" onViewChange={onViewChange} />)

    fireEvent.click(screen.getByText('By Individual'))
    expect(onViewChange).toHaveBeenCalledWith('individual')
  })

  it('hides entirely when disabled', () => {
    render(<ViewToggle view="group" onViewChange={() => {}} disabled />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})

describe('InlineRename', () => {
  it('shows value in display mode', () => {
    render(<InlineRename value="Son 1" onSave={() => {}} />)
    expect(screen.getByText('Son 1')).toBeInTheDocument()
  })

  it('shows subtitle when provided', () => {
    render(<InlineRename value="Rahim" subtitle="Son 1" onSave={() => {}} />)
    expect(screen.getByText('Rahim')).toBeInTheDocument()
    expect(screen.getByText('Son 1')).toBeInTheDocument()
  })

  it('enters edit mode on click and saves on Enter', () => {
    const onSave = vi.fn()
    render(<InlineRename value="Son 1" onSave={onSave} />)

    // Click to enter edit mode
    fireEvent.click(screen.getByText('Son 1'))

    // Input should appear
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Son 1')

    // Type a new name and press Enter
    fireEvent.change(input, { target: { value: 'Rahim' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSave).toHaveBeenCalledWith('Rahim')
  })

  it('cancels on Escape', () => {
    const onSave = vi.fn()
    render(<InlineRename value="Son 1" onSave={onSave} />)

    fireEvent.click(screen.getByText('Son 1'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Different' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    // Should not save
    expect(onSave).not.toHaveBeenCalled()
    // Should show original value
    expect(screen.getByText('Son 1')).toBeInTheDocument()
  })

  it('stops pointer event propagation to prevent DnD conflict', () => {
    render(<InlineRename value="Son 1" onSave={() => {}} />)

    fireEvent.click(screen.getByText('Son 1'))
    const input = screen.getByRole('textbox')

    const event = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    })
    const stopPropSpy = vi.spyOn(event, 'stopPropagation')
    input.dispatchEvent(event)
    expect(stopPropSpy).toHaveBeenCalled()
  })
})

describe('DistributionPage view toggle', () => {
  beforeEach(() => {
    useDistributionStore.setState({
      distributionResult: {
        groups: testGroups,
        items: testItems,
        totalEstateValue: 600000,
        compensations: [],
      },
      previousSnapshot: null,
      fingerprint: null,
    })

    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: testProperties,
      movableAssets: [],
    })

    useIndividualDistributionStore.setState({
      individuals: testIndividuals,
      items: testItems,
      compensations: [],
      customNames: {},
      previousSnapshot: null,
      fingerprint: 'test-fingerprint',
      qurahUsed: false,
      hasBeenUsed: true,
      revealedCount: 0,
      isRevealed: false,
      splitOrigins: new Map(),
    })
  })

  it('renders ViewToggle with "By Group" and "By Individual" tabs', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    expect(screen.getByText('By Group')).toBeInTheDocument()
    expect(screen.getByText('By Individual')).toBeInTheDocument()
  })

  it('shows group view by default with Randomize button', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    expect(screen.getByText('Randomize')).toBeInTheDocument()
  })

  it('switches to individual view when By Individual tab is clicked', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    fireEvent.click(screen.getByText('By Individual'))

    // Individual view should show Qurah button and individual names
    expect(screen.getByText('Draw Lots (Qurah)')).toBeInTheDocument()
    // Names appear in both column headers and mobile fallback dropdowns
    expect(screen.getAllByText('Son 1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Son 2').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Daughter 1').length).toBeGreaterThanOrEqual(1)
  })

  it('shows section headers for heir types in individual view', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    fireEvent.click(screen.getByText('By Individual'))

    // Section headers
    expect(screen.getByText(/Sons/)).toBeInTheDocument()
    expect(screen.getByText(/Daughters/)).toBeInTheDocument()
  })

  it('hides group controls in individual view', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    fireEvent.click(screen.getByText('By Individual'))

    // Group Randomize button should not be visible
    expect(screen.queryByText('Randomize')).not.toBeInTheDocument()
  })
})
