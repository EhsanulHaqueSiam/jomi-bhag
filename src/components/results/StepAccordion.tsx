import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { CalculationStep } from '@/core/faraid/types'

interface StepAccordionProps {
  steps: CalculationStep[]
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
        isOpen ? 'rotate-180' : ''
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function StepAccordion({ steps }: StepAccordionProps) {
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set())

  const toggleStep = useCallback((stepNum: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNum)) {
        next.delete(stepNum)
      } else {
        next.add(stepNum)
      }
      return next
    })
  }, [])

  if (steps.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">
        Calculation Steps
      </h3>
      <div className="mt-1 mb-3 h-px bg-gray-200" />
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {steps.map((step) => {
          const isOpen = openSteps.has(step.step)
          return (
            <div key={step.step}>
              <button
                type="button"
                onClick={() => toggleStep(step.step)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 md:p-4"
                aria-expanded={isOpen}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {step.step}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-gray-800">
                  {step.description}
                </span>
                <ChevronIcon isOpen={isOpen} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-3 pb-3 pl-13 md:px-4 md:pb-4 md:pl-14">
                      <p className="text-sm leading-relaxed text-gray-600">
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
