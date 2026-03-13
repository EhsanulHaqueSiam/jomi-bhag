import { useWizardStore } from '@/stores/wizardStore'
import type { AssetCategory } from '@/core/assets/types'
import { ASSET_CATEGORIES } from '@/data/movable-asset-data'
import { MovableAssetCard } from './MovableAssetCard'
import { AssetRunningTotal } from './AssetRunningTotal'

export function MovableAssetList() {
  const movableAssets = useWizardStore((s) => s.movableAssets)
  const addMovableAsset = useWizardStore((s) => s.addMovableAsset)

  const handleAddAsset = (category: AssetCategory) => {
    addMovableAsset(category)
  }

  return (
    <div className="space-y-3">
      {/* Category picker grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleAddAsset(cat.value)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-400 hover:text-emerald-600"
          >
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Asset cards or empty state */}
      {movableAssets.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
            <svg
              className="h-7 w-7 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <p className="font-medium text-gray-700">
            No movable assets added
          </p>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Add gold, cash, vehicles, or other assets to include in the estate
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {movableAssets.map((a) => (
            <MovableAssetCard key={a.id} assetId={a.id} />
          ))}
        </div>
      )}

      {/* Running total */}
      <AssetRunningTotal />
    </div>
  )
}
