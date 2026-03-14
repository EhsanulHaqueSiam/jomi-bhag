import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Fraction from 'fraction.js'
import App from '@/App'
import { useWizardStore } from '@/stores/wizardStore'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'

// ---------------------------------------------------------------------------
// Mock FaraidOutput factory
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
    steps: [
      {
        step: 1,
        description: 'Identify heirs',
        detail: 'Husband and 2 daughters present.',
      },
    ],
    references: [],
  }
}

// ---------------------------------------------------------------------------
// Base store state helpers
// ---------------------------------------------------------------------------

const resultsState = {
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
  properties: [],
  movableAssets: [],
  totalEstateValue: 0,
  viewMode: 'simple' as const,
  results: makeSimpleOutput(),
}

const step1State = {
  currentStep: 1,
  completedSteps: [],
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
  properties: [],
  movableAssets: [],
  totalEstateValue: 0,
  viewMode: 'simple' as const,
  results: null,
}

// ---------------------------------------------------------------------------
// Export JSON button tests
// ---------------------------------------------------------------------------

describe('Export JSON button on Results page', () => {
  beforeEach(() => {
    useWizardStore.setState(resultsState)
  })

  it('renders Export JSON button text', () => {
    render(<App />)

    expect(screen.getByText('Export JSON')).toBeInTheDocument()
  })

  it('calls exportJson on click (triggers anchor download)', () => {
    // Mock DOM methods used by the export hook
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      writable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      writable: true,
    })

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickSpy
      }
      return el
    })

    render(<App />)

    const btn = screen.getByText('Export JSON')
    fireEvent.click(btn)

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------------------
// Import drop zone tests
// ---------------------------------------------------------------------------

describe('Import drop zone on Step 1', () => {
  beforeEach(() => {
    useWizardStore.setState(step1State)
  })

  it('renders "or import from file" divider text', () => {
    render(<App />)

    expect(screen.getByText('or import from file')).toBeInTheDocument()
  })

  it('renders drop zone with instructions', () => {
    render(<App />)

    expect(
      screen.getByText('Drag JSON file here or click to browse'),
    ).toBeInTheDocument()
  })

  it('triggers import flow on file drop', async () => {
    render(<App />)

    const dropZone = screen.getByText('Drag JSON file here or click to browse')
      .closest('[role="button"]')!

    const validData = JSON.stringify({
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportDate: '2026-01-01',
      data: { relationship: 'wife', sonCount: 2 },
    })

    const file = new File([validData], 'test.json', {
      type: 'application/json',
    })

    const dataTransfer = {
      files: [file],
      dropEffect: '' as string,
      types: ['Files'],
      getData: () => '',
      setData: () => {},
    }

    fireEvent.drop(dropZone, { dataTransfer })

    // After processing, confirmation dialog should appear
    await waitFor(() => {
      expect(
        screen.getByText('Importing will replace your current data. Continue?'),
      ).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Confirmation dialog tests
// ---------------------------------------------------------------------------

describe('Import confirmation dialog', () => {
  beforeEach(() => {
    useWizardStore.setState(step1State)
  })

  it('shows confirmation text when file is validated', async () => {
    render(<App />)

    // Drop a valid file
    const dropZone = screen.getByText('Drag JSON file here or click to browse')
      .closest('[role="button"]')!

    const validData = JSON.stringify({
      data: { relationship: 'wife', sonCount: 3 },
    })
    const file = new File([validData], 'test.json', {
      type: 'application/json',
    })

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        dropEffect: '',
        types: ['Files'],
        getData: () => '',
        setData: () => {},
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Importing will replace your current data. Continue?'),
      ).toBeInTheDocument()
    })

    // Import and Cancel buttons should be visible
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('clicking Cancel clears the confirmation dialog', async () => {
    render(<App />)

    const dropZone = screen.getByText('Drag JSON file here or click to browse')
      .closest('[role="button"]')!

    const validData = JSON.stringify({
      data: { relationship: 'brother' },
    })
    const file = new File([validData], 'test.json', {
      type: 'application/json',
    })

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        dropEffect: '',
        types: ['Files'],
        getData: () => '',
        setData: () => {},
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Importing will replace your current data. Continue?'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Importing will replace your current data. Continue?',
        ),
      ).not.toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Toast notification tests
// ---------------------------------------------------------------------------

describe('Toast notifications', () => {
  beforeEach(() => {
    useWizardStore.setState(step1State)
  })

  it('shows error toast for invalid JSON file', async () => {
    render(<App />)

    const dropZone = screen.getByText('Drag JSON file here or click to browse')
      .closest('[role="button"]')!

    const file = new File(['not json at all'], 'bad.json', {
      type: 'application/json',
    })

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        dropEffect: '',
        types: ['Files'],
        getData: () => '',
        setData: () => {},
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Invalid file -- could not parse JSON'),
      ).toBeInTheDocument()
    })
  })

  it('shows success toast after confirming import', async () => {
    render(<App />)

    const dropZone = screen.getByText('Drag JSON file here or click to browse')
      .closest('[role="button"]')!

    const validData = JSON.stringify({
      data: { relationship: 'sister', daughterCount: 1 },
    })
    const file = new File([validData], 'test.json', {
      type: 'application/json',
    })

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
        dropEffect: '',
        types: ['Files'],
        getData: () => '',
        setData: () => {},
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Importing will replace your current data. Continue?'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Import'))

    await waitFor(() => {
      expect(
        screen.getByText('Data imported successfully'),
      ).toBeInTheDocument()
    })
  })
})
