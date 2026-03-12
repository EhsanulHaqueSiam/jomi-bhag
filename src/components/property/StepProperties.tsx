import { useWizardStore } from '@/stores/wizardStore'
import { Button } from '@/components/ui/Button'
import { PropertyCard } from './PropertyCard'

export function StepProperties() {
  const properties = useWizardStore((s) => s.properties)
  const addProperty = useWizardStore((s) => s.addProperty)

  const hasProperties = properties.length > 0

  if (!hasProperties) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg
            className="h-8 w-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
          </svg>
        </div>
        <p className="mb-6 max-w-xs text-gray-600">
          Add your family&apos;s properties to calculate monetary shares
        </p>
        <Button variant="primary" onClick={() => addProperty()}>
          Add Property
        </Button>
        <p className="mt-4 text-sm text-gray-500 hover:underline cursor-pointer">
          Skip to Results
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} propertyId={p.id} />
      ))}

      {/* Running total placeholder (Task 2 replaces with PropertyRunningTotal) */}
      <div data-testid="running-total-slot" />

      <div className="pt-2">
        <button
          type="button"
          onClick={() => addProperty()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-emerald-400 hover:text-emerald-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Property
        </button>
      </div>
    </div>
  )
}
