// Stub - types to be implemented
import type { HeirType } from '@/core/faraid/types'

export interface DistributionItem {
  id: string
  type: 'property' | 'movable'
  category: string
  label: string
  value: number
}

export type EquilibriumStatus = 'balanced' | 'close' | 'off'

export interface EquilibriumResult {
  status: EquilibriumStatus
  percentage: number
  delta: number
}

export interface DistributionGroup {
  heirType: HeirType
  label: string
  count: number
  targetValue: number
  assignedItems: string[]
  assignedValue: number
  cashAdjustment: number
}

export interface DistributionResult {
  groups: DistributionGroup[]
  items: DistributionItem[]
  totalEstateValue: number
  compensations: CashCompensation[]
}

export type { CashCompensation } from '@/core/land/division'
