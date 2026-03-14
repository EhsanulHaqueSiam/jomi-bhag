import type { AppPage } from '@/types/scenario'
import { useWizardStore } from '@/stores/wizardStore'
import { usePdfExport } from '@/hooks/usePdfExport'
import { useJsonExport } from '@/hooks/useJsonExport'
import { ModeToggle } from '@/components/results/ModeToggle'
import { EstateBreakdownCard } from '@/components/results/EstateBreakdownCard'
import { HeirCard } from '@/components/results/HeirCard'
import { AdjustmentBanner } from '@/components/results/AdjustmentBanner'
import { SpecialCaseCallout } from '@/components/results/SpecialCaseCallout'
import { BlockedHeirsSection } from '@/components/results/BlockedHeirsSection'
import { ChartSection } from '@/components/results/ChartSection'
import { StepAccordion } from '@/components/results/StepAccordion'
import { IslamicBasisSection } from '@/components/results/IslamicBasisSection'
import { getAllReferences } from '@/core/faraid/references'
import { Button } from '@/components/ui/Button'

interface ResultsPageProps {
  onNavigate?: (page: AppPage) => void
}

export function ResultsPage({ onNavigate }: ResultsPageProps) {
  const results = useWizardStore((s) => s.results)
  const viewMode = useWizardStore((s) => s.viewMode)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const properties = useWizardStore((s) => s.properties)
  const movableAssets = useWizardStore((s) => s.movableAssets)
  const setStep = useWizardStore((s) => s.setStep)

  const { downloadPdf, printPdf, isGenerating, error: pdfError, dismissError } = usePdfExport()
  const { exportJson } = useJsonExport()

  if (!results) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')

  return (
    <div className="space-y-6">
      {/* PDF error banner */}
      {pdfError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>{pdfError}</span>
          <button type="button" onClick={dismissError} className="ml-2 font-medium hover:text-red-900">Dismiss</button>
        </div>
      )}
      {/* Header area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Inheritance Results
        </h2>
        <div className="flex items-center gap-3">
          {(properties.length > 0 || movableAssets.length > 0) && onNavigate && (
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
          <Button
            variant="ghost"
            onClick={downloadPdf}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="hidden sm:inline ml-1">Download PDF</span>
          </Button>
          <Button
            variant="ghost"
            onClick={printPdf}
            disabled={isGenerating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline ml-1">Print</span>
          </Button>
          <Button variant="ghost" onClick={exportJson}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline ml-1">Export JSON</span>
          </Button>
          <ModeToggle />
          <Button variant="ghost" onClick={() => setStep(3)}>
            Edit Properties
          </Button>
          <Button variant="ghost" onClick={() => setStep(1)}>
            Edit Heirs
          </Button>
        </div>
      </div>

      {/* Estate value breakdown */}
      <EstateBreakdownCard />

      {/* Charts: pie (share distribution) + bar (monetary comparison) */}
      <ChartSection />

      {/* Adjustment banner (Awl/Radd) */}
      <AdjustmentBanner
        adjustment={results.adjustment}
        totalBeforeAdjustment={results.totalBeforeAdjustment}
      />

      {/* Special case callouts */}
      <SpecialCaseCallout specialCases={results.specialCases} />

      {/* Heir cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {activeShares.map((share) => (
          <HeirCard
            key={share.heirType}
            share={share}
            totalEstateValue={totalEstateValue}
          />
        ))}
      </div>

      {/* Blocked heirs section */}
      <BlockedHeirsSection blockedHeirs={results.blockedHeirs} />

      {/* Detailed mode sections */}
      {viewMode === 'detailed' && (
        <>
          <StepAccordion steps={results.steps} />
          <IslamicBasisSection references={getAllReferences(results)} />
        </>
      )}
    </div>
  )
}
