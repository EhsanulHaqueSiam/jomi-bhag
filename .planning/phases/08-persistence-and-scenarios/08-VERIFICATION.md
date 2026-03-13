---
phase: 08-persistence-and-scenarios
verified: 2026-03-13T15:35:00Z
status: human_needed
score: 20/20 must-haves verified
re_verification: false
human_verification:
  - test: "Auto-save survives page refresh"
    expected: "After entering heir data and refreshing the browser, all wizard inputs and results are still present"
    why_human: "localStorage persistence works at runtime; cannot be verified by grep or test runner alone"
  - test: "My Scenarios navigation (desktop + mobile)"
    expected: "Desktop shows Calculator/My Scenarios tabs in header; mobile shows bottom bar with Calculator and My Scenarios buttons; both switch pages correctly"
    why_human: "CSS visibility (md:hidden, md:flex) and layout rendering require a browser"
  - test: "Save, rename, load, duplicate, delete scenario end-to-end"
    expected: "Save creates a card with auto-generated name; rename updates name on blur/Enter; load replaces wizard state and navigates to calculator; duplicate appends '(Copy)'; delete shows confirm before removing"
    why_human: "Multi-step user interactions with state changes across two stores require visual confirmation"
  - test: "Unsaved changes warning on load"
    expected: "When wizard has unsaved changes and user clicks Load on a scenario, the inline warning appears with Save & Load / Load Without Saving / Cancel options"
    why_human: "Requires live interaction to trigger the hasUnsavedChanges() path"
  - test: "Side-by-side comparison with amber diff highlighting"
    expected: "Selecting 2 scenarios and clicking Compare shows a two-column desktop layout (stacked on mobile) with heir shares; rows where shares differ have pale amber background; heirs absent in one scenario show '--'"
    why_human: "Visual diff highlighting and responsive layout require browser rendering"
  - test: "Fraction objects survive localStorage round-trip in real browser"
    expected: "After calculating shares, refreshing the page, and navigating to Results, all heir share fractions are correct numbers (not NaN or empty objects)"
    why_human: "The test environment uses a polyfilled localStorage; real browser behavior should be verified once"
---

# Phase 8: Persistence and Scenarios Verification Report

**Phase Goal:** Users can save their calculations and compare different inheritance scenarios without creating an account
**Verified:** 2026-03-13T15:35:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (Plan 08-01)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Wizard state auto-saves to localStorage on every change and survives page refresh | VERIFIED (automated) | `wizardStore.ts` wraps store in `persist` middleware with `name: 'jomi-bhag-wizard'`, `storage: fractionStorage`; 3 dedicated persist tests pass |
| 2 | Fraction objects round-trip correctly through localStorage serialization | VERIFIED (automated) | `fractionStorage.ts` uses `__frac__` tagged JSON; 12 round-trip tests pass including edge cases Fraction(0), Fraction(-1/4) |
| 3 | User can save current calculation as a named scenario | VERIFIED (automated) | `saveScenario()` in `scenariosStore.ts` creates Scenario with `crypto.randomUUID()`, auto-name, ISO timestamps, wizard state snapshot |
| 4 | User can load a saved scenario, replacing current wizard state | VERIFIED (automated) | `loadScenario()` returns `WizardState`; `ScenariosPage` calls `useWizardStore.setState(state, true)` then navigates to wizard |
| 5 | User can duplicate a scenario with '(Copy)' suffix | VERIFIED (automated) | `duplicateScenario()` appends `' (Copy)'`; test "creates copy with '(Copy)' suffix, new id" passes |
| 6 | User can delete a scenario or clear all scenarios | VERIFIED (automated) | `deleteScenario()` filters by id and cleans `selectedIds`; `clearAll()` resets to empty state; both tested |
| 7 | Maximum 20 scenarios enforced | VERIFIED (automated) | `MAX_SCENARIOS = 20`; `saveScenario` and `duplicateScenario` both return `null` when at limit; limit test passes |

### Observable Truths (Plan 08-02)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | User can navigate to 'My Scenarios' page from top nav (desktop) or bottom nav (mobile) | VERIFIED (code) | `AppLayout.tsx`: desktop `nav` with `md:flex` shows Calculator/My Scenarios buttons; mobile `nav` with `md:hidden` shows bottom bar; `onNavigate` callback wired through `App.tsx` |
| 9 | User sees a list of saved scenarios as compact cards with name, date, heir summary, and estate value | VERIFIED (automated) | `ScenarioCard.tsx` renders name, `formatDate(scenario.updatedAt)`, `scenario.summary.heirSummary`, BDT-formatted `totalEstateValue`; component test confirms all fields |
| 10 | User can save current calculation from the scenarios page | VERIFIED (automated) | "Save Current" button in `ScenariosPage` calls `saveScenario()`; test "Save Current button calls saveScenario" passes |
| 11 | User can rename a scenario inline | VERIFIED (automated) | `ScenarioCard` toggles to `<input>` on click, saves on blur/Enter, cancels on Escape; test "inline rename: click name, type new name, blur saves" passes |
| 12 | User can delete a scenario with confirmation | VERIFIED (automated) | Delete button shows inline "Delete this scenario?" with Confirm/Cancel; test "delete confirmation flow" passes |
| 13 | User can clear all scenarios with a stronger confirmation | VERIFIED (code) | `ScenariosPage` shows red "Clear All Scenarios" button, then inline warning "This will permanently delete all N scenarios. Are you sure?" with Yes/Cancel |
| 14 | User can duplicate a scenario to create a 'what if' copy | VERIFIED (code) | Duplicate button in `ScenarioCard` calls `onDuplicate` which calls `duplicateScenario(scenario.id)` in `ScenariosPage` |
| 15 | User can load a saved scenario (with unsaved changes warning if applicable) | VERIFIED (automated) | `handleLoad` checks `hasUnsavedChanges()`, shows Save & Load / Load Without Saving / Cancel; test "shows unsaved changes confirmation when loading scenario" passes |
| 16 | User can select exactly 2 scenarios via checkboxes and click Compare | VERIFIED (code) | `toggleSelected` enforces max 2; "Compare Selected Scenarios" button visible only when `selectedIds.length === 2`, calls `startCompare()` |
| 17 | Comparison view shows heir shares, estate totals, and adjustments side by side | VERIFIED (automated) | `ComparisonView.tsx` builds unified heir list, shows estate value and adjustment sections, renders `ShareCell` (fraction + % + BDT); test "renders two-column layout with heir shares from both scenarios" passes |
| 18 | Values that differ between scenarios are highlighted with pale amber background | VERIFIED (automated) | Rows with `isDifferent=true` get `bg-amber-50`; `data-diff="true"` attribute used for testing; tests "applies amber highlight on rows where shares differ" and "does not highlight rows where shares are equal" both pass |
| 19 | User can start a new calculation from the scenarios page | VERIFIED (code) | "+ New Calculation" button calls `handleNewCalculation()` which calls `useWizardStore.setState({...initialState})` then `onNavigate('wizard')` |
| 20 | Empty state shown when no scenarios are saved | VERIFIED (automated) | `ScenariosPage` renders `<EmptyState>` when `scenarios.length === 0`; test "renders empty state when no scenarios" passes |

**Score:** 20/20 truths verified (automated or by code inspection)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/stores/fractionStorage.ts` | Fraction-aware JSON storage for Zustand persist | VERIFIED | Exports `fractionStorage` via `createJSONStorage` with `replacer`/`reviver`; 27 lines, fully substantive |
| `src/types/scenario.ts` | Scenario, ScenarioSummary, AppPage types | VERIFIED | Exports `ScenarioSummary`, `Scenario`, `AppPage` exactly as specified |
| `src/stores/wizardStore.ts` | Wizard store with persist middleware (auto-save) | VERIFIED | `useWizardStore` wrapped in `persist` with `storage: fractionStorage`, `name: 'jomi-bhag-wizard'`, full `partialize` of 24 WizardState fields |
| `src/stores/scenariosStore.ts` | Scenario CRUD store with persist | VERIFIED | Exports `useScenariosStore`, `generateScenarioName`, `computeStateFingerprint`, `MAX_SCENARIOS`; full CRUD implemented |
| `src/App.tsx` | Page-level view switching (wizard vs scenarios) | VERIFIED | `useState<AppPage>('wizard')`; `AnimatePresence` wraps conditional render of `WizardShell` / `ScenariosPage` |
| `src/components/layout/AppLayout.tsx` | Navigation with My Scenarios link in header and mobile bottom bar | VERIFIED | Desktop `nav.md:flex` and mobile `nav.md:hidden` both present with Calculator and My Scenarios buttons |
| `src/components/scenarios/ScenariosPage.tsx` | Main scenarios list page with save, compare, and new calculation controls | VERIFIED | Full implementation: 263 lines, all CRUD wired, comparison trigger, unsaved changes dialog, near-limit warning |
| `src/components/scenarios/ScenarioCard.tsx` | Compact scenario card with name, date, heir summary, estate value, and action buttons | VERIFIED | 205 lines; inline rename, delete confirmation, adjustment badges, BDT formatting all present |
| `src/components/scenarios/ComparisonView.tsx` | Side-by-side comparison table for exactly 2 scenarios with diff highlighting | VERIFIED | 292 lines; `buildUnifiedRows` computes union + diff; desktop table + mobile stacked layout; `data-diff` attribute for testing |
| `src/components/scenarios/EmptyState.tsx` | Empty state when no scenarios saved | VERIFIED | 44 lines; folder SVG, heading, subtext, "+ New Calculation" button |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `wizardStore.ts` | `fractionStorage.ts` | `storage: fractionStorage` | WIRED | Line 359: `storage: fractionStorage` in persist config |
| `scenariosStore.ts` | `fractionStorage.ts` | `storage: fractionStorage` | WIRED | Line 319: `storage: fractionStorage` in persist config |
| `scenariosStore.ts` | `wizardStore.ts` | `useWizardStore.getState()` | WIRED | `saveScenario`, `hasUnsavedChanges`, `updateLastSavedHash` all call `useWizardStore.getState()` |
| `App.tsx` | `ScenariosPage.tsx` | `page === 'scenarios'` conditional render | WIRED | Line 22: `{page === 'scenarios' && <ScenariosPage onNavigate={setPage} />}` |
| `AppLayout.tsx` | `App.tsx` | `onNavigate('scenarios')` callback | WIRED | Both desktop and mobile nav buttons call `onNavigate('scenarios')` and `onNavigate('wizard')` |
| `ScenariosPage.tsx` | `scenariosStore.ts` | `useScenariosStore` hook | WIRED | All 11 store actions/selectors imported and wired to handlers |
| `ComparisonView.tsx` | `scenariosStore.ts` | reads selected scenarios | WIRED | `ScenariosPage` passes `scenarioA` and `scenarioB` from `scenarios.find(s => s.id === selectedIds[N])` |
| `ScenariosPage.tsx` | `wizardStore.ts` | `useWizardStore.setState` to load scenario | WIRED | `performLoad` calls `useWizardStore.setState(state, true)` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PRST-01 | 08-01, 08-02 | App saves calculations to browser localStorage without requiring login | SATISFIED | `wizardStore` with `persist` auto-saves on every change; `scenariosStore` persists to `'jomi-bhag-scenarios'`; no login required |
| PRST-02 | 08-02 | User can compare multiple scenarios side by side ("What if" comparison) | SATISFIED | `ComparisonView` renders side-by-side heir shares with amber diff highlighting; 4 comparison tests pass |
| PRST-03 | 08-01, 08-02 | User can load and modify previously saved calculations | SATISFIED | `loadScenario()` returns `WizardState`; `ScenariosPage.performLoad` replaces wizard state and navigates back to calculator |

All 3 requirement IDs declared across plans are accounted for. No orphaned requirements found (REQUIREMENTS.md maps only PRST-01, PRST-02, PRST-03 to Phase 8).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | - |

No TODO/FIXME/placeholder comments, no stub return values, no empty handlers found across all 10 phase files.

### Human Verification Required

#### 1. Auto-save survives page refresh

**Test:** Open the app, fill in heir data (e.g., select "Father" relationship, add 2 sons, 1 daughter, navigate to Results), then hard-refresh the browser (Ctrl+Shift+R).
**Expected:** All wizard inputs and results are still present after refresh with no data loss.
**Why human:** localStorage persistence works at runtime; test environment uses a polyfilled localStorage. Real browser behavior must be confirmed once.

#### 2. My Scenarios navigation -- desktop and mobile

**Test:** On desktop (1024px+), verify Calculator and My Scenarios tabs appear in the header and switching between them works. On mobile (375px), verify the bottom nav bar appears with Calculator and My Scenarios buttons.
**Expected:** Active page has emerald underline/highlight; inactive has gray; switching navigates correctly; mobile bottom bar does not overlap content.
**Why human:** CSS responsive breakpoints (`md:flex`/`md:hidden`) and fixed positioning require browser rendering to verify.

#### 3. Save, rename, load, duplicate, delete scenario end-to-end

**Test:** 1) Calculate results, go to My Scenarios, click "Save Current" -- verify card appears with auto-generated name (e.g., "2 Sons, 1 Daughter -- Mar 13"). 2) Click the scenario name -- verify it becomes an input field; type a new name and press Enter -- verify it updates. 3) Click "Duplicate" -- verify a copy appears with "(Copy)" suffix. 4) Click "Load" on the original -- verify it switches back to calculator with the saved state. 5) Click "Delete" -- verify confirmation appears; confirm and verify the card is removed.
**Expected:** Each operation performs as described with no UI glitches.
**Why human:** Multi-step user interactions across two stores require visual and functional confirmation.

#### 4. Unsaved changes warning on load

**Test:** Load a scenario, change a heir count in the wizard (without saving), go to My Scenarios, click "Load" on a different scenario.
**Expected:** The inline warning banner appears: "You have unsaved changes. Save current scenario before loading?" with three buttons: Save & Load, Load Without Saving, Cancel. Each button works correctly.
**Why human:** Requires live state interaction to trigger `hasUnsavedChanges()` returning true.

#### 5. Side-by-side comparison with amber diff highlighting

**Test:** Save two scenarios with different heir configurations (e.g., one with 2 sons, another with 1 son 1 daughter). Select both via checkboxes, click "Compare Selected Scenarios". Verify the comparison view.
**Expected:** Desktop shows two-column table with heir types in first column. Rows where shares differ have pale amber background. Heirs present in only one scenario show "--" in the other column. Estate value and adjustment sections show diff highlighting when values differ. Mobile view stacks scenarios vertically.
**Why human:** Visual diff highlighting and responsive layout require browser rendering.

#### 6. Fraction objects survive localStorage round-trip in a real browser

**Test:** Calculate shares, refresh the browser, navigate to the Results step.
**Expected:** All heir share fractions display correctly (e.g., "1/6", "1/3") with no NaN or [object Object] values.
**Why human:** The test environment polyfills localStorage; real browser localStorage uses native JSON serialization which must be verified against the `__frac__` custom replacer/reviver.

### Gaps Summary

No automated gaps were found. All 20 must-have truths are verified by code inspection and automated tests (116 total: 103 store tests + 13 component tests). TypeScript compilation is clean with zero errors.

The 6 human verification items above are standard for a phase that delivers visible UI and localStorage persistence -- they require a running browser, not a code fix.

---

_Verified: 2026-03-13T15:35:00Z_
_Verifier: Claude (gsd-verifier)_
