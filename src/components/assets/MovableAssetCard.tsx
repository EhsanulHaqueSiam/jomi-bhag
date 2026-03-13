import { AnimatePresence, motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { computeAssetValue } from '@/core/assets/valuation'
import type { MovableAsset } from '@/core/assets/types'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'
import { GoldSilverForm } from './GoldSilverForm'
import { VehicleForm } from './VehicleForm'
import { LivestockForm } from './LivestockForm'
import { CustomItemForm } from './CustomItemForm'
import { SimpleValueForm } from './SimpleValueForm'
import { IndivisibleCard } from './IndivisibleCard'

const displayFormatter = new Intl.NumberFormat('en-IN')

/** Get a display label for an asset based on its category and data */
function getAssetLabel(asset: MovableAsset): string {
  const catMeta = ASSET_CATEGORIES.find((c) => c.value === asset.category)
  const catLabel = catMeta?.label ?? 'Asset'

  switch (asset.category) {
    case 'custom':
      return asset.name || catLabel
    case 'gold_silver':
      return asset.metalType === 'gold' ? 'Gold' : 'Silver'
    case 'vehicle': {
      if (asset.description) return asset.description
      return catLabel
    }
    default:
      return catLabel
  }
}

/** Simple category icon as inline SVG */
function CategoryIcon({ category }: { category: MovableAsset['category'] }) {
  const iconClass = 'h-5 w-5 text-gray-500'

  switch (category) {
    case 'gold_silver':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'cash':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      )
    case 'vehicle':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V11.25m19.5 0h1.5m-1.5 0a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m-17.25 0h7.5m-7.5 0a1.125 1.125 0 01-1.125-1.125v-1.5m0 0V6.375c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v3.75m-17.25 0h17.25" />
        </svg>
      )
    case 'jewelry':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    case 'furniture':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
        </svg>
      )
    case 'livestock':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
        </svg>
      )
    case 'custom':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
  }
}

interface MovableAssetCardProps {
  assetId: string
}

export function MovableAssetCard({ assetId }: MovableAssetCardProps) {
  const asset = useWizardStore((s) =>
    s.movableAssets.find((a) => a.id === assetId),
  )
  const expandedAssetId = useWizardStore((s) => s.expandedAssetId)
  const setExpandedAssetId = useWizardStore((s) => s.setExpandedAssetId)
  const updateMovableAsset = useWizardStore((s) => s.updateMovableAsset)
  const removeMovableAsset = useWizardStore((s) => s.removeMovableAsset)
  const shares = useWizardStore((s) => s.results?.shares ?? [])

  if (!asset) return null

  const isExpanded = expandedAssetId === assetId
  const value = computeAssetValue(asset)
  const label = getAssetLabel(asset)

  const handleToggle = () => {
    setExpandedAssetId(isExpanded ? null : assetId)
  }

  const handleDelete = () => {
    const hasData = value > 0
    if (hasData) {
      if (
        !window.confirm(
          'Delete this asset? All entered data will be lost.',
        )
      ) {
        return
      }
    }
    removeMovableAsset(assetId)
  }

  const handleUpdate = (patch: Partial<MovableAsset>) => {
    updateMovableAsset(assetId, patch)
  }

  const handleIndivisibleToggle = () => {
    updateMovableAsset(assetId, { isIndivisible: !asset.isIndivisible })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <CategoryIcon category={asset.category} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{label}</div>
        </div>
        <div className="flex items-center gap-2">
          {asset.isIndivisible && (
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
              Indivisible
            </span>
          )}
          {value > 0 && (
            <span className="text-sm font-medium text-emerald-700">
              &#2547;{displayFormatter.format(value)}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded form */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-4 border-t border-gray-100 px-4 py-4">
              {/* Category-specific form */}
              {asset.category === 'gold_silver' && (
                <GoldSilverForm asset={asset} onUpdate={handleUpdate} />
              )}
              {asset.category === 'vehicle' && (
                <VehicleForm asset={asset} onUpdate={handleUpdate} />
              )}
              {asset.category === 'livestock' && (
                <LivestockForm asset={asset} onUpdate={handleUpdate} />
              )}
              {asset.category === 'custom' && (
                <CustomItemForm asset={asset} onUpdate={handleUpdate} />
              )}
              {asset.category === 'cash' && (
                <SimpleValueForm
                  asset={asset}
                  onUpdate={handleUpdate}
                  label="Cash/Bank Deposits"
                />
              )}
              {asset.category === 'jewelry' && (
                <SimpleValueForm
                  asset={asset}
                  onUpdate={handleUpdate}
                  label="Jewelry (non-gold)"
                />
              )}
              {asset.category === 'furniture' && (
                <SimpleValueForm
                  asset={asset}
                  onUpdate={handleUpdate}
                  label="Furniture/Household"
                />
              )}

              {/* Indivisible toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={asset.isIndivisible}
                  onChange={handleIndivisibleToggle}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">
                  This item is indivisible
                </span>
              </label>

              {/* Indivisible resolution card */}
              {asset.isIndivisible && value > 0 && (
                <IndivisibleCard
                  asset={asset}
                  shares={shares}
                  onUpdate={(resolution) => updateMovableAsset(assetId, { indivisibleResolution: resolution })}
                />
              )}

              {/* Delete and collapse controls */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm font-medium text-red-500 hover:text-red-600"
                >
                  Delete Asset
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedAssetId(null)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Collapse
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
