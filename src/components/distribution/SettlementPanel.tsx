import { useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ShareResult } from '@/core/faraid/types'
import type { LandUnit } from '@/core/land/types'
import type {
  LandSettlement,
  LandSettlementMethod,
} from '@/core/land/settlement-types'
import { SellSplitDetail } from './SellSplitDetail'
import { PhysicalDivisionDetail } from './PhysicalDivisionDetail'
import { BuyoutDetail } from './BuyoutDetail'
import { JointOwnershipDetail } from './JointOwnershipDetail'
import { useTranslation } from '@/i18n/useTranslation'

const displayFormatter = new Intl.NumberFormat('en-IN')

interface SettlementPanelProps {
  propertyId: string
  propertyValue: number
  settlement: LandSettlement | null
  shares: ShareResult[]
  landInputUnit: LandUnit
  onUpdate: (settlement: LandSettlement | null) => void
}

interface MethodOption {
  method: LandSettlementMethod
  icon: React.ReactNode
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    method: 'sell_split',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
  {
    method: 'physical_division',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 3.75v16.5M3.75 12h16.5"
        />
      </svg>
    ),
  },
  {
    method: 'buyout',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
        />
      </svg>
    ),
  },
  {
    method: 'joint_ownership',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
]

export function SettlementPanel({
  propertyValue,
  settlement,
  shares,
  landInputUnit,
  onUpdate,
}: SettlementPanelProps) {
  const { t } = useTranslation()
  const currentMethod = settlement?.method ?? null

  const selectMethod = useCallback(
    (method: LandSettlementMethod) => {
      // Toggle off if clicking the already-selected method
      if (currentMethod === method) {
        onUpdate(null)
        return
      }

      // Create default settlement for the method
      switch (method) {
        case 'sell_split':
          onUpdate({ method: 'sell_split', actualSalePrice: null })
          break
        case 'physical_division':
          onUpdate({ method: 'physical_division', subParcels: [] })
          break
        case 'buyout':
          // Start with no buyer -- user must select
          onUpdate({
            method: 'buyout',
            buyerHeirType: shares.filter((s) => s.shareType !== 'blocked')[0]
              ?.heirType ?? 'son',
            useInstallments: false,
            installmentCount: 3,
          })
          break
        case 'joint_ownership':
          onUpdate({
            method: 'joint_ownership',
            incomeAmount: null,
            incomeType: null,
            incomePeriod: null,
          })
          break
      }
    },
    [currentMethod, onUpdate, shares],
  )

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          {t('distribution.settlementPlan')}
        </h4>
        <span className="text-xs text-gray-500">
          &#2547;{displayFormatter.format(propertyValue)}
        </span>
      </div>

      {/* Method prompt if none selected */}
      {!currentMethod && (
        <p className="mt-1 text-xs text-gray-400">
          {t('distribution.chooseSettlement')}
        </p>
      )}

      {/* 2x2 method option grid */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {METHOD_OPTIONS.map((opt) => {
          const isSelected = currentMethod === opt.method
          return (
            <button
              key={opt.method}
              type="button"
              onClick={() => selectMethod(opt.method)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-colors ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span
                className={
                  isSelected ? 'text-emerald-600' : 'text-gray-500'
                }
              >
                {opt.icon}
              </span>
              <span
                className={`text-xs font-medium ${
                  isSelected ? 'text-emerald-700' : 'text-gray-700'
                }`}
              >
                {opt.method === 'sell_split' && t('distribution.sellSplit')}
                {opt.method === 'physical_division' && t('distribution.physicalDivision')}
                {opt.method === 'buyout' && t('estate.buyout')}
                {opt.method === 'joint_ownership' && t('distribution.jointOwnership')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail panel with animation */}
      <AnimatePresence mode="wait">
        {settlement && (
          <motion.div
            key={settlement.method}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg bg-white p-3 border border-gray-100">
              {settlement.method === 'sell_split' && (
                <SellSplitDetail
                  propertyValue={propertyValue}
                  actualSalePrice={settlement.actualSalePrice}
                  shares={shares}
                  onSalePriceChange={(price) =>
                    onUpdate({ ...settlement, actualSalePrice: price })
                  }
                />
              )}

              {settlement.method === 'physical_division' && (
                <PhysicalDivisionDetail
                  propertyValue={propertyValue}
                  subParcels={settlement.subParcels}
                  shares={shares}
                  landInputUnit={landInputUnit}
                  onSubParcelsChange={(subParcels) =>
                    onUpdate({ ...settlement, subParcels })
                  }
                />
              )}

              {settlement.method === 'buyout' && (
                <BuyoutDetail
                  propertyValue={propertyValue}
                  buyerHeirType={settlement.buyerHeirType}
                  shares={shares}
                  useInstallments={settlement.useInstallments}
                  installmentCount={settlement.installmentCount}
                  onBuyerChange={(heir) =>
                    onUpdate({ ...settlement, buyerHeirType: heir })
                  }
                  onInstallmentToggle={(use) =>
                    onUpdate({ ...settlement, useInstallments: use })
                  }
                  onInstallmentCountChange={(count) =>
                    onUpdate({ ...settlement, installmentCount: count })
                  }
                />
              )}

              {settlement.method === 'joint_ownership' && (
                <JointOwnershipDetail
                  shares={shares}
                  incomeAmount={settlement.incomeAmount}
                  incomeType={settlement.incomeType}
                  incomePeriod={settlement.incomePeriod}
                  onIncomeChange={(amount, type, period) =>
                    onUpdate({
                      ...settlement,
                      incomeAmount: amount,
                      incomeType: type,
                      incomePeriod: period,
                    })
                  }
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
