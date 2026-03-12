import type { PropertyType } from '@/core/land/types'
import { PROPERTY_TYPES } from '@/data/bd-land-data'

interface PropertyTypeSelectorProps {
  selected: PropertyType | null
  onSelect: (type: PropertyType) => void
}

export function PropertyTypeSelector({
  selected,
  onSelect,
}: PropertyTypeSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        Property Type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PROPERTY_TYPES.map((pt) => {
          const isSelected = selected === pt.value
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => onSelect(pt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <span className="text-xl">{pt.icon}</span>
              <span>{pt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
