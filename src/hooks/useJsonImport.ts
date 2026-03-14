import { useState, useCallback } from 'react'
import type { WizardState } from '@/types/wizard'
import { useWizardStore } from '@/stores/wizardStore'
import { useDistributionStore } from '@/stores/distributionStore'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'
import { validateAndParseImport } from '@/core/json/importData'

export function useJsonImport() {
  const [pendingState, setPendingState] = useState<WizardState | null>(null)
  const [pendingIndividualData, setPendingIndividualData] = useState<{
    customHeirNames?: Record<string, string>
    individualDistribution?: {
      assignments: { individualId: string; assignedItemIds: string[] }[]
      qurahUsed: boolean
    } | null
  } | null>(null)
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
        setPendingIndividualData({
          customHeirNames: result.customHeirNames,
          individualDistribution: result.individualDistribution,
        })
      }

      reader.readAsText(file)
    },
    [showError],
  )

  const confirmImport = useCallback(() => {
    if (!pendingState) return

    useWizardStore.setState(pendingState)
    useDistributionStore.getState().resetDistribution()
    useIndividualDistributionStore.getState().reset()
    useWizardStore.getState().calculateShares()

    if (pendingIndividualData?.customHeirNames) {
      useIndividualDistributionStore.setState({
        customNames: pendingIndividualData.customHeirNames,
      })
    }
    if (pendingIndividualData?.individualDistribution) {
      useIndividualDistributionStore.setState({
        qurahUsed: pendingIndividualData.individualDistribution.qurahUsed,
        hasBeenUsed: true,
      })
    }

    setPendingState(null)
    setPendingIndividualData(null)
    setToast({ message: 'Data imported successfully', type: 'success' })
  }, [pendingState, pendingIndividualData])

  const cancelImport = useCallback(() => {
    setPendingState(null)
    setPendingIndividualData(null)
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
