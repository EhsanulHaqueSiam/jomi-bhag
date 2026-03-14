import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import Fraction from 'fraction.js'
import type { FaraidOutput, ShareResult } from '@/core/faraid/types'

// ---------------------------------------------------------------------------
// Mocks -- usePdfExport has heavy dynamic imports
// ---------------------------------------------------------------------------

const mockToBlob = vi.fn(() => Promise.resolve(new Blob(['pdf-content'], { type: 'application/pdf' })))

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: mockToBlob })),
}))

vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mockbase64')),
}))

vi.mock('@/components/pdf/PdfDocument', () => ({
  PdfDocument: () => null,
}))

vi.mock('@/components/pdf/extractPdfData', () => ({
  extractPdfData: vi.fn(() => ({ title: 'test' })),
}))

vi.mock('@/stores/distributionStore', () => ({
  useDistributionStore: { getState: () => ({ distributionResult: null }) },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeShare(
  overrides: Partial<ShareResult> & { heirType: ShareResult['heirType'] },
): ShareResult {
  return {
    count: 1,
    sharePerHeir: new Fraction(1, 4),
    totalShare: new Fraction(1, 4),
    shareType: 'fard',
    explanation: 'Test',
    ...overrides,
  }
}

function makeFaraidOutput(): FaraidOutput {
  return {
    shares: [
      makeShare({ heirType: 'wife', totalShare: new Fraction(1, 8), sharePerHeir: new Fraction(1, 8) }),
      makeShare({ heirType: 'son', count: 2, totalShare: new Fraction(7, 8), sharePerHeir: new Fraction(7, 16), shareType: 'asaba' }),
    ],
    adjustment: 'none',
    totalBeforeAdjustment: new Fraction(1),
    blockedHeirs: [],
    specialCases: [],
    mfloApplied: false,
    steps: [],
    references: [],
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks()
  mockToBlob.mockResolvedValue(new Blob(['pdf-content'], { type: 'application/pdf' }))
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePdfExport', () => {
  it('downloadPdf creates anchor, clicks, and revokes URL', async () => {
    vi.useFakeTimers()
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 1000000,
    })

    const createObjectURL = vi.fn(() => 'blob:pdf-url')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, writable: true })

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    // Lazy import after mocks in place
    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

    // revokeObjectURL is called inside setTimeout(100ms)
    vi.advanceTimersByTime(200)
    expect(revokeObjectURL).toHaveBeenCalled()

    clickSpy.mockRestore()
    vi.useRealTimers()
  })

  it('sets error when no results in store', async () => {
    useWizardStore.setState({ results: null })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(result.current.error).toContain('No results to export')
  })

  it('printPdf creates iframe with blob URL', async () => {
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 0,
    })

    const createObjectURL = vi.fn(() => 'blob:print-url')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.printPdf()
    })

    expect(createObjectURL).toHaveBeenCalled()
    // printPdf creates a hidden iframe with the blob URL
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toBe('blob:print-url')
  })

  it('isGenerating returns to false after completion (success)', async () => {
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 0,
    })

    Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:x'), writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    expect(result.current.isGenerating).toBe(false)

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(result.current.isGenerating).toBe(false)
  })

  it('isGenerating returns to false after error', async () => {
    useWizardStore.setState({ results: null })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      try {
        await result.current.downloadPdf()
      } catch {
        // expected
      }
    })

    expect(result.current.isGenerating).toBe(false)
  })
})
