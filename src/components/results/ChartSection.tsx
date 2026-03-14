import { motion } from 'motion/react'
import { useWizardStore } from '@/stores/wizardStore'
import { useTranslation } from '@/i18n/useTranslation'
import { SharePieChart } from '@/components/results/SharePieChart'
import { MonetaryBarChart } from '@/components/results/MonetaryBarChart'

export function ChartSection() {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)

  const { t } = useTranslation()

  if (!results) return null

  const showBarChart = totalEstateValue > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <SharePieChart />
      {showBarChart ? (
        <MonetaryBarChart />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 p-8">
          <p className="text-sm italic text-gray-400">
            {t('results.enterEstateValueHint')}
          </p>
        </div>
      )}
    </motion.div>
  )
}
