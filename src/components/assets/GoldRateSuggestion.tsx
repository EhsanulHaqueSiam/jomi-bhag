import type { GoldPurity } from '@/core/assets/types'

const formatter = new Intl.NumberFormat('en-IN')

interface GoldRateSuggestionProps {
  rate: number
  weight: number
  purity: GoldPurity
  metalType: 'gold' | 'silver'
  onApply: (calculated: number) => void
}

export function GoldRateSuggestion({
  rate,
  weight,
  purity,
  metalType,
  onApply,
}: GoldRateSuggestionProps) {
  if (weight <= 0) return null

  const calculated = Math.round(rate * weight)
  const metalLabel = metalType === 'gold' ? 'Gold' : 'Silver'

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
      <div className="text-gray-700">
        <span className="font-medium">{metalLabel} ({purity}):</span>{' '}
        &#2547;{formatter.format(rate)}/vori &times; {weight.toFixed(2)} vori ={' '}
        <span className="font-semibold text-emerald-700">
          &#2547;{formatter.format(calculated)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onApply(calculated)}
        className="mt-1 text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
      >
        Use this rate
      </button>
    </div>
  )
}
