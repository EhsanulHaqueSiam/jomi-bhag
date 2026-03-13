import type { ShareResult, HeirType } from '@/core/faraid/types'
import type { BuyoutCalculation } from '@/core/assets/indivisible'
import { calculateBuyout } from '@/core/assets/indivisible'
import type { SubParcel } from '@/core/land/settlement-types'

/** Extended buyout result with optional installment plan */
export interface LandBuyoutResult extends BuyoutCalculation {
  installmentPlan: {
    perInstallment: number
    count: number
    totalOwed: number
  } | null
}

/**
 * Calculate per-heir-group BDT payout from a property sale.
 *
 * Filters blocked shares and distributes the property value
 * proportionally to Faraid share fractions.
 */
export function calculateSellSplit(
  propertyValue: number,
  shares: ShareResult[],
): { heirType: HeirType; amount: number }[] {
  const active = shares.filter((s) => s.shareType !== 'blocked')
  return active.map((s) => ({
    heirType: s.heirType,
    amount: Math.round(propertyValue * s.totalShare.valueOf()),
  }))
}

/**
 * Compute target sub-parcel values for physical division.
 *
 * Each heir group's target value is proportional to their Faraid share.
 * Same math as sell split -- gives per-heir-group target values.
 */
export function computeSubParcelTargets(
  propertyValue: number,
  shares: ShareResult[],
): { heirType: HeirType; targetValue: number }[] {
  const active = shares.filter((s) => s.shareType !== 'blocked')
  return active.map((s) => ({
    heirType: s.heirType,
    targetValue: Math.round(propertyValue * s.totalShare.valueOf()),
  }))
}

/**
 * Calculate compensation for physical division imbalance.
 *
 * Computes the difference between total appraised sub-parcel value
 * and the target total (sum of heir targets from property value).
 */
export function calculatePhysicalDivisionCompensation(
  subParcels: SubParcel[],
  targets: { heirType: HeirType; targetValue: number }[],
): { totalSubParcelValue: number; targetTotal: number; difference: number } {
  const totalSubParcelValue = subParcels.reduce(
    (sum, p) => sum + p.appraisedValue,
    0,
  )
  const targetTotal = targets.reduce((sum, t) => sum + t.targetValue, 0)
  return {
    totalSubParcelValue,
    targetTotal,
    difference: totalSubParcelValue - targetTotal,
  }
}

/**
 * Calculate land buyout compensation.
 *
 * Reuses calculateBuyout() from indivisible assets, extending with
 * an optional installment plan (no interest -- Islamic finance compliant).
 */
export function calculateLandBuyout(
  propertyValue: number,
  buyerHeirType: HeirType,
  shares: ShareResult[],
  useInstallments: boolean,
  installmentCount: number,
): LandBuyoutResult {
  const base = calculateBuyout(propertyValue, buyerHeirType, shares)
  return {
    ...base,
    installmentPlan: useInstallments
      ? calculateInstallments(base.compensationOwed, installmentCount)
      : null,
  }
}

/**
 * Calculate installment breakdown (no interest).
 *
 * Uses Math.round for per-installment amount. The totalOwed is always
 * the original compensation amount (no interest added).
 */
export function calculateInstallments(
  totalCompensation: number,
  installmentCount: number,
): { perInstallment: number; count: number; totalOwed: number } {
  const perInstallment = Math.round(totalCompensation / installmentCount)
  return {
    perInstallment,
    count: installmentCount,
    totalOwed: totalCompensation,
  }
}

/**
 * Calculate ownership percentages from Faraid shares.
 *
 * Returns percentages rounded to 2 decimal places.
 */
export function calculateOwnershipShares(
  shares: ShareResult[],
): { heirType: HeirType; percentage: number }[] {
  const active = shares.filter((s) => s.shareType !== 'blocked')
  return active.map((s) => ({
    heirType: s.heirType,
    percentage: Math.round(s.totalShare.valueOf() * 10000) / 100,
  }))
}

/**
 * Distribute income proportionally to Faraid shares.
 *
 * Each heir group receives income proportional to their ownership stake.
 */
export function calculateIncomeDistribution(
  incomeAmount: number,
  shares: ShareResult[],
): { heirType: HeirType; amount: number; percentage: number }[] {
  const active = shares.filter((s) => s.shareType !== 'blocked')
  return active.map((s) => ({
    heirType: s.heirType,
    amount: Math.round(incomeAmount * s.totalShare.valueOf()),
    percentage: Math.round(s.totalShare.valueOf() * 10000) / 100,
  }))
}
