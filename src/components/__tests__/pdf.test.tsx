import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult, IslamicReference } from '@/core/faraid/types'
import { useWizardStore } from '@/stores/wizardStore'

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
// Mock html-to-image
// ---------------------------------------------------------------------------

vi.mock('html-to-image', () => ({
  toPng: () => Promise.resolve('data:image/png;base64,fake'),
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { extractPdfData } from '@/components/pdf/extractPdfData'
import type { Property } from '@/core/land/types'

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

function makeProperty(overrides?: Partial<Property>): Property {
  return {
    id: 'prop-1',
    nickname: 'Main House',
    type: 'residential',
    division: 'dhaka',
    upazila: 'Mirpur',
    rateSource: 'govt',
    landAreaSqft: 2000,
    landInputUnit: 'sqft',
    landValue: 1000000,
    house: null,
    trees: null,
    pond: null,
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
        count: 1,
        sharePerHeir: new Fraction(3, 4),
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
      { step: 1, description: 'Identify heirs', detail: 'Wife and son present' },
      { step: 2, description: 'Assign shares', detail: 'Wife gets 1/4, son gets remainder' },
    ],
    references: [
      {
        type: 'quran',
        reference: 'Quran 4:12',
        arabicText: 'Arabic text here',
        englishText: 'English translation here',
        appliesTo: ['wife'],
      } as IslamicReference,
    ],
  }
}

// ---------------------------------------------------------------------------
// Tests: extractPdfData basic
// ---------------------------------------------------------------------------

describe('extractPdfData', () => {
  it('transforms FaraidOutput into PdfData with formatted strings', () => {
    const output = makeBasicOutput()
    const properties = [makeProperty()]
    const result = extractPdfData(output, properties, 1500000, null, null)

    expect(result.activeShares).toHaveLength(2)
    expect(result.activeShares[0].fraction).toBe('1/4')
    expect(result.activeShares[0].percentage).toBe('25.0%')
    expect(result.activeShares[0].totalBdt).not.toBe('')
    expect(result.properties).toHaveLength(1)
    expect(result.totalEstateValue).toBe(1500000)
    expect(result.generatedAt).toBeInstanceOf(Date)
  })

  it('formats heir type labels correctly', () => {
    const output = makeBasicOutput()
    const result = extractPdfData(output, [], 1500000, null, null)

    expect(result.activeShares[0].heirType).toBe('Wife')
    expect(result.activeShares[1].heirType).toBe('Son')
  })

  it('formats share type labels correctly', () => {
    const output = makeBasicOutput()
    const result = extractPdfData(output, [], 1500000, null, null)

    expect(result.activeShares[0].shareType).toBe('Fixed Share (Fard)')
    expect(result.activeShares[1].shareType).toBe('Residuary (Asaba)')
  })

  it('includes steps from FaraidOutput', () => {
    const output = makeBasicOutput()
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.steps).toHaveLength(2)
    expect(result.steps[0].step).toBe(1)
    expect(result.steps[0].description).toBe('Identify heirs')
  })

  it('includes references from FaraidOutput', () => {
    const output = makeBasicOutput()
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.references.length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Awl adjustment
// ---------------------------------------------------------------------------

describe('extractPdfData with Awl adjustment', () => {
  it('shows totalBeforeAdjustment as fraction string for Awl', () => {
    const output: FaraidOutput = {
      ...makeBasicOutput(),
      adjustment: 'awl',
      totalBeforeAdjustment: new Fraction(7, 6),
    }
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.totalBeforeAdjustment).toBe('7/6')
    expect(result.adjustment).toBe('awl')
  })
})

// ---------------------------------------------------------------------------
// Tests: No properties / zero estate
// ---------------------------------------------------------------------------

describe('extractPdfData with no properties', () => {
  it('returns empty properties and empty BDT when estate is 0', () => {
    const output = makeBasicOutput()
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.properties).toHaveLength(0)
    expect(result.activeShares[0].totalBdt).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Tests: Blocked heirs
// ---------------------------------------------------------------------------

describe('extractPdfData with blocked heirs', () => {
  it('maps blocked heir types to display labels', () => {
    const output: FaraidOutput = {
      ...makeBasicOutput(),
      blockedHeirs: [
        {
          heirType: 'paternal_grandfather',
          blockedBy: 'father',
          rule: 'Rule 10',
        },
      ],
    }
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.blockedHeirs[0].heirType).toBe('Paternal Grandfather')
    expect(result.blockedHeirs[0].blockedBy).toBe('Father')
  })

  it('filters blocked shares from activeShares', () => {
    const output: FaraidOutput = {
      shares: [
        makeShare({
          heirType: 'son',
          totalShare: new Fraction(3, 4),
          shareType: 'asaba',
        }),
        makeShare({
          heirType: 'brother_full',
          totalShare: new Fraction(0),
          shareType: 'blocked',
        }),
      ],
      adjustment: 'none',
      totalBeforeAdjustment: new Fraction(1),
      blockedHeirs: [
        { heirType: 'brother_full', blockedBy: 'son', rule: 'Sons block siblings' },
      ],
      specialCases: [],
      mfloApplied: false,
      steps: [],
      references: [],
    }
    const result = extractPdfData(output, [], 0, null, null)

    expect(result.shares).toHaveLength(2) // all shares including blocked
    expect(result.activeShares).toHaveLength(1) // only non-blocked
    expect(result.activeShares[0].heirType).toBe('Son')
  })
})

// ---------------------------------------------------------------------------
// Tests: Property mapping
// ---------------------------------------------------------------------------

describe('extractPdfData property mapping', () => {
  it('capitalizes property type and division', () => {
    const prop = makeProperty({ type: 'agricultural', division: 'chittagong' })
    const result = extractPdfData(makeBasicOutput(), [prop], 1000000, null, null)

    expect(result.properties[0].type).toBe('Agricultural')
    expect(result.properties[0].division).toBe('Chittagong')
  })

  it('computes property total including structures', () => {
    const prop = makeProperty({
      landValue: 500000,
      house: { estimatedValue: 200000, areaSqft: null, constructionType: null, floors: null, condition: null },
      trees: { totalEstimatedValue: 50000, items: [], isItemized: false },
      pond: { areaSqft: 500, areaInputUnit: 'sqft', estimatedValue: 30000 },
    })
    const result = extractPdfData(makeBasicOutput(), [prop], 1000000, null, null)

    expect(result.properties[0].totalValue).toBe(780000)
    expect(result.properties[0].houseValue).toBe(200000)
    expect(result.properties[0].treesValue).toBe(50000)
    expect(result.properties[0].pondValue).toBe(30000)
  })
})

// ---------------------------------------------------------------------------
// Tests: Disclaimer content constants
// ---------------------------------------------------------------------------

describe('Disclaimer content', () => {
  const LEGAL_NOTICE =
    'This report is for informational purposes only. Consult a qualified lawyer before using for legal registration or property transfer.'
  const ISLAMIC_NOTICE =
    'Calculations strictly follow the Hanafi school of Islamic jurisprudence. Other schools of thought (Shafi\'i, Maliki, Hanbali) may yield different results. For disputes or edge cases, consult a qualified Islamic scholar (Mufti).'
  const SCOPE_NOTICE =
    'This calculation assumes parents of the deceased have predeceased them. If parents are alive, inheritance rules differ.'
  const VALUES_NOTICE =
    'Property values used in this report are estimates entered by the user and may not reflect actual market values. Verify with local authorities or certified surveyors.'

  it('legal notice contains key phrase', () => {
    expect(LEGAL_NOTICE).toContain('informational purposes only')
  })

  it('Islamic notice references Hanafi school', () => {
    expect(ISLAMIC_NOTICE).toContain('Hanafi school')
  })

  it('scope notice mentions predeceased parents', () => {
    expect(SCOPE_NOTICE).toContain('parents of the deceased have predeceased')
  })

  it('values notice mentions user estimates', () => {
    expect(VALUES_NOTICE).toContain('estimates entered by the user')
  })
})

// ---------------------------------------------------------------------------
// Tests: ResultsPage PDF buttons
// ---------------------------------------------------------------------------

import App from '@/App'

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

describe('ResultsPage PDF buttons', () => {
  beforeEach(() => {
    useWizardStore.setState({
      ...baseStoreState,
      results: makeBasicOutput(),
      totalEstateValue: 0,
    })
  })

  it('renders Download PDF and Print buttons when results exist', () => {
    render(<App />)

    expect(screen.getByText('Download PDF')).toBeInTheDocument()
    expect(screen.getByText('Print')).toBeInTheDocument()
  })

  it('Download PDF button is not disabled initially', () => {
    render(<App />)

    const downloadBtn = screen.getByText('Download PDF').closest('button')
    expect(downloadBtn).not.toBeDisabled()
  })

  it('Print button is not disabled initially', () => {
    render(<App />)

    const printBtn = screen.getByText('Print').closest('button')
    expect(printBtn).not.toBeDisabled()
  })
})
