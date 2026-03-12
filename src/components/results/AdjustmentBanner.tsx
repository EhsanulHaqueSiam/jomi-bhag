import type { AdjustmentType } from '@/core/faraid/types'
import type Fraction from 'fraction.js'
import { fractionToString } from '@/core/utils/display'

interface AdjustmentBannerProps {
  adjustment: AdjustmentType
  totalBeforeAdjustment: Fraction
}

/** Info icon (inline SVG). */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function AdjustmentBanner({
  adjustment,
  totalBeforeAdjustment,
}: AdjustmentBannerProps) {
  if (adjustment === 'none') return null

  const isAwl = adjustment === 'awl'

  const heading = isAwl
    ? 'Awl (Proportional Reduction) Applied'
    : 'Radd (Surplus Return) Applied'

  const description = isAwl
    ? `The total prescribed shares exceeded the estate (${fractionToString(totalBeforeAdjustment)}). All shares have been proportionally reduced so each heir receives a fair portion.`
    : `The total prescribed shares were less than the full estate (${fractionToString(totalBeforeAdjustment)}). The surplus has been redistributed to eligible blood-relative heirs. Spouses are excluded from Radd per Hanafi jurisprudence.`

  const containerClass = isAwl
    ? 'border-l-4 border-amber-400 bg-amber-50'
    : 'border-l-4 border-blue-400 bg-blue-50'

  const headingClass = isAwl ? 'text-amber-800' : 'text-blue-800'
  const textClass = isAwl ? 'text-amber-700' : 'text-blue-700'
  const iconClass = isAwl
    ? 'h-5 w-5 shrink-0 text-amber-500'
    : 'h-5 w-5 shrink-0 text-blue-500'

  return (
    <div className={`rounded-xl p-4 ${containerClass}`}>
      <div className="flex items-start gap-3">
        <InfoIcon className={iconClass} />
        <div className="min-w-0">
          <h3 className={`text-sm font-semibold ${headingClass}`}>
            {heading}
          </h3>
          <p className={`mt-1 text-sm leading-relaxed ${textClass}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
