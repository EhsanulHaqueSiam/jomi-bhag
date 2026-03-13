import type { HeirType } from '@/core/faraid/types'
import type { LandUnit } from '@/core/land/types'

/** Available land settlement methods */
export type LandSettlementMethod =
  | 'sell_split'
  | 'physical_division'
  | 'buyout'
  | 'joint_ownership'

/** Sell the property and split proceeds per Faraid shares */
export interface SellSplitSettlement {
  method: 'sell_split'
  /** Override price -- null means use property value */
  actualSalePrice: number | null
}

/** A named sub-parcel of a physically divided property */
export interface SubParcel {
  id: string
  name: string
  areaSqft: number
  areaInputUnit: LandUnit
  appraisedValue: number
}

/** Physically divide land into sub-parcels with value-based distribution */
export interface PhysicalDivisionSettlement {
  method: 'physical_division'
  subParcels: SubParcel[]
}

/** One heir group buys out others' shares, with optional installment plan */
export interface BuyoutSettlement {
  method: 'buyout'
  buyerHeirType: HeirType
  useInstallments: boolean
  /** Preset options: 3, 6, 12, 24 */
  installmentCount: number
}

/** Co-ownership with optional income distribution */
export interface JointOwnershipSettlement {
  method: 'joint_ownership'
  incomeAmount: number | null
  incomeType: 'rent' | 'crop' | null
  incomePeriod: 'monthly' | 'yearly' | null
}

/** Discriminated union of all land settlement types */
export type LandSettlement =
  | SellSplitSettlement
  | PhysicalDivisionSettlement
  | BuyoutSettlement
  | JointOwnershipSettlement
