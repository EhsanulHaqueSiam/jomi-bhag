import { useState } from 'react'
import { motion } from 'motion/react'
import type { AppPage } from '@/types/scenario'
import { useWizardStore } from '@/stores/wizardStore'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useJsonExport } from '@/hooks/useJsonExport'
import { EstateBreakdownCard } from '@/components/results/EstateBreakdownCard'
import { HeirCard } from '@/components/results/HeirCard'
import { AdjustmentBanner } from '@/components/results/AdjustmentBanner'
import { SpecialCaseCallout } from '@/components/results/SpecialCaseCallout'
import { BlockedHeirsSection } from '@/components/results/BlockedHeirsSection'
import { ChartSection } from '@/components/results/ChartSection'
import { StepAccordion } from '@/components/results/StepAccordion'
import { IslamicBasisSection } from '@/components/results/IslamicBasisSection'
import { getAllReferences } from '@/core/faraid/references'
import { HEIR_TYPE_LABELS } from '@/core/utils/display'

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const staggerItem = {
  hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' },
  },
}

const tableStaggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const tableRowVariant = {
  hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' },
  },
}

interface ResultsPageProps {
  onNavigate?: (page: AppPage) => void
}

export function ResultsPage({ onNavigate }: ResultsPageProps) {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const properties = useWizardStore((s) => s.properties)
  const movableAssets = useWizardStore((s) => s.movableAssets)
  const setStep = useWizardStore((s) => s.setStep)

  const { downloadPdf, printPdf, isGenerating, error: pdfError, dismissError } = usePdfExport()
  const { exportJson } = useJsonExport()

  const [chartsOpen, setChartsOpen] = useState(false)
  const [basisOpen, setBasisOpen] = useState(false)

  if (!results) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')
  const hasAssets = properties.length > 0 || movableAssets.length > 0

  return (
    <div className="space-y-6 pb-20">
      {/* PDF error banner */}
      {pdfError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>{pdfError}</span>
          <button type="button" onClick={dismissError} className="ml-2 font-medium hover:text-red-900">Dismiss</button>
        </div>
      )}

      {/* Header area -- clean, just the title */}
      <h2 className="text-xl font-bold text-gray-900">
        Inheritance Results
      </h2>

      {/* Summary card -- heir shares at a glance */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Inheritance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                <th className="pb-2 pr-4">Heir</th>
                <th className="pb-2 pr-4">Share</th>
                {totalEstateValue > 0 && <th className="pb-2 text-right">Amount</th>}
              </tr>
            </thead>
            <motion.tbody
              initial={prefersReducedMotion ? 'visible' : 'hidden'}
              animate="visible"
              variants={tableStaggerContainer}
            >
              {activeShares.map((share, i) => {
                const label = HEIR_TYPE_LABELS[share.heirType] ?? share.heirType
                const displayLabel = share.count > 1 ? `${label} (x${share.count})` : label
                const fraction = share.totalShare.toFraction()
                const amount = totalEstateValue > 0
                  ? Math.round(share.totalShare.valueOf() * totalEstateValue)
                  : 0

                return (
                  <motion.tr
                    key={share.heirType}
                    variants={tableRowVariant}
                    className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="py-1.5 pr-4 font-medium text-gray-800">
                      {displayLabel}
                    </td>
                    <td className="py-1.5 pr-4 text-gray-600">{fraction}</td>
                    {totalEstateValue > 0 && (
                      <td className="py-1.5 text-right text-gray-700">
                        {bdtFormatter.format(amount)}
                      </td>
                    )}
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Estate value breakdown */}
      <EstateBreakdownCard />

      {/* Adjustment banner (Awl/Radd) -- always visible */}
      <AdjustmentBanner
        adjustment={results.adjustment}
        totalBeforeAdjustment={results.totalBeforeAdjustment}
      />

      {/* Special case callouts -- always visible */}
      <SpecialCaseCallout specialCases={results.specialCases} />

      {/* Heir cards grid -- always visible */}
      <motion.div
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        {activeShares.map((share) => (
          <motion.div key={share.heirType} variants={staggerItem}>
            <HeirCard
              share={share}
              totalEstateValue={totalEstateValue}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Blocked heirs section -- always visible */}
      <BlockedHeirsSection blockedHeirs={results.blockedHeirs} />

      {/* Collapsible: Charts & Visualizations */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setChartsOpen(!chartsOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-gray-700">
            Charts & Visualizations
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              chartsOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {chartsOpen && (
          <div className="border-t border-gray-100 px-4 pb-4 pt-2">
            <ChartSection />
          </div>
        )}
      </div>

      {/* Collapsible: Islamic Legal Basis & Calculation Steps */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setBasisOpen(!basisOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-gray-700">
            Islamic Legal Basis & Calculation Steps
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              basisOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {basisOpen && (
          <div className="space-y-4 border-t border-gray-100 px-4 pb-4 pt-2">
            <StepAccordion steps={results.steps} />
            <IslamicBasisSection references={getAllReferences(results)} />
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-40 -mx-4 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] sm:-mx-6 sm:px-6 md:py-2">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {hasAssets && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('distribution')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" opacity="0.6" />
                <path d="M9 6l3-3m0 0l3 3m-3-3v8m-3 3l3 3m0 0l3-3m-3 3V9" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Distribute Assets
            </button>
          )}
          <button
            type="button"
            onClick={downloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {isGenerating ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            type="button"
            onClick={printPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Edit Heirs
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Edit Properties
          </button>
        </div>
      </div>
    </div>
  )
}
