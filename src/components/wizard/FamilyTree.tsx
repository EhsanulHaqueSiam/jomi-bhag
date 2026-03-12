import { useWizardStore } from '@/stores/wizardStore'

interface TreeNode {
  label: string
  count?: number
  type: 'deceased' | 'spouse' | 'child' | 'sibling' | 'user'
  highlight?: boolean
}

export function FamilyTree() {
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

  if (!relationship) return null

  const deceasedLabel =
    deceasedGender === 'male'
      ? 'Deceased (M)'
      : deceasedGender === 'female'
        ? 'Deceased (F)'
        : 'Deceased'

  // Build spouse nodes
  const spouseNodes: TreeNode[] = []
  if (deceasedGender === 'male' && wifeCount > 0) {
    spouseNodes.push({
      label: wifeCount === 1 ? 'Wife' : `Wives`,
      count: wifeCount,
      type: 'spouse',
      highlight: autoIncludes.some((ai) => ai.type === 'wife'),
    })
  }
  if (deceasedGender === 'female' && husbandPresent) {
    spouseNodes.push({
      label: 'Husband',
      type: 'spouse',
      highlight: autoIncludes.some((ai) => ai.type === 'husband'),
    })
  }

  // Build children nodes
  const childNodes: TreeNode[] = []
  if (sonCount > 0) {
    childNodes.push({
      label: sonCount === 1 ? 'Son' : 'Sons',
      count: sonCount,
      type: 'child',
      highlight: autoIncludes.some((ai) => ai.type === 'son'),
    })
  }
  if (daughterCount > 0) {
    childNodes.push({
      label: daughterCount === 1 ? 'Daughter' : 'Daughters',
      count: daughterCount,
      type: 'child',
      highlight: autoIncludes.some((ai) => ai.type === 'daughter'),
    })
  }

  // Build sibling nodes
  const siblingNodes: TreeNode[] = []
  const totalBrothers =
    brotherFullCount + brotherConsanguineCount + brotherUterineCount
  const totalSisters =
    sisterFullCount + sisterConsanguineCount + sisterUterineCount

  if (totalBrothers > 0) {
    siblingNodes.push({
      label: totalBrothers === 1 ? 'Brother' : 'Brothers',
      count: totalBrothers,
      type: 'sibling',
      highlight: autoIncludes.some((ai) => ai.type === 'brother_full'),
    })
  }
  if (totalSisters > 0) {
    siblingNodes.push({
      label: totalSisters === 1 ? 'Sister' : 'Sisters',
      count: totalSisters,
      type: 'sibling',
      highlight: autoIncludes.some((ai) => ai.type === 'sister_full'),
    })
  }

  const hasAnyHeirs =
    spouseNodes.length > 0 ||
    childNodes.length > 0 ||
    siblingNodes.length > 0

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-emerald-700 uppercase">
        Family Overview
      </p>

      <div className="flex flex-col items-center gap-1">
        {/* Deceased node */}
        <NodeBadge
          label={deceasedLabel}
          type="deceased"
        />

        {hasAnyHeirs && (
          <div className="h-4 w-px bg-emerald-300" />
        )}

        {/* Spouse row */}
        {spouseNodes.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {spouseNodes.map((n) => (
                <NodeBadge key={n.label} {...n} />
              ))}
            </div>
            {(childNodes.length > 0 || siblingNodes.length > 0) && (
              <div className="h-3 w-px bg-emerald-200" />
            )}
          </>
        )}

        {/* Children row */}
        {childNodes.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {childNodes.map((n) => (
                <NodeBadge key={n.label} {...n} />
              ))}
            </div>
            {siblingNodes.length > 0 && (
              <div className="h-3 w-px bg-emerald-200" />
            )}
          </>
        )}

        {/* Siblings row */}
        {siblingNodes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {siblingNodes.map((n) => (
              <NodeBadge key={n.label} {...n} />
            ))}
          </div>
        )}

        {!hasAnyHeirs && (
          <p className="mt-1 text-xs text-gray-400">
            Add heirs to see them here
          </p>
        )}
      </div>
    </div>
  )
}

function NodeBadge({
  label,
  count,
  type,
  highlight,
}: TreeNode) {
  const baseStyles = 'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all'

  const typeStyles = {
    deceased: 'bg-gray-800 text-white',
    spouse: highlight
      ? 'bg-emerald-200 text-emerald-800 ring-1 ring-emerald-400'
      : 'bg-white text-gray-700 ring-1 ring-gray-200',
    child: highlight
      ? 'bg-emerald-200 text-emerald-800 ring-1 ring-emerald-400'
      : 'bg-white text-gray-700 ring-1 ring-gray-200',
    sibling: highlight
      ? 'bg-emerald-200 text-emerald-800 ring-1 ring-emerald-400'
      : 'bg-white text-gray-700 ring-1 ring-gray-200',
    user: 'bg-emerald-600 text-white',
  }

  return (
    <span className={`${baseStyles} ${typeStyles[type]}`}>
      {count !== undefined && count > 1 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px]">
          {count}
        </span>
      )}
      {label}
      {highlight && (
        <span className="text-[10px] opacity-70">you</span>
      )}
    </span>
  )
}
