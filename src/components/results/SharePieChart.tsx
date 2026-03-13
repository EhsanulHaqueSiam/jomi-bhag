import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts'
import { useWizardStore } from '@/stores/wizardStore'
import { buildChartData } from '@/components/results/chartData'
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

export function SharePieChart() {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)

  if (!results) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')
  const chartData = buildChartData(activeShares, totalEstateValue)

  if (chartData.length === 0) return null

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-500">
        Share Distribution
      </h3>
      <div className="relative">
        {/* Center label overlay -- CSS positioned for reliable rendering */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {chartData.length} heirs
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="50%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              <Label
                position="center"
                content={() => (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-gray-700 text-lg font-semibold"
                  >
                    {chartData.length} heirs
                  </text>
                )}
              />
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible legend -- always rendered as HTML for screen readers and testability */}
      <div className="mt-2 flex flex-wrap gap-3" role="list" aria-label="Chart legend">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5" role="listitem">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: d.fill }}
            />
            <span className="text-sm text-gray-700">
              {d.name} ({d.percentage})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
