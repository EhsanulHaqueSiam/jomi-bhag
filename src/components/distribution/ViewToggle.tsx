import { useTranslation } from '@/i18n/useTranslation'

export type DistributionView = 'group' | 'individual'

interface ViewToggleProps {
  view: DistributionView
  onViewChange: (view: DistributionView) => void
  disabled?: boolean
}

export function ViewToggle({ view, onViewChange, disabled }: ViewToggleProps) {
  const { t } = useTranslation()

  if (disabled) return null

  return (
    <div
      role="tablist"
      aria-label={t('distribution.distributionView')}
      className="inline-flex rounded-full bg-gray-100 p-1"
    >
      <button
        role="tab"
        aria-selected={view === 'group'}
        onClick={() => onViewChange('group')}
        className={[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
          view === 'group'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        ].join(' ')}
      >
        {t('distribution.byGroup')}
      </button>
      <button
        role="tab"
        aria-selected={view === 'individual'}
        onClick={() => onViewChange('individual')}
        className={[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
          view === 'individual'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        ].join(' ')}
      >
        {t('distribution.byIndividual')}
      </button>
    </div>
  )
}
