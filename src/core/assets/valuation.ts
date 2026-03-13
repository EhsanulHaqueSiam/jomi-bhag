import type { GoldSilverAsset, GoldUnit, MovableAsset } from '@/core/assets/types'
import { GOLD_RATES, SILVER_RATES, GOLD_UNIT_CONVERSIONS } from '@/data/movable-asset-data'

/**
 * Convert a gold/silver weight to vori (BD standard unit).
 * 1 vori = 11.664 grams. In BD, tola ~ vori.
 */
export function convertToVori(weight: number, unit: GoldUnit): number {
  switch (unit) {
    case 'vori':
      return weight
    case 'gram':
      return weight * GOLD_UNIT_CONVERSIONS.gram_to_vori
    case 'tola':
      // In BD, 1 tola = 1 vori (both = 11.664 grams)
      return weight
  }
}

/**
 * Compute the BDT value of a gold or silver asset.
 * If overrideValue is set, return it directly.
 * Otherwise: weightInVori * rate[purity] for the metal type.
 */
export function computeGoldValue(asset: GoldSilverAsset): number {
  if (asset.overrideValue !== null) return asset.overrideValue
  const weightInVori = convertToVori(asset.weight, asset.weightUnit)
  const rate =
    asset.metalType === 'gold'
      ? GOLD_RATES[asset.purity]
      : SILVER_RATES[asset.purity]
  return Math.round(weightInVori * rate)
}

/**
 * Compute the BDT value of any movable asset.
 * Switches on asset.category to use category-specific logic.
 */
export function computeAssetValue(asset: MovableAsset): number {
  switch (asset.category) {
    case 'gold_silver':
      return computeGoldValue(asset)
    case 'cash':
      return asset.value
    case 'vehicle':
      return asset.estimatedValue
    case 'jewelry':
      return asset.value
    case 'furniture':
      return asset.value
    case 'livestock':
      return asset.count * asset.perUnitValue
    case 'custom':
      return asset.estimatedValue
  }
}

/**
 * Compute the total BDT value of all movable assets.
 */
export function computeMovableAssetsTotal(assets: MovableAsset[]): number {
  return assets.reduce((sum, a) => sum + computeAssetValue(a), 0)
}
