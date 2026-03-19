import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import type { MovableAsset } from '@/core/assets/types'
import type { DistributionGroup, DistributionItem } from '@/core/distribution/types'
import { useWizardStore } from '@/stores/wizardStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { EquilibriumBar } from '@/components/distribution/EquilibriumBar'
import { SummaryBanner } from '@/components/distribution/SummaryBanner'
import { DistributionControls } from '@/components/distribution/DistributionControls'
import { MobileFallback } from '@/components/distribution/MobileFallback'
import { DistributionPage } from '@/components/distribution/DistributionPage'
import App from '@/App'

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
        heirType: 'husband',
        totalShare: new Fraction(1, 4),
        sharePerHeir: new Fraction(1, 4),
      }),
      makeShare({
        heirType: 'daughter',
        count: 2,
        totalShare: new Fraction(2, 3),
        sharePerHeir: new Fraction(1, 3),
      }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(11, 12),
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

function makeMovableAsset(
  overrides: Partial<MovableAsset> & { id: string },
): MovableAsset {
  return {
    id: overrides.id,
    category: 'cash',
    amount: 100000,
    ...overrides,
  } as MovableAsset
}

const testProperties: Property[] = [
  makeProperty({ id: 'p1', nickname: 'Bari-er Jomi', landValue: 800000 }),
]

const testMovableAssets: MovableAsset[] = [
  makeMovableAsset({ id: 'ma1', category: 'cash', amount: 200000 }),
]

const testGroups: DistributionGroup[] = [
  {
    heirType: 'husband',
    label: 'Husband',
    count: 1,
    targetValue: 300000,
    assignedItems: ['p1'],
    assignedValue: 800000,
    cashAdjustment: 500000,
  },
  {
    heirType: 'daughter',
    label: 'Daughter',
    count: 2,
    targetValue: 700000,
    assignedItems: ['ma1'],
    assignedValue: 200000,
    cashAdjustment: -500000,
  },
]

const testItems: DistributionItem[] = [
  { id: 'p1', type: 'property', category: 'residential', label: 'Bari-er Jomi', value: 800000 },
  { id: 'ma1', type: 'movable', category: 'cash', label: 'Cash', value: 200000 },
]

const baseStoreState = {
  currentStep: 4,
  completedSteps: [1, 2, 3],
  relationship: 'father' as const,
  deceasedGender: 'male' as const,
  userGender: 'male' as const,
  mfloEnabled: false,
  motherAlive: null,
  autoIncludes: [],
  wifeCount: 0,
  husbandPresent: false,
  sonCount: 0,
  daughterCount: 0,
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

describe('DistributionPage renders', () => {
  beforeEach(() => {
    useDistributionStore.setState({
      distributionResult: {
        groups: testGroups,
        items: testItems,
        totalEstateValue: 1000000,
        compensations: [],
      },
      previousSnapshot: null,
      fingerprint: null,
    })
  })

  it('renders "Asset Distribution" heading and "Back to Results" button', () => {
    render(<DistributionPage onNavigate={() => {}} />)

    expect(screen.getByText('Asset Distribution')).toBeInTheDocument()
    expect(screen.getByText('Back to Results')).toBeInTheDocument()
  })
})

describe('Distribute Assets button on ResultsPage', () => {
  beforeEach(() => {
    useDistributionStore.setState({
      distributionResult: null,
      previousSnapshot: null,
      fingerprint: null,
    })
  })

  it('appears when properties exist', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: testProperties,
      movableAssets: [],
    })
    render(<App />)
    expect(screen.getByText('Distribute Assets')).toBeInTheDocument()
  })

  it('appears when movable assets exist (no properties)', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      movableAssets: testMovableAssets,
    })
    render(<App />)
    expect(screen.getByText('Distribute Assets')).toBeInTheDocument()
  })

  it('does NOT appear when no properties and no movable assets', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      movableAssets: [],
    })
    render(<App />)
    expect(screen.queryByText('Distribute Assets')).not.toBeInTheDocument()
  })
})

describe('EquilibriumBar', () => {
  it('renders green styling when within 2% of target', () => {
    const { container } = render(
      <EquilibriumBar assignedValue={99000} targetValue={100000} />,
    )
    expect(screen.getByText('99% of target')).toBeInTheDocument()
    // Green bar class
    const bar = container.querySelector('[class*="bg-emerald-500"]')
    expect(bar).toBeTruthy()
  })

  it('renders red styling and over-target text when assigned > target + 5%', () => {
    render(
      <EquilibriumBar assignedValue={120000} targetValue={100000} />,
    )
    expect(screen.getByText('120% of target')).toBeInTheDocument()
    expect(screen.getByText(/over target/)).toBeInTheDocument()
  })
})

describe('SummaryBanner', () => {
  it('shows "All groups balanced!" when all groups are balanced', () => {
    render(<SummaryBanner balancedCount={4} totalCount={4} />)
    expect(screen.getByText('All groups balanced!')).toBeInTheDocument()
  })

  it('shows "X/Y groups balanced" when partially balanced', () => {
    render(<SummaryBanner balancedCount={2} totalCount={4} />)
    expect(screen.getByText('2/4 groups balanced')).toBeInTheDocument()
  })
})

describe('DistributionControls', () => {
  it('shows Undo button when canUndo is true', () => {
    render(
      <DistributionControls
        onRandomize={() => {}}
        onAutoDistribute={() => {}}
        onUndo={() => {}}
        canUndo={true}
      />,
    )
    expect(screen.getByText('Undo')).toBeInTheDocument()
  })

  it('hides Undo button when canUndo is false', () => {
    render(
      <DistributionControls
        onRandomize={() => {}}
        onAutoDistribute={() => {}}
        onUndo={() => {}}
        canUndo={false}
      />,
    )
    expect(screen.queryByText('Undo')).not.toBeInTheDocument()
  })

  it('shows Auto-distribute button', () => {
    render(
      <DistributionControls
        onRandomize={() => {}}
        onAutoDistribute={() => {}}
        onUndo={() => {}}
        canUndo={false}
      />,
    )
    expect(screen.getByText('Auto-distribute')).toBeInTheDocument()
  })
})

describe('MobileFallback', () => {
  it('shows all groups except current as options', () => {
    const item: DistributionItem = {
      id: 'p1',
      type: 'property',
      category: 'residential',
      label: 'Test Property',
      value: 500000,
    }

    render(
      <MobileFallback
        item={item}
        currentGroupHeirType="husband"
        allGroups={testGroups}
        onMove={() => {}}
      />,
    )

    const select = screen.getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option'))

    // Should have placeholder + 1 other group (daughter), but not husband
    expect(options).toHaveLength(2) // placeholder + 1 group
    const optionTexts = options.map((o) => o.textContent)
    expect(optionTexts).toContain('Daughter')
    expect(optionTexts).not.toContain('Husband')
  })
})
