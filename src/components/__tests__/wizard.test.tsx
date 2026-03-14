import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { useWizardStore } from '@/stores/wizardStore'

/**
 * Helper: get the first non-disabled button matching the given text.
 * WizardShell renders both desktop and mobile nav buttons, so we pick
 * the first enabled one found.
 */
function clickNavButton(name: string) {
  const buttons = screen.getAllByText(name)
  const enabled = buttons.find((b) => !(b as HTMLButtonElement).disabled)
  if (enabled) {
    fireEvent.click(enabled)
  } else {
    fireEvent.click(buttons[0])
  }
}

// Reset store state before each test
beforeEach(() => {
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
  })
})

describe('Wizard renders on load', () => {
  it('renders Jomi-Bhag heading', () => {
    render(<App />)
    expect(screen.getByText('Jomi-Bhag')).toBeInTheDocument()
  })

  it('renders Islamic Inheritance Calculator subtitle', () => {
    render(<App />)
    expect(
      screen.getByText('Islamic Inheritance Calculator'),
    ).toBeInTheDocument()
  })

  it('renders Step 1 content on initial load', () => {
    render(<App />)
    expect(
      screen.getByText('Click on who passed away in your family'),
    ).toBeInTheDocument()
  })

  it('renders parents-deceased info text', () => {
    render(<App />)
    expect(
      screen.getByText(
        "This calculator assumes the deceased's parents have passed away",
      ),
    ).toBeInTheDocument()
  })
})

describe('Step navigation', () => {
  it('navigates from Step 1 to Step 2 after selecting Father + Son', async () => {
    render(<App />)

    // Select "Father" relationship
    fireEvent.click(screen.getByText('Father'))

    // Select user gender "Son"
    fireEvent.click(screen.getByText('Son'))

    // Click Next
    clickNavButton('Next')

    // Wait for step content to render (Immediate Family is unique to StepFamilyAndSiblings)
    await waitFor(() => {
      expect(screen.getByText('Immediate Family')).toBeInTheDocument()
    })
  })

  it('navigates from Step 2 to Step 3 (Estate Inventory)', async () => {
    render(<App />)

    // Select relationship and proceed
    fireEvent.click(screen.getByText('Father'))
    fireEvent.click(screen.getByText('Son'))
    clickNavButton('Next')

    await waitFor(() => {
      expect(screen.getByText('Immediate Family')).toBeInTheDocument()
    })

    // Now on Step 2 (combined Family Members) -- click Next to Estate Inventory
    clickNavButton('Next')

    await waitFor(() => {
      expect(screen.getByText('Land & Properties')).toBeInTheDocument()
    })
  })

  it('navigates back from Step 2 to Step 1', async () => {
    render(<App />)

    // Go to Step 2
    fireEvent.click(screen.getByText('Father'))
    fireEvent.click(screen.getByText('Son'))
    clickNavButton('Next')

    await waitFor(() => {
      expect(screen.getByText('Immediate Family')).toBeInTheDocument()
    })

    // Click Back
    clickNavButton('Back')

    await waitFor(() => {
      expect(
        screen.getByText('Click on who passed away in your family'),
      ).toBeInTheDocument()
    })
  })
})

describe('DSGN-03 wizard flow', () => {
  it('all steps are reachable through Next navigation', async () => {
    render(<App />)

    // Step 1
    expect(
      screen.getByText('Click on who passed away in your family'),
    ).toBeInTheDocument()

    // Select relationship and go to Step 2
    fireEvent.click(screen.getByText('Father'))
    fireEvent.click(screen.getByText('Son'))
    clickNavButton('Next')

    await waitFor(() => {
      expect(screen.getByText('Immediate Family')).toBeInTheDocument()
    })

    // Go to Step 3 (Estate Inventory)
    clickNavButton('Next')

    await waitFor(() => {
      expect(screen.getByText('Land & Properties')).toBeInTheDocument()
    })
  })
})

describe('HEIR-05 parents excluded', () => {
  it('no Father or Mother heir entry fields exist in Step 2 (family section)', async () => {
    render(<App />)

    // Go to Step 2
    fireEvent.click(screen.getByText('Father'))
    fireEvent.click(screen.getByText('Son'))
    clickNavButton('Next')

    // Wait for step content to render (use unique text from StepFamilyAndSiblings)
    await waitFor(() => {
      expect(screen.getByText('Immediate Family')).toBeInTheDocument()
    })

    // Step 2 should have Sons and Daughters but NOT Father/Mother as heir entries
    expect(screen.getByText('Sons')).toBeInTheDocument()
    expect(screen.getByText('Daughters')).toBeInTheDocument()

    // There should be no stepper controls for Father or Mother
    expect(screen.queryByLabelText('Decrease Father')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Decrease Mother')).not.toBeInTheDocument()
    // Verify expected controls are present
    expect(screen.getByLabelText('Increase Sons')).toBeInTheDocument()
  })

  it('no Father or Mother heir entry fields exist in Step 2 (siblings section)', async () => {
    render(<App />)

    // Go to Step 2
    fireEvent.click(screen.getByText('Father'))
    fireEvent.click(screen.getByText('Son'))
    clickNavButton('Next')

    // Wait for Step 2 to fully render
    const siblingsToggle = await screen.findByText('Add siblings (optional)')

    // Expand the siblings toggle
    fireEvent.click(siblingsToggle)

    // Siblings section should now show Brothers and Sisters, not Father/Mother
    await waitFor(() => {
      expect(screen.getByText('Brothers')).toBeInTheDocument()
    })
    expect(screen.getByText('Sisters')).toBeInTheDocument()
    expect(screen.queryByLabelText('Decrease Father')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Decrease Mother')).not.toBeInTheDocument()
  })
})
