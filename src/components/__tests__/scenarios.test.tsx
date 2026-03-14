import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Fraction from 'fraction.js'
import { useWizardStore } from '@/stores/wizardStore'
import { useScenariosStore } from '@/stores/scenariosStore'
import type { Scenario, ScenarioSummary } from '@/types/scenario'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'
import type { WizardState } from '@/types/wizard'
import { ScenariosPage } from '@/components/scenarios/ScenariosPage'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { ComparisonView } from '@/components/scenarios/ComparisonView'

// ---------------------------------------------------------------------------
// Mock factory helpers
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

function makeFaraidOutput(
  overrides: Partial<FaraidOutput> = {},
): FaraidOutput {
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
    ...overrides,
  }
}

function createMockScenario(overrides: Partial<Scenario> = {}): Scenario {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'Test Scenario',
    createdAt: now,
    updatedAt: now,
    state: {
      currentStep: 4,
      completedSteps: [1, 2, 3],
      relationship: 'brother',
      deceasedGender: 'male',
      userGender: null,
      mfloEnabled: false,
      motherAlive: null,
      autoIncludes: [{ type: 'brother_full', count: 1 }],
      wifeCount: 0,
      husbandPresent: false,
      sonCount: 0,
      daughterCount: 2,
      siblingTypeExpanded: false,
      brotherFullCount: 0,
      brotherConsanguineCount: 0,
      brotherUterineCount: 0,
      sisterFullCount: 0,
      sisterConsanguineCount: 0,
      sisterUterineCount: 0,
      properties: [],
      expandedPropertyId: null,
      results: makeFaraidOutput(),
      totalEstateValue: 1000000,
      viewMode: 'simple',
    } as WizardState,
    summary: {
      heirSummary: '2D',
      totalEstateValue: 1000000,
      adjustment: 'none',
      heirCount: 3,
    },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Reset state before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear()

  useWizardStore.setState({
    currentStep: 1,
    completedSteps: [],
    relationship: null,
    deceasedGender: null,
    userGender: null,
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
    properties: [],
    expandedPropertyId: null,
    results: null,
    totalEstateValue: 0,
    viewMode: 'simple',
  })

  useScenariosStore.setState({
    scenarios: [],
    selectedIds: [],
    isComparing: false,
    lastSavedHash: null,
  })
})

// ---------------------------------------------------------------------------
// ScenariosPage tests
// ---------------------------------------------------------------------------

describe('ScenariosPage', () => {
  it('renders empty state when no scenarios', () => {
    render(<ScenariosPage onNavigate={() => {}} />)
    expect(screen.getByText('No saved scenarios')).toBeInTheDocument()
    expect(screen.getByText('+ New Calculation')).toBeInTheDocument()
  })

  it('shows scenario cards when scenarios exist', () => {
    const s1 = createMockScenario({ name: 'My First Scenario' })
    const s2 = createMockScenario({ name: 'My Second Scenario' })
    useScenariosStore.setState({ scenarios: [s1, s2] })

    render(<ScenariosPage onNavigate={() => {}} />)
    expect(screen.getByText('My First Scenario')).toBeInTheDocument()
    expect(screen.getByText('My Second Scenario')).toBeInTheDocument()
  })

  it('Save Current button calls saveScenario', () => {
    const s1 = createMockScenario({ name: 'Existing' })
    useScenariosStore.setState({ scenarios: [s1] })

    // Set some wizard state so save produces a scenario
    useWizardStore.setState({
      relationship: 'brother',
      deceasedGender: 'male',
      sonCount: 1,
      results: makeFaraidOutput(),
    })

    render(<ScenariosPage onNavigate={() => {}} />)
    fireEvent.click(screen.getByText('Save Current'))

    // Should now have 2 scenarios
    expect(useScenariosStore.getState().scenarios.length).toBe(2)
  })

  it('shows unsaved changes confirmation when loading scenario', () => {
    const s1 = createMockScenario({ name: 'Load Me' })
    useScenariosStore.setState({
      scenarios: [s1],
      lastSavedHash: 'stale-hash',
    })

    // Set wizard state that differs from hash
    useWizardStore.setState({
      relationship: 'brother',
      deceasedGender: 'male',
      sonCount: 3,
    })

    render(<ScenariosPage onNavigate={() => {}} />)
    fireEvent.click(screen.getByText('Load'))

    expect(
      screen.getByText(/You have unsaved changes/),
    ).toBeInTheDocument()
    expect(screen.getByText('Save & Load')).toBeInTheDocument()
    expect(screen.getByText('Load Without Saving')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// ScenarioCard tests
// ---------------------------------------------------------------------------

describe('ScenarioCard', () => {
  it('renders name, date, heir summary, and estate value', () => {
    const scenario = createMockScenario({
      name: 'Card Test',
      summary: {
        heirSummary: '2S, 1D',
        totalEstateValue: 5000000,
        adjustment: 'none',
        heirCount: 4,
      },
    })

    render(
      <ScenarioCard
        scenario={scenario}
        isSelected={false}
        onToggleSelect={() => {}}
        onLoad={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
      />,
    )

    expect(screen.getByText('Card Test')).toBeInTheDocument()
    expect(screen.getByText('2S, 1D')).toBeInTheDocument()
    // BDT formatting: 50,00,000 (en-IN lakh grouping)
    expect(screen.getByText(/50,00,000/)).toBeInTheDocument()
  })

  it('inline rename: click name, type new name, blur saves', async () => {
    const handleRename = { fn: (_n: string) => {} }
    const renameSpy = (name: string) => {
      handleRename.fn(name)
    }
    let renamedTo = ''
    handleRename.fn = (n: string) => {
      renamedTo = n
    }

    const scenario = createMockScenario({ name: 'Original Name' })

    render(
      <ScenarioCard
        scenario={scenario}
        isSelected={false}
        onToggleSelect={() => {}}
        onLoad={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onRename={renameSpy}
      />,
    )

    // Click the name to start editing
    fireEvent.click(screen.getByText('Original Name'))

    // Input should appear
    const input = screen.getByTestId('rename-input') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('Original Name')

    // Type new name
    fireEvent.change(input, { target: { value: 'Renamed Scenario' } })
    // Blur to save
    fireEvent.blur(input)

    expect(renamedTo).toBe('Renamed Scenario')
  })

  it('delete confirmation flow', () => {
    let deleted = false
    const scenario = createMockScenario({ name: 'Delete Me' })

    render(
      <ScenarioCard
        scenario={scenario}
        isSelected={false}
        onToggleSelect={() => {}}
        onLoad={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {
          deleted = true
        }}
        onRename={() => {}}
      />,
    )

    // Click delete
    fireEvent.click(screen.getByText('Delete'))

    // Confirmation should appear
    expect(screen.getByText('Delete this scenario?')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    // Cancel first
    fireEvent.click(screen.getByText('Cancel'))
    expect(deleted).toBe(false)

    // Delete again and confirm
    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Confirm'))
    expect(deleted).toBe(true)
  })

  it('shows Awl badge when adjustment is awl', () => {
    const scenario = createMockScenario({
      summary: {
        heirSummary: '2D, H',
        totalEstateValue: 0,
        adjustment: 'awl',
        heirCount: 3,
      },
    })

    render(
      <ScenarioCard
        scenario={scenario}
        isSelected={false}
        onToggleSelect={() => {}}
        onLoad={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
      />,
    )

    expect(screen.getByText('Awl')).toBeInTheDocument()
  })

  it('shows Radd badge when adjustment is radd', () => {
    const scenario = createMockScenario({
      summary: {
        heirSummary: '1D',
        totalEstateValue: 0,
        adjustment: 'radd',
        heirCount: 1,
      },
    })

    render(
      <ScenarioCard
        scenario={scenario}
        isSelected={false}
        onToggleSelect={() => {}}
        onLoad={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
        onRename={() => {}}
      />,
    )

    expect(screen.getByText('Radd')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// ComparisonView tests
// ---------------------------------------------------------------------------

describe('ComparisonView', () => {
  it('renders two-column layout with heir shares from both scenarios', () => {
    const scenarioA = createMockScenario({
      name: 'Scenario Alpha',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
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
        }),
      },
    })

    const scenarioB = createMockScenario({
      name: 'Scenario Beta',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
          shares: [
            makeShare({
              heirType: 'wife',
              totalShare: new Fraction(1, 8),
              sharePerHeir: new Fraction(1, 8),
            }),
            makeShare({
              heirType: 'son',
              totalShare: new Fraction(7, 8),
              sharePerHeir: new Fraction(7, 8),
              shareType: 'asaba',
            }),
          ],
        }),
      },
    })

    render(
      <ComparisonView
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onClose={() => {}}
      />,
    )

    expect(screen.getByText('Comparing')).toBeInTheDocument()
    // Name appears in header card + table column header
    expect(screen.getAllByText('Scenario Alpha').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Scenario Beta').length).toBeGreaterThan(0)

    // Check heir type labels present
    expect(screen.getAllByText('Husband').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Daughter').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Wife').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Son').length).toBeGreaterThan(0)
  })

  it('applies amber highlight on rows where shares differ', () => {
    const scenarioA = createMockScenario({
      name: 'A',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
          shares: [
            makeShare({
              heirType: 'husband',
              totalShare: new Fraction(1, 4),
              sharePerHeir: new Fraction(1, 4),
            }),
          ],
        }),
      },
    })

    const scenarioB = createMockScenario({
      name: 'B',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
          shares: [
            makeShare({
              heirType: 'husband',
              totalShare: new Fraction(1, 2),
              sharePerHeir: new Fraction(1, 2),
            }),
          ],
        }),
      },
    })

    const { container } = render(
      <ComparisonView
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onClose={() => {}}
      />,
    )

    // All rows with different values should have data-diff="true"
    const diffElements = container.querySelectorAll('[data-diff="true"]')
    expect(diffElements.length).toBeGreaterThan(0)
  })

  it('shows "--" for heirs present in only one scenario', () => {
    const scenarioA = createMockScenario({
      name: 'A',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
          shares: [
            makeShare({
              heirType: 'husband',
              totalShare: new Fraction(1, 4),
              sharePerHeir: new Fraction(1, 4),
            }),
          ],
        }),
      },
    })

    const scenarioB = createMockScenario({
      name: 'B',
      state: {
        ...createMockScenario().state,
        results: makeFaraidOutput({
          shares: [
            makeShare({
              heirType: 'wife',
              totalShare: new Fraction(1, 8),
              sharePerHeir: new Fraction(1, 8),
            }),
          ],
        }),
      },
    })

    render(
      <ComparisonView
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onClose={() => {}}
      />,
    )

    // Husband is in A but not B, wife is in B but not A
    // Should see "--" markers
    const dashes = screen.getAllByText('--')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('does not highlight rows where shares are equal', () => {
    const sharedOutput = makeFaraidOutput({
      shares: [
        makeShare({
          heirType: 'husband',
          totalShare: new Fraction(1, 4),
          sharePerHeir: new Fraction(1, 4),
        }),
      ],
    })

    const scenarioA = createMockScenario({
      name: 'A',
      state: { ...createMockScenario().state, results: sharedOutput },
    })

    const scenarioB = createMockScenario({
      name: 'B',
      state: { ...createMockScenario().state, results: sharedOutput },
    })

    const { container } = render(
      <ComparisonView
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onClose={() => {}}
      />,
    )

    // No rows should be marked as different
    const diffElements = container.querySelectorAll('[data-diff="true"]')
    expect(diffElements.length).toBe(0)
  })
})
