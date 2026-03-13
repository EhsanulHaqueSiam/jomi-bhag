import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { DistributionItem } from '@/core/distribution/types'

const SQFT_PER_SHOTOK = 435.6

function toShotok(sqft: number): string {
  return (sqft / SQFT_PER_SHOTOK).toFixed(2)
}

interface ParcelSplitDialogProps {
  item: DistributionItem
  originalAreaSqft: number
  onSplit: (splits: { areaSqft: number }[]) => void
  onClose: () => void
}

export function ParcelSplitDialog({
  item,
  originalAreaSqft,
  onSplit,
  onClose,
}: ParcelSplitDialogProps) {
  const [rows, setRows] = useState<string[]>(['', ''])

  const parsedAreas = rows.map((r) => {
    const val = parseFloat(r)
    return isNaN(val) || val <= 0 ? 0 : val
  })

  const totalEntered = parsedAreas.reduce((sum, a) => sum + a, 0)
  const remaining = originalAreaSqft - totalEntered

  const allPositive = parsedAreas.every((a) => a > 0)
  const sumsCorrectly = Math.abs(remaining) < 0.01
  const isValid = allPositive && sumsCorrectly && rows.length >= 2

  const handleAddRow = () => {
    setRows((prev) => [...prev, ''])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 2) return
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? value : r)))
  }

  const handleSplit = () => {
    if (!isValid) return
    onSplit(parsedAreas.map((areaSqft) => ({ areaSqft })))
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-900">Split Parcel</h3>
          <p className="mt-1 text-sm text-gray-500">
            {item.label} -- Total: {originalAreaSqft.toLocaleString()} sqft ({toShotok(originalAreaSqft)} shotok)
          </p>

          <div className="mt-4 space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <label className="shrink-0 text-xs text-gray-500">
                  Part {index + 1}
                </label>
                <input
                  type="number"
                  value={row}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="Area in sqft"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  aria-label={`Part ${index + 1} area in sqft`}
                />
                <span className="shrink-0 text-xs text-gray-400">
                  {parsedAreas[index] > 0 ? `${toShotok(parsedAreas[index])} sh` : ''}
                </span>
                {rows.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label={`Remove part ${index + 1}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            + Add another part
          </button>

          {/* Remaining area indicator */}
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-500">Remaining: </span>
            <span
              className={`text-sm font-medium ${
                Math.abs(remaining) < 0.01
                  ? 'text-emerald-700'
                  : remaining < 0
                    ? 'text-red-600'
                    : 'text-gray-900'
              }`}
            >
              {remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })} sqft
              ({toShotok(remaining)} shotok)
            </span>
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSplit}
              disabled={!isValid}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Split
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
