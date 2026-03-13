import type { CustomAsset } from '@/core/assets/types'
import { PropertyValueInput } from '@/components/property/PropertyValueInput'

interface CustomItemFormProps {
  asset: CustomAsset
  onUpdate: (patch: Partial<CustomAsset>) => void
}

export function CustomItemForm({ asset, onUpdate }: CustomItemFormProps) {
  return (
    <div className="space-y-4">
      {/* Item name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Item Name
        </label>
        <input
          type="text"
          value={asset.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="e.g., Sewing machine"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Estimated value */}
      <PropertyValueInput
        value={asset.estimatedValue}
        onChange={(n) => onUpdate({ estimatedValue: n })}
        label="Estimated Value"
      />
    </div>
  )
}
