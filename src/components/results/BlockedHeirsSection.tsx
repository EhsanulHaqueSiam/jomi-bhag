import type { FaraidOutput } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

interface BlockedHeirsSectionProps {
  blockedHeirs: FaraidOutput['blockedHeirs']
}

export function BlockedHeirsSection({ blockedHeirs }: BlockedHeirsSectionProps) {
  if (blockedHeirs.length === 0) return null

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Blocked Heirs</h3>
      <div className="mt-1 mb-3 h-px bg-gray-200" />
      <p className="text-sm leading-relaxed text-gray-600">
        The following heirs are excluded from inheritance in this scenario due
        to Islamic blocking rules (Hajb Hirman). A closer relative takes their
        place.
      </p>
      <div className="mt-3 space-y-2">
        {blockedHeirs.map((bh) => (
          <div
            key={`${bh.heirType}-${bh.blockedBy}`}
            className="flex flex-wrap items-baseline gap-x-1.5 text-sm"
          >
            <span className="font-medium text-gray-800">
              {HEIR_TYPE_LABELS[bh.heirType] ?? bh.heirType}
            </span>
            <span className="text-gray-500">blocked by</span>
            <span className="font-medium text-gray-800">
              {HEIR_TYPE_LABELS[bh.blockedBy] ?? bh.blockedBy}
            </span>
            <span className="text-gray-500">({bh.rule})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
