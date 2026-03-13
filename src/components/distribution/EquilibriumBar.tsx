import { motion } from 'motion/react'
import { getEquilibriumStatus } from '@/core/distribution/algorithm'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Color mapping for equilibrium status: [barBg, text, borderTop] */
const STATUS_COLORS: Record<string, [string, string, string]> = {
  balanced: ['bg-emerald-500', 'text-emerald-700', 'border-t-emerald-500'],
  close: ['bg-amber-400', 'text-amber-700', 'border-t-amber-400'],
  off: ['bg-red-500', 'text-red-700', 'border-t-red-500'],
}

interface EquilibriumBarProps {
  assignedValue: number
  targetValue: number
}

export function EquilibriumBar({
  assignedValue,
  targetValue,
}: EquilibriumBarProps) {
  const result = getEquilibriumStatus(assignedValue, targetValue)
  const [barBg, textColor] = STATUS_COLORS[result.status] ?? STATUS_COLORS.off
  const barWidth = Math.min(result.percentage, 100)

  return (
    <div className="space-y-1" data-testid="equilibrium-bar">
      {/* Progress bar track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={`h-full rounded-full ${barBg}`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Label */}
      <div className={`flex items-center justify-between text-xs ${textColor}`}>
        <span>{result.percentage}% of target</span>
        {result.delta > 0 && (
          <span className="font-medium">
            +{bdtFormatter.format(result.delta)} over target
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Returns the border-top color class for a column based on equilibrium status.
 */
export function getColumnBorderColor(
  assignedValue: number,
  targetValue: number,
): string {
  const result = getEquilibriumStatus(assignedValue, targetValue)
  return STATUS_COLORS[result.status]?.[2] ?? 'border-t-red-500'
}
