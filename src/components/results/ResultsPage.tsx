import { useWizardStore } from '@/stores/wizardStore'
import { ModeToggle } from '@/components/results/ModeToggle'
import { EstateValueInput } from '@/components/results/EstateValueInput'
import { HeirCard } from '@/components/results/HeirCard'
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

      {/* Plan 02: BlockedHeirsSection */}
      {/* Plan 02: AdjustmentBanner */}
      {/* Plan 02: SpecialCaseCallout */}

      {/* Detailed mode sections */}
      {viewMode === 'detailed' && (
        <>
          {/* Plan 02: StepAccordion */}
          {/* Plan 02: IslamicBasisSection */}
        </>
      )}
    </div>
  )
}
