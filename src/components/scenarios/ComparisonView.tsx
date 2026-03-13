import type { Scenario } from '@/types/scenario'
import type { HeirType, ShareResult } from '@/core/faraid/types'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface ComparisonViewProps {
  scenarioA: Scenario
  scenarioB: Scenario
  onClose: () => void
}

interface UnifiedHeirRow {
  heirType: HeirType
  label: string
  shareA: ShareResult | null
  shareB: ShareResult | null
  isDifferent: boolean
}

function buildUnifiedRows(a: Scenario, b: Scenario): UnifiedHeirRow[] {
  const sharesA = a.state.results?.shares.filter((s) => s.shareType !== 'blocked') ?? []
  const sharesB = b.state.results?.shares.filter((s) => s.shareType !== 'blocked') ?? []

  const mapA = new Map<HeirType, ShareResult>()
  for (const s of sharesA) mapA.set(s.heirType, s)

  const mapB = new Map<HeirType, ShareResult>()
  for (const s of sharesB) mapB.set(s.heirType, s)

  // Union of all heir types from both
  const allTypes = new Set<HeirType>([...mapA.keys(), ...mapB.keys()])

  const rows: UnifiedHeirRow[] = []
  for (const ht of allTypes) {
    const sa = mapA.get(ht) ?? null
    const sb = mapB.get(ht) ?? null

    // Diff: heir present in only one, or totalShare fractions differ
    let isDifferent = false
    if (!sa || !sb) {
      isDifferent = true
    } else {
      isDifferent = sa.totalShare.valueOf() !== sb.totalShare.valueOf()
    }

    rows.push({
      heirType: ht,
      label: HEIR_TYPE_LABELS[ht] ?? ht,
      shareA: sa,
      shareB: sb,
      isDifferent,
    })
  }

  return rows
}

function ShareCell({
  share,
  totalEstateValue,
}: {
  share: ShareResult | null
  totalEstateValue: number
}) {
  if (!share) {
    return <span className="text-gray-400">--</span>
  }

  const fraction = share.totalShare.toFraction()
  const percent = (share.totalShare.valueOf() * 100).toFixed(1) + '%'
  const bdt =
    totalEstateValue > 0
      ? bdtFormatter.format(
          Math.round(share.totalShare.valueOf() * totalEstateValue),
        )
      : null

  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1.5">
        {share.count > 1 && (
          <span className="text-xs text-gray-500">x{share.count}</span>
        )}
        <span className="text-sm font-medium text-gray-900">{fraction}</span>
        <span className="text-xs text-gray-500">({percent})</span>
      </div>
      {bdt && (
        <div className="text-sm font-medium text-emerald-700">{bdt}</div>
      )}
    </div>
  )
}

export function ComparisonView({
  scenarioA,
  scenarioB,
  onClose,
}: ComparisonViewProps) {
  const rows = buildUnifiedRows(scenarioA, scenarioB)

  const adjustmentLabel = (adj: string) => {
    if (adj === 'awl') return 'Awl'
    if (adj === 'radd') return 'Radd'
    return 'None'
  }

  const adjustmentsDiffer =
    scenarioA.summary.adjustment !== scenarioB.summary.adjustment
  const estateValuesDiffer =
    scenarioA.summary.totalEstateValue !== scenarioB.summary.totalEstateValue

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Comparing</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      {/* Scenario names row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-xs font-medium text-emerald-600">Scenario A</div>
          <div className="mt-0.5 text-sm font-semibold text-gray-900">
            {scenarioA.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(scenarioA.updatedAt)}
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-xs font-medium text-emerald-600">Scenario B</div>
          <div className="mt-0.5 text-sm font-semibold text-gray-900">
            {scenarioB.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(scenarioB.updatedAt)}
          </div>
        </div>
      </div>

      {/* Estate Summary */}
      <div
        className={`rounded-lg border p-3 ${
          estateValuesDiffer
            ? 'border-amber-200 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="text-xs font-medium text-gray-600">Estate Value</div>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="text-sm font-medium text-gray-900">
            {scenarioA.summary.totalEstateValue > 0
              ? bdtFormatter.format(scenarioA.summary.totalEstateValue)
              : 'Not specified'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {scenarioB.summary.totalEstateValue > 0
              ? bdtFormatter.format(scenarioB.summary.totalEstateValue)
              : 'Not specified'}
          </div>
        </div>
      </div>

      {/* Adjustment */}
      <div
        className={`rounded-lg border p-3 ${
          adjustmentsDiffer
            ? 'border-amber-200 bg-amber-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="text-xs font-medium text-gray-600">Adjustment</div>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="text-sm font-medium text-gray-900">
            {adjustmentLabel(scenarioA.summary.adjustment)}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {adjustmentLabel(scenarioB.summary.adjustment)}
          </div>
        </div>
      </div>

      {/* Heir Shares Table */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Heir Shares
        </h3>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
          <table className="w-full text-sm" data-testid="comparison-table">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 font-medium text-gray-600">Heir</th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  {scenarioA.name}
                </th>
                <th className="px-3 py-2 font-medium text-gray-600">
                  {scenarioB.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.heirType}
                  className={`border-t border-gray-100 ${
                    row.isDifferent ? 'bg-amber-50' : ''
                  }`}
                  data-diff={row.isDifferent ? 'true' : 'false'}
                >
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {row.label}
                  </td>
                  <td className="px-3 py-2">
                    <ShareCell
                      share={row.shareA}
                      totalEstateValue={scenarioA.summary.totalEstateValue}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <ShareCell
                      share={row.shareB}
                      totalEstateValue={scenarioB.summary.totalEstateValue}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked layout */}
        <div className="space-y-2 md:hidden">
          {rows.map((row) => (
            <div
              key={row.heirType}
              className={`rounded-lg border p-3 ${
                row.isDifferent
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200 bg-white'
              }`}
              data-diff={row.isDifferent ? 'true' : 'false'}
            >
              <div className="text-sm font-medium text-gray-700">
                {row.label}
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Scenario A</div>
                  <ShareCell
                    share={row.shareA}
                    totalEstateValue={scenarioA.summary.totalEstateValue}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Scenario B</div>
                  <ShareCell
                    share={row.shareB}
                    totalEstateValue={scenarioB.summary.totalEstateValue}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
