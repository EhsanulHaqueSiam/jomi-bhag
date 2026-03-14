import { renderHook, act, waitFor } from '@testing-library/react'
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

vi.mock('@/stores/divisionStore', () => ({
  useDivisionStore: { getState: () => ({ divisionResult: null }) },
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

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickSpy
      }
      return el
    })

    // Lazy import after mocks in place
    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.downloadPdf()
    })

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()
  })

  it('throws when no results in store', async () => {
    useWizardStore.setState({ results: null })

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    let error: Error | null = null
    await act(async () => {
      try {
        await result.current.downloadPdf()
      } catch (e) {
        error = e as Error
      }
    })

    expect(error).not.toBeNull()
    expect(error!.message).toBe('No results to export')
  })

  it('printPdf calls window.open with blob URL', async () => {
    useWizardStore.setState({
      results: makeFaraidOutput(),
      properties: [],
      movableAssets: [],
      totalEstateValue: 0,
    })

    const createObjectURL = vi.fn(() => 'blob:print-url')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

    const openSpy = vi.fn()
    vi.spyOn(window, 'open').mockImplementation(openSpy)

    const { usePdfExport } = await import('@/hooks/usePdfExport')
    const { result } = renderHook(() => usePdfExport())

    await act(async () => {
      await result.current.printPdf()
    })

    expect(openSpy).toHaveBeenCalledWith('blob:print-url', '_blank')
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
