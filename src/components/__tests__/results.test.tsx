import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Fraction from 'fraction.js'
import App from '@/App'
import { useWizardStore } from '@/stores/wizardStore'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'

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

    // Husband: 1/4 = 25% (single heir -- no parentheses on percentage)
    expect(screen.getByText('1/4')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()

    // Daughter: total 2/3 = 66.7% (multiple heirs -- parenthesized percentages)
    expect(screen.getByText('2/3')).toBeInTheDocument()
    expect(screen.getByText('(66.7%)')).toBeInTheDocument()
  })

  it('shows BDT amounts when estate value is entered', () => {
    useWizardStore.setState({ totalEstateValue: 1200000 })
    render(<App />)

    // Husband: 1/4 of 12,00,000 = 3,00,000
    // Look for the formatted BDT string
    expect(screen.getByText(/3,00,000/)).toBeInTheDocument()
  })
})

describe('RSLT-02: shows Quranic reference', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
    })
  })

  it('shows expandable Quran reference label on heir card', () => {
    render(<App />)

    // Quran reference labels should be visible (e.g., "Quran 4:12" for husband)
    const quranLabels = screen.getAllByText(/Quran \d+:\d+/)
    expect(quranLabels.length).toBeGreaterThan(0)
  })

  it('expands reference to show Arabic text with RTL direction', async () => {
    render(<App />)

    // Click the first Quran reference to expand it
    const quranLabels = screen.getAllByText(/Quran \d+:\d+/)
    fireEvent.click(quranLabels[0])

    // After expanding, Arabic text container should appear with dir="rtl"
    await waitFor(() => {
      const arabicElements = document.querySelectorAll('[dir="rtl"][lang="ar"]')
      expect(arabicElements.length).toBeGreaterThan(0)
    })
  })
})

describe('RSLT-03: step accordion', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeSimpleOutput(),
      viewMode: 'detailed',
    })
  })

  it('shows step descriptions in detailed mode', () => {
    render(<App />)

    expect(screen.getByText('Calculation Steps')).toBeInTheDocument()
    expect(screen.getByText('Identify heirs')).toBeInTheDocument()
    expect(screen.getByText('Assign fixed shares')).toBeInTheDocument()
    expect(screen.getByText('Assign residuary')).toBeInTheDocument()
  })

  it('expands a step to show detail text when clicked', async () => {
    render(<App />)

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
    })
  })

  it('hides step accordion in simple mode', () => {
    render(<App />)

    expect(screen.queryByText('Calculation Steps')).not.toBeInTheDocument()
  })

  it('shows step accordion after switching to Detailed mode', async () => {
    render(<App />)

    // Click the "Detailed" mode button
    fireEvent.click(screen.getByText('Detailed'))

    await waitFor(() => {
      expect(screen.getByText('Calculation Steps')).toBeInTheDocument()
    })
  })

  it('hides step accordion when switching back to Simple mode', async () => {
    render(<App />)

    // Switch to Detailed
    fireEvent.click(screen.getByText('Detailed'))
    await waitFor(() => {
      expect(screen.getByText('Calculation Steps')).toBeInTheDocument()
    })

    // Switch back to Simple
    fireEvent.click(screen.getByText('Simple'))
    await waitFor(() => {
      expect(screen.queryByText('Calculation Steps')).not.toBeInTheDocument()
    })
  })

  it('shows Islamic Basis section only in detailed mode', async () => {
    render(<App />)

    // Not visible in simple mode
    expect(screen.queryByText('Islamic Basis')).not.toBeInTheDocument()

    // Switch to detailed
    fireEvent.click(screen.getByText('Detailed'))

    await waitFor(() => {
      expect(screen.getByText('Islamic Basis')).toBeInTheDocument()
    })
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
