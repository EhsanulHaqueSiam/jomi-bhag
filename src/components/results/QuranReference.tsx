import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { HeirType } from '@/core/faraid/types'
import { getShareReference } from '@/core/faraid/references'

interface QuranReferenceProps {
  heirType: HeirType
}

export function QuranReference({ heirType }: QuranReferenceProps) {
  const refs = getShareReference(heirType)
  const [isExpanded, setIsExpanded] = useState(false)

  if (refs.length === 0) return null

  const firstRef = refs[0]

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-1.5 text-left text-sm font-medium text-gold-600 transition-colors hover:text-gold-500"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        <span>{firstRef.reference}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-2 space-y-3">
              {refs.map((ref, i) => (
                <div
                  key={`${ref.type}-${ref.reference}-${i}`}
                  className="rounded-lg border border-gold-100 bg-gold-50 p-3"
                >
                  <span className="mb-1.5 inline-block rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-600">
                    {ref.type === 'quran' ? 'Quran' : 'Hadith'} &mdash;{' '}
                    {ref.reference}
                  </span>
                  {ref.arabicText && (
                    <p
                      dir="rtl"
                      lang="ar"
                      className="mt-2 font-arabic text-lg leading-loose text-gray-800"
                    >
                      {ref.arabicText}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {ref.englishText}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
