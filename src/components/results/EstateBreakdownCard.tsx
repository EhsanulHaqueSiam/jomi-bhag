import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { computeEstateBreakdown } from '@/core/land/valuation'
import type { PropertyType } from '@/core/land/types'
import { PROPERTY_TYPES } from '@/data/bd-land-data'

const displayFormatter = new Intl.NumberFormat('en-IN')

function getAutoLabel(type: PropertyType | null, index: number): string {
  if (!type) return 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = typeInfo?.label ?? 'Property'
  return `${label} #${index}`
}

export function EstateBreakdownCard() {
  const properties = useWizardStore((s) => s.properties)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const setTotalEstateValue = useWizardStore((s) => s.setTotalEstateValue)
  const getAllPropertiesTotal = useWizardStore((s) => s.getAllPropertiesTotal)

  const [isFocused, setIsFocused] = useState(false)
  const [isOverriding, setIsOverriding] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  const propertiesTotal = getAllPropertiesTotal()
  const hasProperties = propertiesTotal > 0
  const breakdown = computeEstateBreakdown(properties)

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

  const handleSwitchBack = () => {
    setIsOverriding(false)
    setTotalEstateValue(getAllPropertiesTotal())
  }

  const displayValue = isFocused
    ? totalEstateValue === 0
      ? ''
      : String(totalEstateValue)
    : totalEstateValue === 0
      ? ''
      : displayFormatter.format(totalEstateValue)

  // No properties: fall back to simple manual input
  if (!hasProperties) {
    return (
      <div>
        <label
          htmlFor="estate-value"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Total Estate Value (BDT)
        </label>
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

  const categories = [
    { label: 'Land', value: breakdown.land },
    { label: 'Structures', value: breakdown.structures },
    { label: 'Trees/Crops', value: breakdown.trees },
    { label: 'Ponds', value: breakdown.ponds },
  ]

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
      {/* Header: title + total */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Estate Value</h3>
        <span className="text-xl font-bold text-emerald-700">
          &#2547;{displayFormatter.format(isOverriding ? totalEstateValue : propertiesTotal)}
        </span>
      </div>

      {/* Category grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.label} className="rounded-lg bg-white/70 px-3 py-2">
            <div className="text-xs text-gray-500">{cat.label}</div>
            <div className="text-sm font-medium text-gray-800">
              &#2547;{displayFormatter.format(cat.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Override controls */}
      {isOverriding ? (
        <div className="mt-3 space-y-2">
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
          <button
            type="button"
            onClick={handleSwitchBack}
            className="text-xs font-medium text-emerald-600 underline hover:text-emerald-700"
          >
            Use auto-calculated value
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-emerald-600">Auto-calculated from properties</span>
          <button
            type="button"
            onClick={() => setIsOverriding(true)}
            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
          >
            Override total
          </button>
        </div>
      )}

      {/* Expandable per-property detail */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowProperties(!showProperties)}
          className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
        >
          {showProperties ? 'Hide properties' : 'View properties'}
        </button>

        <AnimatePresence initial={false}>
          {showProperties && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-2 space-y-1">
                {breakdown.byProperty.map((bp) => {
                  const sameType = properties.filter((pp) => pp.type === bp.property.type)
                  const typeIndex = sameType.findIndex((pp) => pp.id === bp.property.id) + 1
                  const name = bp.property.nickname || getAutoLabel(bp.property.type, typeIndex)
                  return (
                    <div
                      key={bp.property.id}
                      className="rounded-lg bg-white/80 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{name}</span>
                          {bp.property.landValue > 0 && (
                            bp.property.rateSource === 'govt' ? (
                              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                                Govt rate
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                                Manual
                              </span>
                            )
                          )}
                        </div>
                        <span className="font-medium text-emerald-700">
                          &#2547;{displayFormatter.format(bp.total)}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>Land: &#2547;{displayFormatter.format(bp.land)}</span>
                        <span>Structures: &#2547;{displayFormatter.format(bp.structures)}</span>
                        <span>Trees: &#2547;{displayFormatter.format(bp.trees)}</span>
                        <span>Ponds: &#2547;{displayFormatter.format(bp.ponds)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
