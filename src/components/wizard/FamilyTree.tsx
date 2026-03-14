import { useWizardStore } from '@/stores/wizardStore'
import type { HeirType } from '@/core/faraid/types'
import { useTranslation } from '@/i18n/useTranslation'
import { getHeirTypeLabel } from '@/core/utils/display'

interface FamilyTreeProps {
  currentStep: number
}

export function FamilyTree({ currentStep }: FamilyTreeProps) {
  const relationship = useWizardStore((s) => s.relationship)

  if (currentStep === 1) {
    return <TreeSelector />
  }

  if (!relationship) return null
  return <TreeDisplay />
}

// ─── Step 1: Interactive relationship selector ─────────────────────────

function TreeSelector() {
  const relationship = useWizardStore((s) => s.relationship)
  const setRelationship = useWizardStore((s) => s.setRelationship)
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50/40 to-white p-4">
      <p className="mb-4 text-center text-sm text-gray-600">
        {t('relationship.clickWhoPassedAway')}
      </p>

      {/* Row 1: Parents (above YOU) */}
      <div className="mb-1 text-center">
        <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          {t('relationship.myParents')}
        </span>
      </div>
      <div className="flex justify-center gap-2">
        <TreeButton
          label={t('relationship.father')}
          selected={relationship === 'father'}
          onClick={() => setRelationship('father')}
        />
        <TreeButton
          label={t('relationship.mother')}
          selected={relationship === 'mother'}
          onClick={() => setRelationship('mother')}
        />
      </div>

      {/* Connector: parents -> YOU */}
      <div className="flex justify-center">
        <div className="h-3 w-px bg-emerald-200" />
      </div>

      {/* Row 2: YOU (center) */}
      <div className="flex justify-center">
        <span className="rounded-full bg-emerald-600 px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md">
          {t('relationship.you')}
        </span>
      </div>

      {/* Connector: YOU -> siblings/spouse */}
      <div className="flex justify-center">
        <div className="h-3 w-px bg-emerald-200" />
      </div>

      {/* Row 3: Siblings (same generation) */}
      <div className="mb-1 text-center">
        <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          {t('relationship.mySiblings')}
        </span>
      </div>
      <div className="flex justify-center gap-2">
        <TreeButton
          label={t('relationship.brother')}
          selected={relationship === 'brother'}
          onClick={() => setRelationship('brother')}
        />
        <TreeButton
          label={t('relationship.sister')}
          selected={relationship === 'sister'}
          onClick={() => setRelationship('sister')}
        />
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-dashed border-gray-200" />

      {/* Row 4: Spouse (same generation) */}
      <div className="mb-1 text-center">
        <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
          {t('relationship.mySpouse')}
        </span>
      </div>
      <div className="flex justify-center gap-2">
        <TreeButton
          label={t('relationship.husband')}
          selected={relationship === 'husband'}
          onClick={() => setRelationship('husband')}
        />
        <TreeButton
          label={t('relationship.wife')}
          selected={relationship === 'wife'}
          onClick={() => setRelationship('wife')}
        />
      </div>

      {/* Other */}
      <div className="mt-3 flex justify-center">
        <TreeButton
          label={t('relationship.other')}
          selected={relationship === 'other'}
          onClick={() => setRelationship('other')}
          ghost
        />
      </div>
    </div>
  )
}

function TreeButton({
  label,
  selected,
  onClick,
  ghost = false,
}: {
  label: string
  selected: boolean
  onClick: () => void
  ghost?: boolean
}) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer'
  const style = selected
    ? 'bg-gray-800 text-white shadow-md ring-2 ring-gray-600'
    : ghost
      ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50'

  return (
    <button type="button" onClick={onClick} className={`${base} ${style}`}>
      {label}
      {selected && <span className="ml-1 text-xs opacity-60">&#x271D;</span>}
    </button>
  )
}

// ─── Steps 2-3: Heir display tree ──────────────────────────────────────

function TreeDisplay() {
  const { t, language } = useTranslation()
  const relationship = useWizardStore((s) => s.relationship)
  const deceasedGender = useWizardStore((s) => s.deceasedGender)
  const wifeCount = useWizardStore((s) => s.wifeCount)
  const husbandPresent = useWizardStore((s) => s.husbandPresent)
  const sonCount = useWizardStore((s) => s.sonCount)
  const daughterCount = useWizardStore((s) => s.daughterCount)
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
  const autoIncludes = useWizardStore((s) => s.autoIncludes)

  const autoCount = (type: HeirType) =>
    autoIncludes.find((ai) => ai.type === type)?.count ?? 0

  // Determine where the user sits in the tree
  const userIsChild =
    relationship === 'father' || relationship === 'mother'
  const userIsSpouse =
    relationship === 'husband' || relationship === 'wife'
  const userIsSibling =
    relationship === 'brother' || relationship === 'sister'

  const deceasedLabel =
    deceasedGender === 'male' ? t('familyTree.deceasedMale') : deceasedGender === 'female' ? t('familyTree.deceasedFemale') : t('familyTree.deceased')

  // Spouse
  const totalWives = wifeCount + autoCount('wife')
  const totalHusband = (husbandPresent ? 1 : 0) + autoCount('husband')
  const hasSpouse =
    (deceasedGender === 'male' && totalWives > 0) ||
    (deceasedGender === 'female' && totalHusband > 0)
  const spouseLabel =
    deceasedGender === 'male'
      ? totalWives === 1
        ? getHeirTypeLabel('wife', language)
        : `${totalWives} ${getHeirTypeLabel('wife', language)}`
      : getHeirTypeLabel('husband', language)

  // Children
  const totalSons = sonCount + autoCount('son')
  const totalDaughters = daughterCount + autoCount('daughter')
  const hasChildren = totalSons > 0 || totalDaughters > 0

  // Siblings
  const totalBrothers =
    brotherFullCount +
    brotherConsanguineCount +
    brotherUterineCount +
    autoCount('brother_full')
  const totalSisters =
    sisterFullCount +
    sisterConsanguineCount +
    sisterUterineCount +
    autoCount('sister_full')
  const hasSiblings = totalBrothers > 0 || totalSisters > 0

  const hasAny = hasSpouse || hasChildren || hasSiblings

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 py-4">
      <p className="mb-3 text-center text-[10px] font-semibold tracking-widest text-emerald-600 uppercase">
        {t('familyTree.familyOverview')}
      </p>

      {/* ── Top row: Siblings (same generation as deceased) ── */}
      {hasSiblings && (
        <>
          <div className="mb-1 text-center">
            <span className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
              {t('familyTree.siblingsOfDeceased')}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {totalBrothers > 0 && (
              <HeirBadge
                label={totalBrothers === 1 ? t('relationship.brother') : `${totalBrothers} ${t('relationship.brother')}`}
                isYou={userIsSibling && relationship === 'brother'}
                autoIncluded={autoCount('brother_full') > 0}
              />
            )}
            {totalSisters > 0 && (
              <HeirBadge
                label={totalSisters === 1 ? t('relationship.sister') : `${totalSisters} ${t('relationship.sister')}`}
                isYou={userIsSibling && relationship === 'sister'}
                autoIncluded={autoCount('sister_full') > 0}
              />
            )}
          </div>
          <div className="flex justify-center">
            <div className="h-2 w-px bg-emerald-200" />
          </div>
        </>
      )}

      {/* ── Middle row: Deceased ══ Spouse ── */}
      <div className="flex items-center justify-center gap-0">
        {/* Deceased */}
        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          {deceasedLabel}
        </span>

        {/* Marriage connector + Spouse */}
        {hasSpouse && (
          <>
            <span className="mx-1 text-xs font-bold text-emerald-400">=</span>
            <HeirBadge
              label={spouseLabel}
              isYou={userIsSpouse}
              autoIncluded={
                deceasedGender === 'male'
                  ? autoCount('wife') > 0
                  : autoCount('husband') > 0
              }
            />
          </>
        )}
      </div>

      {/* ── Connector to children ── */}
      {hasChildren && (
        <div className="flex justify-center">
          <div className="h-3 w-px bg-emerald-300" />
        </div>
      )}

      {/* ── Bottom row: Children ── */}
      {hasChildren && (
        <>
          <div className="mb-1 text-center">
            <span className="text-[9px] font-medium tracking-wider text-gray-400 uppercase">
              {t('familyTree.children')}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {totalSons > 0 && (
              <HeirBadge
                label={totalSons === 1 ? t('relationship.son') : `${totalSons} ${t('relationship.son')}`}
                isYou={userIsChild && autoCount('son') > 0}
                autoIncluded={autoCount('son') > 0}
              />
            )}
            {totalDaughters > 0 && (
              <HeirBadge
                label={
                  totalDaughters === 1
                    ? t('relationship.daughter')
                    : `${totalDaughters} ${t('relationship.daughter')}`
                }
                isYou={userIsChild && autoCount('daughter') > 0}
                autoIncluded={autoCount('daughter') > 0}
              />
            )}
          </div>
        </>
      )}

      {!hasAny && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {t('familyTree.addFamilyMembers')}
        </p>
      )}
    </div>
  )
}

function HeirBadge({
  label,
  isYou,
  autoIncluded,
}: {
  label: string
  isYou: boolean
  autoIncluded: boolean
}) {
  const style = autoIncluded
    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
    : 'bg-white text-gray-700 ring-1 ring-gray-200'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${style}`}>
      {label}
      {isYou && (
        <span className="rounded bg-emerald-600 px-1 py-px text-[8px] font-semibold leading-none text-white">
          you
        </span>
      )}
    </span>
  )
}
