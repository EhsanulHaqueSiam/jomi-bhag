import { useWizardStore } from '@/stores/wizardStore'
import { StepperButton } from '@/components/ui/StepperButton'
import { Tooltip } from '@/components/ui/Tooltip'

export function StepSiblings() {
  const siblingTypeExpanded = useWizardStore((s) => s.siblingTypeExpanded)
  const brotherFullCount = useWizardStore((s) => s.brotherFullCount)
  const brotherConsanguineCount = useWizardStore(
    (s) => s.brotherConsanguineCount,
  )
  const brotherUterineCount = useWizardStore((s) => s.brotherUterineCount)
  const sisterFullCount = useWizardStore((s) => s.sisterFullCount)
  const sisterConsanguineCount = useWizardStore(
    (s) => s.sisterConsanguineCount,
  )
  const sisterUterineCount = useWizardStore((s) => s.sisterUterineCount)
  const setSiblingTypeExpanded = useWizardStore(
    (s) => s.setSiblingTypeExpanded,
  )
  const setBrotherFullCount = useWizardStore((s) => s.setBrotherFullCount)
  const setBrotherConsanguineCount = useWizardStore(
    (s) => s.setBrotherConsanguineCount,
  )
  const setBrotherUterineCount = useWizardStore(
    (s) => s.setBrotherUterineCount,
  )
  const setSisterFullCount = useWizardStore((s) => s.setSisterFullCount)
  const setSisterConsanguineCount = useWizardStore(
    (s) => s.setSisterConsanguineCount,
  )
  const setSisterUterineCount = useWizardStore(
    (s) => s.setSisterUterineCount,
  )

  const totalBrothers =
    brotherFullCount + brotherConsanguineCount + brotherUterineCount
  const totalSisters =
    sisterFullCount + sisterConsanguineCount + sisterUterineCount

  /**
   * When collapsed, increment/decrement goes to brotherFullCount only.
   * The displayed value is the sum of all brother types.
   */
  const handleCollapsedBrotherChange = (newTotal: number) => {
    const diff = newTotal - totalBrothers
    setBrotherFullCount(brotherFullCount + diff)
  }

  const handleCollapsedSisterChange = (newTotal: number) => {
    const diff = newTotal - totalSisters
    setSisterFullCount(sisterFullCount + diff)
  }

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-800">Siblings</h2>
        <p className="mb-6 text-sm text-gray-500">
          Enter the deceased's brothers and sisters. Siblings inherit when there
          are no sons or paternal grandsons. Their share depends on whether they
          are full, consanguine, or uterine.
        </p>
      </div>

      {!siblingTypeExpanded ? (
        /* Collapsed view: simple Brothers / Sisters steppers */
        <div className="space-y-1">
          <StepperButton
            label="Brothers"
            value={totalBrothers}
            onChange={handleCollapsedBrotherChange}
          />
          <StepperButton
            label="Sisters"
            value={totalSisters}
            onChange={handleCollapsedSisterChange}
          />
        </div>
      ) : (
        /* Expanded view: sub-type steppers */
        <div className="space-y-2">
          {/* Brothers sub-heading */}
          <p className="mt-4 mb-2 text-sm font-medium text-gray-600">
            Brothers
          </p>
          <StepperButton
            label="Full brothers"
            value={brotherFullCount}
            onChange={setBrotherFullCount}
            tooltip="Share both parents with the deceased"
          />
          <StepperButton
            label="Consanguine brothers"
            value={brotherConsanguineCount}
            onChange={setBrotherConsanguineCount}
            tooltip="Share only the father (paternal half-brothers)"
          />
          <StepperButton
            label="Uterine brothers"
            value={brotherUterineCount}
            onChange={setBrotherUterineCount}
            tooltip="Share only the mother (maternal half-brothers)"
          />

          {/* Sisters sub-heading */}
          <p className="mt-4 mb-2 text-sm font-medium text-gray-600">
            Sisters
          </p>
          <StepperButton
            label="Full sisters"
            value={sisterFullCount}
            onChange={setSisterFullCount}
            tooltip="Share both parents with the deceased"
          />
          <StepperButton
            label="Consanguine sisters"
            value={sisterConsanguineCount}
            onChange={setSisterConsanguineCount}
            tooltip="Share only the father (paternal half-sisters)"
          />
          <StepperButton
            label="Uterine sisters"
            value={sisterUterineCount}
            onChange={setSisterUterineCount}
            tooltip="Share only the mother (maternal half-sisters)"
          />
        </div>
      )}

      {/* Toggle for different sibling types */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSiblingTypeExpanded(!siblingTypeExpanded)}
          className="cursor-pointer text-sm text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {siblingTypeExpanded
            ? 'Show simple view'
            : 'Different types of siblings?'}
        </button>
        <Tooltip content="In Islamic inheritance, siblings have different shares based on whether they share both parents (full), only the father (consanguine/paternal), or only the mother (uterine/maternal)." />
      </div>
    </div>
  )
}
