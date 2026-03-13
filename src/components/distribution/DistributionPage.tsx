import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AppPage } from '@/types/scenario'
import type { IndividualCompensation } from '@/core/distribution/individual-types'
import { useDistributionStore } from '@/stores/distributionStore'
import { useIndividualDistributionStore } from '@/stores/individualDistributionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { CompensationBanner } from '@/components/division/CompensationBanner'
import { DistributionBoard } from './DistributionBoard'
import { DistributionControls } from './DistributionControls'
import { ViewToggle } from './ViewToggle'
import { IndividualBoard } from './IndividualBoard'
import { IndividualQurahCeremony } from './IndividualQurahCeremony'
import type { DistributionView } from './ViewToggle'
import type { LandSettlement } from '@/core/land/settlement-types'

const EMPTY_SHARES: import('@/core/faraid/types').ShareResult[] = []

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Controls bar for individual view: Draw Lots (Qurah) + Undo. */
function IndividualControls({
  onUndo,
  canUndo,
  onStartCeremony,
}: {
  onUndo: () => void
  canUndo: boolean
  onStartCeremony: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {/* Undo button */}
      <AnimatePresence>
        {canUndo && (
          <motion.button
            type="button"
            onClick={onUndo}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Undo
          </motion.button>
        )}
      </AnimatePresence>

      {/* Draw Lots (Qurah) button - opens ceremony overlay */}
      <button
        type="button"
        onClick={onStartCeremony}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
        </svg>
        Draw Lots (Qurah)
      </button>
    </div>
  )
}

/** Compensation banner for individual view showing pairwise transfers. */
function IndividualCompensationBanner({
  compensations,
  customNames,
}: {
  compensations: IndividualCompensation[]
  customNames: Record<string, string>
}) {
  if (compensations.length === 0) return null

  const getName = (id: string, fallback: string) =>
    customNames[id] || fallback

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-800">
        Individual Cash Compensation
      </h3>
      <ul className="mt-2 space-y-1">
        {compensations.map((comp, idx) => (
          <li key={idx} className="text-sm text-amber-800">
            {getName(comp.fromId, comp.fromName)} pays{' '}
            {getName(comp.toId, comp.toName)}{' '}
            {bdtFormatter.format(comp.amount)}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface DistributionPageProps {
  onNavigate: (page: AppPage) => void
}

export function DistributionPage({ onNavigate }: DistributionPageProps) {
  const [view, setView] = useState<DistributionView>('group')
  const [showQurahCeremony, setShowQurahCeremony] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Group distribution store
  const distributionResult = useDistributionStore((s) => s.distributionResult)
  const previousSnapshot = useDistributionStore((s) => s.previousSnapshot)
  const computeDistribution = useDistributionStore((s) => s.computeDistribution)
  const randomize = useDistributionStore((s) => s.randomize)
  const moveItem = useDistributionStore((s) => s.moveItem)
  const undoGroup = useDistributionStore((s) => s.undo)
  const isStale = useDistributionStore((s) => s.isStale)
  const getEquilibriumSummary = useDistributionStore(
    (s) => s.getEquilibriumSummary,
  )

  // Individual distribution store
  const indIndividuals = useIndividualDistributionStore((s) => s.individuals)
  const indItems = useIndividualDistributionStore((s) => s.items)
  const indCompensations = useIndividualDistributionStore((s) => s.compensations)
  const indCustomNames = useIndividualDistributionStore((s) => s.customNames)
  const indPreviousSnapshot = useIndividualDistributionStore((s) => s.previousSnapshot)
  const indSplitOrigins = useIndividualDistributionStore((s) => s.splitOrigins)
  const indInitialize = useIndividualDistributionStore((s) => s.initialize)
  const indMoveItem = useIndividualDistributionStore((s) => s.moveItem)
  const indQurahShuffle = useIndividualDistributionStore((s) => s.qurahShuffle)
  const indUndo = useIndividualDistributionStore((s) => s.undo)
  const indRename = useIndividualDistributionStore((s) => s.renameIndividual)
  const indSplit = useIndividualDistributionStore((s) => s.splitItem)
  const indMerge = useIndividualDistributionStore((s) => s.mergeItem)
  const indQurahUsed = useIndividualDistributionStore((s) => s.qurahUsed)
  const indIsStale = useIndividualDistributionStore((s) => s.isStale)
  const indGetEquilibriumSummary = useIndividualDistributionStore(
    (s) => s.getEquilibriumSummary,
  )

  // Wizard store
  const setStep = useWizardStore((s) => s.setStep)
  const properties = useWizardStore((s) => s.properties)
  const results = useWizardStore((s) => s.results)
  const updateProperty = useWizardStore((s) => s.updateProperty)

  const shares = results?.shares ?? EMPTY_SHARES

  // Compute group distribution on mount if needed
  useEffect(() => {
    if (!distributionResult || isStale()) {
      computeDistribution()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize individual distribution when switching to individual view
  useEffect(() => {
    if (view === 'individual') {
      if (indIndividuals.length === 0 || indIsStale()) {
        indInitialize()
      }
    }
  }, [view]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup reveal interval on unmount
  useEffect(() => {
    return () => {
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current)
      }
    }
  }, [])

  const handleCeremonyDraw = useCallback(() => {
    // Clear any existing interval
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current)
    }

    // Perform the shuffle
    indQurahShuffle()

    // Reset revealed count
    setRevealedCount(0)

    // Check reduced motion preference
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Instant reveal
      setRevealedCount(indIndividuals.length)
    } else {
      // Staggered reveal at 200ms per individual
      let count = 0
      revealIntervalRef.current = setInterval(() => {
        count++
        setRevealedCount(count)
        if (count >= indIndividuals.length) {
          if (revealIntervalRef.current) {
            clearInterval(revealIntervalRef.current)
            revealIntervalRef.current = null
          }
        }
      }, 200)
    }
  }, [indQurahShuffle, indIndividuals.length])

  const handleCeremonyClose = useCallback(() => {
    setShowQurahCeremony(false)
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current)
      revealIntervalRef.current = null
    }
    setRevealedCount(0)
  }, [])

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

  const canUndoGroup = previousSnapshot !== null
  const canUndoIndividual = indPreviousSnapshot !== null
  const groupSummary = getEquilibriumSummary()
  const individualSummary = indGetEquilibriumSummary()

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

      {/* View toggle */}
      <ViewToggle view={view} onViewChange={setView} />

      {/* Group view */}
      {view === 'group' && (
        <>
          {/* Controls: Randomize + Undo */}
          <DistributionControls
            onRandomize={randomize}
            onUndo={undoGroup}
            canUndo={canUndoGroup}
          />

          {/* Compensation banner */}
          <CompensationBanner compensations={distributionResult.compensations} />

          {/* DnD board */}
          <DistributionBoard
            groups={distributionResult.groups}
            items={distributionResult.items}
            balancedCount={groupSummary.balanced}
            totalCount={groupSummary.total}
            onMoveItem={moveItem}
            properties={properties}
            shares={shares}
            onSettlementUpdate={handleSettlementUpdate}
          />
        </>
      )}

      {/* Individual view */}
      {view === 'individual' && indIndividuals.length > 0 && (
        <>
          {/* Controls: Qurah + Undo */}
          <IndividualControls
            onUndo={indUndo}
            canUndo={canUndoIndividual}
            onStartCeremony={() => setShowQurahCeremony(true)}
          />

          {/* Individual compensation banner */}
          <IndividualCompensationBanner
            compensations={indCompensations}
            customNames={indCustomNames}
          />

          {/* Individual DnD board */}
          <IndividualBoard
            individuals={indIndividuals}
            items={indItems}
            customNames={indCustomNames}
            balancedCount={individualSummary.balanced}
            totalCount={individualSummary.total}
            onMoveItem={indMoveItem}
            onRename={indRename}
            onSplit={indSplit}
            onMerge={indMerge}
            properties={properties}
            splitOrigins={indSplitOrigins}
          />
        </>
      )}

      {/* Individual Qurah Ceremony overlay */}
      {showQurahCeremony && (
        <IndividualQurahCeremony
          individuals={indIndividuals}
          customNames={indCustomNames}
          onDraw={handleCeremonyDraw}
          onClose={handleCeremonyClose}
          hasDrawn={indQurahUsed}
          revealedCount={revealedCount}
        />
      )}
    </div>
  )
}
