import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepProperties } from '@/components/property/StepProperties'
import { PropertyTypeSelector } from '@/components/property/PropertyTypeSelector'

// Reset store before each test
beforeEach(() => {
  useWizardStore.setState({
    properties: [],
    expandedPropertyId: null,
  })
})

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

    // After adding, should see expanded card with nickname input
    expect(screen.getByPlaceholderText(/bari-er jomi/i)).toBeInTheDocument()
    // Should see property type selector
    expect(screen.getByText('Agricultural')).toBeInTheDocument()
    expect(screen.getByText('Residential')).toBeInTheDocument()
  })

  test('can delete an empty property without confirmation', () => {
    // Add property via store
    const id = useWizardStore.getState().addProperty()
    useWizardStore.setState({ expandedPropertyId: id })

    render(<StepProperties />)
    fireEvent.click(screen.getByText(/delete property/i))

    // Should return to empty state (no confirm dialog for empty property)
    expect(screen.getByText(/add your family/i)).toBeInTheDocument()
  })
})

describe('PropertyTypeSelector', () => {
  test('renders 4 type options', () => {
    const onSelect = () => {}
    render(<PropertyTypeSelector selected={null} onSelect={onSelect} />)

    expect(screen.getByText('Agricultural')).toBeInTheDocument()
    expect(screen.getByText('Residential')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
    expect(screen.getByText('Mixed')).toBeInTheDocument()
  })

  test('highlights selected type', () => {
    const onSelect = () => {}
    render(<PropertyTypeSelector selected="residential" onSelect={onSelect} />)

    const resBtn = screen.getByText('Residential').closest('button')
    expect(resBtn?.className).toContain('emerald')
  })
})

describe('Property card interactions', () => {
  test('selecting type shows land area input', () => {
    const id = useWizardStore.getState().addProperty()
    useWizardStore.setState({ expandedPropertyId: id })

    render(<StepProperties />)

    // Before type selection, no division dropdown
    expect(screen.queryByText('Division')).not.toBeInTheDocument()

    // Select Residential type
    fireEvent.click(screen.getByText('Residential'))

    // Now division dropdown should appear
    expect(screen.getByText('Division')).toBeInTheDocument()
    expect(screen.getByText('Select division')).toBeInTheDocument()
  })
})
