import { useState } from 'react'
import type { ShareResult } from '@/core/faraid/types'
import {
  calculateOwnershipShares,
  calculateIncomeDistribution,
} from '@/core/land/settlement'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const displayFormatter = new Intl.NumberFormat('en-IN')

interface JointOwnershipDetailProps {
  shares: ShareResult[]
  incomeAmount: number | null
  incomeType: 'rent' | 'crop' | null
  incomePeriod: 'monthly' | 'yearly' | null
  onIncomeChange: (
    amount: number | null,
    type: 'rent' | 'crop' | null,
    period: 'monthly' | 'yearly' | null,
  ) => void
}

export function JointOwnershipDetail({
  shares,
  incomeAmount,
  incomeType,
  incomePeriod,
  onIncomeChange,
}: JointOwnershipDetailProps) {
  const [editingAmount, setEditingAmount] = useState(false)
  const [rawAmount, setRawAmount] = useState(
    incomeAmount !== null ? String(incomeAmount) : '',
  )

  const ownershipShares = calculateOwnershipShares(shares)
  const incomeDistribution =
    incomeAmount !== null && incomeAmount > 0
      ? calculateIncomeDistribution(incomeAmount, shares)
      : null

  const handleAmountFocus = () => {
    setEditingAmount(true)
    setRawAmount(incomeAmount !== null ? String(incomeAmount) : '')
  }

  const handleAmountBlur = () => {
    setEditingAmount(false)
    const parsed = parseInt(rawAmount, 10)
    if (isNaN(parsed) || parsed <= 0 || rawAmount.trim() === '') {
      onIncomeChange(null, incomeType, incomePeriod)
    } else {
      onIncomeChange(parsed, incomeType, incomePeriod)
    }
  }

  const handleTypeChange = (type: 'rent' | 'crop') => {
    const period = type === 'rent' ? 'monthly' : 'yearly'
    onIncomeChange(incomeAmount, type, period)
  }

  const handlePeriodChange = (period: 'monthly' | 'yearly') => {
    onIncomeChange(incomeAmount, incomeType, period)
  }

  return (
    <div className="space-y-3">
      {/* Ownership percentages */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600">
          Ownership percentages
        </p>
        {ownershipShares.map((o) => (
          <div
            key={o.heirType}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700">
              {HEIR_TYPE_LABELS[o.heirType]}
            </span>
            <span className="font-medium text-gray-900">
              {o.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-2">
        <p className="text-xs font-medium text-gray-600">
          Income Distribution (optional)
        </p>
      </div>

      {/* Income type */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('rent')}
          className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
            incomeType === 'rent'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          Rent
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('crop')}
          className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
            incomeType === 'crop'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          Crop Income
        </button>
      </div>

      {/* Income period */}
      {incomeType && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePeriodChange('monthly')}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              incomePeriod === 'monthly'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange('yearly')}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
              incomePeriod === 'yearly'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            Yearly
          </button>
        </div>
      )}

      {/* Income amount input */}
      {incomeType && (
        <div>
          <label className="text-xs text-gray-500">
            {incomeType === 'rent' ? 'Rent' : 'Crop income'} amount (BDT)
          </label>
          <div className="relative mt-0.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              &#2547;
            </span>
            {editingAmount ? (
              <input
                type="number"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                onBlur={handleAmountBlur}
                autoFocus
                placeholder="Enter amount..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            ) : (
              <button
                type="button"
                onClick={handleAmountFocus}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-left text-sm text-gray-500 hover:border-gray-300"
              >
                {incomeAmount !== null
                  ? displayFormatter.format(incomeAmount)
                  : 'Enter income amount'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Income distribution */}
      {incomeDistribution && (
        <div className="space-y-1 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-600">
            Per-heir {incomeType === 'rent' ? 'rent' : 'crop income'} (
            {incomePeriod})
          </p>
          {incomeDistribution.map((d) => (
            <div
              key={d.heirType}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700">
                {HEIR_TYPE_LABELS[d.heirType]}
                <span className="ml-1 text-xs text-gray-400">
                  ({d.percentage}%)
                </span>
              </span>
              <span className="font-medium text-emerald-700">
                &#2547;{displayFormatter.format(d.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
