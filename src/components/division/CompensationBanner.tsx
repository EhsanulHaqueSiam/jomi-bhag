import type { CashCompensation } from '@/core/land/division'
import { getHeirTypeLabel } from '@/core/utils/display'
import { useTranslation } from '@/i18n/useTranslation'

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
  const { t, language } = useTranslation()

  if (compensations.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-800">
        {t('distribution.cashCompensation')}
      </h3>
      <ul className="mt-2 space-y-1">
        {compensations.map((comp, idx) => (
          <li key={idx} className="text-sm text-amber-800">
            {getHeirTypeLabel(comp.fromGroup, language)} {' > '}{' '}
            {getHeirTypeLabel(comp.toGroup, language)} {bdtFormatter.format(comp.amount)}
          </li>
        ))}
      </ul>
    </div>
  )
}
