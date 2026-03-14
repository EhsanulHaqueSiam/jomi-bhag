import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useWizardStore } from '@/stores/wizardStore'
import { useTranslation } from '@/i18n/useTranslation'
import { buildChartData, EMERALD_COLORS } from '@/components/results/chartData'
import type { ChartDatum } from '@/components/results/chartData'

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDatum }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="font-medium text-gray-900">{d.name}</p>
      <p className="text-sm text-gray-600">
        Share: {d.fraction} ({d.percentage})
      </p>
      {d.bdtAmount && (
        <p className="text-sm font-medium text-emerald-700">{d.bdtAmount}</p>
      )}
    </div>
  )
}

export function MonetaryBarChart() {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)

  const { t } = useTranslation()

  if (!results || totalEstateValue <= 0) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')
  const chartData = buildChartData(activeShares, totalEstateValue)

  if (chartData.length === 0) return null

  return (
    <div id="pdf-bar-chart">
      <h3 className="mb-2 text-sm font-medium text-gray-500">
        {t('results.monetaryComparison')}
      </h3>
      <ResponsiveContainer width="100%" height={chartData.length * 48 + 40}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 13 }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="bdtValue" radius={[0, 4, 4, 0]} barSize={28}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={EMERALD_COLORS[index % EMERALD_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
