import type { IslamicReference } from '@/core/faraid/types'
import { getHeirTypeLabel } from '@/core/utils/display'
import { useTranslation } from '@/i18n/useTranslation'

interface IslamicBasisSectionProps {
  references: IslamicReference[]
}

export function IslamicBasisSection({ references }: IslamicBasisSectionProps) {
  const { t, language } = useTranslation()

  if (references.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{t('results.islamicBasis')}</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        {t('results.islamicBasisSubtitle')}
      </p>
      <div className="mt-1 mb-3 h-px bg-gray-200" />
      <div className="space-y-3">
        {references.map((ref, i) => {
          const isQuran = ref.type === 'quran'
          return (
            <div
              key={`${ref.type}-${ref.reference}-${i}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              {/* Type badge + reference label */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    isQuran
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gold-100 text-gold-700'
                  }`}
                >
                  {isQuran ? t('results.quran') : t('results.hadith')}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {ref.reference}
                </span>
              </div>

              {/* Arabic text */}
              {ref.arabicText && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-3 rounded-lg bg-gold-50 p-3 font-arabic text-lg leading-loose text-gray-800"
                >
                  {ref.arabicText}
                </p>
              )}

              {/* English translation */}
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {ref.englishText}
              </p>

              {/* Applies to */}
              {ref.appliesTo.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-gray-500">{t('results.appliesTo')}:</span>
                  {ref.appliesTo.map((ht) => (
                    <span
                      key={ht}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {getHeirTypeLabel(ht, language)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
