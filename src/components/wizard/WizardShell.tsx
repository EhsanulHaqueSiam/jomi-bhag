import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { AppPage } from '@/types/scenario'
import { useWizardStore } from '@/stores/wizardStore'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Button } from '@/components/ui/Button'
import { StepRelationship } from '@/components/wizard/StepRelationship'
import { StepFamily } from '@/components/wizard/StepFamily'
import { StepSiblings } from '@/components/wizard/StepSiblings'
import { FamilyTree } from '@/components/wizard/FamilyTree'
import { ResultsPage } from '@/components/results/ResultsPage'
import { StepProperties } from '@/components/property/StepProperties'

interface WizardShellProps {
  onNavigate: (page: AppPage) => void
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

const stepTransition = {
  duration: 0.3,
  ease: 'easeInOut' as const,
}

export function WizardShell({ onNavigate }: WizardShellProps) {
  const currentStep = useWizardStore((s) => s.currentStep)
  const setStep = useWizardStore((s) => s.setStep)
  // Compute validity inline from relevant state so the component re-renders
  // when relationship/deceasedGender change (isStepValid is a function ref that
  // never changes, so subscribing to it alone won't trigger re-renders).
  const relationship = useWizardStore((s) => s.relationship)
  const deceasedGender = useWizardStore((s) => s.deceasedGender)

  const isCurrentStepValid = (() => {
    switch (currentStep) {
      case 1:
        if (!relationship) return false
        if (relationship === 'other' && !deceasedGender) return false
        return true
      case 2:
        return true
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  })()

  const [direction, setDirection] = useState(1)

  const handleBack = () => {
    setDirection(-1)
    setStep(currentStep - 1)
  }

  const handleNext = () => {
    setDirection(1)
    setStep(currentStep + 1)
  }

  const calculateShares = useWizardStore((s) => s.calculateShares)

  const handleCalculate = () => {
    calculateShares()
  }

  return (
    <div>
      {/* Step Indicator */}
      <StepIndicator />

      {/* Parents-deceased info text (hidden on results step) */}
      {currentStep !== 5 && (
        <p className="mt-3 text-center text-xs text-gray-400">
          <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-400">
            i
          </span>
          This calculator assumes the deceased's parents have passed away
        </p>
      )}

      {/* Family tree visualization (hidden on results step) */}
      {currentStep !== 5 && (
        <div className="mt-4">
          <FamilyTree currentStep={currentStep} />
        </div>
      )}

      {/* Animated step content */}
      <div className="relative mt-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            {currentStep === 1 && <StepRelationship />}
            {currentStep === 2 && <StepFamily />}
            {currentStep === 3 && <StepSiblings />}
            {currentStep === 4 && <StepProperties />}
            {currentStep === 5 && <ResultsPage onNavigate={onNavigate} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop navigation bar (hidden on results step) */}
      {currentStep !== 5 && (
        <div className="mt-8 hidden justify-between md:flex">
          {currentStep > 1 ? (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {currentStep < 4 && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!isCurrentStepValid}
            >
              Next
            </Button>
          )}
          {currentStep === 4 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Skip to Results
              </button>
              <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={!isCurrentStepValid}
              >
                Calculate Shares
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile navigation bar -- fixed bottom (hidden on results step) */}
      {currentStep !== 5 && (
        <div className="fixed bottom-0 left-0 right-0 flex flex-col gap-2 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button variant="secondary" onClick={handleBack} fullWidth>
                Back
              </Button>
            )}
            {currentStep < 4 && (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                fullWidth
              >
                Next
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                variant="primary"
                onClick={handleCalculate}
                disabled={!isCurrentStepValid}
                fullWidth
              >
                Calculate Shares
              </Button>
            )}
          </div>
          {currentStep === 4 && (
            <button
              type="button"
              onClick={handleCalculate}
              className="text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Skip to Results
            </button>
          )}
        </div>
      )}
    </div>
  )
}
