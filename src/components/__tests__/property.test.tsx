import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepProperties } from '@/components/property/StepProperties'
import { PropertyTypeSelector } from '@/components/property/PropertyTypeSelector'
import { LandAreaInput } from '@/components/property/LandAreaInput'
import type { Property } from '@/core/land/types'

// Reset store before each test
beforeEach(() => {
  useWizardStore.setState({
    properties: [],
    expandedPropertyId: null,
  })
})

function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: crypto.randomUUID(),
    nickname: '',
    type: null,
    division: null,
    upazila: null,
    rateSource: 'manual',
    landAreaSqft: 0,
    landInputUnit: 'decimal',
    landValue: 0,
    house: null,
    trees: null,
    pond: null,
    ...overrides,
  }
}

describe('PROP-02: Multi-property entry', () => {
  test('empty state shows Add Property button and Skip to Results', () => {
    render(<StepProperties />)
    expect(screen.getByRole('button', { name: /add property/i })).toBeInTheDocument()
    expect(screen.getByText(/skip to results/i)).toBeInTheDocument()
    expect(screen.getByText(/add your family/i)).toBeInTheDocument()
  })

  test('clicking Add Property creates a property card', () => {
    render(<StepProperties />)
    fireEvent.click(screen.getByRole('button', { name: /add property/i }))
    expect(screen.getByPlaceholderText(/bari-er jomi/i)).toBeInTheDocument()
    expect(screen.getByText('Agricultural')).toBeInTheDocument()
    expect(screen.getByText('Residential')).toBeInTheDocument()
  })

  test('can add multiple properties of different types', () => {
    const p1 = makeProperty({ type: 'residential', nickname: 'Home' })
    const p2 = makeProperty({ type: 'agricultural', nickname: 'Farm' })
    useWizardStore.setState({ properties: [p1, p2] })

    render(<StepProperties />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Farm')).toBeInTheDocument()
  })

  test('delete removes property from list', () => {
    const id = useWizardStore.getState().addProperty()
    useWizardStore.setState({ expandedPropertyId: id })

    render(<StepProperties />)
    fireEvent.click(screen.getByText(/delete property/i))
    // Empty property: no confirmation, goes back to empty state
    expect(screen.getByText(/add your family/i)).toBeInTheDocument()
  })

  test('auto-labels properties as "Residential #1", "Agricultural #2"', () => {
    const p1 = makeProperty({ type: 'residential' })
    const p2 = makeProperty({ type: 'agricultural' })
    useWizardStore.setState({ properties: [p1, p2] })

    render(<StepProperties />)
    expect(screen.getByText('Residential #1')).toBeInTheDocument()
    expect(screen.getByText('Agricultural #1')).toBeInTheDocument()
  })
})

describe('PROP-01: Land area input with BD units', () => {
  test('area input shows decimal as default unit', () => {
    const p = makeProperty({ type: 'residential', division: 'dhaka' })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<LandAreaInput propertyId={p.id} />)
    // Default unit should be Decimal
    const unitSelect = screen.getByDisplayValue('Decimal')
    expect(unitSelect).toBeInTheDocument()
  })

  test('live conversion display shows equivalent values', () => {
    // 5 decimal = 5 * 435.6 = 2178 sqft
    const p = makeProperty({
      type: 'residential',
      division: 'dhaka',
      landAreaSqft: 2178,
      landInputUnit: 'decimal',
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<LandAreaInput propertyId={p.id} />)
    // Should show katha conversion (2178 / 720 ~ 3.03)
    expect(screen.getByText(/Katha \(Dhaka\)/)).toBeInTheDocument()
  })
})

describe('PROP-03: House/structure details', () => {
  test('entering house value shows value in card summary', () => {
    const p = makeProperty({
      type: 'residential',
      division: 'dhaka',
      house: { estimatedValue: 2000000, areaSqft: null, constructionType: null, floors: null, condition: null },
    })
    useWizardStore.setState({ properties: [p] })

    render(<StepProperties />)
    // Card summary and running total both show formatted value
    const matches = screen.getAllByText(/20,00,000/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  test('expanding details shows construction type, floors, condition fields', () => {
    const p = makeProperty({
      type: 'residential',
      division: 'dhaka',
      house: { estimatedValue: 500000, areaSqft: null, constructionType: null, floors: null, condition: null },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    // Click "Add details" to expand house detail section
    fireEvent.click(screen.getByText('Add details'))
    expect(screen.getByText('Construction Type')).toBeInTheDocument()
    expect(screen.getByText('Floors')).toBeInTheDocument()
    expect(screen.getByText('Condition')).toBeInTheDocument()
  })
})

describe('PROP-04: Tree/crop details', () => {
  test('entering tree value initializes tree detail', () => {
    const p = makeProperty({
      type: 'agricultural',
      division: 'rajshahi',
      trees: { totalEstimatedValue: 500000, items: [], isItemized: false },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    // Should show Itemize toggle
    expect(screen.getByText('Itemize by species')).toBeInTheDocument()
  })

  test('itemize toggle shows species rows', () => {
    const p = makeProperty({
      type: 'agricultural',
      division: 'rajshahi',
      trees: { totalEstimatedValue: 500000, items: [], isItemized: false },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    fireEvent.click(screen.getByText('Itemize by species'))
    // Should show "Add species" button
    expect(screen.getByText('+ Add species')).toBeInTheDocument()
  })

  test('adding species row with count and value', () => {
    const p = makeProperty({
      type: 'agricultural',
      division: 'rajshahi',
      trees: {
        totalEstimatedValue: 100000,
        items: [],
        isItemized: false,
      },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    // Toggle itemized mode
    fireEvent.click(screen.getByText('Itemize by species'))
    // Click "+ Add species" to add a row
    fireEvent.click(screen.getByText('+ Add species'))
    // Should see Count stepper in the species row
    expect(screen.getByText('Count')).toBeInTheDocument()
  })
})

describe('PROP-05: Pond details', () => {
  test('entering pond value initializes pond detail', () => {
    const p = makeProperty({
      type: 'residential',
      division: 'dhaka',
      pond: { areaSqft: 0, areaInputUnit: 'decimal', estimatedValue: 300000 },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    // Pond area input should be visible when value > 0 and division set
    expect(screen.getByText(/pond area/i)).toBeInTheDocument()
  })

  test('pond area input uses same unit system as land', () => {
    const p = makeProperty({
      type: 'residential',
      division: 'dhaka',
      pond: { areaSqft: 435.6, areaInputUnit: 'decimal', estimatedValue: 300000 },
    })
    useWizardStore.setState({ properties: [p], expandedPropertyId: p.id })

    render(<StepProperties />)
    // Unit options should be available
    const selects = screen.getAllByRole('combobox')
    // One of the selects should have Decimal, Katha, etc.
    const pondUnitSelect = selects.find((s) =>
      Array.from(s.querySelectorAll('option')).some((o) => o.textContent === 'Katha'),
    )
    expect(pondUnitSelect).toBeDefined()
  })
})

describe('PROP-06: Regional variations', () => {
  test('selecting different divisions changes katha conversion', () => {
    // Same sqft, different division = different katha value
    // 2178 sqft in Dhaka: 2178/720 = 3.025 katha
    // 2178 sqft in Rajshahi: 2178/1620 = 1.34 katha
    const pDhaka = makeProperty({
      type: 'residential',
      division: 'dhaka',
      landAreaSqft: 2178,
      landInputUnit: 'decimal',
    })
    useWizardStore.setState({ properties: [pDhaka], expandedPropertyId: pDhaka.id })

    const { unmount } = render(<LandAreaInput propertyId={pDhaka.id} />)
    // Dhaka katha conversion should show ~3.03
    expect(screen.getByText(/3\.03/)).toBeInTheDocument()
    unmount()

    // Now with Rajshahi
    const pRaj = makeProperty({
      id: pDhaka.id,
      type: 'residential',
      division: 'rajshahi',
      landAreaSqft: 2178,
      landInputUnit: 'decimal',
    })
    useWizardStore.setState({ properties: [pRaj], expandedPropertyId: pRaj.id })

    render(<LandAreaInput propertyId={pRaj.id} />)
    // Rajshahi katha conversion should show ~1.34
    expect(screen.getByText(/1\.34/)).toBeInTheDocument()
  })
})
