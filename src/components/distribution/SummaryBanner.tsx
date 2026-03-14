import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from '@/i18n/useTranslation'

interface SummaryBannerProps {
  balancedCount: number
  totalCount: number
}

export function SummaryBanner({ balancedCount, totalCount }: SummaryBannerProps) {
  const { t } = useTranslation()
  const allBalanced = balancedCount === totalCount && totalCount > 0
  const noneBalanced = balancedCount === 0

  const bgClass = allBalanced
    ? 'bg-emerald-50 border-emerald-200'
    : noneBalanced
      ? 'bg-amber-50 border-amber-200'
      : 'bg-gray-50 border-gray-200'

  const textClass = allBalanced
    ? 'text-emerald-800'
    : noneBalanced
      ? 'text-amber-800'
      : 'text-gray-800'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={allBalanced ? 'all' : `${balancedCount}`}
        className={`rounded-xl border p-3 text-center ${bgClass}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={
          allBalanced
            ? {
                opacity: 1,
                scale: [1, 1.02, 1],
                transition: { duration: 0.3, ease: 'easeOut' },
              }
            : { opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0 }}
      >
        {allBalanced ? (
          <p className={`text-sm font-semibold ${textClass}`}>
            {t('distribution.allGroupsBalanced')}
          </p>
        ) : noneBalanced ? (
          <p className={`text-sm ${textClass}`}>
            {t('distribution.groupsBalancedDrag').replace('{balanced}', String(balancedCount)).replace('{total}', String(totalCount))}
          </p>
        ) : (
          <p className={`text-sm ${textClass}`}>
            {t('distribution.groupsBalanced').replace('{balanced}', String(balancedCount)).replace('{total}', String(totalCount))}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
