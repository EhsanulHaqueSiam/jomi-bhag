import { Fragment } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { WIZARD_STEPS } from '@/types/wizard'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function StepIndicator() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const completedSteps = useWizardStore((s) => s.completedSteps)
  const setStep = useWizardStore((s) => s.setStep)

  const isCompleted = (step: number) => completedSteps.includes(step)
  const isActive = (step: number) => step === currentStep
  const isClickable = (step: number) =>
    isCompleted(step) && !isActive(step)

  return (
    <div className="flex items-center justify-center">
      {WIZARD_STEPS.map((step, i) => (
        <Fragment key={step.number}>
          {/* Step circle + label */}
          <div className="flex flex-col items-center">
            <motion.button
              type="button"
              layout={!prefersReducedMotion}
              onClick={() => isClickable(step.number) && setStep(step.number)}
              disabled={!isClickable(step.number)}
              whileTap={
                !prefersReducedMotion && isClickable(step.number)
                  ? { scale: 0.92 }
                  : undefined
              }
              className={`flex items-center justify-center rounded-full text-sm font-semibold transition-all
                ${isActive(step.number) ? 'h-10 w-10 bg-emerald-600 text-white shadow-lg md:h-10 md:w-10' : ''}
                ${isCompleted(step.number) && !isActive(step.number) ? 'h-8 w-8 cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200 md:h-10 md:w-10' : ''}
                ${!isCompleted(step.number) && !isActive(step.number) ? 'h-8 w-8 bg-gray-100 text-gray-400 md:h-10 md:w-10' : ''}
              `}
              aria-current={isActive(step.number) ? 'step' : undefined}
              aria-label={`${step.label}${isCompleted(step.number) && !isActive(step.number) ? ' (completed)' : ''}`}
            >
              <AnimatePresence mode="wait">
                {isCompleted(step.number) && !isActive(step.number) ? (
                  <motion.span
                    key="check"
                    initial={prefersReducedMotion ? false : { scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 25 }
                    }
                  >
                    {'\u2713'}
                  </motion.span>
                ) : (
                  <motion.span
                    key="number"
                    initial={prefersReducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
                  >
                    {step.number}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            {/* Label: hidden on mobile, shown on desktop */}
            <span
              className={`mt-1 hidden text-xs md:block ${
                isActive(step.number)
                  ? 'font-medium text-emerald-700'
                  : isCompleted(step.number)
                    ? 'text-emerald-600'
                    : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {i < WIZARD_STEPS.length - 1 && (
            <motion.div
              className="mx-1 h-0.5 w-12 md:mx-2 md:w-20"
              animate={{
                backgroundColor: isCompleted(step.number) ? '#34d399' : '#e5e7eb',
              }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }
              }
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}
