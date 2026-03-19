import { useState } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { StepperButton } from '@/components/ui/StepperButton'
import { Tooltip } from '@/components/ui/Tooltip'
import type { HeirType } from '@/core/faraid/types'
import { useTranslation } from '@/i18n/useTranslation'

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

  const { t } = useTranslation()

  // Collapsible siblings section state
  const [siblingsExpanded, setSiblingsExpanded] = useState(() => hasSiblings)

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
          {t('family.title')}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {t('family.subtitle')}
        </p>
      </div>

      {/* Spouse section */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-600">
          {t('family.immediateFamily')}
        </h3>
        {deceasedGender === 'male' && (
          <div className="relative">
            <StepperButton
              label={t('family.wives')}
              value={wifeCount}
              min={0}
              max={4}
              onChange={setWifeCount}
            />
            {isAutoIncluded('wife') && (
              <span className="absolute right-0 top-0 text-xs text-emerald-600">
                {t('family.includesMother')}
              </span>
            )}
          </div>
        )}

        {deceasedGender === 'female' && (
          <div className="flex items-center justify-between py-3">
            <span className="font-medium text-gray-700">
              {t('family.wasSheMarried')}
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
            {t('family.pleaseSelectRelationship')}
          </p>
        )}
      </div>

      {/* Children section */}
      <div className="space-y-1">
        <div className="relative">
          <StepperButton
            label={t('family.sons')}
            value={sonCount}
            onChange={setSonCount}
          />
          {isAutoIncluded('son') && (
            <span className="absolute right-0 top-0 text-xs text-emerald-600">
              {t('family.includesYou')}
            </span>
          )}
        </div>
        <div className="relative">
          <StepperButton
            label={t('family.daughters')}
            value={daughterCount}
            onChange={setDaughterCount}
          />
          {isAutoIncluded('daughter') && (
            <span className="absolute right-0 top-0 text-xs text-emerald-600">
              {t('family.includesYou')}
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
              ? t('family.siblings')
              : hasSiblings
                ? `${t('family.siblings')} (${totalBrothers + totalSisters})`
                : t('family.addSiblings')}
          </span>
        </button>

        {siblingsExpanded && (
          <div className="mt-3 space-y-4 pl-6">
            <p className="text-sm text-gray-500">
              {t('family.siblingsInfo')}
            </p>

            {!siblingTypeExpanded ? (
              /* Collapsed view: simple Brothers / Sisters steppers */
              <div className="space-y-1">
                <StepperButton
                  label={t('family.brothers')}
                  value={totalBrothers}
                  onChange={handleCollapsedBrotherChange}
                />
                <StepperButton
                  label={t('family.sisters')}
                  value={totalSisters}
                  onChange={handleCollapsedSisterChange}
                />
              </div>
            ) : (
              /* Expanded view: sub-type steppers */
              <div className="space-y-2">
                {/* Brothers sub-heading */}
                <p className="mt-4 mb-2 text-sm font-medium text-gray-600">
                  {t('family.brothers')}
                </p>
                <StepperButton
                  label={t('family.fullBrothers')}
                  value={brotherFullCount}
                  onChange={setBrotherFullCount}
                  tooltip={t('family.fullBrotherTooltip')}
                />
                <StepperButton
                  label={t('family.consanguineBrothers')}
                  value={brotherConsanguineCount}
                  onChange={setBrotherConsanguineCount}
                  tooltip={t('family.consanguineTooltip')}
                />
                <StepperButton
                  label={t('family.uterineBrothers')}
                  value={brotherUterineCount}
                  onChange={setBrotherUterineCount}
                  tooltip={t('family.uterineTooltip')}
                />

                {/* Sisters sub-heading */}
                <p className="mt-4 mb-2 text-sm font-medium text-gray-600">
                  {t('family.sisters')}
                </p>
                <StepperButton
                  label={t('family.fullSisters')}
                  value={sisterFullCount}
                  onChange={setSisterFullCount}
                  tooltip={t('family.fullBrotherTooltip')}
                />
                <StepperButton
                  label={t('family.consanguineSisters')}
                  value={sisterConsanguineCount}
                  onChange={setSisterConsanguineCount}
                  tooltip={t('family.consanguineTooltip')}
                />
                <StepperButton
                  label={t('family.uterineSisters')}
                  value={sisterUterineCount}
                  onChange={setSisterUterineCount}
                  tooltip={t('family.uterineTooltip')}
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
                  ? t('family.simpleView')
                  : t('family.differentTypes')}
              </button>
              <Tooltip content={t('family.siblingTypeTooltip')} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
