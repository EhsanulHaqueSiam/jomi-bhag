// Individual distribution types - to be implemented
import type { HeirType } from '@/core/faraid/types'
import type { DistributionItem } from '@/core/distribution/types'

/** Minimum BDT amount for a compensation entry to be included */
export const COMPENSATION_THRESHOLD = 100

/** An individual heir's column in the individual distribution view */
export interface IndividualColumn {
  id: string // e.g. "son_0", "daughter_1"
  heirType: HeirType
  index: number
  displayName: string // e.g. "Son 1", "Daughter 2"
  customName: string | null
  targetValue: number
  sharePerHeir: string // serialized Fraction
  assignedItems: string[]
  assignedValue: number
  cashAdjustment: number
}

/** A sub-parcel created by splitting a property */
export interface SplitParcel {
  id: string // crypto.randomUUID()
  parentId: string // original DistributionItem id
  label: string // e.g. "Beki (5 shotok)"
  areaSqft: number
  value: number
}

/** A pairwise cash compensation between individuals */
export interface IndividualCompensation {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
}

/** Complete result of individual-level distribution */
export interface IndividualDistributionResult {
  individuals: IndividualColumn[]
  items: DistributionItem[] // includes split sub-parcels as regular items
  compensations: IndividualCompensation[]
  totalEstateValue: number
}
