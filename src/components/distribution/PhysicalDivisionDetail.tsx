import type { ShareResult } from '@/core/faraid/types'
import type { SubParcel } from '@/core/land/settlement-types'
import type { LandUnit } from '@/core/land/types'
import {
  computeSubParcelTargets,
  calculatePhysicalDivisionCompensation,
} from '@/core/land/settlement'

const displayFormatter = new Intl.NumberFormat('en-IN')

/** Generate names like Parcel A, Parcel B, etc. */
function parcelName(index: number): string {
  return `Parcel ${String.fromCharCode(65 + index)}`
}

interface PhysicalDivisionDetailProps {
  propertyValue: number
  subParcels: SubParcel[]
  shares: ShareResult[]
  landInputUnit: LandUnit
  onSubParcelsChange: (parcels: SubParcel[]) => void
}

export function PhysicalDivisionDetail({
  propertyValue,
  subParcels,
  shares,
  landInputUnit,
  onSubParcelsChange,
}: PhysicalDivisionDetailProps) {
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')
  const targets = computeSubParcelTargets(propertyValue, shares)
  const compensation = calculatePhysicalDivisionCompensation(subParcels, targets)

  const diffPercent =
    compensation.targetTotal > 0
      ? Math.abs(compensation.difference / compensation.targetTotal) * 100
      : 0
  const isClose = diffPercent <= 10

  const handleSuggest = () => {
    const count = activeShares.length
    const suggested: SubParcel[] = targets.map((t, i) => ({
      id: crypto.randomUUID(),
      name: parcelName(i),
      areaSqft: 0,
      areaInputUnit: landInputUnit,
      appraisedValue: t.targetValue,
    }))
    onSubParcelsChange(suggested.slice(0, count))
  }

  const handleAdd = () => {
    const newParcel: SubParcel = {
      id: crypto.randomUUID(),
      name: parcelName(subParcels.length),
      areaSqft: 0,
      areaInputUnit: landInputUnit,
      appraisedValue: 0,
    }
    onSubParcelsChange([...subParcels, newParcel])
  }

  const handleRemove = (id: string) => {
    onSubParcelsChange(subParcels.filter((p) => p.id !== id))
  }

  const handleUpdate = (id: string, patch: Partial<SubParcel>) => {
    onSubParcelsChange(
      subParcels.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  const unitLabel =
    landInputUnit === 'sqft'
      ? 'sqft'
      : landInputUnit.charAt(0).toUpperCase() + landInputUnit.slice(1)

  return (
    <div className="space-y-3">
      {/* Suggest button */}
      <button
        type="button"
        onClick={handleSuggest}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
      >
        Suggest {activeShares.length} sub-parcels
      </button>

      {/* Sub-parcel cards */}
      {subParcels.map((parcel) => (
        <div
          key={parcel.id}
          className="relative rounded-lg border border-gray-200 bg-gray-50 p-3"
        >
          {/* Delete button */}
          <button
            type="button"
            onClick={() => handleRemove(parcel.id)}
            className="absolute top-2 right-2 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label={`Remove ${parcel.name}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {/* Name */}
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <input
                type="text"
                value={parcel.name}
                onChange={(e) =>
                  handleUpdate(parcel.id, { name: e.target.value })
                }
                className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              />
            </div>

            {/* Area */}
            <div>
              <label className="text-xs text-gray-500">
                Area ({unitLabel})
              </label>
              <input
                type="number"
                value={parcel.areaSqft || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  handleUpdate(parcel.id, {
                    areaSqft: isNaN(val) ? 0 : val,
                  })
                }}
                placeholder="0"
                className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              />
            </div>

            {/* Value */}
            <div>
              <label className="text-xs text-gray-500">Value (BDT)</label>
              <input
                type="number"
                value={parcel.appraisedValue || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  handleUpdate(parcel.id, {
                    appraisedValue: isNaN(val) ? 0 : val,
                  })
                }}
                placeholder="0"
                className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add sub-parcel */}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600"
      >
        + Add sub-parcel
      </button>

      {/* Summary comparison */}
      {subParcels.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total sub-parcel value:</span>
            <span
              className={`font-semibold ${isClose ? 'text-emerald-700' : 'text-amber-600'}`}
            >
              &#2547;{displayFormatter.format(compensation.totalSubParcelValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Property value:</span>
            <span className="font-semibold text-gray-900">
              &#2547;{displayFormatter.format(compensation.targetTotal)}
            </span>
          </div>
          {compensation.difference !== 0 && (
            <p className="mt-1 text-xs text-amber-600">
              Cash compensation of &#2547;
              {displayFormatter.format(Math.abs(compensation.difference))}{' '}
              {compensation.difference > 0 ? 'surplus' : 'needed'} to balance
              the division.
            </p>
          )}
        </div>
      )}

      {/* Informational note */}
      <p className="text-xs leading-relaxed text-gray-400">
        Sub-parcels show how the physical split achieves fair value
        distribution. They are not assigned to specific heirs.
      </p>
    </div>
  )
}
