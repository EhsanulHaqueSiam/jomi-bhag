import type { LivestockAsset, LivestockType } from '@/core/assets/types'
import { LIVESTOCK_TYPES } from '@/data/movable-asset-data'
import { StepperButton } from '@/components/ui/StepperButton'
import { PropertyValueInput } from '@/components/property/PropertyValueInput'

const formatter = new Intl.NumberFormat('en-IN')

interface LivestockFormProps {
  asset: LivestockAsset
  onUpdate: (patch: Partial<LivestockAsset>) => void
}

export function LivestockForm({ asset, onUpdate }: LivestockFormProps) {
  const total = asset.count * asset.perUnitValue

  return (
    <div className="space-y-4">
      {/* Livestock type dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Livestock Type
        </label>
        <select
          value={asset.livestockType}
          onChange={(e) =>
            onUpdate({ livestockType: e.target.value as LivestockType })
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          {LIVESTOCK_TYPES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Count stepper */}
      <StepperButton
        label="Count"
        value={asset.count}
        min={1}
        onChange={(n) => onUpdate({ count: n })}
      />

      {/* Per-unit value */}
      <PropertyValueInput
        value={asset.perUnitValue}
        onChange={(n) => onUpdate({ perUnitValue: n })}
        label="Value per Unit"
        placeholder="Estimated value each"
      />

      {/* Auto-calculated total */}
      {total > 0 && (
        <p className="text-sm text-gray-600">
          {asset.count} &times; &#2547;{formatter.format(asset.perUnitValue)} ={' '}
          <span className="font-medium text-gray-900">
            &#2547;{formatter.format(total)}
          </span>
        </p>
      )}
    </div>
  )
}
