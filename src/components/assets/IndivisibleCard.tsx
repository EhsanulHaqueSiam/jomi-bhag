import { useState, useCallback } from 'react'
import type { MovableAsset, IndivisibleResolution, ResolutionMethod } from '@/core/assets/types'
import type { ShareResult, HeirType } from '@/core/faraid/types'
import { computeAssetValue } from '@/core/assets/valuation'
import { calculateBuyout } from '@/core/assets/indivisible'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'
import { QurahCeremony } from '@/components/division/QurahCeremony'

const displayFormatter = new Intl.NumberFormat('en-IN')

interface IndivisibleCardProps {
  asset: MovableAsset
  shares: ShareResult[]
  onUpdate: (resolution: IndivisibleResolution) => void
}

export function IndivisibleCard({ asset, shares, onUpdate }: IndivisibleCardProps) {
  const activeShares = shares.filter((s) => s.shareType !== 'blocked')
  const assetValue = computeAssetValue(asset)

  const currentMethod: ResolutionMethod | null = asset.indivisibleResolution?.method ?? null

  // Buyout state
  const [buyoutBuyer, setBuyoutBuyer] = useState<HeirType | null>(
    asset.indivisibleResolution?.method === 'buyout'
      ? asset.indivisibleResolution.buyerHeirType
      : null,
  )

  // Qurah state
  const [hasDrawn, setHasDrawn] = useState(
    asset.indivisibleResolution?.method === 'qurah' && asset.indivisibleResolution.assignedHeirType !== null,
  )
  const [isRevealed, setIsRevealed] = useState(
    asset.indivisibleResolution?.method === 'qurah' && asset.indivisibleResolution.assignedHeirType !== null,
  )
  const [assignedHeir, setAssignedHeir] = useState<HeirType | null>(
    asset.indivisibleResolution?.method === 'qurah'
      ? asset.indivisibleResolution.assignedHeirType
      : null,
  )

  const selectMethod = useCallback(
    (method: ResolutionMethod) => {
      if (method === 'sell_divide') {
        onUpdate({ method: 'sell_divide' })
      } else if (method === 'buyout') {
        // Reset buyout buyer on fresh selection
        setBuyoutBuyer(null)
        // Don't call onUpdate yet -- wait for buyer selection
      } else if (method === 'qurah') {
        setHasDrawn(false)
        setIsRevealed(false)
        setAssignedHeir(null)
        onUpdate({ method: 'qurah', assignedHeirType: null })
      }
    },
    [onUpdate],
  )

  const handleBuyoutSelect = useCallback(
    (heirType: HeirType) => {
      setBuyoutBuyer(heirType)
      onUpdate({ method: 'buyout', buyerHeirType: heirType })
    },
    [onUpdate],
  )

  const handleQurahDraw = useCallback(() => {
    // Weighted random selection from active shares
    const totalCount = activeShares.reduce((sum, s) => sum + s.count, 0)
    const rand = Math.random() * totalCount
    let cumulative = 0
    let selectedHeir: HeirType = activeShares[0]?.heirType ?? 'son'
    for (const s of activeShares) {
      cumulative += s.count
      if (rand < cumulative) {
        selectedHeir = s.heirType
        break
      }
    }

    setHasDrawn(true)
    setAssignedHeir(selectedHeir)

    // Staggered reveal after 1.5s
    setTimeout(() => {
      setIsRevealed(true)
      onUpdate({ method: 'qurah', assignedHeirType: selectedHeir })
    }, 1500)
  }, [activeShares, onUpdate])

  const buyoutCalc =
    currentMethod === 'buyout' && buyoutBuyer
      ? calculateBuyout(assetValue, buyoutBuyer, shares)
      : null

  const optionCards: { method: ResolutionMethod; label: string; icon: JSX.Element }[] = [
    {
      method: 'sell_divide',
      label: 'Sell & Divide',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      method: 'buyout',
      label: 'Buyout',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      method: 'qurah',
      label: 'Qurah (Lots)',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h4 className="text-sm font-semibold text-amber-800">
        Indivisible Asset Resolution
      </h4>
      <p className="mt-1 text-xs text-amber-600">
        Value: &#2547;{displayFormatter.format(assetValue)} -- Choose how to distribute this asset
      </p>

      {/* Three option cards */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {optionCards.map((opt) => {
          const isSelected = currentMethod === opt.method
          return (
            <button
              key={opt.method}
              type="button"
              onClick={() => selectMethod(opt.method)}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-colors ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className={isSelected ? 'text-emerald-600' : 'text-gray-500'}>
                {opt.icon}
              </span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? 'text-emerald-700' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sell & Divide detail */}
      {currentMethod === 'sell_divide' && (
        <div className="mt-3 space-y-1 rounded-lg bg-white p-3">
          <p className="text-xs font-medium text-gray-600">Per-heir share amounts:</p>
          {activeShares.map((s) => (
            <div key={s.heirType} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{HEIR_TYPE_LABELS[s.heirType]}</span>
              <span className="font-medium text-emerald-700">
                &#2547;{displayFormatter.format(Math.round(assetValue * s.totalShare.valueOf()))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Buyout detail */}
      {currentMethod === 'buyout' && (
        <div className="mt-3 space-y-3 rounded-lg bg-white p-3">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Which heir group buys?
            </label>
            <select
              value={buyoutBuyer ?? ''}
              onChange={(e) => handleBuyoutSelect(e.target.value as HeirType)}
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

          {buyoutCalc && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">
                Compensation owed: &#2547;{displayFormatter.format(buyoutCalc.compensationOwed)}
              </p>
              {buyoutCalc.perGroupPayments.map((pg) => (
                <div key={pg.heirType} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    Pay {HEIR_TYPE_LABELS[pg.heirType]}
                  </span>
                  <span className="font-medium text-emerald-700">
                    &#2547;{displayFormatter.format(pg.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Qurah detail */}
      {currentMethod === 'qurah' && (
        <div className="mt-3 rounded-lg bg-white p-3">
          <QurahCeremony
            onDraw={handleQurahDraw}
            isRevealed={isRevealed}
            hasDrawn={hasDrawn}
          />
          {isRevealed && assignedHeir && (
            <p className="mt-3 text-center text-sm font-semibold text-gold-600">
              Assigned to: {HEIR_TYPE_LABELS[assignedHeir]}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
