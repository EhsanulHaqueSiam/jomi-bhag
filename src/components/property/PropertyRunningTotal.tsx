import { useWizardStore } from '@/stores/wizardStore'

const displayFormatter = new Intl.NumberFormat('en-IN')

export function PropertyRunningTotal() {
  const getAllPropertiesTotal = useWizardStore((s) => s.getAllPropertiesTotal)
  const propertyCount = useWizardStore((s) => s.properties.length)

  const total = getAllPropertiesTotal()

  if (total <= 0) return null

  return (
    <div className="border-t border-gray-200 pt-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-700">
            Total Estate Value
          </div>
          <div className="text-xs text-gray-500">
            from {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
          </div>
        </div>
        <div className="text-lg font-bold text-emerald-700">
          &#2547;{displayFormatter.format(total)}
        </div>
      </div>
    </div>
  )
}
