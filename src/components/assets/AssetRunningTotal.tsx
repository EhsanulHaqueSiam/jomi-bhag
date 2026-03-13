import { useWizardStore } from '@/stores/wizardStore'

const formatter = new Intl.NumberFormat('en-IN')

export function AssetRunningTotal() {
  const total = useWizardStore((s) => s.getMovableAssetsTotal())

  if (total <= 0) return null

  return (
    <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm">
      <span className="text-gray-600">Movable Assets Total: </span>
      <span className="font-semibold text-emerald-700">
        &#2547;{formatter.format(total)}
      </span>
    </div>
  )
}
