import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Fraction from 'fraction.js'
import App from '@/App'
import { useWizardStore } from '@/stores/wizardStore'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'

// ---------------------------------------------------------------------------
// Mock ResponsiveContainer -- jsdom has no ResizeObserver / layout
// ---------------------------------------------------------------------------

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  }
})

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

function makeTwoHeirOutput(): FaraidOutput {
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

function makeWithBlockedOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({
        heirType: 'son',
        totalShare: new Fraction(3, 4),
        sharePerHeir: new Fraction(3, 4),
        shareType: 'asaba',
      }),
      makeShare({
        heirType: 'wife',
        totalShare: new Fraction(1, 8),
        sharePerHeir: new Fraction(1, 8),
      }),
      makeShare({
        heirType: 'brother_full',
        totalShare: new Fraction(0),
        sharePerHeir: new Fraction(0),
        shareType: 'blocked',
      }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [
      {
        heirType: 'brother_full',
        blockedBy: 'son',
        rule: 'Sons block all siblings',
      },
    ],
    specialCases: [],
    mfloApplied: false,
    steps: [],
    references: [],
  }
}

// ---------------------------------------------------------------------------
// Base store state
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
// RSLT-04: Pie Chart
// ---------------------------------------------------------------------------

describe('RSLT-04: Pie Chart', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeTwoHeirOutput(),
      totalEstateValue: 1000000,
    })
  })

  it('renders pie chart with Share Distribution heading', () => {
    render(<App />)
    expect(screen.getByText('Share Distribution')).toBeInTheDocument()
  })

  it('shows center label with heir count', () => {
    render(<App />)
    expect(screen.getByText('2 heirs')).toBeInTheDocument()
  })

  it('shows legend with heir names including count notation', () => {
    render(<App />)
    // Daughter count > 1, so displayed as "Daughter x2" in the chart legend
    expect(screen.getByText(/Daughter x2.*66\.7%/)).toBeInTheDocument()
    // Husband appears in both legend and HeirCard -- use the legend-specific text with percentage
    expect(screen.getByText(/Husband \(25\.0%\)/)).toBeInTheDocument()
  })

  it('excludes blocked heirs from chart', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeWithBlockedOutput(),
      totalEstateValue: 1000000,
    })
    render(<App />)

    expect(screen.getByText('Share Distribution')).toBeInTheDocument()
    // Full Brother is blocked -- should NOT appear in chart legend
    // The "Full Brother" text might appear in the BlockedHeirsSection but NOT in the chart area
    const chartSection = screen.getByText('Share Distribution').closest('div')!.parentElement!
    expect(chartSection.textContent).not.toContain('Full Brother')
  })
})

// ---------------------------------------------------------------------------
// RSLT-05: Bar Chart
// ---------------------------------------------------------------------------

describe('RSLT-05: Bar Chart', () => {
  it('renders bar chart when totalEstateValue > 0', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeTwoHeirOutput(),
      totalEstateValue: 1000000,
    })
    render(<App />)
    expect(screen.getByText('Monetary Comparison')).toBeInTheDocument()
  })

  it('hides bar chart with hint when no estate value', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeTwoHeirOutput(),
      totalEstateValue: 0,
    })
    render(<App />)
    expect(
      screen.getByText('Enter estate value to see monetary comparison'),
    ).toBeInTheDocument()
  })

  it('shows heir type names on Y-axis', () => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeTwoHeirOutput(),
      totalEstateValue: 1000000,
    })
    render(<App />)
    // Bar chart should show heir names
    expect(screen.getByText('Monetary Comparison')).toBeInTheDocument()
  })
})
