interface QurahCeremonyProps {
  onDraw: () => void
  isRevealed: boolean
  hasDrawn: boolean
}

export function QurahCeremony({
  onDraw,
  isRevealed,
  hasDrawn,
}: QurahCeremonyProps) {
  const hasCompletedDraw = hasDrawn || isRevealed

  return (
    <div className="space-y-4">
      {/* Bismillah header */}
      <div className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl leading-relaxed text-gold-600"
        >
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <p className="mt-2 text-sm text-gold-500">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </div>

      {/* Draw button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onDraw}
          className="rounded-xl bg-gold-600 px-8 py-3 font-semibold text-white hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          {hasCompletedDraw ? 'Re-Draw Lots (Qurah)' : 'Draw Lots (Qurah)'}
        </button>
      </div>
    </div>
  )
}
