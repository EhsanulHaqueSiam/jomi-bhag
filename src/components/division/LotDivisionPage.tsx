import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AppPage } from '@/types/scenario'
import type { HeirType } from '@/core/faraid/types'
import { useDivisionStore } from '@/stores/divisionStore'
import { useWizardStore } from '@/stores/wizardStore'
import { QurahReference } from './QurahReference'
import { QurahCeremony } from './QurahCeremony'
import { CompensationBanner } from './CompensationBanner'
import { GroupCard } from './GroupCard'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.4 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

interface LotDivisionPageProps {
  onNavigate: (page: AppPage) => void
}

export function LotDivisionPage({ onNavigate }: LotDivisionPageProps) {
  const divisionResult = useDivisionStore((s) => s.divisionResult)
  const qurahMap = useDivisionStore((s) => s.qurahMap)
  const isRevealed = useDivisionStore((s) => s.isRevealed)
  const revealedGroupCount = useDivisionStore((s) => s.revealedGroupCount)
  const computeDivision = useDivisionStore((s) => s.computeDivision)
  const performQurah = useDivisionStore((s) => s.performQurah)
  const revealNextGroup = useDivisionStore((s) => s.revealNextGroup)
  const revealAll = useDivisionStore((s) => s.revealAll)
  const moveParcel = useDivisionStore((s) => s.moveParcel)
  const getDisplayGroups = useDivisionStore((s) => s.getDisplayGroups)
  const isStale = useDivisionStore((s) => s.isStale)

  const properties = useWizardStore((s) => s.properties)
  const setStep = useWizardStore((s) => s.setStep)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Compute division on mount if needed
  useEffect(() => {
    if (!divisionResult || isStale()) {
      computeDivision()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Staggered reveal timer
  useEffect(() => {
    if (qurahMap && !isRevealed && divisionResult) {
      const totalGroups = divisionResult.groups.length
      timerRef.current = setInterval(() => {
        const currentCount = useDivisionStore.getState().revealedGroupCount
        if (currentCount < totalGroups) {
          revealNextGroup()
        } else {
          revealAll()
          if (timerRef.current) clearInterval(timerRef.current)
        }
      }, 400)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [qurahMap, isRevealed, divisionResult, revealNextGroup, revealAll])

  const handleBackToResults = () => {
    setStep(5)
    onNavigate('wizard')
  }

  const handleDraw = () => {
    performQurah()
  }

  const handleMoveParcel = (
    propertyId: string,
    from: HeirType,
    to: HeirType,
  ) => {
    moveParcel(propertyId, from, to)
  }

  const displayGroups = getDisplayGroups()
  const hasDrawn = qurahMap !== null
  const animateReveal = hasDrawn && !isRevealed

  // Filter groups to show based on reveal progress
  const visibleGroups = animateReveal
    ? displayGroups.slice(0, revealedGroupCount)
    : displayGroups

  return (
    <div className="space-y-6 pb-8">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Land Division</h2>
        <button
          type="button"
          onClick={handleBackToResults}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Back to Results
        </button>
      </div>

      {/* Qurah Islamic reference */}
      <QurahReference />

      {/* Qurah ceremony (bismillah + draw button) */}
      <QurahCeremony
        onDraw={handleDraw}
        isRevealed={isRevealed}
        hasDrawn={hasDrawn}
      />

      {/* Compensation banner */}
      {divisionResult && (
        <CompensationBanner compensations={divisionResult.compensations} />
      )}

      {/* Group cards grid */}
      {animateReveal ? (
        <AnimatePresence>
          <motion.div
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleGroups.map((group) => (
              <motion.div key={group.heirType} variants={cardVariants}>
                <GroupCard
                  group={group}
                  allGroups={displayGroups}
                  properties={properties}
                  onMoveParcel={handleMoveParcel}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {displayGroups.map((group) => (
            <GroupCard
              key={group.heirType}
              group={group}
              allGroups={displayGroups}
              properties={properties}
              onMoveParcel={handleMoveParcel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
