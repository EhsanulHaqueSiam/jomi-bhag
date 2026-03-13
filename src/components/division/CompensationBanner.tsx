import type { CashCompensation } from '@/core/land/division'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

interface CompensationBannerProps {
  compensations: CashCompensation[]
}

export function CompensationBanner({ compensations }: CompensationBannerProps) {
  if (compensations.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-800">
        Cash Compensation Required
      </h3>
      <ul className="mt-2 space-y-1">
        {compensations.map((comp, idx) => (
          <li key={idx} className="text-sm text-amber-800">
            {HEIR_TYPE_LABELS[comp.fromGroup]} received{' '}
            {bdtFormatter.format(comp.amount)} more in land -- owes{' '}
            {HEIR_TYPE_LABELS[comp.toGroup]} {bdtFormatter.format(comp.amount)}{' '}
            cash
          </li>
        ))}
      </ul>
    </div>
  )
}
