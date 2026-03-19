import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ShareResult } from '@/core/faraid/types'
import {
  fractionToString,
  fractionToPercent,
  getHeirTypeLabel,
  getShareTypeLabel,
} from '@/core/utils/display'
import { useTranslation } from '@/i18n/useTranslation'
import { getShareReference } from '@/core/faraid/references'
import { HeirIcon } from '@/components/ui/HeirIcon'
import { feminineHeirs } from '@/components/ui/heirGender'
import { useWizardStore } from '@/stores/wizardStore'
import { useCountUp } from '@/hooks/useCountUp'
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

function getAutoLabel(type: PropertyType | null, index: number, language: 'en' | 'bn' = 'en'): string {
  if (!type) return language === 'bn' ? '\u09A8\u09A4\u09C1\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF' : 'New Property'
  const typeInfo = PROPERTY_TYPES.find((pt) => pt.value === type)
  const label = language === 'bn' ? (typeInfo?.labelBn ?? '\u09B8\u09AE\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF') : (typeInfo?.label ?? 'Property')
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
  const viewMode = useWizardStore((s) => s.viewMode)
  const [showProperties, setShowProperties] = useState(false)

  const { t, language } = useTranslation()
  const isDetailed = viewMode === 'detailed'

  const label = getHeirTypeLabel(share.heirType, language)
  const isFeminine = feminineHeirs.has(share.heirType)
  const shareTypeLabel = getShareTypeLabel(share.shareType, language)
  const badgeStyle = shareTypeBadgeStyles[share.shareType] ?? 'bg-gray-100 text-gray-500'

  const hasMultiple = share.count > 1
  const rawBdtTotal = totalEstateValue > 0
    ? Math.round(share.totalShare.valueOf() * totalEstateValue)
    : 0
  const rawBdtEach = hasMultiple && totalEstateValue > 0
    ? Math.round(share.sharePerHeir.valueOf() * totalEstateValue)
    : 0
  const animatedTotal = useCountUp(rawBdtTotal)
  const animatedEach = useCountUp(rawBdtEach)

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
    const name = p.nickname || getAutoLabel(p.type, typeIndex, language)
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
        label: language === 'bn' ? cat.labelBn : cat.label,
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
              <span className="text-sm text-gray-500">{t('results.each')}</span>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {fractionToString(share.sharePerHeir)}
                </span>
                <span className="text-xs text-gray-500">
                  ({fractionToPercent(share.sharePerHeir)})
                </span>
                {totalEstateValue > 0 && rawBdtEach > 0 && (
                  <span className="truncate text-sm font-medium text-emerald-700">
                    {bdtFormatter.format(animatedEach)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">{t('results.total')}</span>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="text-base font-semibold text-gray-900">
                  {fractionToString(share.totalShare)}
                </span>
                <span className="text-xs text-gray-500">
                  ({fractionToPercent(share.totalShare)})
                </span>
                {totalEstateValue > 0 && rawBdtTotal > 0 && (
                  <span className="truncate text-base font-semibold text-emerald-700">
                    {bdtFormatter.format(animatedTotal)}
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
              {totalEstateValue > 0 && rawBdtTotal > 0 && (
                <span className="truncate text-base font-semibold text-emerald-700">
                  {bdtFormatter.format(animatedTotal)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint when no properties and no estate value */}
      {properties.length === 0 && totalEstateValue === 0 && (
        <p className="mt-2 text-xs italic text-gray-400">
          {t('results.addPropertiesHint')}
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
            {showProperties ? t('results.hideAssetShares') : t('results.viewAssetShares')}
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

      {/* Compact Quran citation footer -- detailed mode only */}
      {isDetailed && (() => {
        const refs = getShareReference(share.heirType)
        const primaryRef = refs[0]
        if (!primaryRef) return null
        const verseNum = primaryRef.reference.replace('Quran ', '')
        const excerpt = primaryRef.englishText.length > 80
          ? primaryRef.englishText.slice(0, 80).replace(/\s+\S*$/, '') + '...'
          : primaryRef.englishText
        return (
          <div className="mt-3 flex items-start gap-1.5 border-t border-gray-100 pt-2">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-xs text-gray-500">
              An-Nisa {verseNum} &mdash; {excerpt}
            </span>
          </div>
        )
      })()}
    </div>
  )
}
