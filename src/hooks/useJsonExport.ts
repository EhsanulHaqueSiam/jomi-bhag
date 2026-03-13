import { useWizardStore } from '@/stores/wizardStore'
import { extractExportData, generateExportFilename } from '@/core/json/exportData'

export function useJsonExport() {
  function exportJson() {
    const state = useWizardStore.getState()
    const exportData = extractExportData(state)
    const filename = generateExportFilename(state)

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportJson }
}
