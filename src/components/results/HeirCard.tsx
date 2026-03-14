import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ShareResult } from '@/core/faraid/types'
import {
  fractionToString,
  fractionToPercent,
  fractionToBDT,
  HEIR_TYPE_LABELS,
  SHARE_TYPE_LABELS,
} from '@/core/utils/display'
import { QuranReference } from '@/components/results/QuranReference'
import { HeirIcon, feminineHeirs } from '@/components/ui/HeirIcon'
import { useWizardStore } from '@/stores/wizardStore'
import { computePropertyTotal } from '@/core/land/types'
import type { PropertyType } from '@/core/land/types'
import { PROPERTY_TYPES } from '@/data/bd-land-data'
import { computeAssetValue } from '@/core/assets/valuation'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function getAutoLabel(type: PropertyType | null, index: number): string {
  if (!type) return 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = typeInfo?.label ?? 'Property'
  return `${label} #${index}`
}

interface HeirCardProps {
  share: ShareResult
  totalEstateValue: number
}

/** Badge color classes per share type. */
const shareTypeBadgeStyles: Record<string, string> = {
  fard: 'bg-emerald-50 text-emerald-700',
  asaba: 'bg-blue-50 text-blue-700',
  radd_adjusted: 'bg-amber-50 text-amber-700',
  blocked: 'bg-gray-100 text-gray-500',
}

export function HeirCard({ share, totalEstateValue }: HeirCardProps) {
  const properties = useWizardStore((s) => s.properties)
  const movableAssets = useWizardStore((s) => s.movableAssets)
  const [showProperties, setShowProperties] = useState(false)

  const label = HEIR_TYPE_LABELS[share.heirType] ?? share.heirType
  const isFeminine = feminineHeirs.has(share.heirType)
  const shareTypeLabel = SHARE_TYPE_LABELS[share.shareType] ?? share.shareType
  const badgeStyle = shareTypeBadgeStyles[share.shareType] ?? 'bg-gray-100 text-gray-500'

  const hasMultiple = share.count > 1
  const bdtTotal = fractionToBDT(share.totalShare, totalEstateValue)
  const bdtEach = hasMultiple ? fractionToBDT(share.sharePerHeir, totalEstateValue) : ''

  // Check for adjustment notes
  const adjustmentNote = share.notes?.find(
    (n) => n.startsWith('Awl applied:') || n.startsWith('Radd applied:'),
  )
  const isAwl = adjustmentNote?.startsWith('Awl')

  // Per-property amounts
  const propertyAmounts = properties.map((p) => {
    const propTotal = computePropertyTotal(p)
    const sameType = properties.filter((pp) => pp.type === p.type)
    const typeIndex = sameType.findIndex((pp) => pp.id === p.id) + 1
    const name = p.nickname || getAutoLabel(p.type, typeIndex)
    return {
      id: p.id,
      name,
      eachAmount: Math.round(share.sharePerHeir.valueOf() * propTotal),
      totalAmount: Math.round(share.totalShare.valueOf() * propTotal),
    }
  })

  // Per-category movable asset amounts
  const movableCategoryAmounts = ASSET_CATEGORIES
    .map((cat) => {
      const catAssets = movableAssets.filter((a) => a.category === cat.value)
      const catTotal = catAssets.reduce((sum, a) => sum + computeAssetValue(a), 0)
      return {
        label: cat.label,
        catTotal,
        eachAmount: Math.round(share.sharePerHeir.valueOf() * catTotal),
        totalAmount: Math.round(share.totalShare.valueOf() * catTotal),
      }
    })
    .filter((c) => c.catTotal > 0)

  const hasAssetsOrProperties =
    (properties.length > 0 || movableCategoryAmounts.length > 0) && totalEstateValue > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <HeirIcon isFeminine={isFeminine} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {label}
            </h3>
            {hasMultiple && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                x{share.count}
              </span>
            )}
          </div>
          <span
            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
          >
            {shareTypeLabel}
          </span>
        </div>
      </div>

      {/* Share display */}
      <div className="mt-3 space-y-1.5">
        {hasMultiple ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Each</span>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {fractionToString(share.sharePerHeir)}
                </span>
                <span className="text-xs text-gray-500">
                  ({fractionToPercent(share.sharePerHeir)})
                </span>
                {totalEstateValue > 0 && bdtEach && (
                  <span className="truncate text-sm font-medium text-emerald-700">
                    {bdtEach}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="text-base font-semibold text-gray-900">
                  {fractionToString(share.totalShare)}
                </span>
                <span className="text-xs text-gray-500">
                  ({fractionToPercent(share.totalShare)})
                </span>
                {totalEstateValue > 0 && bdtTotal && (
                  <span className="truncate text-base font-semibold text-emerald-700">
                    {bdtTotal}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-gray-900">
              {fractionToString(share.totalShare)}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-500">
                {fractionToPercent(share.totalShare)}
              </span>
              {totalEstateValue > 0 && bdtTotal && (
                <span className="truncate text-base font-semibold text-emerald-700">
                  {bdtTotal}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint when no properties and no estate value */}
      {properties.length === 0 && totalEstateValue === 0 && (
        <p className="mt-2 text-xs italic text-gray-400">
          Add properties or enter estate value to see BDT amounts
        </p>
      )}

      {/* Per-asset expandable section */}
      {hasAssetsOrProperties && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowProperties(!showProperties)}
            className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
          >
            {showProperties ? 'Hide asset shares' : 'View asset shares'}
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
                <div className="mt-1">
                  {propertyAmounts.map((pa) => (
                    <div
                      key={pa.id}
                      className="flex items-baseline justify-between border-t border-gray-100 py-1.5 text-sm"
                    >
                      <span className="text-gray-600">{pa.name}</span>
                      <div className="flex items-baseline gap-2">
                        {hasMultiple ? (
                          <>
                            <span className="text-xs text-gray-500">
                              Each: {bdtFormatter.format(pa.eachAmount)}
                            </span>
                            <span className="font-medium text-emerald-700">
                              Total ({share.count}): {bdtFormatter.format(pa.totalAmount)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-emerald-700">
                            {bdtFormatter.format(pa.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Movable asset category rows */}
                  {movableCategoryAmounts.map((mc) => (
                    <div
                      key={mc.label}
                      className="flex items-baseline justify-between border-t border-gray-100 py-1.5 text-sm"
                    >
                      <span className="text-gray-600">{mc.label}</span>
                      <div className="flex items-baseline gap-2">
                        {hasMultiple ? (
                          <>
                            <span className="text-xs text-gray-500">
                              Each: {bdtFormatter.format(mc.eachAmount)}
                            </span>
                            <span className="font-medium text-emerald-700">
                              Total ({share.count}): {bdtFormatter.format(mc.totalAmount)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-emerald-700">
                            {bdtFormatter.format(mc.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Adjustment badge */}
      {adjustmentNote && (
        <div className="mt-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              isAwl ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}
          >
            {adjustmentNote}
          </span>
        </div>
      )}

      {/* Quran reference */}
      <QuranReference heirType={share.heirType} />
    </div>
  )
}
