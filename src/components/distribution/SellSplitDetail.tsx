import { useState } from 'react'
import type { ShareResult } from '@/core/faraid/types'
import { calculateSellSplit } from '@/core/land/settlement'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const displayFormatter = new Intl.NumberFormat('en-IN')

interface SellSplitDetailProps {
  propertyValue: number
  actualSalePrice: number | null
  shares: ShareResult[]
  onSalePriceChange: (price: number | null) => void
}

export function SellSplitDetail({
  propertyValue,
  actualSalePrice,
  shares,
  onSalePriceChange,
}: SellSplitDetailProps) {
  const [editing, setEditing] = useState(false)
  const [rawInput, setRawInput] = useState(
    actualSalePrice !== null ? String(actualSalePrice) : '',
  )

  const effectiveValue = actualSalePrice ?? propertyValue
  const payouts = calculateSellSplit(effectiveValue, shares)

  const handleFocus = () => {
    setEditing(true)
    setRawInput(actualSalePrice !== null ? String(actualSalePrice) : '')
  }

  const handleBlur = () => {
    setEditing(false)
    const parsed = parseInt(rawInput, 10)
    if (isNaN(parsed) || parsed <= 0 || rawInput.trim() === '') {
      onSalePriceChange(null)
      setRawInput('')
    } else {
      onSalePriceChange(parsed)
    }
  }

  return (
    <div className="space-y-3">
      {/* Sale price override */}
      <div>
        <label className="text-xs font-medium text-gray-600">
          Actual sale price (optional)
        </label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            &#2547;
          </span>
          {editing ? (
            <input
              type="number"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              placeholder="Enter sale price..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          ) : (
            <button
              type="button"
              onClick={handleFocus}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-left text-sm text-gray-500 hover:border-gray-300"
            >
              {actualSalePrice !== null
                ? displayFormatter.format(actualSalePrice)
                : 'Using property value'}
            </button>
          )}
        </div>
      </div>

      {/* Per-heir payouts */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600">
          Per-heir share amounts
          {actualSalePrice !== null && (
            <span className="ml-1 text-gray-400">
              (from sale price)
            </span>
          )}
        </p>
        {payouts.map((p) => (
          <div
            key={p.heirType}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700">
              {HEIR_TYPE_LABELS[p.heirType]}
            </span>
            <span className="font-medium text-emerald-700">
              &#2547;{displayFormatter.format(p.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
