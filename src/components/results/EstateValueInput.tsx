import { useState, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'

const displayFormatter = new Intl.NumberFormat('en-IN')

export function EstateValueInput() {
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const setTotalEstateValue = useWizardStore((s) => s.setTotalEstateValue)
  const getAllPropertiesTotal = useWizardStore((s) => s.getAllPropertiesTotal)
  const [isFocused, setIsFocused] = useState(false)
  const [isOverriding, setIsOverriding] = useState(false)

  const propertiesTotal = getAllPropertiesTotal()
  const hasProperties = propertiesTotal > 0

  // Auto-set estate value from properties total when not overriding
  useEffect(() => {
    if (hasProperties && !isOverriding) {
      setTotalEstateValue(propertiesTotal)
    }
  }, [propertiesTotal, hasProperties, isOverriding, setTotalEstateValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    const parsed = parseInt(raw, 10)
    setTotalEstateValue(isNaN(parsed) ? 0 : parsed)
  }

  const displayValue = isFocused
    ? totalEstateValue === 0
      ? ''
      : String(totalEstateValue)
    : totalEstateValue === 0
      ? ''
      : displayFormatter.format(totalEstateValue)

  // Auto-calculated mode: show read-only display with override option
  if (hasProperties && !isOverriding) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Total Estate Value (BDT)
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 py-3 px-4">
          <span className="text-gray-400 font-medium">&#2547;</span>
          <span className="flex-1 text-gray-900 font-medium">
            {displayFormatter.format(propertiesTotal)}
          </span>
          <span className="text-xs text-emerald-600">Auto-calculated from properties</span>
          <button
            type="button"
            onClick={() => setIsOverriding(true)}
            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
          >
            Override
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label
        htmlFor="estate-value"
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        Total Estate Value (BDT)
      </label>
      {hasProperties && isOverriding && (
        <button
          type="button"
          onClick={() => setIsOverriding(false)}
          className="mb-1.5 text-xs font-medium text-emerald-600 underline hover:text-emerald-700"
        >
          Use auto-calculated value
        </button>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          &#2547;
        </span>
        <input
          id="estate-value"
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter total estate value"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-gray-900 transition-shadow placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </div>
  )
}
