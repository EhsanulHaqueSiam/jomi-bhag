import { useWizardStore } from '@/stores/wizardStore'
import { StepperButton } from '@/components/ui/StepperButton'
import type { HeirType } from '@/core/faraid/types'

export function StepFamily() {
  const deceasedGender = useWizardStore((s) => s.deceasedGender)
  const wifeCount = useWizardStore((s) => s.wifeCount)
  const husbandPresent = useWizardStore((s) => s.husbandPresent)
  const sonCount = useWizardStore((s) => s.sonCount)
  const daughterCount = useWizardStore((s) => s.daughterCount)
  const autoIncludes = useWizardStore((s) => s.autoIncludes)
  const setWifeCount = useWizardStore((s) => s.setWifeCount)
  const setHusbandPresent = useWizardStore((s) => s.setHusbandPresent)
  const setSonCount = useWizardStore((s) => s.setSonCount)
  const setDaughterCount = useWizardStore((s) => s.setDaughterCount)

  /** Check if a specific heir type is auto-included */
  const isAutoIncluded = (type: HeirType) =>
    autoIncludes.some((ai) => ai.type === type)

  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-800">
          Immediate Family
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Enter the deceased's spouse and children. In Islamic inheritance,
          spouses and children are primary heirs with guaranteed shares
          (Quranic fixed shares).
        </p>
      </div>

      {/* Spouse section */}
      <div>
        {deceasedGender === 'male' && (
          <div className="relative">
            <StepperButton
              label="Wives"
              value={wifeCount}
              min={0}
              max={4}
              onChange={setWifeCount}
            />
            {isAutoIncluded('wife') && (
              <span className="absolute right-0 top-0 text-xs text-emerald-600">
                (includes mother)
              </span>
            )}
          </div>
        )}

        {deceasedGender === 'female' && (
          <div className="flex items-center justify-between py-3">
            <span className="font-medium text-gray-700">
              Was she married?
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={husbandPresent}
              onClick={() => setHusbandPresent(!husbandPresent)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                husbandPresent ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  husbandPresent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {deceasedGender === null && (
          <p className="py-3 text-sm text-amber-600">
            Please select relationship first
          </p>
        )}
      </div>

      {/* Children section */}
      <div className="space-y-1">
        <div className="relative">
          <StepperButton
            label="Sons"
            value={sonCount}
            onChange={setSonCount}
          />
          {isAutoIncluded('son') && (
            <span className="absolute right-0 top-0 text-xs text-emerald-600">
              (includes you)
            </span>
          )}
        </div>
        <div className="relative">
          <StepperButton
            label="Daughters"
            value={daughterCount}
            onChange={setDaughterCount}
          />
          {isAutoIncluded('daughter') && (
            <span className="absolute right-0 top-0 text-xs text-emerald-600">
              (includes you)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
