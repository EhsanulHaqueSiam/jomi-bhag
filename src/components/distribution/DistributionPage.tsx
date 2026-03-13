import { useEffect, useCallback } from 'react'
import type { AppPage } from '@/types/scenario'
import { useDistributionStore } from '@/stores/distributionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { CompensationBanner } from '@/components/division/CompensationBanner'
import { DistributionBoard } from './DistributionBoard'
import { DistributionControls } from './DistributionControls'
import type { LandSettlement } from '@/core/land/settlement-types'

const EMPTY_SHARES: import('@/core/faraid/types').ShareResult[] = []

interface DistributionPageProps {
  onNavigate: (page: AppPage) => void
}

export function DistributionPage({ onNavigate }: DistributionPageProps) {
  const distributionResult = useDistributionStore((s) => s.distributionResult)
  const previousSnapshot = useDistributionStore((s) => s.previousSnapshot)
  const computeDistribution = useDistributionStore((s) => s.computeDistribution)
  const randomize = useDistributionStore((s) => s.randomize)
  const moveItem = useDistributionStore((s) => s.moveItem)
  const undo = useDistributionStore((s) => s.undo)
  const isStale = useDistributionStore((s) => s.isStale)
  const getEquilibriumSummary = useDistributionStore(
    (s) => s.getEquilibriumSummary,
  )

  const setStep = useWizardStore((s) => s.setStep)
  const properties = useWizardStore((s) => s.properties)
  const results = useWizardStore((s) => s.results)
  const updateProperty = useWizardStore((s) => s.updateProperty)

  const shares = results?.shares ?? EMPTY_SHARES

  // Compute distribution on mount if needed
  useEffect(() => {
    if (!distributionResult || isStale()) {
      computeDistribution()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackToResults = () => {
    setStep(5)
    onNavigate('wizard')
  }

  const handleSettlementUpdate = useCallback(
    (propertyId: string, settlement: LandSettlement | null) => {
      updateProperty(propertyId, { settlement })
    },
    [updateProperty],
  )

  const canUndo = previousSnapshot !== null
  const summary = getEquilibriumSummary()

  if (!distributionResult) {
    return (
      <div className="py-12 text-center text-gray-500">
        No assets to distribute. Add properties or movable assets first.
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Asset Distribution
        </h2>
        <button
          type="button"
          onClick={handleBackToResults}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Back to Results
        </button>
      </div>

      {/* Controls: Randomize + Undo */}
      <DistributionControls
        onRandomize={randomize}
        onUndo={undo}
        canUndo={canUndo}
      />

      {/* Compensation banner */}
      <CompensationBanner compensations={distributionResult.compensations} />

      {/* DnD board */}
      <DistributionBoard
        groups={distributionResult.groups}
        items={distributionResult.items}
        balancedCount={summary.balanced}
        totalCount={summary.total}
        onMoveItem={moveItem}
        properties={properties}
        shares={shares}
        onSettlementUpdate={handleSettlementUpdate}
      />
    </div>
  )
}
