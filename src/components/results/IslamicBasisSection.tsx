import type { IslamicReference } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

interface IslamicBasisSectionProps {
  references: IslamicReference[]
}

export function IslamicBasisSection({ references }: IslamicBasisSectionProps) {
  if (references.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">Islamic Basis</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        All Quranic verses and Hadith references applied in this calculation
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
                  {isQuran ? 'Quran' : 'Hadith'}
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
                  <span className="text-xs text-gray-500">Applies to:</span>
                  {ref.appliesTo.map((ht) => (
                    <span
                      key={ht}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                    >
                      {HEIR_TYPE_LABELS[ht] ?? ht}
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
