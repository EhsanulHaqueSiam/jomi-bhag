import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import { useJsonExport } from '@/hooks/useJsonExport'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks()

  useWizardStore.setState({
    currentStep: 5,
    completedSteps: [1, 2, 3, 4],
    relationship: 'father',
    deceasedGender: 'male',
    userGender: 'male',
    mfloEnabled: false,
    motherAlive: null,
    autoIncludes: [],
    wifeCount: 0,
    husbandPresent: false,
    sonCount: 2,
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
// Tests
// ---------------------------------------------------------------------------

describe('useJsonExport', () => {
  it('creates a JSON blob, clicks the anchor, and revokes URL', () => {
    const createObjectURL = vi.fn(() => 'blob:test-url')
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
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickSpy
      }
      return el
    })

    const { result } = renderHook(() => useJsonExport())
    act(() => {
      result.current.exportJson()
    })

    expect(createObjectURL).toHaveBeenCalledOnce()
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/json')

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })

  it('exported blob contains schemaVersion and data.relationship', async () => {
    let capturedBlob: Blob | null = null
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:test'
    })
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      writable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    })

    const { result } = renderHook(() => useJsonExport())
    act(() => {
      result.current.exportJson()
    })

    expect(capturedBlob).not.toBeNull()
    const text = await capturedBlob!.text()
    const parsed = JSON.parse(text)

    expect(parsed).toHaveProperty('schemaVersion')
    expect(parsed.data).toHaveProperty('relationship', 'father')
  })

  it('generates download filename based on heir counts', () => {
    const createObjectURL = vi.fn(() => 'blob:test')
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      writable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    })

    let downloadAttr = ''
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        // Spy on the download property assignment
        Object.defineProperty(el, 'download', {
          set(val: string) {
            downloadAttr = val
          },
          get() {
            return downloadAttr
          },
        })
      }
      return el
    })

    const { result } = renderHook(() => useJsonExport())
    act(() => {
      result.current.exportJson()
    })

    // sonCount=2 so filename should contain "2-sons"
    expect(downloadAttr).toContain('2-sons')
    expect(downloadAttr).toMatch(/\.json$/)
  })
})
