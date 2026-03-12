/**
 * Quranic verse references for Faraid inheritance rules.
 * Each entry contains the Arabic text and English translation
 * for the relevant Surah An-Nisa verses.
 */

export interface QuranReference {
  surah: number
  ayah: number
  arabicText: string
  englishTranslation: string
  context: string
}

/**
 * Map of Quranic references keyed by "surah:ayah".
 * The three primary Faraid verses are Surah An-Nisa 4:11, 4:12, and 4:176.
 */
export const QURAN_REFERENCES: Record<string, QuranReference> = {
  '4:11': {
    surah: 4,
    ayah: 11,
    arabicText:
      'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ ۚ فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ ۖ وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ ۚ وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ ۚ فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ ۚ فَإِن كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ ۚ مِن بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ',
    englishTranslation:
      'Allah instructs you concerning your children: for the male, what is equal to the share of two females. But if there are [only] daughters, two or more, for them is two-thirds of what he left. And if there is only one, for her is half. And for one\'s parents, to each one of them is a sixth of what he left, if he had a child. But if he had no child and the parents [alone] inherit from him, then for his mother is one third. And if he had brothers [or sisters], for his mother is a sixth, after any bequest he [may have] made or debt.',
    context:
      'Shares of children (sons, daughters), parents (father, mother). Primary verse for child inheritance and parental shares.',
  },
  '4:12': {
    surah: 4,
    ayah: 12,
    arabicText:
      'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ ۚ فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ ۚ مِن بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ ۚ وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ ۚ فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم ۚ مِن بَعْدِ وَصِيَّةٍ تُوصُونَ بِهَا أَوْ دَيْنٍ ۗ وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ ۚ فَإِن كَانُوا أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ',
    englishTranslation:
      'And for you is half of what your wives leave, if they have no child. But if they have a child, for you is one-fourth of what they leave, after any bequest they [may have] made or debt. And for them [wives] is one-fourth if you leave no child. But if you leave a child, then for them is an eighth of what you leave, after any bequest you [may have] made or debt. And if a man or woman leaves neither ascendants nor descendants but has a brother or a sister, then for each one of them is a sixth. But if they are more than two, they share a third.',
    context:
      'Shares of spouses (husband, wife) and uterine siblings (Kalalah case). Primary verse for spousal inheritance.',
  },
  '4:176': {
    surah: 4,
    ayah: 176,
    arabicText:
      'يَسْتَفْتُونَكَ قُلِ اللَّهُ يُفْتِيكُمْ فِي الْكَلَالَةِ ۚ إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ ۚ وَهُوَ يَرِثُهَا إِن لَّمْ يَكُن لَّهَا وَلَدٌ ۚ فَإِن كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ ۚ وَإِن كَانُوا إِخْوَةً رِّجَالًا وَنِسَاءً فَلِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ',
    englishTranslation:
      'They request from you a [legal] ruling. Say, "Allah gives you a ruling concerning one having neither combiningthat is, the Kalalah. If a man dies, leaving no child but [only] a sister, she will have half of what he left. And he inherits from her if she [dies and] has no child. But if there are two sisters [or more], they will have two-thirds of what he left. And if there are both brothers and sisters, the male will have the share of two females."',
    context:
      'Shares of full and consanguine siblings in Kalalah (no children, no father). The Kalalah verse.',
  },
}

/**
 * Get a Quran reference by surah:ayah key.
 */
export function getQuranReference(key: string): QuranReference | undefined {
  return QURAN_REFERENCES[key]
}
