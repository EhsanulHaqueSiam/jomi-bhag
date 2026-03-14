import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Fraction from 'fraction.js'
import App from '@/App'
import { useWizardStore } from '@/stores/wizardStore'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { Property } from '@/core/land/types'
import type { MovableAsset, VehicleAsset, CashAsset } from '@/core/assets/types'

// ---------------------------------------------------------------------------
// Mock FaraidOutput factories
// ---------------------------------------------------------------------------

function makeShare(overrides: Partial<ShareResult> & { heirType: ShareResult['heirType'] }): ShareResult {
  return {
    count: 1,
    sharePerHeir: new Fraction(1, 4),
    totalShare: new Fraction(1, 4),
    shareType: 'fard',
    explanation: 'Test explanation',
    ...overrides,
  }
}

/** Simple scenario: husband + 2 daughters. */
function makeSimpleOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({ heirType: 'husband', totalShare: new Fraction(1, 4), sharePerHeir: new Fraction(1, 4) }),
      makeShare({ heirType: 'daughter', count: 2, totalShare: new Fraction(2, 3), sharePerHeir: new Fraction(1, 3) }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(11, 12),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [
      { step: 1, description: 'Identify heirs', detail: 'Husband and 2 daughters are present.' },
      { step: 2, description: 'Assign fixed shares', detail: 'Husband receives 1/4 with children present. 2 daughters share 2/3.' },
      { step: 3, description: 'Assign residuary', detail: 'No residuary heirs. Total = 11/12.' },
    ],
    references: [],
  }
}

/** Awl scenario: shares exceed 1. */
function makeAwlOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({ heirType: 'husband', totalShare: new Fraction(3, 13), sharePerHeir: new Fraction(3, 13) }),
      makeShare({ heirType: 'daughter', count: 2, totalShare: new Fraction(8, 13), sharePerHeir: new Fraction(4, 13) }),
      makeShare({ heirType: 'mother', totalShare: new Fraction(2, 13), sharePerHeir: new Fraction(2, 13) }),
    ],
    adjustment: 'awl',
    totalBeforeAdjustment: new Fraction(13, 12),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [
      { step: 1, description: 'Identify heirs', detail: 'Husband, 2 daughters, and mother present.' },
      { step: 2, description: 'Assign shares', detail: 'Total shares = 13/12 > 1. Awl applied.' },
    ],
    references: [],
  }
}

/** Blocked heirs scenario. */
function makeBlockedOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({ heirType: 'son', totalShare: new Fraction(3, 4), sharePerHeir: new Fraction(3, 4), shareType: 'asaba' }),
      makeShare({ heirType: 'wife', totalShare: new Fraction(1, 8), sharePerHeir: new Fraction(1, 8) }),
      makeShare({ heirType: 'mother', totalShare: new Fraction(1, 6), sharePerHeir: new Fraction(1, 6) }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [
      { heirType: 'brother_full', blockedBy: 'son', rule: 'Sons block all siblings from inheritance' },
    ],
    specialCases: [],
    mfloApplied: false,
    steps: [
      { step: 1, description: 'Identify heirs', detail: 'Son, wife, mother, and full brother present.' },
      { step: 2, description: 'Apply blocking', detail: 'Full brother blocked by son.' },
    ],
    references: [],
  }
}

/** Special case scenario with Kalalah. */
function makeKalalahOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({ heirType: 'wife', totalShare: new Fraction(1, 4), sharePerHeir: new Fraction(1, 4) }),
      makeShare({ heirType: 'sister_full', totalShare: new Fraction(1, 2), sharePerHeir: new Fraction(1, 2), shareType: 'fard' }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(3, 4),
    blockedHeirs: [],
    specialCases: ['kalalah'],
    mfloApplied: false,
    steps: [
      { step: 1, description: 'Detect Kalalah', detail: 'No children, father, or grandfather. Kalalah rules apply.' },
    ],
    references: [],
  }
}

// ---------------------------------------------------------------------------
// Initial store state for reset
// ---------------------------------------------------------------------------

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

describe('RSLT-01: displays fraction, percentage, and monetary amounts', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      totalEstateValue: 0,
    })
  })

  it('shows fraction and percentage for each heir', () => {
    render(<App />)

    // Husband: 1/4 = 25% (shown in both summary table and heir cards)
    const quarterFractions = screen.getAllByText('1/4')
    expect(quarterFractions.length).toBeGreaterThan(0)
    expect(screen.getByText('25.0%')).toBeInTheDocument()

    // Daughter: total 2/3 = 66.7% (shown in both summary table and heir cards)
    const twoThirdFractions = screen.getAllByText('2/3')
    expect(twoThirdFractions.length).toBeGreaterThan(0)
    expect(screen.getByText('(66.7%)')).toBeInTheDocument()
  })

  it('shows BDT amounts when estate value is entered', () => {
    useWizardStore.setState({ totalEstateValue: 1200000 })
    render(<App />)

    // Husband: 1/4 of 12,00,000 = 3,00,000
    // Multiple elements may show this (summary table + heir card)
    const matches = screen.getAllByText(/3,00,000/)
    expect(matches.length).toBeGreaterThan(0)
  })
})

describe('RSLT-02: Quran citation in heir cards', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      viewMode: 'simple',
    })
  })

  it('hides Quran reference text in simple mode', () => {
    render(<App />)

    // No An-Nisa citation should be visible in simple mode
    expect(screen.queryByText(/An-Nisa/)).not.toBeInTheDocument()
  })

  it('shows compact citation footer in detailed mode', () => {
    useWizardStore.setState({ viewMode: 'detailed' })
    render(<App />)

    // Each active heir card should show An-Nisa citation
    const citations = screen.getAllByText(/An-Nisa/)
    expect(citations.length).toBeGreaterThan(0)
  })

  it('citation footer is non-interactive (no expand/collapse)', () => {
    useWizardStore.setState({ viewMode: 'detailed' })
    render(<App />)

    // No expandable QuranReference chevron buttons should exist in heir cards
    // The old Quran reference buttons with chevrons should be gone
    const quranButtons = screen.queryAllByText(/Quran \d+:\d+/)
    // These should not be clickable buttons
    for (const el of quranButtons) {
      expect(el.closest('button')).toBeNull()
    }
  })
})

describe('RSLT-03: step accordion (in detailed mode)', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      viewMode: 'detailed',
    })
  })

  it('shows step descriptions in detailed mode', async () => {
    render(<App />)

    // Step accordion visible directly in detailed mode
    await waitFor(() => {
      expect(screen.getByText('Calculation Steps')).toBeInTheDocument()
    })
    expect(screen.getByText('Identify heirs')).toBeInTheDocument()
    expect(screen.getByText('Assign fixed shares')).toBeInTheDocument()
    expect(screen.getByText('Assign residuary')).toBeInTheDocument()
  })

  it('expands a step to show detail text when clicked', async () => {
    render(<App />)

    // Steps visible directly in detailed mode
    await waitFor(() => {
      expect(screen.getByText('Identify heirs')).toBeInTheDocument()
    })

    // Detail should not be visible initially
    expect(screen.queryByText(/Husband and 2 daughters are present/)).not.toBeInTheDocument()

    // Click the first step header
    fireEvent.click(screen.getByText('Identify heirs'))

    // Detail text should appear
    await waitFor(() => {
      expect(screen.getByText('Husband and 2 daughters are present.')).toBeInTheDocument()
    })
  })

  it('allows multiple steps to be open simultaneously', async () => {
    render(<App />)

    // Steps visible directly in detailed mode
    await waitFor(() => {
      expect(screen.getByText('Identify heirs')).toBeInTheDocument()
    })

    // Open step 1
    fireEvent.click(screen.getByText('Identify heirs'))
    await waitFor(() => {
      expect(screen.getByText('Husband and 2 daughters are present.')).toBeInTheDocument()
    })

    // Open step 2
    fireEvent.click(screen.getByText('Assign fixed shares'))
    await waitFor(() => {
      expect(screen.getByText(/Husband receives 1\/4 with children present/)).toBeInTheDocument()
    })

    // Step 1 detail should still be visible
    expect(screen.getByText('Husband and 2 daughters are present.')).toBeInTheDocument()
  })
})

describe('RSLT-06: mode toggle', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      viewMode: 'simple',
      hasToggledMode: false,
    })
  })

  it('renders ModeToggle radiogroup', () => {
    render(<App />)

    expect(screen.getByRole('radiogroup', { name: 'View mode' })).toBeInTheDocument()
  })

  it('simple mode hides Calculation Steps and Islamic Basis', () => {
    render(<App />)

    expect(screen.queryByText('Calculation Steps')).not.toBeInTheDocument()
    expect(screen.queryByText('Islamic Basis')).not.toBeInTheDocument()
  })

  it('detailed mode shows Calculation Steps and Islamic Basis inline', () => {
    useWizardStore.setState({ viewMode: 'detailed' })
    render(<App />)

    expect(screen.getByText('Calculation Steps')).toBeInTheDocument()
    expect(screen.getByText('Islamic Basis')).toBeInTheDocument()
  })

  it('collapsible toggle buttons do not exist', () => {
    render(<App />)

    // The old collapsible toggle buttons should not exist
    expect(screen.queryByText('Charts & Visualizations')).not.toBeInTheDocument()
    expect(screen.queryByText('Islamic Legal Basis & Calculation Steps')).not.toBeInTheDocument()
  })

  it('shows hint text in simple mode with hasToggledMode=false', () => {
    render(<App />)

    expect(screen.getByText('Switch to Detailed for charts, legal references, and calculation steps')).toBeInTheDocument()
  })

  it('hides hint text when hasToggledMode=true', () => {
    useWizardStore.setState({ hasToggledMode: true })
    render(<App />)

    expect(screen.queryByText('Switch to Detailed for charts, legal references, and calculation steps')).not.toBeInTheDocument()
  })

  it('shows Inheritance Summary table in both modes', () => {
    render(<App />)
    expect(screen.getByText('Inheritance Summary')).toBeInTheDocument()

    useWizardStore.setState({ viewMode: 'detailed' })
    render(<App />)
    expect(screen.getAllByText('Inheritance Summary').length).toBeGreaterThan(0)
  })
})

describe('Adjustment banner', () => {
  it('shows Awl banner when adjustment is awl', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeAwlOutput(),
    })
    render(<App />)

    expect(screen.getByText('Awl (Proportional Reduction) Applied')).toBeInTheDocument()
    expect(screen.getByText(/proportionally reduced/)).toBeInTheDocument()
  })

  it('does not show banner when adjustment is none', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
    })
    render(<App />)

    expect(screen.queryByText('Awl (Proportional Reduction) Applied')).not.toBeInTheDocument()
    expect(screen.queryByText('Radd (Surplus Return) Applied')).not.toBeInTheDocument()
  })
})

describe('Blocked heirs section', () => {
  it('shows blocked heirs with blocking explanation', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeBlockedOutput(),
    })
    render(<App />)

    expect(screen.getByText('Blocked Heirs')).toBeInTheDocument()
    expect(screen.getByText('Full Brother')).toBeInTheDocument()
    expect(screen.getByText('blocked by')).toBeInTheDocument()
    // Rule text
    expect(screen.getByText(/Sons block all siblings/)).toBeInTheDocument()
  })

  it('does not show blocked heirs section when none are blocked', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
    })
    render(<App />)

    expect(screen.queryByText('Blocked Heirs')).not.toBeInTheDocument()
  })
})

describe('Special case callouts', () => {
  it('shows Kalalah callout when special case is present', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeKalalahOutput(),
    })
    render(<App />)

    expect(screen.getByText('Kalalah')).toBeInTheDocument()
    expect(screen.getByText(/no children, no father, and no grandfather/)).toBeInTheDocument()
  })

  it('does not show callouts when no special cases', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
    })
    render(<App />)

    expect(screen.queryByText('Kalalah')).not.toBeInTheDocument()
    expect(screen.queryByText('Umariyyatayn')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Mock properties for VALP-03 / VALP-04 tests
// ---------------------------------------------------------------------------

function makeProperty(overrides: Partial<Property> & { id: string }): Property {
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

const twoProperties: Property[] = [
  makeProperty({
    id: 'prop-1',
    nickname: 'Bari-er Jomi',
    type: 'residential',
    rateSource: 'govt',
    landValue: 800000,
    house: { estimatedValue: 200000, areaSqft: 1200, constructionType: 'brick', floors: 2, condition: 'good' },
  }),
  makeProperty({
    id: 'prop-2',
    nickname: '',
    type: 'agricultural',
    rateSource: 'manual',
    landValue: 300000,
    trees: { totalEstimatedValue: 50000, items: [], isItemized: false },
    pond: { areaSqft: 2178, areaInputUnit: 'decimal', estimatedValue: 100000 },
  }),
]

// Total: prop-1 = 800000+200000 = 1000000, prop-2 = 300000+50000+100000 = 450000
// Grand total = 1450000

// ---------------------------------------------------------------------------
// VALP-03: EstateBreakdownCard tests
// ---------------------------------------------------------------------------

describe('VALP-03: EstateBreakdownCard', () => {
  it('shows category totals when properties exist', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    // Should display "Estate Value" header
    expect(screen.getByText('Estate Value')).toBeInTheDocument()
    // Category labels present
    expect(screen.getByText('Land')).toBeInTheDocument()
    expect(screen.getByText('Structures')).toBeInTheDocument()
    expect(screen.getByText('Trees/Crops')).toBeInTheDocument()
    expect(screen.getByText('Ponds')).toBeInTheDocument()
  })

  it('shows override option with auto-calculated label', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    expect(screen.getByText('Auto-calculated from properties')).toBeInTheDocument()
    expect(screen.getByText('Override total')).toBeInTheDocument()
  })

  it('falls back to simple input with no properties', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      totalEstateValue: 0,
    })
    render(<App />)

    // Should show simple input with label
    expect(screen.getByText('Total Estate Value (BDT)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter total estate value')).toBeInTheDocument()
    // Should NOT show breakdown categories
    expect(screen.queryByText('Estate Value')).not.toBeInTheDocument()
  })

  it('shows govt rate and manual badges in per-property rows', async () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    // Expand per-property detail
    fireEvent.click(screen.getByText('View properties'))

    await waitFor(() => {
      expect(screen.getByText('Bari-er Jomi')).toBeInTheDocument()
      expect(screen.getByText('Agricultural #1')).toBeInTheDocument()
    })

    // Check rate badges
    expect(screen.getByText('Govt rate')).toBeInTheDocument()
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// VALP-04: HeirCard per-property distribution tests
// ---------------------------------------------------------------------------

describe('VALP-04: HeirCard per-property distribution', () => {
  it('shows "View asset shares" toggle when properties exist and estate value > 0', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    const toggles = screen.getAllByText('View asset shares')
    expect(toggles.length).toBeGreaterThan(0)
  })

  it('shows per-property amounts matching share * property total', async () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    // Click first "View asset shares" (Husband card: 1/4 share)
    const toggles = screen.getAllByText('View asset shares')
    fireEvent.click(toggles[0])

    // Husband (1/4): prop-1 total=1000000, 1/4 * 1000000 = 250000 = BDT 2,50,000
    await waitFor(() => {
      // Property names should appear
      expect(screen.getByText('Bari-er Jomi')).toBeInTheDocument()
      expect(screen.getByText('Agricultural #1')).toBeInTheDocument()
    })

    // Check formatted amounts appear (BDT 2,50,000 for husband's share of prop-1)
    expect(screen.getByText(/2,50,000/)).toBeInTheDocument()
  })

  it('shows Each/Total per-property rows for multi-heir groups', async () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      totalEstateValue: 1450000,
    })
    render(<App />)

    // Daughter card (count=2): second toggle button
    const toggles = screen.getAllByText('View asset shares')
    // First is Husband card, second is Daughter card
    fireEvent.click(toggles[1])

    await waitFor(() => {
      // Per-property rows for daughters should show Each/Total pattern
      const eachLabels = screen.getAllByText(/^Each:/)
      expect(eachLabels.length).toBeGreaterThan(0)

      const totalLabels = screen.getAllByText(/^Total \(2\):/)
      expect(totalLabels.length).toBeGreaterThan(0)
    })
  })

  it('shows hint when no properties and no estate value', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      totalEstateValue: 0,
    })
    render(<App />)

    expect(screen.getAllByText('Add properties or enter estate value to see BDT amounts').length).toBeGreaterThan(0)
  })

  it('does NOT show asset toggle when no properties and no movable assets', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 1000000,
    })
    render(<App />)

    expect(screen.queryByText('View asset shares')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Movable asset test helpers
// ---------------------------------------------------------------------------

const testVehicle: VehicleAsset = {
  id: 'asset-v1',
  category: 'vehicle',
  isIndivisible: true,
  indivisibleResolution: null,
  vehicleType: 'car',
  description: 'Toyota Corolla',
  estimatedValue: 500000,
}

const testCash: CashAsset = {
  id: 'asset-c1',
  category: 'cash',
  isIndivisible: false,
  indivisibleResolution: null,
  value: 200000,
}

const testMovableAssets: MovableAsset[] = [testVehicle, testCash]

// ---------------------------------------------------------------------------
// Movable Assets - EstateBreakdownCard integration
// ---------------------------------------------------------------------------

describe('Movable Assets: EstateBreakdownCard integration', () => {
  it('shows "Movable Assets" category when movable assets exist', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      movableAssets: testMovableAssets,
      totalEstateValue: 2150000, // 1450000 properties + 700000 movable
    })
    render(<App />)

    expect(screen.getByText('Movable Assets')).toBeInTheDocument()
  })

  it('total includes both property and movable asset values', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      movableAssets: testMovableAssets,
      totalEstateValue: 2150000,
    })
    render(<App />)

    // The estate value should display 2150000 formatted as 21,50,000
    expect(screen.getByText(/21,50,000/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Movable Assets: HeirCard integration
// ---------------------------------------------------------------------------

describe('Movable Assets: HeirCard integration', () => {
  it('shows movable asset rows in expandable section', async () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      properties: twoProperties,
      movableAssets: testMovableAssets,
      totalEstateValue: 2150000,
    })
    render(<App />)

    // Click the "View asset shares" toggle on first heir card (Husband: 1/4)
    const toggles = screen.getAllByText('View asset shares')
    expect(toggles.length).toBeGreaterThan(0)
    fireEvent.click(toggles[0])

    await waitFor(() => {
      // Should show Vehicle category row
      expect(screen.getByText('Vehicle')).toBeInTheDocument()
      // Should show Cash/Bank Deposits category row
      expect(screen.getByText('Cash/Bank Deposits')).toBeInTheDocument()
    })
  })
})
