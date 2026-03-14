import { useState, useCallback } from 'react'
import type { WizardState } from '@/types/wizard'
import { useWizardStore } from '@/stores/wizardStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { validateAndParseImport } from '@/core/json/importData'

export function useJsonImport() {
  const [pendingState, setPendingState] = useState<WizardState | null>(null)
  const [toast, setToast] = useState<{
    message: string | null
    type: 'success' | 'error'
  }>({ message: null, type: 'success' })

  const showError = useCallback((message: string) => {
    setToast({ message, type: 'error' })
  }, [])

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }))
  }, [])

  const importFromFile = useCallback(
    (file: File) => {
      // Size guard
      if (file.size > 1_000_000) {
        showError('File too large (max 1MB)')
        return
      }

      // Type guard
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        showError('Please select a JSON file')
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        let parsed: unknown
        try {
          parsed = JSON.parse(reader.result as string)
        } catch {
          showError('Invalid file -- could not parse JSON')
          return
        }

        const result = validateAndParseImport(parsed)

        if (!result.success) {
          showError(result.error)
          return
        }

        setPendingState(result.state)
      }

      reader.readAsText(file)
    },
    [showError],
  )

  const confirmImport = useCallback(() => {
    if (!pendingState) return

    useWizardStore.setState(pendingState)
    useDistributionStore.getState().resetDistribution()
    useWizardStore.getState().calculateShares()
    setPendingState(null)
    setToast({ message: 'Data imported successfully', type: 'success' })
  }, [pendingState])

  const cancelImport = useCallback(() => {
    setPendingState(null)
  }, [])

  return {
    importFromFile,
    pendingState,
    confirmImport,
    cancelImport,
    toast,
    dismissToast,
  }
}
