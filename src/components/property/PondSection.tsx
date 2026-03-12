import { useWizardStore } from '@/stores/wizardStore'
import type { LandUnit } from '@/core/land/types'
import { toSqft } from '@/core/land/units'
import { PropertyValueInput } from './PropertyValueInput'

const UNIT_OPTIONS: { value: LandUnit; label: string }[] = [
  { value: 'decimal', label: 'Decimal' },
  { value: 'katha', label: 'Katha' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'sqft', label: 'Sqft' },
]

interface PondSectionProps {
  propertyId: string
}

export function PondSection({ propertyId }: PondSectionProps) {
  const property = useWizardStore((s) =>
    s.properties.find((p) => p.id === propertyId),
  )
  const updateProperty = useWizardStore((s) => s.updateProperty)

  if (!property) return null

  const pond = property.pond
  const division = property.division

  const handleValueChange = (val: number) => {
    if (val === 0) {
      updateProperty(propertyId, { pond: null })
      return
    }
    updateProperty(propertyId, {
      pond: {
        areaSqft: pond?.areaSqft ?? 0,
        areaInputUnit: pond?.areaInputUnit ?? 'decimal',
        estimatedValue: val,
      },
    })
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pond || !division) return
    const num = parseFloat(e.target.value)
    const sqft = isNaN(num) || num < 0 ? 0 : toSqft(num, pond.areaInputUnit, division)
    updateProperty(propertyId, {
      pond: { ...pond, areaSqft: sqft },
    })
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!pond) return
    updateProperty(propertyId, {
      pond: { ...pond, areaInputUnit: e.target.value as LandUnit },
    })
  }

  return (
    <div className="space-y-2">
      <PropertyValueInput
        value={pond?.estimatedValue ?? 0}
        onChange={handleValueChange}
        label="Pond/Water Body Value (BDT)"
        placeholder="Enter pond value"
      />

      {pond && pond.estimatedValue > 0 && division && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Pond Area (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              onChange={handleAreaChange}
              placeholder="Area"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            />
            <select
              value={pond.areaInputUnit}
              onChange={handleUnitChange}
              className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
