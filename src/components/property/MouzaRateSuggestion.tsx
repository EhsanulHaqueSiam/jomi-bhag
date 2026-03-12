const formatter = new Intl.NumberFormat('en-IN')

interface MouzaRateSuggestionProps {
  ratePerDecimal: number
  areaInDecimals: number
  onApply: (totalValue: number) => void
}

export function MouzaRateSuggestion({
  ratePerDecimal,
  areaInDecimals,
  onApply,
}: MouzaRateSuggestionProps) {
  if (areaInDecimals <= 0) return null

  const suggestedTotal = Math.round(ratePerDecimal * areaInDecimals)

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
      <div className="text-gray-700">
        <span className="font-medium">Govt rate:</span>{' '}
        &#2547;{formatter.format(ratePerDecimal)}/decimal &times;{' '}
        {areaInDecimals.toFixed(2)} decimal ={' '}
        <span className="font-semibold text-emerald-700">
          &#2547;{formatter.format(suggestedTotal)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onApply(suggestedTotal)}
        className="mt-1 text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
      >
        Use this rate
      </button>
    </div>
  )
}
