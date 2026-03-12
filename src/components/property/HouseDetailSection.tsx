import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import type { ConstructionType, Condition } from '@/core/land/types'
import { CONSTRUCTION_TYPES, CONDITION_OPTIONS } from '@/data/bd-land-data'
import { StepperButton } from '@/components/ui/StepperButton'
import { PropertyValueInput } from './PropertyValueInput'

interface HouseDetailSectionProps {
  propertyId: string
}

export function HouseDetailSection({ propertyId }: HouseDetailSectionProps) {
  const property = useWizardStore((s) =>
    s.properties.find((p) => p.id === propertyId),
  )
  const updateProperty = useWizardStore((s) => s.updateProperty)
  const [showDetails, setShowDetails] = useState(false)

  if (!property) return null

  const house = property.house

  const handleValueChange = (val: number) => {
    if (val === 0) {
      updateProperty(propertyId, { house: null })
      setShowDetails(false)
      return
    }
    updateProperty(propertyId, {
      house: {
        estimatedValue: val,
        areaSqft: house?.areaSqft ?? null,
        constructionType: house?.constructionType ?? null,
        floors: house?.floors ?? null,
        condition: house?.condition ?? null,
      },
    })
  }

  const updateDetail = (patch: Record<string, unknown>) => {
    if (!house) return
    updateProperty(propertyId, {
      house: { ...house, ...patch },
    })
  }

  return (
    <div className="space-y-2">
      <PropertyValueInput
        value={house?.estimatedValue ?? 0}
        onChange={handleValueChange}
        label="House/Structure Value (BDT)"
        placeholder="Enter house value"
      />

      {house && house.estimatedValue > 0 && (
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          {showDetails ? 'Hide details' : 'Add details'}
        </button>
      )}

      <AnimatePresence initial={false}>
        {showDetails && house && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-3 rounded-lg bg-gray-50 p-3">
              {/* Area sqft */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Area (sqft)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={house.areaSqft ?? ''}
                  onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
                    updateDetail({ areaSqft: isNaN(n) ? null : n })
                  }}
                  placeholder="e.g., 1200"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                />
              </div>

              {/* Construction type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Construction Type
                </label>
                <select
                  value={house.constructionType ?? ''}
                  onChange={(e) =>
                    updateDetail({
                      constructionType: (e.target.value || null) as ConstructionType | null,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                >
                  <option value="">Select type</option>
                  {CONSTRUCTION_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floors */}
              <StepperButton
                label="Floors"
                value={house.floors ?? 1}
                min={1}
                max={10}
                onChange={(n) => updateDetail({ floors: n })}
              />

              {/* Condition */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Condition
                </label>
                <select
                  value={house.condition ?? ''}
                  onChange={(e) =>
                    updateDetail({
                      condition: (e.target.value || null) as Condition | null,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-100"
                >
                  <option value="">Select condition</option>
                  {CONDITION_OPTIONS.map((co) => (
                    <option key={co.value} value={co.value}>
                      {co.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
