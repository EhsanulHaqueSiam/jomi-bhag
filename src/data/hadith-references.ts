/**
 * Hadith reference data for Faraid inheritance rules.
 * Includes source, narrator, and relevant text for
 * rules derived from Sunnah rather than direct Quranic text.
 */

export interface HadithReference {
  id: string
  source: string
  narrator: string
  arabicText?: string
  englishText: string
  appliesTo: string[]
}

/**
 * Hadith references used in Faraid calculations.
 */
export const HADITH_REFERENCES: HadithReference[] = [
  {
    id: 'bukhari-6732',
    source: 'Sahih al-Bukhari, Book 85 (Al-Faraid), Hadith 6732',
    narrator: 'Ibn Abbas (RA)',
    arabicText:
      'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    englishText:
      'Give the prescribed shares (Faraid) to those who are entitled to them, and whatever remains shall go to the closest male relative (Asaba).',
    appliesTo: ['father', 'paternal_grandfather', 'son', 'son_of_son', 'brother_full', 'brother_consanguine'],
  },
  {
    id: 'bukhari-6735',
    source: 'Sahih al-Bukhari, Book 85 (Al-Faraid), Hadith 6735',
    narrator: 'Ibn Abbas (RA)',
    arabicText:
      'لَا يَرِثُ الْقَاتِلُ شَيْئًا',
    englishText:
      'The killer does not inherit anything. (The Prophet, peace be upon him, established that the father inherits as Asaba when no children exist.)',
    appliesTo: ['father'],
  },
  {
    id: 'muwatta-grandmother',
    source: "Muwatta Imam Malik, Book of Faraid",
    narrator: 'Qabisah ibn Dhuwayb',
    englishText:
      'A grandmother came to Abu Bakr (RA) asking about her inheritance. He said: "You have nothing in the Book of Allah, and I do not know of anything for you in the Sunnah of the Messenger of Allah (peace be upon him). Go back until I ask the people." Al-Mughirah ibn Shu\'bah said: "I was present when the Messenger of Allah (peace be upon him) gave her a sixth." Abu Bakr said: "Was anyone else with you?" Muhammad ibn Maslamah confirmed it. So Abu Bakr gave her a sixth.',
    appliesTo: ['paternal_grandmother', 'maternal_grandmother'],
  },
  {
    id: 'umariyyatayn',
    source: 'Consensus of Companions (Ijma al-Sahabah)',
    narrator: 'Umar ibn al-Khattab (RA)',
    englishText:
      'In the case of husband/wife + mother + father (with no children or siblings), Umar (RA) ruled that the mother receives one-third of the remainder after the spouse\'s share, not one-third of the entire estate. This ruling was agreed upon by the companions and adopted by all four Sunni schools of jurisprudence.',
    appliesTo: ['mother'],
  },
  {
    id: 'hanafi-grandfather-siblings',
    source: 'Hanafi Jurisprudence (Al-Hidayah)',
    narrator: 'Abu Hanifa, based on rulings of Abu Bakr, Umar, and Uthman (RA)',
    englishText:
      'In the Hanafi school, the paternal grandfather blocks all siblings (full, consanguine, and uterine) from inheritance, taking the same position as the father. This differs from the Shafi\'i and Hanbali schools, which allow siblings to inherit alongside the grandfather.',
    appliesTo: ['paternal_grandfather', 'brother_full', 'brother_consanguine', 'brother_uterine', 'sister_full', 'sister_consanguine', 'sister_uterine'],
  },
  {
    id: 'asaba-priority',
    source: 'Sahih al-Bukhari and Sahih Muslim',
    narrator: 'Ibn Abbas (RA)',
    englishText:
      'The Prophet (peace be upon him) said: "Give the prescribed shares to those who are entitled to them, and whatever is left over goes to the nearest male agnate (Asaba)." This establishes the priority order for residuary heirs: son, then son\'s son (however low), then father, then grandfather (however high), then full brother, then consanguine brother.',
    appliesTo: ['son', 'son_of_son', 'father', 'paternal_grandfather', 'brother_full', 'brother_consanguine'],
  },
]

/**
 * Get a Hadith reference by ID.
 */
export function getHadithReference(id: string): HadithReference | undefined {
  return HADITH_REFERENCES.find((h) => h.id === id)
}

/**
 * Get all Hadith references that apply to a given heir type.
 */
export function getHadithReferencesForHeir(heirType: string): HadithReference[] {
  return HADITH_REFERENCES.filter((h) => h.appliesTo.includes(heirType))
}
