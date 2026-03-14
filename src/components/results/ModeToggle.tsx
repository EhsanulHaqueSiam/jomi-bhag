import { useWizardStore } from '@/stores/wizardStore'
import { useTranslation } from '@/i18n/useTranslation'

export function ModeToggle() {
  const viewMode = useWizardStore((s) => s.viewMode)
  const setViewMode = useWizardStore((s) => s.setViewMode)
  const { t } = useTranslation()

  const modes = [
    { value: 'simple' as const, label: t('results.simple') },
    { value: 'detailed' as const, label: t('results.detailed') },
  ]

  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className="inline-flex rounded-lg bg-gray-100 p-1"
    >
      {modes.map((mode) => {
        const isActive = viewMode === mode.value
        return (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setViewMode(mode.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
