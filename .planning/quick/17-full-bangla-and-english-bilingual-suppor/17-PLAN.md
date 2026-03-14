---
phase: quick-17
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  # i18n infrastructure
  - src/i18n/LanguageContext.tsx
  - src/i18n/translations/en.ts
  - src/i18n/translations/bn.ts
  - src/i18n/translations/index.ts
  - src/i18n/useTranslation.ts
  # Font loading
  - index.html
  - src/index.css
  - src/assets/fonts/NotoSansBengali-Regular.ttf
  - src/components/pdf/pdfFonts.ts
  # App wrapper
  - src/main.tsx
  - src/App.tsx
  # Layout + header (language switcher)
  - src/components/layout/AppLayout.tsx
  # Core display utils (bilingual labels)
  - src/core/utils/display.ts
  - src/types/wizard.ts
  # Data files (bilingual labels)
  - src/data/bd-land-data.ts
  - src/data/movable-asset-data.ts
  # Wizard components
  - src/components/wizard/WizardShell.tsx
  - src/components/wizard/StepRelationship.tsx
  - src/components/wizard/StepFamilyAndSiblings.tsx
  - src/components/wizard/FamilyTree.tsx
  - src/components/ui/StepIndicator.tsx
  - src/components/ui/StepperButton.tsx
  # Estate / property components
  - src/components/assets/StepEstateInventory.tsx
  - src/components/assets/MovableAssetList.tsx
  - src/components/assets/MovableAssetCard.tsx
  - src/components/assets/GoldSilverForm.tsx
  - src/components/assets/GoldRateSuggestion.tsx
  - src/components/assets/GoldUnitConversion.tsx
  - src/components/assets/VehicleForm.tsx
  - src/components/assets/LivestockForm.tsx
  - src/components/assets/IndivisibleCard.tsx
  - src/components/assets/CustomItemForm.tsx
  - src/components/assets/SimpleValueForm.tsx
  - src/components/assets/AssetRunningTotal.tsx
  - src/components/property/StepProperties.tsx
  - src/components/property/PropertyCard.tsx
  - src/components/property/PropertyTypeSelector.tsx
  - src/components/property/PropertyValueInput.tsx
  - src/components/property/LandAreaInput.tsx
  - src/components/property/HouseDetailSection.tsx
  - src/components/property/TreeCropSection.tsx
  - src/components/property/PondSection.tsx
  - src/components/property/ConversionDisplay.tsx
  - src/components/property/MouzaRateSuggestion.tsx
  - src/components/property/PropertyRunningTotal.tsx
  # Results components
  - src/components/results/ResultsPage.tsx
  - src/components/results/HeirCard.tsx
  - src/components/results/EstateBreakdownCard.tsx
  - src/components/results/AdjustmentBanner.tsx
  - src/components/results/SpecialCaseCallout.tsx
  - src/components/results/BlockedHeirsSection.tsx
  - src/components/results/ChartSection.tsx
  - src/components/results/IslamicBasisSection.tsx
  - src/components/results/ModeToggle.tsx
  - src/components/results/StepAccordion.tsx
  - src/components/results/QuranReference.tsx
  - src/components/results/SharePieChart.tsx
  - src/components/results/MonetaryBarChart.tsx
  # Scenarios
  - src/components/scenarios/ScenariosPage.tsx
  - src/components/scenarios/ScenarioCard.tsx
  - src/components/scenarios/ComparisonView.tsx
  - src/components/scenarios/EmptyState.tsx
  # Distribution
  - src/components/distribution/DistributionPage.tsx
  - src/components/distribution/DistributionControls.tsx
  - src/components/distribution/DistributionBoard.tsx
  - src/components/distribution/HeirColumn.tsx
  - src/components/distribution/AssetCard.tsx
  - src/components/distribution/SummaryBanner.tsx
  - src/components/distribution/EquilibriumBar.tsx
  - src/components/distribution/MobileFallback.tsx
  - src/components/distribution/SettlementPanel.tsx
  - src/components/distribution/SellSplitDetail.tsx
  - src/components/distribution/PhysicalDivisionDetail.tsx
  - src/components/distribution/BuyoutDetail.tsx
  - src/components/distribution/JointOwnershipDetail.tsx
  - src/components/distribution/IndividualBoard.tsx
  - src/components/distribution/IndividualColumn.tsx
  - src/components/distribution/IndividualMobileFallback.tsx
  - src/components/distribution/IndividualQurahCeremony.tsx
  - src/components/distribution/ParcelSplitDialog.tsx
  - src/components/distribution/ViewToggle.tsx
  - src/components/distribution/InlineRename.tsx
  # Division
  - src/components/division/CompensationBanner.tsx
  - src/components/division/QurahCeremony.tsx
  # JSON import/export
  - src/components/json/ImportDropZone.tsx
  - src/components/json/ImportConfirmDialog.tsx
  - src/components/json/Toast.tsx
  # PDF components
  - src/components/pdf/PdfDocument.tsx
  - src/components/pdf/PdfHeader.tsx
  - src/components/pdf/PdfHeirTable.tsx
  - src/components/pdf/PdfDisclaimer.tsx
  - src/components/pdf/PdfStepsSection.tsx
  - src/components/pdf/PdfReferencesSection.tsx
  - src/components/pdf/PdfPropertySection.tsx
  - src/components/pdf/PdfMovableAssetsSection.tsx
  - src/components/pdf/PdfDistributionSection.tsx
  - src/components/pdf/PdfIndividualSection.tsx
  - src/components/pdf/PdfSettlementSection.tsx
  - src/components/pdf/PdfChartSection.tsx
  - src/components/pdf/extractPdfData.ts
  - src/components/pdf/pdfTypes.ts
  # PDF export hook
  - src/hooks/usePdfExport.tsx
autonomous: true
must_haves:
  truths:
    - "User can switch between English and Bangla using a toggle in the header"
    - "All UI text (labels, headings, descriptions, buttons, tooltips) renders in the selected language"
    - "Language preference persists across page reloads via localStorage"
    - "Bangla text renders correctly with proper Bengali font"
    - "PDF export generates content in the currently selected language"
    - "Bangla feels native -- heir type names, property labels, button text all in proper Bangla, not transliteration"
  artifacts:
    - path: "src/i18n/LanguageContext.tsx"
      provides: "React context for language state + toggle + persistence"
    - path: "src/i18n/translations/en.ts"
      provides: "Complete English translation object"
    - path: "src/i18n/translations/bn.ts"
      provides: "Complete Bangla translation object"
    - path: "src/i18n/useTranslation.ts"
      provides: "Hook returning typed t() function and current language"
  key_links:
    - from: "src/main.tsx"
      to: "src/i18n/LanguageContext.tsx"
      via: "LanguageProvider wraps App"
      pattern: "LanguageProvider"
    - from: "src/components/layout/AppLayout.tsx"
      to: "src/i18n/useTranslation.ts"
      via: "useTranslation hook for language switcher"
      pattern: "useTranslation"
    - from: "src/hooks/usePdfExport.tsx"
      to: "src/i18n/translations"
      via: "passes language to PDF data extraction"
      pattern: "language|lang"
---

<objective>
Add full Bangla and English bilingual support to the entire Jomi-Bhag site.

Purpose: The app targets Bangladeshi users who predominantly speak Bangla. Making the entire UI available in both Bangla and English ensures the app feels native and accessible to its target audience.

Output: Complete i18n system with language switcher, all UI text translated, PDF export respecting selected language, and Bangla font rendering properly.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key existing patterns:
- All UI text is hardcoded English strings in ~90 component files
- HEIR_TYPE_LABELS and SHARE_TYPE_LABELS in src/core/utils/display.ts are the main label maps
- WIZARD_STEPS in src/types/wizard.ts has step label strings
- Data files (bd-land-data.ts, movable-asset-data.ts) have label fields
- PDF uses @react-pdf/renderer with static TTF fonts (Inter, Noto Naskh Arabic)
- Google Fonts loaded via CSS @import in index.html (Inter, Noto Naskh Arabic)
- App uses Zustand for state, motion/react for animations, TailwindCSS 4 for styling
- No existing i18n library -- this is greenfield
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create i18n infrastructure and complete translation files</name>
  <files>
    src/i18n/LanguageContext.tsx
    src/i18n/useTranslation.ts
    src/i18n/translations/en.ts
    src/i18n/translations/bn.ts
    src/i18n/translations/index.ts
    index.html
    src/index.css
    src/main.tsx
    src/components/pdf/pdfFonts.ts
  </files>
  <action>
    Build a lightweight context-based i18n system (no external library needed for this app size).

    **1. Translation files (src/i18n/translations/en.ts and bn.ts):**
    Create a flat-ish nested object structure covering ALL UI strings in the app. The structure should be organized by domain:

    ```typescript
    export const en = {
      // App-level
      app: {
        title: 'Jomi-Bhag',
        subtitle: 'Islamic Inheritance Calculator',
        pageTitle: 'Jomi-Bhag - Islamic Inheritance Calculator',
      },
      // Navigation
      nav: {
        calculator: 'Calculator',
        myScenarios: 'My Scenarios',
      },
      // Wizard steps
      steps: {
        relationship: 'Relationship',
        familyMembers: 'Family Members',
        estateInventory: 'Estate Inventory',
        results: 'Results',
        // Short labels for mobile
        relationshipShort: 'Relationship',
        familyShort: 'Family',
        estateShort: 'Estate',
        resultsShort: 'Results',
      },
      // Step 1: Relationship
      relationship: {
        iAmThe: "I am the deceased's...",
        son: 'Son',
        daughter: 'Daughter',
        isMotherAlive: "Is the deceased's wife (your mother) alive?",
        yes: 'Yes',
        no: 'No',
        deceasedWas: 'The deceased was...',
        male: 'Male',
        female: 'Female',
        advancedOptions: 'Advanced options',
        applyMflo: 'Apply MFLO Section 4 (orphaned grandchildren)',
        mfloTooltip: 'The Muslim Family Laws Ordinance 1961 Section 4 allows orphaned grandchildren to inherit their parent\'s share. This diverges from traditional Hanafi jurisprudence.',
        mfloWarning: 'MFLO Section 4 modifies traditional Hanafi inheritance rules. Consult a qualified scholar for guidance.',
        orImportFromFile: 'or import from file',
        assumesParentsDeceased: "This calculator assumes the deceased's parents have passed away",
      },
      // Step 2: Family Members
      family: {
        spouseAndChildren: 'Spouse & Children',
        wives: 'Wives',
        husband: 'Husband',
        sons: 'Sons',
        daughters: 'Daughters',
        siblings: 'Siblings',
        showSiblings: 'Show siblings',
        hideSiblings: 'Hide siblings',
        fullBrothers: 'Full Brothers',
        fullSisters: 'Full Sisters',
        paternalBrothers: 'Paternal Brothers',
        paternalSisters: 'Paternal Sisters',
        maternalBrothers: 'Maternal Brothers',
        maternalSisters: 'Maternal Sisters',
        includesYou: '(includes you)',
      },
      // Step 3: Estate
      estate: {
        properties: 'Properties',
        addProperty: 'Add Property',
        movableAssets: 'Movable Assets',
        addAsset: 'Add Asset',
        noProperties: 'No properties added yet',
        noAssets: 'No assets added yet',
        totalEstateValue: 'Total Estate Value',
        propertyValue: 'Property Value',
        landArea: 'Land Area',
        // ... many more (executor should extract ALL strings from property/asset components)
      },
      // ... (executor extracts all remaining sections)
    }
    ```

    The bn.ts file should have the EXACT same structure with proper Bangla translations. Key Bangla translations for reference:
    - Jomi-Bhag = জমি-ভাগ
    - Islamic Inheritance Calculator = ইসলামিক উত্তরাধিকার ক্যালকুলেটর
    - Calculator = ক্যালকুলেটর
    - My Scenarios = আমার পরিস্থিতি
    - Relationship = সম্পর্ক
    - Family Members = পরিবারের সদস্য
    - Estate Inventory = সম্পত্তির তালিকা
    - Results = ফলাফল
    - Heir types: Husband=স্বামী, Wife=স্ত্রী, Son=ছেলে, Daughter=মেয়ে, Father=পিতা, Mother=মাতা, etc.
    - Son's Son=ছেলের ছেলে, Son's Daughter=ছেলের মেয়ে
    - Full Brother=সহোদর ভাই, Full Sister=সহোদর বোন
    - Paternal Brother=বৈমাত্রেয় ভাই, Paternal Sister=বৈমাত্রেয় বোন
    - Maternal Brother=বৈপিত্রেয় ভাই, Maternal Sister=বৈপিত্রেয় বোন
    - Paternal Grandfather=দাদা, Paternal Grandmother=দাদি, Maternal Grandmother=নানি
    - Fixed Share (Fard)=নির্ধারিত অংশ (ফরজ), Residuary (Asaba)=অবশিষ্টাংশ (আসাবা)
    - Back=পেছনে, Next=পরবর্তী, Calculate Shares=অংশ হিসাব করুন
    - Download PDF=পিডিএফ ডাউনলোড, Print=প্রিন্ট, Export JSON=JSON রপ্তানি
    - Inheritance Results=উত্তরাধিকার ফলাফল
    - Inheritance Summary=উত্তরাধিকার সারসংক্ষেপ
    - Heir=উত্তরাধিকারী, Share=অংশ, Amount=পরিমাণ
    - Properties=সম্পত্তি, Agricultural=কৃষি, Residential=আবাসিক, Commercial=বাণিজ্যিক
    - Gold/Silver=স্বর্ণ/রৌপ্য, Cash=নগদ, Vehicle=যানবাহন
    - Distribute Assets=সম্পদ বন্টন করুন
    - Edit Heirs=উত্তরাধিকারী সম্পাদনা, Edit Properties=সম্পত্তি সম্পাদনা
    - Simple=সাধারণ, Detailed=বিস্তারিত
    - Blocked Heirs=বঞ্চিত উত্তরাধিকারী
    - Important Notices=গুরুত্বপূর্ণ নোটিশ
    - Generated on=তৈরি হয়েছে
    - Page X of Y=পৃষ্ঠা X / Y
    - Months in Bangla: জানুয়ারি, ফেব্রুয়ারি, মার্চ, এপ্রিল, মে, জুন, জুলাই, আগস্ট, সেপ্টেম্বর, অক্টোবর, নভেম্বর, ডিসেম্বর
    - BDT/Taka related: টাকা
    - Randomize=এলোমেলো করুন, Auto-distribute=স্বয়ংক্রিয় বন্টন, Undo=পূর্বাবস্থায়

    The executor MUST go through EVERY component file listed in files_modified and extract ALL hardcoded English strings into the translation files. Do not leave any English text hardcoded in components.

    **2. LanguageContext.tsx:**
    ```typescript
    type Language = 'en' | 'bn'
    interface LanguageContextValue {
      language: Language
      setLanguage: (lang: Language) => void
      t: (key: string) => string
    }
    ```
    - Read initial language from localStorage key 'jomi-bhag-lang', default to 'bn' (Bangla-first for target audience)
    - On language change, persist to localStorage
    - The t() function takes a dot-notation key like 'nav.calculator' and looks up the nested value
    - Export LanguageProvider component and useLanguage hook

    **3. useTranslation.ts:**
    A convenience hook wrapping useLanguage that returns `{ t, language, setLanguage, isEn, isBn }`.

    **4. index.html updates:**
    - Add Noto Sans Bengali Google Font link: `https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap`
    - Change `lang="en"` to be dynamic (or keep it and let React update it)

    **5. src/index.css updates:**
    - Add `--font-bengali: 'Noto Sans Bengali', sans-serif;` to the @theme block
    - Update `--font-sans` to include `'Noto Sans Bengali'` as a fallback for Bengali text rendering

    **6. PDF font registration (pdfFonts.ts):**
    - Download NotoSansBengali-Regular.ttf static weight font to src/assets/fonts/
    - Register it with @react-pdf/renderer Font.register() as family 'Noto Sans Bengali'
    - The executor should get the static TTF from Google Fonts static directory or use a direct download URL

    **7. main.tsx:**
    - Wrap `<App />` with `<LanguageProvider>` inside StrictMode

    IMPORTANT: The translation files must be EXHAUSTIVE. Go through every component file and extract every user-visible English string. Use the component structure to organize the keys logically. The bn.ts translations must be authentic Bangla, not transliteration. For Islamic/legal terms, use the standard Bangla equivalents that a Bangladeshi Muslim would recognize.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | head -50</automated>
  </verify>
  <done>
    - LanguageContext with provider, hook, and t() function exists and type-checks
    - en.ts and bn.ts translation files exist with complete coverage of all UI strings
    - Noto Sans Bengali font loaded in both CSS (for browser) and PDF renderer
    - LanguageProvider wraps App in main.tsx
    - Language defaults to 'bn' and persists in localStorage
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate translations into all components and add language switcher</name>
  <files>
    src/components/layout/AppLayout.tsx
    src/core/utils/display.ts
    src/types/wizard.ts
    src/data/bd-land-data.ts
    src/data/movable-asset-data.ts
    src/components/wizard/WizardShell.tsx
    src/components/wizard/StepRelationship.tsx
    src/components/wizard/StepFamilyAndSiblings.tsx
    src/components/wizard/FamilyTree.tsx
    src/components/ui/StepIndicator.tsx
    src/components/assets/StepEstateInventory.tsx
    src/components/assets/MovableAssetList.tsx
    src/components/assets/MovableAssetCard.tsx
    src/components/assets/GoldSilverForm.tsx
    src/components/assets/GoldRateSuggestion.tsx
    src/components/assets/GoldUnitConversion.tsx
    src/components/assets/VehicleForm.tsx
    src/components/assets/LivestockForm.tsx
    src/components/assets/IndivisibleCard.tsx
    src/components/assets/CustomItemForm.tsx
    src/components/assets/SimpleValueForm.tsx
    src/components/assets/AssetRunningTotal.tsx
    src/components/property/StepProperties.tsx
    src/components/property/PropertyCard.tsx
    src/components/property/PropertyTypeSelector.tsx
    src/components/property/PropertyValueInput.tsx
    src/components/property/LandAreaInput.tsx
    src/components/property/HouseDetailSection.tsx
    src/components/property/TreeCropSection.tsx
    src/components/property/PondSection.tsx
    src/components/property/ConversionDisplay.tsx
    src/components/property/MouzaRateSuggestion.tsx
    src/components/property/PropertyRunningTotal.tsx
    src/components/results/ResultsPage.tsx
    src/components/results/HeirCard.tsx
    src/components/results/EstateBreakdownCard.tsx
    src/components/results/AdjustmentBanner.tsx
    src/components/results/SpecialCaseCallout.tsx
    src/components/results/BlockedHeirsSection.tsx
    src/components/results/ChartSection.tsx
    src/components/results/IslamicBasisSection.tsx
    src/components/results/ModeToggle.tsx
    src/components/results/StepAccordion.tsx
    src/components/results/QuranReference.tsx
    src/components/results/SharePieChart.tsx
    src/components/results/MonetaryBarChart.tsx
    src/components/scenarios/ScenariosPage.tsx
    src/components/scenarios/ScenarioCard.tsx
    src/components/scenarios/ComparisonView.tsx
    src/components/scenarios/EmptyState.tsx
    src/components/distribution/DistributionPage.tsx
    src/components/distribution/DistributionControls.tsx
    src/components/distribution/DistributionBoard.tsx
    src/components/distribution/HeirColumn.tsx
    src/components/distribution/AssetCard.tsx
    src/components/distribution/SummaryBanner.tsx
    src/components/distribution/EquilibriumBar.tsx
    src/components/distribution/MobileFallback.tsx
    src/components/distribution/SettlementPanel.tsx
    src/components/distribution/SellSplitDetail.tsx
    src/components/distribution/PhysicalDivisionDetail.tsx
    src/components/distribution/BuyoutDetail.tsx
    src/components/distribution/JointOwnershipDetail.tsx
    src/components/distribution/IndividualBoard.tsx
    src/components/distribution/IndividualColumn.tsx
    src/components/distribution/IndividualMobileFallback.tsx
    src/components/distribution/IndividualQurahCeremony.tsx
    src/components/distribution/ParcelSplitDialog.tsx
    src/components/distribution/ViewToggle.tsx
    src/components/distribution/InlineRename.tsx
    src/components/division/CompensationBanner.tsx
    src/components/division/QurahCeremony.tsx
    src/components/json/ImportDropZone.tsx
    src/components/json/ImportConfirmDialog.tsx
    src/components/json/Toast.tsx
  </files>
  <action>
    Systematically replace all hardcoded English strings with t() calls across every component.

    **1. Language switcher in AppLayout.tsx:**
    Add a compact language toggle in the header, positioned to the right of the title. Use a simple button showing "EN | BN" or "English | বাংলা" with the active language highlighted. Style it with emerald accent colors consistent with the app's theme. On mobile, place it in the top-right corner of the header.

    Example structure:
    ```tsx
    <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium ...">
      {language === 'en' ? 'বাংলা' : 'English'}
    </button>
    ```
    Also update the html lang attribute dynamically: add a useEffect in AppLayout or App that sets `document.documentElement.lang = language`.

    Also apply `font-bengali` class or font-family when language is 'bn' to the root container, so Bengali text renders with the correct font.

    **2. Core display.ts changes:**
    Make HEIR_TYPE_LABELS and SHARE_TYPE_LABELS language-aware. Two approaches (choose the simpler one):
    - Option A: Convert to functions: `getHeirTypeLabel(type: HeirType, lang: Language): string`
    - Option B: Make them bilingual records: `Record<HeirType, { en: string; bn: string }>`

    Use Option A (functions) since the existing codebase uses these as simple lookups. Add a function signature like:
    ```typescript
    export function getHeirTypeLabel(type: HeirType, language: Language): string
    export function getShareTypeLabel(type: string, language: Language): string
    ```
    Keep the old HEIR_TYPE_LABELS and SHARE_TYPE_LABELS exports as aliases (defaulting to English) so any test files that import them still work unchanged.

    **3. types/wizard.ts WIZARD_STEPS:**
    Make step labels bilingual. Either:
    - Change the label/shortLabel to use translation keys and look them up at render time (preferred -- keep data static, translate at render)
    - The StepIndicator component should use t('steps.relationship') etc. instead of step.label directly

    **4. Data files (bd-land-data.ts, movable-asset-data.ts):**
    Add `labelBn` field alongside `label` for PROPERTY_TYPES, CONSTRUCTION_TYPES, CONDITION_OPTIONS, TREE_SPECIES, VEHICLE_TYPES, LIVESTOCK_TYPES, ASSET_CATEGORIES. Then components pick the right label based on language.

    Example:
    ```typescript
    { value: 'agricultural' as PropertyType, label: 'Agricultural', labelBn: 'কৃষি', icon: '...' },
    ```

    **5. Component-by-component integration:**
    For each component file:
    a) Add `const { t, language } = useTranslation()` at the top of the component function
    b) Replace every hardcoded English string with the corresponding t() call
    c) For data-driven labels (from PROPERTY_TYPES, VEHICLE_TYPES etc.), use the `labelBn` field: `language === 'bn' ? item.labelBn : item.label`
    d) For HEIR_TYPE_LABELS usage, replace with `getHeirTypeLabel(type, language)`

    **CRITICAL patterns to handle:**
    - Template literals with variables: `\`${label} #${index}\`` needs a t() function that supports interpolation, OR construct the string using the translated parts
    - Conditional text: e.g. "blocked by X" needs `t('results.blockedBy', { blocker })` or similar interpolation pattern
    - Plural forms: "1 Son" vs "2 Sons" -- Bangla doesn't pluralize the same way, so just use the base form with count
    - aria-labels: These should also be translated for accessibility
    - Number formatting: When in Bangla mode, consider using Bengali numerals (optional, can keep Arabic numerals for now as they are universally understood in BD)

    **Do NOT touch:**
    - Test files (they can keep using English assertions)
    - Core engine files (faraid/, land/, assets/ logic files -- these are data, not UI)
    - Store files (no UI strings)
    - Quran/hadith reference text (these are Arabic/English scholarly references -- keep as-is; the surrounding UI labels like "Quranic Reference" should be translated)
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | head -50</automated>
  </verify>
  <done>
    - Language switcher visible in header on both desktop and mobile
    - Clicking switcher toggles between English and Bangla
    - ALL component text renders in selected language
    - HEIR_TYPE_LABELS now has language-aware accessor function
    - Data files have labelBn fields for all label arrays
    - No hardcoded English text remains in component JSX (except Quran/hadith Arabic text)
  </done>
</task>

<task type="auto">
  <name>Task 3: PDF bilingual support and verification</name>
  <files>
    src/hooks/usePdfExport.tsx
    src/components/pdf/extractPdfData.ts
    src/components/pdf/pdfTypes.ts
    src/components/pdf/PdfDocument.tsx
    src/components/pdf/PdfHeader.tsx
    src/components/pdf/PdfHeirTable.tsx
    src/components/pdf/PdfDisclaimer.tsx
    src/components/pdf/PdfStepsSection.tsx
    src/components/pdf/PdfReferencesSection.tsx
    src/components/pdf/PdfPropertySection.tsx
    src/components/pdf/PdfMovableAssetsSection.tsx
    src/components/pdf/PdfDistributionSection.tsx
    src/components/pdf/PdfIndividualSection.tsx
    src/components/pdf/PdfSettlementSection.tsx
    src/components/pdf/PdfChartSection.tsx
  </files>
  <action>
    Make PDF export respect the selected language.

    **1. Thread language through PDF pipeline:**

    In usePdfExport.tsx, the hook should read the current language from useTranslation() and pass it to extractPdfData(). Since extractPdfData uses getState() non-reactively, pass language as an explicit parameter.

    Update extractPdfData function signature:
    ```typescript
    export function extractPdfData(language: Language): PdfData
    ```

    In extractPdfData, use `getHeirTypeLabel(type, language)` and `getShareTypeLabel(type, language)` instead of direct HEIR_TYPE_LABELS[type] lookups. All string fields in PdfData (heirType display names, shareType labels, property labels, asset category labels) should be translated.

    **2. PdfData type updates (pdfTypes.ts):**
    No structural changes needed -- all fields are already strings. The extractPdfData function will just populate them with translated strings.

    **3. PDF component updates:**
    All PDF components (PdfHeader, PdfHeirTable, PdfDisclaimer, etc.) have hardcoded English strings for section headings and labels. These need to be translated.

    Since PDF components render in @react-pdf/renderer context (not regular React DOM), they cannot use hooks. Instead, pass the translations as data through PdfData, OR pass a language prop down through PdfDocument.

    Recommended approach: Add `language: Language` field to PdfData. Then in each PDF component, use a simple lookup function (not a hook) to get translated strings:
    ```typescript
    // In each PDF component, import translations directly
    import { en } from '@/i18n/translations/en'
    import { bn } from '@/i18n/translations/bn'

    function getPdfText(language: Language): typeof en { return language === 'bn' ? bn : en }
    ```

    Strings to translate in PDF components:
    - PdfHeader: "Jomi-Bhag", "Islamic Inheritance Division Report", "Generated on {date}"
    - PdfHeirTable: "Heir Share Allocation", "Heir Type", "Count", "Fraction", "Percentage", "Per-Heir BDT", "Total BDT", "Share Type", "Blocked Heirs:", "Special Cases:", adjustment messages
    - PdfDisclaimer: "Important Notices", "Legal Notice", "Islamic Jurisprudence", "Scope", "Property Values", all notice text bodies
    - PdfDocument: Document title, author, subject metadata
    - PdfDocument footer: "Page X of Y"
    - PdfPropertySection: "Property Details", column headers
    - PdfMovableAssetsSection: "Movable Assets", column headers
    - PdfDistributionSection: "Asset Distribution", headers
    - PdfIndividualSection: "Individual Asset Breakdown", headers, equilibrium text markers
    - PdfSettlementSection: "Settlement Plans", method labels
    - PdfStepsSection: "Step-by-Step Calculation"
    - PdfReferencesSection: "Islamic Legal References"
    - PdfChartSection: "Share Distribution" or similar heading
    - Month names in date formatting (PdfHeader, PdfDisclaimer)

    **4. Bengali font in PDF:**
    For PDF rendering of Bangla text, the registered 'Noto Sans Bengali' font must be used. In pdfStyles.ts or directly in PDF components, when language is 'bn', set the fontFamily to 'Noto Sans Bengali'. Since @react-pdf/renderer requires explicit font family assignment, add a conditional font style:
    ```typescript
    const fontFamily = data.language === 'bn' ? 'Noto Sans Bengali' : 'Inter'
    ```

    IMPORTANT: Previous phases discovered that Bengali Unicode causes issues with PDF rendering (sanitizeForPdf was stripping Bengali). Now that we have a proper Bengali font registered, the sanitization in extractPdfData.ts should be updated: when language is 'bn', do NOT strip Bengali characters. The sanitizeForPdf function should be language-aware -- strip Bengali only when generating English PDFs (to avoid font fallback issues), but keep Bengali when generating Bangla PDFs with the Bengali font.

    **5. Build verification:**
    After all changes, run `tsc --noEmit` and `vitest run` to ensure no type errors or test regressions. Fix any issues.

    Note: Existing tests use English assertions and should continue to pass since the default language in tests will be English (localStorage won't be set in test environment, and the context can default to 'en' for test compatibility -- OR keep the 'bn' default and update test expectations if needed; the simpler approach is to default to 'bn' in browser and 'en' in test/SSR environments by checking typeof window).
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit && npx vitest run 2>&1 | tail -30</automated>
  </verify>
  <done>
    - PDF downloads render all text in the currently selected language
    - Bangla PDF uses Noto Sans Bengali font and renders Bengali text correctly
    - English PDF continues to work as before
    - Month names translated in PDF date formatting
    - All disclaimer and notice text translated in PDF
    - tsc --noEmit passes with no errors
    - vitest run passes with no test regressions
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` -- no TypeScript errors
2. `npx vitest run` -- all existing tests pass
3. Manual: Open the app, verify default language is Bangla
4. Manual: Click language toggle, verify all text switches to English
5. Manual: Refresh page, verify language preference persisted
6. Manual: Walk through all 4 wizard steps in Bangla, verify all text is proper Bangla
7. Manual: Generate PDF in Bangla mode, verify Bengali text renders correctly
8. Manual: Generate PDF in English mode, verify English text renders correctly
</verification>

<success_criteria>
- All UI text in ~90 component files translated to both English and Bangla
- Language switcher in header toggles between languages
- Language preference persists in localStorage across reloads
- Bengali font (Noto Sans Bengali) renders properly in browser and PDF
- PDF export respects selected language
- No TypeScript errors, no test regressions
- Bangla feels native -- uses proper Bengali terminology, not transliteration
</success_criteria>

<output>
After completion, create `.planning/quick/17-full-bangla-and-english-bilingual-suppor/17-SUMMARY.md`
</output>
