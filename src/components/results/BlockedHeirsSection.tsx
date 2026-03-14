import type { FaraidOutput } from '@/core/faraid/types'
import { getHeirTypeLabel } from '@/core/utils/display'
import { useTranslation } from '@/i18n/useTranslation'

interface BlockedHeirsSectionProps {
  blockedHeirs: FaraidOutput['blockedHeirs']
}

export function BlockedHeirsSection({ blockedHeirs }: BlockedHeirsSectionProps) {
  const { t, language } = useTranslation()

  if (blockedHeirs.length === 0) return null

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">{t('results.blockedHeirs')}</h3>
      <div className="mt-1 mb-3 h-px bg-gray-200" />
      <p className="text-sm leading-relaxed text-gray-600">
        {t('results.blockedHeirsDescription')}
      </p>
      <div className="mt-3 space-y-2">
        {blockedHeirs.map((bh) => (
          <div
            key={`${bh.heirType}-${bh.blockedBy}`}
            className="flex flex-wrap items-baseline gap-x-1.5 text-sm"
          >
            <span className="font-medium text-gray-800">
              {getHeirTypeLabel(bh.heirType, language)}
            </span>
            <span className="text-gray-500">{t('results.blockedBy')}</span>
            <span className="font-medium text-gray-800">
              {getHeirTypeLabel(bh.blockedBy, language)}
            </span>
            <span className="text-gray-500">({bh.rule})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
