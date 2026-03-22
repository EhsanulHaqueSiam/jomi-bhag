import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { IndividualColumn } from '@/core/distribution/individual-types'
import type { HeirType } from '@/core/faraid/types'
import { getEquilibriumStatus } from '@/core/distribution/algorithm'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import { HeirIcon } from '@/components/ui/HeirIcon'
import { feminineHeirs } from '@/components/ui/heirGender'
import { HEIR_TYPE_COLORS } from './IndividualColumn'
import { useTranslation } from '@/i18n/useTranslation'

/** Faraid priority order for section rendering. */
const HEIR_TYPE_ORDER: HeirType[] = [
  'husband',
  'wife',
  'son',
  'daughter',
  'son_of_son',
  'daughter_of_son',
  'father',
  'paternal_grandfather',
  'mother',
  'paternal_grandmother',
  'maternal_grandmother',
  'brother_full',
  'brother_consanguine',
  'brother_uterine',
  'sister_full',
  'sister_consanguine',
  'sister_uterine',
]

interface IndividualQurahCeremonyProps {
  individuals: IndividualColumn[]
  customNames: Record<string, string>
  onDraw: () => void
  onClose: () => void
  hasDrawn: boolean
  revealedCount: number
}

/** Check prefers-reduced-motion at render time. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function IndividualQurahCeremony({
  individuals,
  customNames,
  onDraw,
  onClose,
  hasDrawn,
  revealedCount,
}: IndividualQurahCeremonyProps) {
  const { t } = useTranslation()
  const reducedMotion = prefersReducedMotion()

  // Group individuals by heir type in Faraid priority order
  const groupedByType = useMemo(() => {
    const groups = new Map<HeirType, IndividualColumn[]>()
    for (const ind of individuals) {
      const existing = groups.get(ind.heirType)
      if (existing) {
        existing.push(ind)
      } else {
        groups.set(ind.heirType, [ind])
      }
    }

    const ordered: { heirType: HeirType; individuals: IndividualColumn[] }[] = []
    for (const heirType of HEIR_TYPE_ORDER) {
      const group = groups.get(heirType)
      if (group && group.length > 0) {
        ordered.push({ heirType, individuals: group })
      }
    }
    return ordered
  }, [individuals])

  // Flatten all individuals in display order for staggered reveal
  const flatIndividuals = useMemo(
    () => groupedByType.flatMap((g) => g.individuals),
    [groupedByType],
  )

  const allRevealed = reducedMotion || revealedCount >= flatIndividuals.length

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          // Close on backdrop click (not inner card)
          if (e.target === e.currentTarget) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t('distribution.qurahCeremonyDialog')}
      >
        <motion.div
          className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-6 p-6">
            {/* Bismillah header */}
            <div className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center">
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-2xl leading-relaxed text-gold-600"
              >
                {'\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'}
              </p>
              <p className="mt-2 text-sm text-gold-500">
                {t('distribution.bismillahTranslation')}
              </p>
              <p className="mt-1 text-xs text-gold-400 italic">
                {t('distribution.qurahVerse')}
              </p>
            </div>

            {/* Draw button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onDraw}
                className="rounded-xl bg-gold-600 px-8 py-3 font-semibold text-white hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
              >
                {hasDrawn ? t('distribution.drawAgain') : t('distribution.drawLots')}
              </button>
            </div>

            {/* Staggered reveal of individual heir assignments */}
            {hasDrawn && (
              <div className="space-y-4">
                {groupedByType.map(({ heirType, individuals: typeIndividuals }) => {
                  const colors = HEIR_TYPE_COLORS[heirType] ?? {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                  }
                  const translatedHeirType = t(`results.heirTypes.${heirType}`)
                  const sectionLabel =
                    translatedHeirType !== `results.heirTypes.${heirType}`
                      ? translatedHeirType
                      : HEIR_TYPE_LABELS[heirType] ?? heirType

                  return (
                    <div key={heirType}>
                      {/* Section header */}
                      <div
                        className={`mb-2 rounded-lg px-3 py-1.5 ${colors.bg}`}
                      >
                        <h4
                          className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}
                        >
                          {sectionLabel}
                        </h4>
                      </div>

                      {/* Individual entries */}
                      <div className="space-y-2">
                        {typeIndividuals.map((ind) => {
                          const flatIdx = flatIndividuals.indexOf(ind)
                          const isVisible =
                            reducedMotion || flatIdx < revealedCount

                          if (!isVisible) return null

                          const displayName =
                            customNames[ind.id] || ind.displayName
                          const subtitle = customNames[ind.id]
                            ? ind.displayName
                            : null
                          const isFeminine = feminineHeirs.has(ind.heirType)
                          const eq = getEquilibriumStatus(
                            ind.assignedValue,
                            ind.targetValue,
                          )

                          const eqIcon =
                            eq.status === 'balanced'
                              ? { symbol: '\u2713', color: 'text-emerald-600' }
                              : eq.status === 'close'
                                ? { symbol: '\u26A0', color: 'text-amber-600' }
                                : { symbol: '\u2717', color: 'text-red-600' }

                          return (
                            <motion.div
                              key={ind.id}
                              initial={
                                reducedMotion
                                  ? false
                                  : { opacity: 0, y: 10 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
                            >
                              <HeirIcon isFeminine={isFeminine} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {displayName}
                                </p>
                                {subtitle && (
                                  <p className="text-xs text-gray-500">
                                    {subtitle}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`text-sm font-semibold ${eqIcon.color}`}
                                aria-label={`Equilibrium: ${eq.percentage}%`}
                              >
                                {eqIcon.symbol} {eq.percentage}%
                              </span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Done button: appears after all revealed */}
            {hasDrawn && allRevealed && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {t('buttons.done')}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
