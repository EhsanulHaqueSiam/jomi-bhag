import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import type { Division, LandUnit } from '@/core/land/types'
import { toSqft, fromSqft } from '@/core/land/units'
import { BD_DIVISIONS } from '@/data/bd-land-data'
import { Tooltip } from '@/components/ui/Tooltip'
import { ConversionDisplay } from './ConversionDisplay'
import { PropertyValueInput } from './PropertyValueInput'

const UNIT_OPTIONS: { value: LandUnit; label: string }[] = [
  { value: 'decimal', label: 'Decimal' },
  { value: 'katha', label: 'Katha' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'sqft', label: 'Sqft' },
]

interface LandAreaInputProps {
  propertyId: string
}

export function LandAreaInput({ propertyId }: LandAreaInputProps) {
  const property = useWizardStore((s) =>
    s.properties.find((p) => p.id === propertyId),
  )
  const updateProperty = useWizardStore((s) => s.updateProperty)
  const [rawInput, setRawInput] = useState('')

  if (!property) return null

  const { division, landAreaSqft, landInputUnit, landValue } = property

  // Derive display value from canonical sqft storage
  const displayValue =
    division && landAreaSqft > 0
      ? fromSqft(landAreaSqft, landInputUnit, division)
      : rawInput
        ? parseFloat(rawInput)
        : 0

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiv = e.target.value as Division
    if (!newDiv) return
    // Recompute sqft from current display value with new division
    const currentDisplay =
      division && landAreaSqft > 0
        ? fromSqft(landAreaSqft, landInputUnit, division)
        : parseFloat(rawInput) || 0
    const newSqft =
      currentDisplay > 0 ? toSqft(currentDisplay, landInputUnit, newDiv) : 0
    updateProperty(propertyId, { division: newDiv, landAreaSqft: newSqft })
  }

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setRawInput(val)
    const num = parseFloat(val)
    if (isNaN(num) || num < 0 || !division) {
      if (!division) return
      updateProperty(propertyId, { landAreaSqft: 0 })
      return
    }
    const sqft = toSqft(num, landInputUnit, division)
    updateProperty(propertyId, { landAreaSqft: sqft })
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as LandUnit
    // Keep same sqft, just change display unit
    updateProperty(propertyId, { landInputUnit: newUnit })
  }

  const handleLandValueChange = (val: number) => {
    updateProperty(propertyId, { landValue: val })
  }

  // Format display for area
  const areaDisplay =
    displayValue > 0 ? String(Math.round(displayValue * 100) / 100) : ''

  return (
    <div className="space-y-3">
      {/* Division dropdown */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Division
        </label>
        <select
          value={division ?? ''}
          onChange={handleDivisionChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Select division</option>
          {BD_DIVISIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Area input + unit dropdown */}
      <div>
        <div className="mb-1 flex items-center gap-1">
          <label className="text-sm font-medium text-gray-600">Land Area</label>
          <Tooltip content="BD land is measured in Decimal (govt standard), Katha (regional, varies by division), Bigha (20 Katha), or Square Feet." />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={areaDisplay}
            onChange={handleAreaChange}
            placeholder="Enter area"
            disabled={!division}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <select
            value={landInputUnit}
            onChange={handleUnitChange}
            disabled={!division}
            className="w-28 rounded-xl border border-gray-200 bg-white px-2 py-2.5 text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50 disabled:text-gray-400"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversion display */}
      {division && landAreaSqft > 0 && (
        <ConversionDisplay
          sqft={landAreaSqft}
          division={division}
          currentUnit={landInputUnit}
        />
      )}

      {/* Land value */}
      <PropertyValueInput
        value={landValue}
        onChange={handleLandValueChange}
        label="Land Value (BDT)"
        placeholder="Enter land value"
      />
    </div>
  )
}
