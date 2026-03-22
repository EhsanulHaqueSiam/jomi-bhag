import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { DistributionItem } from '@/core/distribution/types'
import type { Property } from '@/core/land/types'
import type { ShareResult } from '@/core/faraid/types'
import type { LandSettlement } from '@/core/land/settlement-types'
import { SettlementPanel } from './SettlementPanel'
import { useTranslation } from '@/i18n/useTranslation'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Category color schemes: [bgColor, textColor, borderColor] */
const CATEGORY_COLORS: Record<string, [string, string, string]> = {
  residential: ['bg-blue-100', 'text-blue-700', 'border-blue-300'],
  agricultural: ['bg-green-100', 'text-green-700', 'border-green-300'],
  commercial: ['bg-purple-100', 'text-purple-700', 'border-purple-300'],
  mixed: ['bg-gray-100', 'text-gray-700', 'border-gray-300'],
  land: ['bg-emerald-100', 'text-emerald-700', 'border-emerald-300'],
  gold_silver: ['bg-yellow-100', 'text-yellow-700', 'border-yellow-300'],
  cash: ['bg-teal-100', 'text-teal-700', 'border-teal-300'],
  vehicle: ['bg-indigo-100', 'text-indigo-700', 'border-indigo-300'],
  jewelry: ['bg-pink-100', 'text-pink-700', 'border-pink-300'],
  furniture: ['bg-orange-100', 'text-orange-700', 'border-orange-300'],
  livestock: ['bg-lime-100', 'text-lime-700', 'border-lime-300'],
  custom: ['bg-slate-100', 'text-slate-700', 'border-slate-300'],
}

function getCategoryColors(category: string): [string, string, string] {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.custom
}

/** Small inline SVG icons for asset categories (16x16). */
function CategoryIcon({ category }: { category: string }) {
  const iconClass = 'h-4 w-4 shrink-0'

  switch (category) {
    case 'residential':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" />
        </svg>
      )
    case 'agricultural':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1C8 1 4 4 4 8c0 2 1 3 2 4v3h4v-3c1-1 2-2 2-4 0-4-4-7-4-7z" />
        </svg>
      )
    case 'commercial':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2h5v14H2V2zm7 4h5v10H9V6zm-6 2h3v2H3V8zm0 3h3v2H3v-2zm7 0h3v2h-3v-2zm0-3h3v2h-3V8z" />
        </svg>
      )
    case 'gold_silver':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="8" r="4" />
          <circle cx="11" cy="8" r="4" opacity="0.7" />
        </svg>
      )
    case 'cash':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="4" width="14" height="8" rx="1" />
          <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      )
    case 'vehicle':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 6l1-3h8l1 3h1v5h-2v1H4v-1H2V6h1zm2 3a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      )
    case 'jewelry':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2l4 6 4-6H4zm4 7L3 14h10L8 9z" />
        </svg>
      )
    case 'furniture':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="6" width="12" height="4" rx="1" />
          <rect x="3" y="10" width="2" height="3" />
          <rect x="11" y="10" width="2" height="3" />
          <rect x="4" y="4" width="8" height="2" rx="1" />
        </svg>
      )
    case 'livestock':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <ellipse cx="8" cy="9" rx="5" ry="3" />
          <circle cx="12" cy="6" r="2" />
          <rect x="4" y="11" width="1.5" height="3" />
          <rect x="10" y="11" width="1.5" height="3" />
        </svg>
      )
    default:
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="12" height="12" rx="2" />
        </svg>
      )
  }
}

interface AssetCardProps {
  item: DistributionItem
  groupId: string
  isOverlay?: boolean
  property?: Property
  shares?: ShareResult[]
  onSettlementUpdate?: (settlement: LandSettlement | null) => void
}

export function AssetCard({
  item,
  groupId,
  isOverlay,
  property,
  shares,
  onSettlementUpdate,
}: AssetCardProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: Boolean(isOverlay),
    data: { groupId },
  })

  const [expanded, setExpanded] = useState(false)

  const [bgColor, textColor, borderColor] = getCategoryColors(item.category)

  const isProperty = item.type === 'property'
  const showSettlement =
    isProperty && !isOverlay && property && shares && onSettlementUpdate

  return (
    <div ref={!isOverlay ? setNodeRef : undefined}>
      {/* Drag handle area */}
      <div
        {...(!isOverlay ? { ...listeners, ...attributes } : {})}
        className={[
          'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing select-none',
          borderColor,
          isOverlay
            ? 'shadow-lg ring-2 ring-emerald-400 bg-white'
            : 'bg-white',
          isDragging && !isOverlay ? 'opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Category badge */}
        <span
          className={`inline-flex items-center justify-center rounded p-1 ${bgColor} ${textColor}`}
        >
          <CategoryIcon category={item.category} />
        </span>

        {/* Label */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
          {item.label}
        </span>

        {/* BDT value */}
        <span className="shrink-0 text-sm font-semibold text-gray-900">
          {bdtFormatter.format(item.value)}
        </span>
      </div>

      {/* Settlement expand button -- separate from drag handle */}
      {showSettlement && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <span>{t('distribution.settlementPlan')}</span>
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      )}

      {/* Settlement panel -- rendered outside drag area */}
      {showSettlement && expanded && (
        <div className="mt-1">
          <SettlementPanel
            propertyId={item.id}
            propertyValue={item.value}
            settlement={property.settlement}
            shares={shares}
            landInputUnit={property.landInputUnit}
            onUpdate={onSettlementUpdate}
          />
        </div>
      )}
    </div>
  )
}
