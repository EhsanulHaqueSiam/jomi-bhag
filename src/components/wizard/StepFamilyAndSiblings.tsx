import { useState, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepperButton } from '@/components/ui/StepperButton'
import { Tooltip } from '@/components/ui/Tooltip'
import type { HeirType } from '@/core/faraid/types'

export function StepFamilyAndSiblings() {
  // Family selectors
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

  // Sibling selectors
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

  /** Check if a specific heir type is auto-included */
  const isAutoIncluded = (type: HeirType) =>
    autoIncludes.some((ai) => ai.type === type)

  // Sibling totals
  const totalBrothers =
    brotherFullCount + brotherConsanguineCount + brotherUterineCount
  const totalSisters =
    sisterFullCount + sisterConsanguineCount + sisterUterineCount
  const hasSiblings = totalBrothers > 0 || totalSisters > 0

  // Collapsible siblings section state
  const [siblingsExpanded, setSiblingsExpanded] = useState(false)

  // Auto-expand on mount if any sibling count > 0
  useEffect(() => {
    if (hasSiblings) {
      setSiblingsExpanded(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        <h2 className="mb-1 text-lg font-semibold text-gray-800">
          Family Members
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Enter the deceased's spouse, children, and siblings. These are the
          primary heirs with shares defined by Quranic text.
        </p>
      </div>

      {/* Spouse section */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-600">
          Immediate Family
        </h3>
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

      {/* Horizontal divider */}
      <hr className="border-gray-200" />

      {/* Siblings section -- collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setSiblingsExpanded(!siblingsExpanded)}
          className="flex w-full items-center gap-2 text-left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              siblingsExpanded ? 'rotate-90' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-emerald-600">
            {siblingsExpanded
              ? 'Siblings'
              : hasSiblings
                ? `Siblings (${totalBrothers + totalSisters} added)`
                : 'Add siblings (optional)'}
          </span>
        </button>

        {siblingsExpanded && (
          <div className="mt-3 space-y-4 pl-6">
            <p className="text-sm text-gray-500">
              Siblings inherit when there are no sons or paternal grandsons.
              Their share depends on whether they are full, consanguine, or
              uterine.
            </p>

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
        )}
      </div>
    </div>
  )
}
