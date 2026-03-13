import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import type { DivisionGroup, CashCompensation, DivisionResult } from '@/core/land/division'
import { useWizardStore } from '@/stores/wizardStore'
import { useDivisionStore } from '@/stores/divisionStore'
import { CompensationBanner } from '@/components/division/CompensationBanner'
import { GroupCard } from '@/components/division/GroupCard'
import { ParcelRow } from '@/components/division/ParcelRow'
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

const testProperties: Property[] = [
  makeProperty({ id: 'p1', nickname: 'Bari-er Jomi', landValue: 800000 }),
  makeProperty({ id: 'p2', nickname: 'Mather Jomi', landValue: 400000 }),
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

describe('Distribute Assets button visibility', () => {
  beforeEach(() => {
    useDivisionStore.setState({
      divisionResult: null,
      qurahMap: null,
      isRevealed: false,
      revealedGroupCount: 0,
      propertyFingerprint: null,
    })
  })

  it('does not appear on ResultsPage when no assets', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      movableAssets: [],
    })
    render(<App />)
    expect(screen.queryByText('Distribute Assets')).not.toBeInTheDocument()
  })

  it('appears on ResultsPage when properties exist', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: testProperties,
      movableAssets: [],
    })
    render(<App />)
    expect(screen.getByText('Distribute Assets')).toBeInTheDocument()
  })
})

describe('CompensationBanner', () => {
  it('renders correct who-owes-whom text', () => {
    const compensations: CashCompensation[] = [
      { fromGroup: 'son', toGroup: 'daughter', amount: 50000 },
    ]
    render(<CompensationBanner compensations={compensations} />)
    expect(screen.getByText(/Son received/)).toBeInTheDocument()
    expect(screen.getByText(/owes/)).toBeInTheDocument()
    expect(screen.getByText(/Daughter/)).toBeInTheDocument()
  })

  it('returns null when compensations array is empty', () => {
    const { container } = render(<CompensationBanner compensations={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('GroupCard', () => {
  const allGroups: DivisionGroup[] = [
    {
      heirType: 'son',
      label: 'Son',
      count: 2,
      targetValue: 600000,
      assignedProperties: ['p1'],
      assignedValue: 800000,
      cashAdjustment: 200000,
    },
    {
      heirType: 'daughter',
      label: 'Daughter',
      count: 1,
      targetValue: 400000,
      assignedProperties: [],
      assignedValue: 0,
      cashAdjustment: -400000,
    },
  ]

  it('shows "No land parcels assigned" for empty group', () => {
    render(
      <GroupCard
        group={allGroups[1]}
        allGroups={allGroups}
        properties={testProperties}
        onMoveParcel={() => {}}
      />,
    )
    expect(screen.getByText(/No land parcels assigned/)).toBeInTheDocument()
  })

  it('shows parcel rows for assigned properties', () => {
    render(
      <GroupCard
        group={allGroups[0]}
        allGroups={allGroups}
        properties={testProperties}
        onMoveParcel={() => {}}
      />,
    )
    expect(screen.getByText('Bari-er Jomi')).toBeInTheDocument()
  })
})

describe('ParcelRow', () => {
  const allGroups: DivisionGroup[] = [
    {
      heirType: 'son',
      label: 'Son',
      count: 2,
      targetValue: 600000,
      assignedProperties: ['p1'],
      assignedValue: 800000,
      cashAdjustment: 200000,
    },
    {
      heirType: 'daughter',
      label: 'Daughter',
      count: 1,
      targetValue: 400000,
      assignedProperties: ['p2'],
      assignedValue: 400000,
      cashAdjustment: 0,
    },
    {
      heirType: 'wife',
      label: 'Wife',
      count: 1,
      targetValue: 200000,
      assignedProperties: [],
      assignedValue: 0,
      cashAdjustment: -200000,
    },
  ]

  it('shows all groups except current as move targets', () => {
    render(
      <ParcelRow
        propertyId="p1"
        propertyName="Bari-er Jomi"
        propertyValue={800000}
        currentGroup="son"
        allGroups={allGroups}
        onMove={() => {}}
      />,
    )

    const select = screen.getByRole('combobox')
    const options = Array.from(select.querySelectorAll('option'))

    // Should have placeholder + 2 other groups (daughter, wife) but not son
    expect(options).toHaveLength(3) // placeholder + 2 groups
    const optionTexts = options.map((o) => o.textContent)
    expect(optionTexts).toContain('Daughter')
    expect(optionTexts).toContain('Wife')
    expect(optionTexts).not.toContain('Son')
  })
})
