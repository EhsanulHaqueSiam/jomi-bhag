import { useState } from 'react'
import type { Division, LandUnit } from '@/core/land/types'
import { getConversions, KATHA_SQFT } from '@/core/land/units'
import { Tooltip } from '@/components/ui/Tooltip'

interface ConversionDisplayProps {
  sqft: number
  division: Division
  currentUnit: LandUnit
}

export function ConversionDisplay({
  sqft,
  division,
  currentUnit,
}: ConversionDisplayProps) {
  const [showAll, setShowAll] = useState(false)

  if (sqft <= 0) return null

  const allConversions = getConversions(sqft, division)
  const filtered = allConversions.filter((c) => c.unit !== currentUnit)
  const display = showAll ? filtered : filtered.slice(0, 2)
  const hasKatha = display.some(
    (c) => c.unit === 'katha' || c.unit === 'bigha',
  )

  const formatValue = (v: number) =>
    v >= 1000
      ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(v)
      : String(v)

  return (
    <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        {display.map((c) => (
          <span key={c.unit}>
            <span className="font-medium text-gray-800">
              {formatValue(c.value)}
            </span>{' '}
            {c.label}
          </span>
        ))}
        {hasKatha && (
          <Tooltip
            content={`1 Katha = ${KATHA_SQFT[division]} sqft in ${division.charAt(0).toUpperCase() + division.slice(1)} division. This varies by region.`}
          />
        )}
      </div>
      {filtered.length > 2 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          Show all units
        </button>
      )}
    </div>
  )
}
