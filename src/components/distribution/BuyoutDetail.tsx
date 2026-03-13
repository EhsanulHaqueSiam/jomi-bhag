import type { ShareResult, HeirType } from '@/core/faraid/types'
import { calculateLandBuyout } from '@/core/land/settlement'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const displayFormatter = new Intl.NumberFormat('en-IN')

const INSTALLMENT_OPTIONS = [3, 6, 12, 24] as const

interface BuyoutDetailProps {
  propertyValue: number
  buyerHeirType: HeirType | null
  shares: ShareResult[]
  useInstallments: boolean
  installmentCount: number
  onBuyerChange: (heir: HeirType) => void
  onInstallmentToggle: (use: boolean) => void
  onInstallmentCountChange: (count: number) => void
}

export function BuyoutDetail({
  propertyValue,
  buyerHeirType,
  shares,
  useInstallments,
  installmentCount,
  onBuyerChange,
  onInstallmentToggle,
  onInstallmentCountChange,
}: BuyoutDetailProps) {
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')

  const buyoutCalc =
    buyerHeirType
      ? calculateLandBuyout(
          propertyValue,
          buyerHeirType,
          shares,
          useInstallments,
          installmentCount,
        )
      : null

  return (
    <div className="space-y-3">
      {/* Buyer select */}
      <div>
        <label className="text-xs font-medium text-gray-600">
          Which heir group buys?
        </label>
        <select
          value={buyerHeirType ?? ''}
          onChange={(e) => onBuyerChange(e.target.value as HeirType)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Select heir group...</option>
          {activeShares.map((s) => (
            <option key={s.heirType} value={s.heirType}>
              {HEIR_TYPE_LABELS[s.heirType]}
            </option>
          ))}
        </select>
      </div>

      {/* Compensation breakdown */}
      {buyoutCalc && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">
            Compensation owed: &#2547;
            {displayFormatter.format(buyoutCalc.compensationOwed)}
          </p>
          <div className="space-y-1">
            {buyoutCalc.perGroupPayments.map((pg) => (
              <div
                key={pg.heirType}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  Pay {HEIR_TYPE_LABELS[pg.heirType]}
                </span>
                <span className="font-medium text-emerald-700">
                  &#2547;{displayFormatter.format(pg.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Installment toggle */}
          <div className="border-t border-gray-100 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useInstallments}
                onChange={(e) => onInstallmentToggle(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
              />
              <span className="text-sm text-gray-700">
                Pay in installments?
              </span>
              <span className="text-xs text-gray-400">
                No interest (Islamic finance)
              </span>
            </label>
          </div>

          {/* Installment details */}
          {useInstallments && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Number of installments
                </label>
                <select
                  value={installmentCount}
                  onChange={(e) =>
                    onInstallmentCountChange(parseInt(e.target.value, 10))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  {INSTALLMENT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} months
                    </option>
                  ))}
                </select>
              </div>

              {buyoutCalc.installmentPlan && (
                <p className="text-sm text-gray-700">
                  ~&#2547;
                  {displayFormatter.format(
                    buyoutCalc.installmentPlan.perInstallment,
                  )}{' '}
                  per installment for {buyoutCalc.installmentPlan.count} months
                  <span className="ml-1 block text-xs text-gray-400">
                    Approximately -- last installment may vary
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
