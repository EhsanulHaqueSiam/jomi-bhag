import type { FaraidOutput, HeirType, IslamicReference } from '@/core/faraid/types'
import { QURAN_REFERENCES } from '@/data/quran-references'
import { HADITH_REFERENCES } from '@/data/hadith-references'
import { FARAID_RULES } from '@/data/faraid-rules'

/**
 * Get the Quranic/Hadith reference for a specific share allocation.
 */
export function getShareReference(
  heirType: HeirType,
  _condition?: string
): IslamicReference[] {
  const rule = FARAID_RULES.find((r) => r.heirType === heirType)
  if (!rule) return []

  const refs: IslamicReference[] = []

  // Add Quran reference
  const quranRef = QURAN_REFERENCES[rule.quranRef]
  if (quranRef) {
    refs.push({
      type: 'quran',
      reference: `Quran ${rule.quranRef}`,
      arabicText: quranRef.arabicText,
      englishText: quranRef.englishTranslation,
      appliesTo: [heirType],
    })
  }

  // Add Hadith reference
  if (rule.hadithRef) {
    const hadithRef = HADITH_REFERENCES.find((h) => h.id === rule.hadithRef)
    if (hadithRef) {
      refs.push({
        type: 'hadith',
        reference: hadithRef.source,
        arabicText: hadithRef.arabicText ?? '',
        englishText: hadithRef.englishText,
        appliesTo: [heirType],
      })
    }
  }

  return refs
}

/**
 * Get the reference for a blocking rule.
 */
export function getBlockingReference(
  blocker: HeirType,
  blocked: HeirType
): IslamicReference | undefined {
  // Blocking references are primarily from Hadith and juristic consensus
  const hadith = HADITH_REFERENCES.find(
    (h) => h.appliesTo.includes(blocker) && h.appliesTo.includes(blocked)
  )

  if (hadith) {
    return {
      type: 'hadith',
      reference: hadith.source,
      arabicText: hadith.arabicText ?? '',
      englishText: hadith.englishText,
      appliesTo: [blocker, blocked],
    }
  }

  return undefined
}

/**
 * Get references for adjustment mechanisms (Awl or Radd).
 */
export function getAdjustmentReference(
  adjustmentType: 'awl' | 'radd'
): IslamicReference {
  if (adjustmentType === 'awl') {
    return {
      type: 'hadith',
      reference: 'Ijma (Scholarly Consensus)',
      arabicText: '',
      englishText:
        "Awl (proportional reduction) is applied when the total of prescribed shares exceeds the estate. All scholars agree that shares are proportionally reduced so that each heir receives a fair proportion. This was first applied by Umar ibn al-Khattab (RA) when the shares of husband (1/2) and two sisters (2/3) summed to more than the estate.",
      appliesTo: [],
    }
  }

  return {
    type: 'hadith',
    reference: 'Hanafi Jurisprudence',
    arabicText: '',
    englishText:
      'Radd (return of surplus) is applied when the total of prescribed shares is less than the estate and no Asaba (residuary) heirs exist. In Hanafi jurisprudence, the surplus is redistributed proportionally to blood-relative fixed-share heirs only. Spouses are excluded from Radd, as their shares are fixed by the Quran and do not increase through redistribution.',
    appliesTo: [],
  }
}

/**
 * Collect all unique Islamic references used in a calculation result.
 */
export function getAllReferences(output: FaraidOutput): IslamicReference[] {
  const seen = new Set<string>()
  const refs: IslamicReference[] = []

  for (const share of output.shares) {
    const shareRefs = getShareReference(share.heirType)
    for (const ref of shareRefs) {
      const key = `${ref.type}:${ref.reference}`
      if (!seen.has(key)) {
        seen.add(key)
        refs.push(ref)
      }
    }
  }

  // Add adjustment reference if applicable
  if (output.adjustment !== 'none') {
    const adjRef = getAdjustmentReference(output.adjustment)
    const key = `${adjRef.type}:${adjRef.reference}`
    if (!seen.has(key)) {
      seen.add(key)
      refs.push(adjRef)
    }
  }

  // Add references from existing output.references that we might have missed
  for (const ref of output.references) {
    const key = `${ref.type}:${ref.reference}`
    if (!seen.has(key)) {
      seen.add(key)
      refs.push(ref)
    }
  }

  return refs
}
