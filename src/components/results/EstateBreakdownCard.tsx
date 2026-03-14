import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { computeEstateBreakdown } from '@/core/land/valuation'
import { computeAssetValue } from '@/core/assets/valuation'
import type { PropertyType } from '@/core/land/types'
import { PROPERTY_TYPES } from '@/data/bd-land-data'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'
import { useTranslation } from '@/i18n/useTranslation'

const displayFormatter = new Intl.NumberFormat('en-IN')

function getAutoLabel(type: PropertyType | null, index: number): string {
  if (!type) return 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = typeInfo?.label ?? 'Property'
  return `${label} #${index}`
}

export function EstateBreakdownCard() {
  const properties = useWizardStore((s) => s.properties)
  const movableAssets = useWizardStore((s) => s.movableAssets)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const setTotalEstateValue = useWizardStore((s) => s.setTotalEstateValue)
  const getAllPropertiesTotal = useWizardStore((s) => s.getAllPropertiesTotal)
  const getMovableAssetsTotal = useWizardStore((s) => s.getMovableAssetsTotal)

  const { t } = useTranslation()
  const [isFocused, setIsFocused] = useState(false)
  const [isOverriding, setIsOverriding] = useState(false)
  const [showProperties, setShowProperties] = useState(false)

  const movableAssetsTotal = getMovableAssetsTotal()
  const propertiesTotal = getAllPropertiesTotal()
  const hasProperties = propertiesTotal > 0
  const breakdown = computeEstateBreakdown(properties, movableAssetsTotal)

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
          {t('estate.totalEstateValueBdt')}
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

  // Group movable assets by category for detail view
  const movableCategoryTotals = ASSET_CATEGORIES
    .map((cat) => {
      const assets = movableAssets.filter((a) => a.category === cat.value)
      const total = assets.reduce((sum, a) => sum + computeAssetValue(a), 0)
      return { label: cat.label, total }
    })
    .filter((c) => c.total > 0)

  const categories = [
    { label: t('estate.land'), value: breakdown.land },
    { label: t('estate.structures'), value: breakdown.structures },
    { label: t('estate.treesCrops'), value: breakdown.trees },
    { label: t('estate.ponds'), value: breakdown.ponds },
    ...(movableAssetsTotal > 0
      ? [{ label: t('estate.movableAssetsLabel'), value: movableAssetsTotal }]
      : []),
  ]

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
      {/* Header: title + total */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{t('estate.estateValue')}</h3>
        <span className="text-xl font-bold text-emerald-700">
          &#2547;{displayFormatter.format(isOverriding ? totalEstateValue : propertiesTotal)}
        </span>
      </div>

      {/* Category grid */}
      <div className={`mt-3 grid grid-cols-2 gap-2 ${categories.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
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
            {t('estate.useAutoCalculated')}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-emerald-600">{t('estate.autoCalculated')}</span>
          <button
            type="button"
            onClick={() => setIsOverriding(true)}
            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
          >
            {t('estate.overrideTotal')}
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
          {showProperties ? t('estate.hideProperties') : t('estate.viewProperties')}
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

                {/* Movable assets per-category breakdown */}
                {movableCategoryTotals.length > 0 && (
                  <div className="rounded-lg bg-white/80 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Movable Assets</span>
                      <span className="font-medium text-emerald-700">
                        &#2547;{displayFormatter.format(movableAssetsTotal)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      {movableCategoryTotals.map((cat) => (
                        <span key={cat.label}>
                          {cat.label}: &#2547;{displayFormatter.format(cat.total)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
