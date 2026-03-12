import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Button } from '@/components/ui/Button'

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

export function WizardShell() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const setStep = useWizardStore((s) => s.setStep)
  const isStepValid = useWizardStore((s) => s.isStepValid)
  const [direction, setDirection] = useState(1)

  const handleBack = () => {
    setDirection(-1)
    setStep(currentStep - 1)
  }

  const handleNext = () => {
    setDirection(1)
    setStep(currentStep + 1)
  }

  const handleCalculate = () => {
    // Phase 3 will wire this to results display
    console.log('Calculate shares triggered')
  }

  return (
    <div>
      {/* Step Indicator */}
      <StepIndicator />

      {/* Parents-deceased info text */}
      <p className="mt-3 text-center text-xs text-gray-400">
        <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-400">
          i
        </span>
        This calculator assumes the deceased's parents have passed away
      </p>

      {/* Animated step content */}
      <div className="relative mt-6 overflow-hidden">
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
            {/* Placeholder step content -- Plan 03 will replace these */}
            <div className="flex min-h-[200px] items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              Step {currentStep} content
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop navigation bar */}
      <div className="mt-8 hidden justify-between md:flex">
        {currentStep > 1 ? (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < 3 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
          >
            Next
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            variant="primary"
            onClick={handleCalculate}
            disabled={!isStepValid(3)}
          >
            Calculate Shares
          </Button>
        )}
      </div>

      {/* Mobile navigation bar -- fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-gray-100 bg-white px-4 py-3 md:hidden">
        {currentStep > 1 && (
          <Button variant="secondary" onClick={handleBack} fullWidth>
            Back
          </Button>
        )}
        {currentStep < 3 && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            fullWidth
          >
            Next
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            variant="primary"
            onClick={handleCalculate}
            disabled={!isStepValid(3)}
            fullWidth
          >
            Calculate Shares
          </Button>
        )}
      </div>
    </div>
  )
}
