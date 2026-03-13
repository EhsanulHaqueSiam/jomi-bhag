import type { HeirType } from '@/core/faraid/types'

/** Gold weight unit options for BD context */
export type GoldUnit = 'vori' | 'gram' | 'tola'

/** Gold/silver purity levels */
export type GoldPurity = '24K' | '22K' | '18K'

/** Common vehicle types in Bangladesh */
export type VehicleType =
  | 'car'
  | 'motorcycle'
  | 'cng_rickshaw'
  | 'truck'
  | 'bicycle'
  | 'boat'

/** Common livestock types in Bangladesh */
export type LivestockType =
  | 'cow'
  | 'goat'
  | 'chicken'
  | 'duck'
  | 'pigeon'
  | 'fish_pond'

/** All movable asset category identifiers */
export type AssetCategory =
  | 'gold_silver'
  | 'cash'
  | 'vehicle'
  | 'jewelry'
  | 'furniture'
  | 'livestock'
  | 'custom'

/** Base fields shared by all movable assets */
export interface BaseAsset {
  id: string
  category: AssetCategory
  isIndivisible: boolean
  indivisibleResolution: IndivisibleResolution | null
}

/** Gold or silver asset with weight, purity, and rate calculation */
export interface GoldSilverAsset extends BaseAsset {
  category: 'gold_silver'
  metalType: 'gold' | 'silver'
  weight: number
  weightUnit: GoldUnit
  purity: GoldPurity
  useAutoRate: boolean
  overrideValue: number | null
}

/** Cash or bank deposit */
export interface CashAsset extends BaseAsset {
  category: 'cash'
  value: number
}

/** Vehicle with type, description, and estimated market value */
export interface VehicleAsset extends BaseAsset {
  category: 'vehicle'
  vehicleType: VehicleType
  description: string
  estimatedValue: number
}

/** Non-gold jewelry with lump value */
export interface JewelryAsset extends BaseAsset {
  category: 'jewelry'
  value: number
}

/** Furniture and household items with lump value */
export interface FurnitureAsset extends BaseAsset {
  category: 'furniture'
  value: number
}

/** Livestock with type, count, and per-unit value */
export interface LivestockAsset extends BaseAsset {
  category: 'livestock'
  livestockType: LivestockType
  count: number
  perUnitValue: number
}

/** Custom/miscellaneous asset */
export interface CustomAsset extends BaseAsset {
  category: 'custom'
  name: string
  estimatedValue: number
}

/** Discriminated union of all movable asset types */
export type MovableAsset =
  | GoldSilverAsset
  | CashAsset
  | VehicleAsset
  | JewelryAsset
  | FurnitureAsset
  | LivestockAsset
  | CustomAsset

/** How an indivisible asset is resolved among heirs */
export type ResolutionMethod = 'sell_divide' | 'buyout' | 'qurah'

/** Sell the asset and divide proceeds per Faraid shares */
export interface SellDivideResolution {
  method: 'sell_divide'
}

/** One heir group buys out the others' shares */
export interface BuyoutResolution {
  method: 'buyout'
  buyerHeirType: HeirType
}

/** Islamic lot drawing to assign to an heir group */
export interface QurahResolution {
  method: 'qurah'
  assignedHeirType: HeirType | null
}

/** Resolution choice for an indivisible asset */
export type IndivisibleResolution =
  | SellDivideResolution
  | BuyoutResolution
  | QurahResolution
