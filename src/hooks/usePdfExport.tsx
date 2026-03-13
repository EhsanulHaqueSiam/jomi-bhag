import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'

export function usePdfExport() {
  const [isGenerating, setIsGenerating] = useState(false)

  // Read store state (non-reactive -- only read when generating)
  const getStoreState = () => useWizardStore.getState()

  async function captureCharts(): Promise<{
    pieChartImage: string | null
    barChartImage: string | null
  }> {
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
  }

  async function generatePdfBlob(): Promise<Blob> {
    const state = getStoreState()
    if (!state.results) throw new Error('No results to export')

    // Capture charts from DOM
    const { pieChartImage, barChartImage } = await captureCharts()

    // Dynamic imports for lazy loading (keeps ~450KB out of initial bundle)
    const [{ pdf }, { PdfDocument }, { extractPdfData }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/pdf/PdfDocument'),
      import('@/components/pdf/extractPdfData'),
    ])

    const pdfData = extractPdfData(
      state.results,
      state.properties,
      state.totalEstateValue,
      pieChartImage,
      barChartImage,
    )

    // Generate PDF blob
    const blob = await pdf(<PdfDocument data={pdfData} />).toBlob()
    return blob
  }

  async function downloadPdf(): Promise<void> {
    setIsGenerating(true)
    try {
      const blob = await generatePdfBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `jomi-bhag-inheritance-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsGenerating(false)
    }
  }

  async function printPdf(): Promise<void> {
    setIsGenerating(true)
    try {
      const blob = await generatePdfBlob()
      const url = URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)
      iframe.onload = () => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        // Cleanup after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe)
          URL.revokeObjectURL(url)
        }, 1000)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return { downloadPdf, printPdf, isGenerating }
}
