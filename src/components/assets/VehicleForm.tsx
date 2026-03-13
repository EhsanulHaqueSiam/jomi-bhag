import type { VehicleAsset, VehicleType } from '@/core/assets/types'
import { VEHICLE_TYPES } from '@/data/movable-asset-data'
import { PropertyValueInput } from '@/components/property/PropertyValueInput'

interface VehicleFormProps {
  asset: VehicleAsset
  onUpdate: (patch: Partial<VehicleAsset>) => void
}

export function VehicleForm({ asset, onUpdate }: VehicleFormProps) {
  return (
    <div className="space-y-4">
      {/* Vehicle type dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Vehicle Type
        </label>
        <select
          value={asset.vehicleType}
          onChange={(e) =>
            onUpdate({ vehicleType: e.target.value as VehicleType })
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          {VEHICLE_TYPES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Description (optional)
        </label>
        <input
          type="text"
          value={asset.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="e.g., Toyota Corolla 2018"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Estimated market value */}
      <PropertyValueInput
        value={asset.estimatedValue}
        onChange={(n) => onUpdate({ estimatedValue: n })}
        label="Estimated Market Value"
      />
    </div>
  )
}
