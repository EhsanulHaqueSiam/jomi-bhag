import { useWizardStore } from '@/stores/wizardStore'
import { ModeToggle } from '@/components/results/ModeToggle'
import { EstateValueInput } from '@/components/results/EstateValueInput'
import { HeirCard } from '@/components/results/HeirCard'
import { AdjustmentBanner } from '@/components/results/AdjustmentBanner'
import { SpecialCaseCallout } from '@/components/results/SpecialCaseCallout'
import { BlockedHeirsSection } from '@/components/results/BlockedHeirsSection'
import { StepAccordion } from '@/components/results/StepAccordion'
import { IslamicBasisSection } from '@/components/results/IslamicBasisSection'
import { getAllReferences } from '@/core/faraid/references'
import { Button } from '@/components/ui/Button'

export function ResultsPage() {
  const results = useWizardStore((s) => s.results)
  const viewMode = useWizardStore((s) => s.viewMode)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  const setStep = useWizardStore((s) => s.setStep)

  if (!results) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')

  return (
    <div className="space-y-6">
      {/* Header area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Inheritance Results
        </h2>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" onClick={() => setStep(1)}>
            Edit Heirs
          </Button>
        </div>
      </div>

      {/* Estate value input */}
      <EstateValueInput />

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
