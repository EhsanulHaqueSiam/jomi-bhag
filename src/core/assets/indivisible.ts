import type { ShareResult, HeirType } from '@/core/faraid/types'

/** Result of a buyout calculation for an indivisible asset */
export interface BuyoutCalculation {
  assetValue: number
  buyerHeirType: HeirType
  buyerShare: number
  compensationOwed: number
  perGroupPayments: { heirType: HeirType; amount: number }[]
}

/**
 * Calculate buyout compensation for an indivisible asset.
 *
 * The buying heir group keeps the asset and compensates other groups
 * proportionally to their Faraid shares.
 *
 * Formula: compensationOwed = assetValue * (1 - buyerFraction)
 * Each other group receives: compensationOwed * (theirShare / otherSharesTotal)
 *
 * @throws Error if buyerHeirType is not found in active (non-blocked) shares
 */
export function calculateBuyout(
  assetValue: number,
  buyerHeirType: HeirType,
  shares: ShareResult[],
): BuyoutCalculation {
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')
  const buyerShare = activeShares.find((s) => s.heirType === buyerHeirType)
  if (!buyerShare) {
    throw new Error(`Buyer ${buyerHeirType} not found in shares`)
  }

  const buyerFraction = buyerShare.totalShare.valueOf()
  const compensationOwed = Math.round(assetValue * (1 - buyerFraction))

  const otherShares = activeShares.filter(
    (s) => s.heirType !== buyerHeirType,
  )
  const otherTotal = otherShares.reduce(
    (sum, s) => sum + s.totalShare.valueOf(),
    0,
  )

  const perGroupPayments = otherShares.map((s) => ({
    heirType: s.heirType,
    amount: Math.round(compensationOwed * (s.totalShare.valueOf() / otherTotal)),
  }))

  return {
    assetValue,
    buyerHeirType,
    buyerShare: buyerFraction,
    compensationOwed,
    perGroupPayments,
  }
}
