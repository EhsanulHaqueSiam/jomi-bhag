import { useTranslation } from '@/i18n/useTranslation'

/** Decorative star icon for callout boxes. */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 1l2.39 4.84L17.82 7l-3.91 3.81.92 5.38L10 13.47l-4.83 2.72.92-5.38L2.18 7l5.43-1.16L10 1z" />
    </svg>
  )
}

interface SpecialCaseCalloutProps {
  specialCases: string[]
}

export function SpecialCaseCallout({ specialCases }: SpecialCaseCalloutProps) {
  const { t } = useTranslation()

  if (specialCases.length === 0) return null

  const specialCaseInfo: Record<string, { titleKey: string; descriptionKey: string }> = {
    kalalah: { titleKey: 'results.kalalahTitle', descriptionKey: 'results.kalalahDescription' },
    umariyyatayn: { titleKey: 'results.umariyyataynTitle', descriptionKey: 'results.umariyyataynDescription' },
    mushtarakah: { titleKey: 'results.mushtarakahTitle', descriptionKey: 'results.mushtarakahDescription' },
  }

  return (
    <div className="space-y-3">
      {specialCases.map((caseKey) => {
        const info = specialCaseInfo[caseKey]
        if (!info) return null

        return (
          <div
            key={caseKey}
            className="relative rounded-xl border-l-4 border-gold-600 bg-gold-50 p-4"
          >
            <StarIcon className="absolute right-3 top-3 h-5 w-5 text-gold-300" />
            <h3 className="text-sm font-semibold text-gold-700">
              {t(info.titleKey)}
            </h3>
            <p className="mt-1 pr-6 text-sm leading-relaxed text-gray-700">
              {t(info.descriptionKey)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
