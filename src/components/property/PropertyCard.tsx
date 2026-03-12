import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { computePropertyTotal } from '@/core/land/types'
import type { PropertyType } from '@/core/land/types'
import { PROPERTY_TYPES, BD_DIVISIONS } from '@/data/bd-land-data'
import { PropertyTypeSelector } from './PropertyTypeSelector'
import { LandAreaInput } from './LandAreaInput'
import { HouseDetailSection } from './HouseDetailSection'
import { TreeCropSection } from './TreeCropSection'
import { PondSection } from './PondSection'

const displayFormatter = new Intl.NumberFormat('en-IN')

function getAutoLabel(
  type: PropertyType | null,
  index: number,
): string {
  if (!type) return 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = typeInfo?.label ?? 'Property'
  return `${label} #${index}`
}

interface PropertyCardProps {
  propertyId: string
}

export function PropertyCard({ propertyId }: PropertyCardProps) {
  const property = useWizardStore((s) =>
    s.properties.find((p) => p.id === propertyId),
  )
  const properties = useWizardStore((s) => s.properties)
  const expandedPropertyId = useWizardStore((s) => s.expandedPropertyId)
  const setExpandedPropertyId = useWizardStore((s) => s.setExpandedPropertyId)
  const updateProperty = useWizardStore((s) => s.updateProperty)
  const removeProperty = useWizardStore((s) => s.removeProperty)

  if (!property) return null

  const isExpanded = expandedPropertyId === propertyId
  const total = computePropertyTotal(property)

  // Compute same-type index for auto-label
  const sameType = properties.filter((p) => p.type === property.type)
  const typeIndex = sameType.findIndex((p) => p.id === propertyId) + 1
  const displayName =
    property.nickname || getAutoLabel(property.type, typeIndex)

  const divisionLabel = property.division
    ? BD_DIVISIONS.find((d) => d.value === property.division)?.label
    : null

  const typeIcon = property.type
    ? PROPERTY_TYPES.find((pt) => pt.value === property.type)?.icon
    : null

  const handleToggle = () => {
    setExpandedPropertyId(isExpanded ? null : propertyId)
  }

  const handleDelete = () => {
    const hasData =
      property.type !== null || total > 0
    if (hasData) {
      if (!window.confirm('Delete this property? All entered data will be lost.')) {
        return
      }
    }
    removeProperty(propertyId)
  }

  const handleTypeSelect = (type: PropertyType) => {
    updateProperty(propertyId, { type })
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProperty(propertyId, { nickname: e.target.value })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Collapsed summary / header */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {typeIcon && <span className="text-xl">{typeIcon}</span>}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {displayName}
          </div>
          {divisionLabel && (
            <span className="text-xs text-gray-500">{divisionLabel}</span>
          )}
        </div>
        {total > 0 && (
          <span className="text-sm font-medium text-emerald-700">
            &#2547;{displayFormatter.format(total)}
          </span>
        )}
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded form */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-4 border-t border-gray-100 px-4 py-4">
              {/* Nickname */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Nickname (optional)
                </label>
                <input
                  type="text"
                  value={property.nickname}
                  onChange={handleNicknameChange}
                  placeholder="e.g., Bari-er Jomi, Nana-bari"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Type selector */}
              <PropertyTypeSelector
                selected={property.type}
                onSelect={handleTypeSelect}
              />

              {/* Land area (shown after type selection) */}
              {property.type && (
                <LandAreaInput propertyId={propertyId} />
              )}

              {/* Sub-sections: house, trees, pond */}
              {property.type && (
                <div className="space-y-4">
                  <HouseDetailSection propertyId={propertyId} />
                  <TreeCropSection propertyId={propertyId} />
                  <PondSection propertyId={propertyId} />
                </div>
              )}

              {/* Delete button */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Delete Property
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedPropertyId(null)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Collapse
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
