import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { useJsonImport } from '@/hooks/useJsonImport'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks()

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
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeValidJsonString(): string {
  return JSON.stringify({
    schemaVersion: 1,
    appVersion: '1.0.0',
    exportDate: '2026-01-01',
    data: { relationship: 'wife', sonCount: 2 },
  })
}

function createFile(
  content: string,
  name: string,
  options?: FilePropertyBag,
): File {
  return new File([content], name, options)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useJsonImport', () => {
  it('rejects files larger than 1MB', () => {
    const { result } = renderHook(() => useJsonImport())

    // Create a >1MB file
    const bigContent = 'x'.repeat(1_000_001)
    const file = createFile(bigContent, 'big.json', {
      type: 'application/json',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    expect(result.current.toast.type).toBe('error')
    expect(result.current.toast.message).toContain('File too large')
  })

  it('rejects non-JSON files (no .json extension AND not application/json type)', () => {
    const { result } = renderHook(() => useJsonImport())

    const file = createFile('hello', 'data.txt', { type: 'text/plain' })

    act(() => {
      result.current.importFromFile(file)
    })

    expect(result.current.toast.type).toBe('error')
    expect(result.current.toast.message).toContain('JSON file')
  })

  it('shows error toast for invalid JSON content', async () => {
    const { result } = renderHook(() => useJsonImport())

    const file = createFile('not json at all', 'bad.json', {
      type: 'application/json',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    await waitFor(() => {
      expect(result.current.toast.message).toBe(
        'Invalid file -- could not parse JSON',
      )
    })
    expect(result.current.toast.type).toBe('error')
  })

  it('sets pendingState with valid JSON', async () => {
    const { result } = renderHook(() => useJsonImport())

    const file = createFile(makeValidJsonString(), 'valid.json', {
      type: 'application/json',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    await waitFor(() => {
      expect(result.current.pendingState).not.toBeNull()
    })

    // Pending state should reflect imported relationship
    expect(result.current.pendingState).toHaveProperty('relationship', 'wife')
  })

  it('confirmImport calls useWizardStore.setState and resetDistribution', async () => {
    const setStateSpy = vi.spyOn(useWizardStore, 'setState')
    const resetSpy = vi.fn()
    vi.spyOn(useDistributionStore, 'getState').mockReturnValue({
      resetDistribution: resetSpy,
    } as any)

    const { result } = renderHook(() => useJsonImport())

    // Import a valid file first
    const file = createFile(makeValidJsonString(), 'valid.json', {
      type: 'application/json',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    await waitFor(() => {
      expect(result.current.pendingState).not.toBeNull()
    })

    act(() => {
      result.current.confirmImport()
    })

    expect(setStateSpy).toHaveBeenCalled()
    expect(resetSpy).toHaveBeenCalled()
    expect(result.current.pendingState).toBeNull()
    expect(result.current.toast.message).toBe('Data imported successfully')
    expect(result.current.toast.type).toBe('success')
  })

  it('cancelImport clears pendingState back to null', async () => {
    const { result } = renderHook(() => useJsonImport())

    const file = createFile(makeValidJsonString(), 'valid.json', {
      type: 'application/json',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    await waitFor(() => {
      expect(result.current.pendingState).not.toBeNull()
    })

    act(() => {
      result.current.cancelImport()
    })

    expect(result.current.pendingState).toBeNull()
  })

  it('dismissToast clears toast message', () => {
    const { result } = renderHook(() => useJsonImport())

    // Trigger an error toast
    const bigFile = createFile('x'.repeat(1_000_001), 'big.json', {
      type: 'application/json',
    })
    act(() => {
      result.current.importFromFile(bigFile)
    })

    expect(result.current.toast.message).not.toBeNull()

    act(() => {
      result.current.dismissToast()
    })

    expect(result.current.toast.message).toBeNull()
  })

  it('accepts files with .json extension even without application/json type', async () => {
    const { result } = renderHook(() => useJsonImport())

    // File has .json extension but text/plain type
    const file = createFile(makeValidJsonString(), 'data.json', {
      type: 'text/plain',
    })

    act(() => {
      result.current.importFromFile(file)
    })

    await waitFor(() => {
      expect(result.current.pendingState).not.toBeNull()
    })
  })
})
