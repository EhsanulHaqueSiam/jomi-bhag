/** Content map for special case descriptions. */
const specialCaseInfo: Record<string, { title: string; description: string }> = {
  kalalah: {
    title: 'Kalalah',
    description:
      'The deceased has no children, no father, and no grandfather. Siblings inherit according to Quran 4:12 (uterine) and 4:176 (full/consanguine).',
  },
  umariyyatayn: {
    title: 'Umariyyatayn (Two Omari Cases)',
    description:
      "Per Omar's (RA) ruling: the mother receives 1/3 of the remainder after the spouse's share, not 1/3 of the entire estate.",
  },
  mushtarakah: {
    title: 'Mushtarakah (Shared Case)',
    description:
      "Hanafi ruling: full siblings receive nothing as Asaba when there is no remainder. Note: Shafi'i and Maliki schools would have full siblings share in the uterine siblings' 1/3 portion.",
  },
}

/** Decorative star icon for callout boxes. */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 1l2.39 4.84L17.82 7l-3.91 3.81.92 5.38L10 13.47l-4.83 2.72.92-5.38L2.18 7l5.43-1.16L10 1z" />
    </svg>
  )
}

interface SpecialCaseCalloutProps {
  specialCases: string[]
}

export function SpecialCaseCallout({ specialCases }: SpecialCaseCalloutProps) {
  if (specialCases.length === 0) return null

  return (
    <div className="space-y-3">
      {specialCases.map((caseKey) => {
        const info = specialCaseInfo[caseKey]
        if (!info) return null

        return (
          <div
            key={caseKey}
            className="relative rounded-xl border-l-4 border-gold-600 bg-gold-50 p-4"
          >
            <StarIcon className="absolute right-3 top-3 h-5 w-5 text-gold-300" />
            <h3 className="text-sm font-semibold text-gold-700">
              {info.title}
            </h3>
            <p className="mt-1 pr-6 text-sm leading-relaxed text-gray-700">
              {info.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
