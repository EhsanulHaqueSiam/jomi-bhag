import { useState, useCallback } from 'react'
import { useWizardStore } from '@/stores/wizardStore'

export function usePdfExport() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Read store state (non-reactive -- only read when generating)
  const getStoreState = () => useWizardStore.getState()

  async function captureCharts(): Promise<{
    pieChartImage: string | null
    barChartImage: string | null
  }> {
    try {
      const { toPng } = await import('html-to-image')

      const pieEl = document.getElementById('pdf-pie-chart')
      const barEl = document.getElementById('pdf-bar-chart')

      const pieChartImage = pieEl
        ? await toPng(pieEl, { pixelRatio: 2, backgroundColor: '#ffffff' })
        : null
      const barChartImage = barEl
        ? await toPng(barEl, { pixelRatio: 2, backgroundColor: '#ffffff' })
        : null

      return { pieChartImage, barChartImage }
    } catch {
      // Chart capture is non-critical — PDF works without charts
      return { pieChartImage: null, barChartImage: null }
    }
  }

  async function generatePdfBlob(): Promise<Blob> {
    const state = getStoreState()
    if (!state.results) throw new Error('No results to export')

    // Validate that Fraction objects are real instances (not plain objects from stale localStorage)
    const firstShare = state.results.shares[0]
    if (firstShare && typeof firstShare.totalShare?.toFraction !== 'function') {
      throw new Error('Stale data — please recalculate shares (click "Edit Heirs" then recalculate)')
    }

    // Capture charts from DOM (non-critical, won't throw)
    const { pieChartImage, barChartImage } = await captureCharts()

    // Dynamic imports for lazy loading (keeps ~450KB out of initial bundle)
    const [{ pdf }, { PdfDocument }, { extractPdfData }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/pdf/PdfDocument'),
      import('@/components/pdf/extractPdfData'),
    ])

    const divisionState = (await import('@/stores/divisionStore')).useDivisionStore.getState()
    const divisionResult = divisionState.divisionResult

    const distributionState = (await import('@/stores/distributionStore')).useDistributionStore.getState()
    const distributionResult = distributionState.distributionResult

    let pdfData
    try {
      pdfData = extractPdfData(
        state.results,
        state.properties,
        state.totalEstateValue,
        pieChartImage,
        barChartImage,
        divisionResult,
        state.movableAssets,
        distributionResult,
      )
    } catch (extractErr) {
      throw new Error(`Data extraction failed: ${extractErr instanceof Error ? extractErr.message : String(extractErr)}`)
    }

    // Generate PDF blob
    const blob = await pdf(<PdfDocument data={pdfData} />).toBlob()
    return blob
  }

  const downloadPdf = useCallback(async (): Promise<void> => {
    setIsGenerating(true)
    setError(null)
    try {
      const blob = await generatePdfBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `jomi-bhag-inheritance-report-${new Date().toISOString().split('T')[0]}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('PDF download failed:', msg, err)
      setError(`PDF download failed: ${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const printPdf = useCallback(async (): Promise<void> => {
    setIsGenerating(true)
    setError(null)
    try {
      const blob = await generatePdfBlob()
      const url = URL.createObjectURL(blob)

      // Use hidden iframe for printing — more reliable than window.open
      // which gets popup-blocked on mobile
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)

      iframe.onload = () => {
        try {
          iframe.contentWindow?.print()
        } catch {
          // If iframe print fails (cross-origin on some browsers),
          // fall back to opening in a new tab
          window.open(url, '_blank')
        }
        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(iframe)
          URL.revokeObjectURL(url)
        }, 60000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('PDF print failed:', msg, err)
      setError(`PDF print failed: ${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return { downloadPdf, printPdf, isGenerating, error, dismissError }
}
