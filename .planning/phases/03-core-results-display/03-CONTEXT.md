# Phase 3: Core Results Display - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Display inheritance division results with per-heir share breakdown (fractions, percentages, monetary amounts), Quranic/Hadith justifications, step-by-step calculation explanation, and dual simple/detailed mode toggle. Users can enter a total estate value for monetary calculation. No property-level breakdown (Phase 4/5), no charts (Phase 6), no PDF export (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Share Breakdown Layout
- Card-based layout: one card per heir type (consistent with Phase 2 design language)
- Each card shows: heir type icon, count, share fraction, percentage, share type (Fard/Asaba/Radd-adjusted)
- Multiple heirs of same type: show both per-heir share and total share (e.g., "Each: 7/24 (29.2%), Total: 7/8 (87.5%)")
- Blocked heirs shown in a separate "Blocked Heirs" section below active heir cards — explains who was blocked, by whom, and why (educational per Phase 1 decision)
- Quick total estate value input (BDT) at top of results page — user enters a number, all cards update with monetary amounts instantly. Replaces detailed property-level valuation until Phase 4/5

### Quranic Reference Display
- Expandable inline per card: gold-accented reference label (e.g., "Quran 4:12") on each heir card, collapsed by default
- Expanding shows Arabic text (Noto Naskh Arabic font) + English translation in a styled box within the card
- Grouped "Islamic Basis" section at bottom — collects ALL unique Quran/Hadith references used in the calculation. Visible in detailed mode only. Uses engine's `getAllReferences()` output
- Awl/Radd adjustments: colored info banner at top of results explaining what happened + each affected card marked with badge showing original vs adjusted share
- Special cases (Umariyyatayn, Mushtarakah, Kalalah): highlighted callout box with gold border and Islamic accent, appears between banner area and heir cards. Explains what it is, why it applies, and the ruling followed

### Calculation Explanation
- Numbered accordion: vertical list of numbered steps, each shows short description (always visible), click to expand full detail
- Users can open multiple steps simultaneously
- Visible in detailed mode only — simple mode shows just the heir cards
- Plain language with Islamic terms defined parenthetically: "Sons inherit the remaining estate equally as residuary (Asaba) heirs"
- Fraction math shown in step expansions only (not in collapsed descriptions): "1/2 + 1/6 + 2/3 = 8/6 > 1, Awl applied"

### Simple vs Detailed Mode
- Simple mode is the default (most users are families, not lawyers)
- Toggle: segmented control [Simple | Detailed] next to "Inheritance Results" heading at top
- **Simple mode shows:** heir cards (fraction, %, BDT), expandable Quran refs per card, blocked heirs section, adjustment banner, special case callouts
- **Detailed mode adds:** step-by-step numbered accordion with fraction math, grouped Islamic Basis section with all references

### Results Navigation
- "Edit heirs" button at top of results page — navigates back to wizard with inputs preserved
- Results page is the final step in the wizard flow (step 4 conceptually)

### Claude's Discretion
- Card grid layout (1 vs 2 columns on desktop)
- Exact animation for accordion expand/collapse
- Color coding for share types (Fard vs Asaba vs blocked)
- Loading state design while engine calculates
- Mobile card stacking behavior
- Exact BDT input field styling and formatting (lakh/crore notation)

</decisions>

<specifics>
## Specific Ideas

- Cards should feel clean and modern, consistent with Phase 2's emerald + white aesthetic
- Gold accent specifically for Quranic/Hadith references (established in Phase 2 context)
- Educational tone: users should understand WHY they get their share, building trust (from Phase 1)
- When showing alternative opinions (Mushtarakah), clearly label Hanafi vs other schools (from Phase 1)
- App's core promise is "strictly follows Islam" — every displayed share must be defensible with sources

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FaraidOutput` type: shares[], adjustment, blockedHeirs[], specialCases[], steps[], references[] — all data needed for display
- `ShareResult`: heirType, count, sharePerHeir, totalShare, shareType, quranRef, hadithRef, explanation, notes[]
- `CalculationStep`: step, description, detail — maps directly to numbered accordion
- `IslamicReference`: type, reference, arabicText, englishText, appliesTo
- `getShareReference()`, `getAllReferences()`, `getAdjustmentReference()` — reference lookup functions ready to use
- `Button`, `Tooltip` UI components — reusable from Phase 2
- `motion/react` (Framer Motion) — already installed for step animations
- `useWizardStore.buildFaraidInput()` — builds engine input from wizard state
- `calculateInheritance()` — engine entry point

### Established Patterns
- Zustand for state management (wizardStore pattern)
- TailwindCSS 4 with oklch color values (emerald + gold palette)
- `@/*` path alias for imports
- Noto Naskh Arabic font loaded for Quranic text
- Component-per-file in `src/components/` subdirectories
- Motion/React for animations (AnimatePresence + motion.div)

### Integration Points
- Results component receives `FaraidOutput` from calling `calculateInheritance(wizardStore.buildFaraidInput())`
- Results page is step 4 in WizardShell flow — needs to integrate with existing step navigation
- Step indicator needs to show "Results" as final step (currently 3 steps)
- "Edit heirs" navigates back to wizard steps with state preserved (Zustand already persists)

</code_context>

<deferred>
## Deferred Ideas

- **Physical Land Lot Assignment** — After calculating shares, divide actual land parcels (by name: "Gojarmari", "Chakra" etc.) into groups and randomly assign or let user name each lot's owner. Follows Islamic Qur'ah (drawing lots) for fair division. This is a new capability beyond share calculation — belongs in its own phase after property input (Phase 4/5) is complete.

</deferred>

---

*Phase: 03-core-results-display*
*Context gathered: 2026-03-13*
