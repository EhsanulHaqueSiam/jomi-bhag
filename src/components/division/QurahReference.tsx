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

export function QurahReference() {
  return (
    <div className="relative rounded-xl border-l-4 border-gold-600 bg-gold-50 p-4">
      <StarIcon className="absolute right-3 top-3 h-5 w-5 text-gold-300" />
      <h3 className="text-sm font-semibold text-gold-700">
        Qurah (القرعة) -- Islamic Lot Drawing
      </h3>
      <p
        dir="rtl"
        lang="ar"
        className="mt-2 font-arabic text-base leading-relaxed text-gold-600"
      >
        وَكَانَ يُقْرِعُ بَيْنَ نِسَائِهِ
      </p>
      <p className="mt-2 pr-6 text-sm leading-relaxed text-gray-700">
        The Prophet (PBUH) used to draw lots among his wives when going on a
        journey. (Sahih Bukhari, Book 62, Hadith 97). Drawing lots (Qurah) is
        the Sunnah method for fairly assigning divided portions when multiple
        parties have equal claims.
      </p>
    </div>
  )
}
