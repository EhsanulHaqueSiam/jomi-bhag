import type { ShareResult } from '@/core/faraid/types'
import {
  fractionToString,
  fractionToPercent,
  fractionToBDT,
  HEIR_TYPE_LABELS,
  SHARE_TYPE_LABELS,
} from '@/core/utils/display'
import { QuranReference } from '@/components/results/QuranReference'

interface HeirCardProps {
  share: ShareResult
  totalEstateValue: number
}

/** Heir types considered feminine for icon selection. */
const feminineHeirs = new Set([
  'wife',
  'daughter',
  'daughter_of_son',
  'mother',
  'paternal_grandmother',
  'maternal_grandmother',
  'sister_full',
  'sister_consanguine',
  'sister_uterine',
])

/** Badge color classes per share type. */
const shareTypeBadgeStyles: Record<string, string> = {
  fard: 'bg-emerald-50 text-emerald-700',
  asaba: 'bg-blue-50 text-blue-700',
  radd_adjusted: 'bg-amber-50 text-amber-700',
  blocked: 'bg-gray-100 text-gray-500',
}

function HeirIcon({ isFeminine }: { isFeminine: boolean }) {
  return (
    <svg
      className="h-8 w-8 text-gray-400"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {isFeminine ? (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M12 12c-4 0-7 2.5-7 5.5 0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5 0-3-3-5.5-7-5.5z" />
        </>
      ) : (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M12 12c-3.5 0-6.5 2-6.5 5v1.5c0 .83.67 1.5 1.5 1.5h10c.83 0 1.5-.67 1.5-1.5V17c0-3-3-5-6.5-5z" />
        </>
      )}
    </svg>
  )
}

export function HeirCard({ share, totalEstateValue }: HeirCardProps) {
  const label = HEIR_TYPE_LABELS[share.heirType] ?? share.heirType
  const isFeminine = feminineHeirs.has(share.heirType)
  const shareTypeLabel = SHARE_TYPE_LABELS[share.shareType] ?? share.shareType
  const badgeStyle = shareTypeBadgeStyles[share.shareType] ?? 'bg-gray-100 text-gray-500'

  const hasMultiple = share.count > 1
  const bdtTotal = fractionToBDT(share.totalShare, totalEstateValue)
  const bdtEach = hasMultiple ? fractionToBDT(share.sharePerHeir, totalEstateValue) : ''

  // Check for adjustment notes
  const adjustmentNote = share.notes?.find(
    (n) => n.startsWith('Awl applied:') || n.startsWith('Radd applied:'),
  )
  const isAwl = adjustmentNote?.startsWith('Awl')

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
              <span className="text-sm text-gray-500">Each</span>
              <div className="flex items-baseline gap-2 text-right">
                <span className="text-sm font-medium text-gray-700">
                  {fractionToString(share.sharePerHeir)}
                </span>
                <span className="text-sm text-gray-500">
                  ({fractionToPercent(share.sharePerHeir)})
                </span>
                {totalEstateValue > 0 && bdtEach && (
                  <span className="text-sm font-medium text-emerald-700">
                    {bdtEach}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-700">Total</span>
              <div className="flex items-baseline gap-2 text-right">
                <span className="text-base font-semibold text-gray-900">
                  {fractionToString(share.totalShare)}
                </span>
                <span className="text-sm text-gray-500">
                  ({fractionToPercent(share.totalShare)})
                </span>
                {totalEstateValue > 0 && bdtTotal && (
                  <span className="text-base font-semibold text-emerald-700">
                    {bdtTotal}
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
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-500">
                {fractionToPercent(share.totalShare)}
              </span>
              {totalEstateValue > 0 && bdtTotal && (
                <span className="text-base font-semibold text-emerald-700">
                  {bdtTotal}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

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

      {/* Quran reference */}
      <QuranReference heirType={share.heirType} />
    </div>
  )
}
