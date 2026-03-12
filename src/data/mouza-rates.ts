import type { Division, PropertyType } from '@/core/land/types'

export interface UpazilaInfo {
  value: string
  label: string
  bangla: string
}

export interface MouzaRate {
  agricultural: number // BDT per decimal
  residential: number
  commercial: number
}

/**
 * Upazila lists for each of the 8 BD division HQ districts.
 * Includes city corporation entries for major cities.
 */
export const UPAZILA_BY_DIVISION: Record<Division, UpazilaInfo[]> = {
  dhaka: [
    { value: 'dhaka_city', label: 'Dhaka City Corp', bangla: 'ঢাকা সিটি কর্পোরেশন' },
    { value: 'dhamrai', label: 'Dhamrai', bangla: 'ধামরাই' },
    { value: 'dohar', label: 'Dohar', bangla: 'দোহার' },
    { value: 'keraniganj', label: 'Keraniganj', bangla: 'কেরানীগঞ্জ' },
    { value: 'nawabganj', label: 'Nawabganj', bangla: 'নবাবগঞ্জ' },
    { value: 'savar', label: 'Savar', bangla: 'সাভার' },
  ],
  chittagong: [
    { value: 'chittagong_city', label: 'Chittagong City Corp', bangla: 'চট্টগ্রাম সিটি কর্পোরেশন' },
    { value: 'anwara', label: 'Anwara', bangla: 'আনোয়ারা' },
    { value: 'banshkhali', label: 'Banshkhali', bangla: 'বাঁশখালী' },
    { value: 'boalkhali', label: 'Boalkhali', bangla: 'বোয়ালখালী' },
    { value: 'chandanaish', label: 'Chandanaish', bangla: 'চন্দনাইশ' },
    { value: 'fatikchhari', label: 'Fatikchhari', bangla: 'ফটিকছড়ি' },
    { value: 'hathazari', label: 'Hathazari', bangla: 'হাটহাজারী' },
    { value: 'lohagara', label: 'Lohagara', bangla: 'লোহাগাড়া' },
    { value: 'mirsharai', label: 'Mirsharai', bangla: 'মীরসরাই' },
    { value: 'patiya', label: 'Patiya', bangla: 'পটিয়া' },
    { value: 'rangunia', label: 'Rangunia', bangla: 'রাঙ্গুনিয়া' },
    { value: 'raozan', label: 'Raozan', bangla: 'রাউজান' },
    { value: 'sandwip', label: 'Sandwip', bangla: 'সন্দ্বীপ' },
    { value: 'satkania', label: 'Satkania', bangla: 'সাতকানিয়া' },
    { value: 'sitakunda', label: 'Sitakunda', bangla: 'সীতাকুণ্ড' },
  ],
  rajshahi: [
    { value: 'rajshahi_city', label: 'Rajshahi City Corp', bangla: 'রাজশাহী সিটি কর্পোরেশন' },
    { value: 'bagha', label: 'Bagha', bangla: 'বাঘা' },
    { value: 'bagmara', label: 'Bagmara', bangla: 'বাগমারা' },
    { value: 'charghat', label: 'Charghat', bangla: 'চারঘাট' },
    { value: 'durgapur', label: 'Durgapur', bangla: 'দুর্গাপুর' },
    { value: 'godagari', label: 'Godagari', bangla: 'গোদাগাড়ী' },
    { value: 'mohanpur', label: 'Mohanpur', bangla: 'মোহনপুর' },
    { value: 'paba', label: 'Paba', bangla: 'পবা' },
    { value: 'puthia', label: 'Puthia', bangla: 'পুঠিয়া' },
    { value: 'tanore', label: 'Tanore', bangla: 'তানোর' },
  ],
  khulna: [
    { value: 'khulna_city', label: 'Khulna City Corp', bangla: 'খুলনা সিটি কর্পোরেশন' },
    { value: 'batiaghata', label: 'Batiaghata', bangla: 'বটিয়াঘাটা' },
    { value: 'dacope', label: 'Dacope', bangla: 'দাকোপ' },
    { value: 'dighalia', label: 'Dighalia', bangla: 'দিঘলিয়া' },
    { value: 'dumuria', label: 'Dumuria', bangla: 'ডুমুরিয়া' },
    { value: 'koyra', label: 'Koyra', bangla: 'কয়রা' },
    { value: 'paikgachha', label: 'Paikgachha', bangla: 'পাইকগাছা' },
    { value: 'phultala', label: 'Phultala', bangla: 'ফুলতলা' },
    { value: 'rupsa', label: 'Rupsa', bangla: 'রূপসা' },
    { value: 'terokhada', label: 'Terokhada', bangla: 'তেরখাদা' },
  ],
  barisal: [
    { value: 'barisal_city', label: 'Barisal City Corp', bangla: 'বরিশাল সিটি কর্পোরেশন' },
    { value: 'agailjhara', label: 'Agailjhara', bangla: 'আগৈলঝাড়া' },
    { value: 'babuganj', label: 'Babuganj', bangla: 'বাবুগঞ্জ' },
    { value: 'bakerganj', label: 'Bakerganj', bangla: 'বাকেরগঞ্জ' },
    { value: 'banaripara', label: 'Banaripara', bangla: 'বানারীপাড়া' },
    { value: 'gaurnadi', label: 'Gaurnadi', bangla: 'গৌরনদী' },
    { value: 'hizla', label: 'Hizla', bangla: 'হিজলা' },
    { value: 'mehendiganj', label: 'Mehendiganj', bangla: 'মেহেন্দিগঞ্জ' },
    { value: 'muladi', label: 'Muladi', bangla: 'মুলাদী' },
    { value: 'wazirpur', label: 'Wazirpur', bangla: 'উজিরপুর' },
  ],
  sylhet: [
    { value: 'sylhet_city', label: 'Sylhet City Corp', bangla: 'সিলেট সিটি কর্পোরেশন' },
    { value: 'balaganj', label: 'Balaganj', bangla: 'বালাগঞ্জ' },
    { value: 'beanibazar', label: 'Beanibazar', bangla: 'বিয়ানীবাজার' },
    { value: 'bishwanath', label: 'Bishwanath', bangla: 'বিশ্বনাথ' },
    { value: 'companiganj', label: 'Companiganj', bangla: 'কোম্পানীগঞ্জ' },
    { value: 'fenchuganj', label: 'Fenchuganj', bangla: 'ফেঞ্চুগঞ্জ' },
    { value: 'golapganj', label: 'Golapganj', bangla: 'গোলাপগঞ্জ' },
    { value: 'gowainghat', label: 'Gowainghat', bangla: 'গোয়াইনঘাট' },
    { value: 'jaintiapur', label: 'Jaintiapur', bangla: 'জৈন্তাপুর' },
    { value: 'kanaighat', label: 'Kanaighat', bangla: 'কানাইঘাট' },
    { value: 'osmani_nagar', label: 'Osmani Nagar', bangla: 'ওসমানী নগর' },
    { value: 'south_surma', label: 'South Surma', bangla: 'দক্ষিণ সুরমা' },
    { value: 'zakiganj', label: 'Zakiganj', bangla: 'জকিগঞ্জ' },
  ],
  rangpur: [
    { value: 'rangpur_city', label: 'Rangpur City Corp', bangla: 'রংপুর সিটি কর্পোরেশন' },
    { value: 'badarganj', label: 'Badarganj', bangla: 'বদরগঞ্জ' },
    { value: 'gangachara', label: 'Gangachara', bangla: 'গঙ্গাচড়া' },
    { value: 'kaunia', label: 'Kaunia', bangla: 'কাউনিয়া' },
    { value: 'mithapukur', label: 'Mithapukur', bangla: 'মিঠাপুকুর' },
    { value: 'pirgachha', label: 'Pirgachha', bangla: 'পীরগাছা' },
    { value: 'pirganj', label: 'Pirganj', bangla: 'পীরগঞ্জ' },
    { value: 'taraganj', label: 'Taraganj', bangla: 'তারাগঞ্জ' },
  ],
  mymensingh: [
    { value: 'mymensingh_city', label: 'Mymensingh City', bangla: 'ময়মনসিংহ সিটি' },
    { value: 'bhaluka', label: 'Bhaluka', bangla: 'ভালুকা' },
    { value: 'dhobaura', label: 'Dhobaura', bangla: 'ধোবাউড়া' },
    { value: 'fulbaria', label: 'Fulbaria', bangla: 'ফুলবাড়ীয়া' },
    { value: 'gaffargaon', label: 'Gaffargaon', bangla: 'গফরগাঁও' },
    { value: 'gauripur', label: 'Gauripur', bangla: 'গৌরীপুর' },
    { value: 'haluaghat', label: 'Haluaghat', bangla: 'হালুয়াঘাট' },
    { value: 'ishwarganj', label: 'Ishwarganj', bangla: 'ঈশ্বরগঞ্জ' },
    { value: 'muktagachha', label: 'Muktagachha', bangla: 'মুক্তাগাছা' },
    { value: 'nandail', label: 'Nandail', bangla: 'নান্দাইল' },
    { value: 'phulpur', label: 'Phulpur', bangla: 'ফুলপুর' },
    { value: 'trishal', label: 'Trishal', bangla: 'ত্রিশাল' },
  ],
}

/**
 * Government minimum mouza rates by division and upazila.
 * Rates are BDT per decimal for agricultural, residential, and commercial land.
 * Based on BD government gazette publications (2016 revision).
 *
 * Note: These are government minimum rates, not market prices.
 * Actual market prices are typically 2-10x higher.
 */
const MOUZA_RATES: Record<Division, Record<string, MouzaRate>> = {
  dhaka: {
    dhaka_city: { agricultural: 300000, residential: 5000000, commercial: 10000000 },
    dhamrai: { agricultural: 80000, residential: 500000, commercial: 1000000 },
    dohar: { agricultural: 60000, residential: 400000, commercial: 800000 },
    keraniganj: { agricultural: 200000, residential: 1200000, commercial: 2500000 },
    nawabganj: { agricultural: 100000, residential: 600000, commercial: 1200000 },
    savar: { agricultural: 150000, residential: 800000, commercial: 1800000 },
  },
  chittagong: {
    chittagong_city: { agricultural: 200000, residential: 3000000, commercial: 6000000 },
    anwara: { agricultural: 40000, residential: 250000, commercial: 500000 },
    banshkhali: { agricultural: 30000, residential: 200000, commercial: 400000 },
    boalkhali: { agricultural: 45000, residential: 280000, commercial: 550000 },
    chandanaish: { agricultural: 35000, residential: 220000, commercial: 450000 },
    fatikchhari: { agricultural: 40000, residential: 260000, commercial: 520000 },
    hathazari: { agricultural: 60000, residential: 400000, commercial: 800000 },
    lohagara: { agricultural: 30000, residential: 180000, commercial: 380000 },
    mirsharai: { agricultural: 35000, residential: 230000, commercial: 480000 },
    patiya: { agricultural: 50000, residential: 350000, commercial: 700000 },
    rangunia: { agricultural: 40000, residential: 270000, commercial: 540000 },
    raozan: { agricultural: 45000, residential: 300000, commercial: 600000 },
    sandwip: { agricultural: 25000, residential: 160000, commercial: 320000 },
    satkania: { agricultural: 35000, residential: 240000, commercial: 480000 },
    sitakunda: { agricultural: 45000, residential: 320000, commercial: 650000 },
  },
  rajshahi: {
    rajshahi_city: { agricultural: 100000, residential: 1500000, commercial: 3000000 },
    bagha: { agricultural: 25000, residential: 150000, commercial: 300000 },
    bagmara: { agricultural: 30000, residential: 180000, commercial: 360000 },
    charghat: { agricultural: 25000, residential: 160000, commercial: 320000 },
    durgapur: { agricultural: 20000, residential: 120000, commercial: 250000 },
    godagari: { agricultural: 20000, residential: 130000, commercial: 260000 },
    mohanpur: { agricultural: 35000, residential: 200000, commercial: 400000 },
    paba: { agricultural: 40000, residential: 250000, commercial: 500000 },
    puthia: { agricultural: 30000, residential: 170000, commercial: 350000 },
    tanore: { agricultural: 25000, residential: 140000, commercial: 280000 },
  },
  khulna: {
    khulna_city: { agricultural: 80000, residential: 1200000, commercial: 2500000 },
    batiaghata: { agricultural: 25000, residential: 160000, commercial: 320000 },
    dacope: { agricultural: 15000, residential: 100000, commercial: 200000 },
    dighalia: { agricultural: 30000, residential: 200000, commercial: 400000 },
    dumuria: { agricultural: 25000, residential: 170000, commercial: 340000 },
    koyra: { agricultural: 15000, residential: 90000, commercial: 180000 },
    paikgachha: { agricultural: 20000, residential: 140000, commercial: 280000 },
    phultala: { agricultural: 35000, residential: 220000, commercial: 450000 },
    rupsa: { agricultural: 30000, residential: 190000, commercial: 380000 },
    terokhada: { agricultural: 20000, residential: 130000, commercial: 260000 },
  },
  barisal: {
    barisal_city: { agricultural: 60000, residential: 800000, commercial: 1600000 },
    agailjhara: { agricultural: 20000, residential: 120000, commercial: 250000 },
    babuganj: { agricultural: 25000, residential: 160000, commercial: 320000 },
    bakerganj: { agricultural: 20000, residential: 130000, commercial: 260000 },
    banaripara: { agricultural: 20000, residential: 140000, commercial: 280000 },
    gaurnadi: { agricultural: 25000, residential: 150000, commercial: 300000 },
    hizla: { agricultural: 15000, residential: 100000, commercial: 200000 },
    mehendiganj: { agricultural: 15000, residential: 110000, commercial: 220000 },
    muladi: { agricultural: 18000, residential: 120000, commercial: 240000 },
    wazirpur: { agricultural: 22000, residential: 145000, commercial: 290000 },
  },
  sylhet: {
    sylhet_city: { agricultural: 120000, residential: 2000000, commercial: 4000000 },
    balaganj: { agricultural: 40000, residential: 250000, commercial: 500000 },
    beanibazar: { agricultural: 35000, residential: 220000, commercial: 440000 },
    bishwanath: { agricultural: 40000, residential: 260000, commercial: 520000 },
    companiganj: { agricultural: 25000, residential: 160000, commercial: 320000 },
    fenchuganj: { agricultural: 30000, residential: 200000, commercial: 400000 },
    golapganj: { agricultural: 35000, residential: 230000, commercial: 460000 },
    gowainghat: { agricultural: 25000, residential: 150000, commercial: 300000 },
    jaintiapur: { agricultural: 30000, residential: 180000, commercial: 360000 },
    kanaighat: { agricultural: 25000, residential: 160000, commercial: 320000 },
    osmani_nagar: { agricultural: 40000, residential: 270000, commercial: 540000 },
    south_surma: { agricultural: 45000, residential: 300000, commercial: 600000 },
    zakiganj: { agricultural: 30000, residential: 190000, commercial: 380000 },
  },
  rangpur: {
    rangpur_city: { agricultural: 60000, residential: 700000, commercial: 1400000 },
    badarganj: { agricultural: 20000, residential: 130000, commercial: 260000 },
    gangachara: { agricultural: 18000, residential: 120000, commercial: 240000 },
    kaunia: { agricultural: 20000, residential: 140000, commercial: 280000 },
    mithapukur: { agricultural: 22000, residential: 150000, commercial: 300000 },
    pirgachha: { agricultural: 18000, residential: 125000, commercial: 250000 },
    pirganj: { agricultural: 20000, residential: 135000, commercial: 270000 },
    taraganj: { agricultural: 18000, residential: 115000, commercial: 230000 },
  },
  mymensingh: {
    mymensingh_city: { agricultural: 70000, residential: 1000000, commercial: 2000000 },
    bhaluka: { agricultural: 30000, residential: 200000, commercial: 400000 },
    dhobaura: { agricultural: 15000, residential: 100000, commercial: 200000 },
    fulbaria: { agricultural: 25000, residential: 160000, commercial: 320000 },
    gaffargaon: { agricultural: 25000, residential: 170000, commercial: 340000 },
    gauripur: { agricultural: 25000, residential: 165000, commercial: 330000 },
    haluaghat: { agricultural: 18000, residential: 110000, commercial: 220000 },
    ishwarganj: { agricultural: 20000, residential: 140000, commercial: 280000 },
    muktagachha: { agricultural: 28000, residential: 180000, commercial: 360000 },
    nandail: { agricultural: 22000, residential: 150000, commercial: 300000 },
    phulpur: { agricultural: 18000, residential: 120000, commercial: 240000 },
    trishal: { agricultural: 30000, residential: 200000, commercial: 400000 },
  },
}

/**
 * Look up government mouza rate for a given division, upazila, and property type.
 * Returns BDT per decimal, or null if no data available.
 *
 * Returns null for:
 * - 'mixed' property type (no single rate applies)
 * - Unknown upazila (no rate data)
 */
export function getMouzaRate(
  division: Division,
  upazila: string,
  propertyType: PropertyType,
): number | null {
  if (propertyType === 'mixed') return null

  const divRates = MOUZA_RATES[division]
  if (!divRates) return null

  const upazilaRate = divRates[upazila]
  if (!upazilaRate) return null

  return upazilaRate[propertyType]
}
