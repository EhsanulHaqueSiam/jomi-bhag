---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/__tests__/useJsonExport.test.ts
  - src/hooks/__tests__/useJsonImport.test.ts
  - src/hooks/__tests__/usePdfExport.test.ts
  - src/components/__tests__/appLayout.test.tsx
  - e2e/mobile-wizard.spec.ts
  - e2e/land-division.spec.ts
  - e2e/asset-management.spec.ts
  - e2e/scenarios.spec.ts
autonomous: true
must_haves:
  truths:
    - "All 3 hooks in src/hooks/ have dedicated unit tests"
    - "AppLayout component has tests for desktop and mobile navigation rendering"
    - "E2e tests cover mobile wizard flow, land division, asset management, and scenario management"
    - "All existing 685 tests continue to pass alongside new tests"
  artifacts:
    - path: "src/hooks/__tests__/useJsonExport.test.ts"
      provides: "Unit tests for useJsonExport hook"
    - path: "src/hooks/__tests__/useJsonImport.test.ts"
      provides: "Unit tests for useJsonImport hook"
    - path: "src/hooks/__tests__/usePdfExport.test.ts"
      provides: "Unit tests for usePdfExport hook"
    - path: "src/components/__tests__/appLayout.test.tsx"
      provides: "Component tests for AppLayout desktop/mobile nav"
    - path: "e2e/mobile-wizard.spec.ts"
      provides: "Mobile viewport wizard flow e2e"
    - path: "e2e/land-division.spec.ts"
      provides: "Land division page e2e"
    - path: "e2e/asset-management.spec.ts"
      provides: "Asset management (properties + movable assets) e2e"
    - path: "e2e/scenarios.spec.ts"
      provides: "Scenario save/load/compare e2e"
  key_links:
    - from: "src/hooks/__tests__/useJsonExport.test.ts"
      to: "src/hooks/useJsonExport.ts"
      via: "direct import"
      pattern: "useJsonExport"
    - from: "e2e/mobile-wizard.spec.ts"
      to: "src/components/wizard/WizardShell.tsx"
      via: "Playwright mobile viewport"
      pattern: "viewport.*375"
---

<objective>
Fill unit/integration test coverage gaps for hooks and layout, then expand e2e test suite to cover untested user journeys (mobile wizard, land division, asset management, scenarios).

Purpose: The app has 685 passing tests but zero coverage for hooks (useJsonExport, useJsonImport, usePdfExport), no dedicated AppLayout tests, and e2e tests miss critical flows like mobile wizard navigation, land division, asset management, and scenario comparison.
Output: ~50+ new tests across unit, integration, and e2e layers.
</objective>

<execution_context>
@.planning/STATE.md
</execution_context>

<context>
@src/hooks/useJsonExport.ts
@src/hooks/useJsonImport.ts
@src/hooks/usePdfExport.tsx
@src/components/layout/AppLayout.tsx
@src/components/wizard/WizardShell.tsx
@src/App.tsx
@e2e/helpers.ts
@playwright.config.ts
@vite.config.ts
@src/test-setup.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unit/integration tests for hooks and AppLayout</name>
  <files>
    src/hooks/__tests__/useJsonExport.test.ts
    src/hooks/__tests__/useJsonImport.test.ts
    src/hooks/__tests__/usePdfExport.test.ts
    src/components/__tests__/appLayout.test.tsx
  </files>
  <action>
Create unit tests for the 3 untested hooks and AppLayout component. Follow existing test conventions (vitest, @testing-library/react, vi.fn() mocks, useWizardStore.setState for state setup).

**src/hooks/__tests__/useJsonExport.test.ts:**
Test useJsonExport hook using renderHook from @testing-library/react:
- Mock document.createElement to spy on anchor creation and click
- Mock URL.createObjectURL and URL.revokeObjectURL
- Set wizardStore state with relationship='father', sonCount=2
- Call exportJson(), verify: createObjectURL called with Blob of type 'application/json', anchor.click called, revokeObjectURL called
- Verify exported JSON contains schemaVersion and data.relationship fields by reading the Blob passed to createObjectURL

**src/hooks/__tests__/useJsonImport.test.ts:**
Test useJsonImport hook using renderHook:
- Test importFromFile rejects files > 1MB (check toast.type === 'error', message 'File too large')
- Test importFromFile rejects non-JSON files (no .json extension AND not application/json type)
- Test importFromFile with invalid JSON content shows error toast 'Invalid file -- could not parse JSON'
- Test importFromFile with valid JSON sets pendingState (use act() + waitFor)
- Test confirmImport calls useWizardStore.setState and useDistributionStore.getState().resetDistribution
- Test cancelImport clears pendingState back to null
- Test dismissToast clears toast message
- For file reading, create File objects and use act() around the reader.onload callback

**src/hooks/__tests__/usePdfExport.test.ts:**
Test usePdfExport hook -- this hook has heavy dynamic imports so mock them:
- vi.mock('@react-pdf/renderer', () => ({ pdf: vi.fn(() => ({ toBlob: vi.fn(() => Promise.resolve(new Blob(['pdf']))) })) }))
- vi.mock('html-to-image', () => ({ toPng: vi.fn(() => Promise.resolve('data:image/png;base64,mock')) }))
- vi.mock('@/components/pdf/PdfDocument', () => ({ PdfDocument: () => null }))
- vi.mock('@/components/pdf/extractPdfData', () => ({ extractPdfData: vi.fn(() => ({})) }))
- vi.mock('@/stores/divisionStore', () => ({ useDivisionStore: { getState: () => ({ divisionResult: null }) } }))
- vi.mock('@/stores/distributionStore', () => ({ useDistributionStore: { getState: () => ({ distributionResult: null }) } }))
- Test downloadPdf: sets isGenerating=true during execution, creates anchor, clicks, revokes URL
- Test downloadPdf throws when no results in store
- Test printPdf: calls window.open with blob URL
- Test isGenerating returns to false after completion (both success and error)

**src/components/__tests__/appLayout.test.tsx:**
Test AppLayout component with render():
- Renders header with "Jomi-Bhag" and "Islamic Inheritance Calculator"
- Desktop nav shows Calculator and My Scenarios buttons
- Mobile nav (role="navigation", name="Mobile navigation") renders Calculator and My Scenarios
- Click Calculator button calls onNavigate('wizard')
- Click My Scenarios button calls onNavigate('scenarios')
- Active page gets emerald text styling (check className contains 'text-emerald-700' for active tab)
- Children are rendered inside main content area

Do NOT modify any production code. Only create test files.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx vitest run src/hooks/__tests__/ src/components/__tests__/appLayout.test.tsx --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>
    - useJsonExport has 3+ passing tests covering export flow (blob creation, anchor click, URL cleanup)
    - useJsonImport has 7+ passing tests covering file validation, parsing, confirm/cancel, toast
    - usePdfExport has 4+ passing tests covering download, print, error handling, isGenerating state
    - appLayout has 5+ passing tests covering nav rendering and interaction
    - All 685 existing tests still pass (npx vitest run shows 0 failures)
  </done>
</task>

<task type="auto">
  <name>Task 2: E2e test expansion -- mobile wizard, land division, assets, scenarios</name>
  <files>
    e2e/mobile-wizard.spec.ts
    e2e/land-division.spec.ts
    e2e/asset-management.spec.ts
    e2e/scenarios.spec.ts
  </files>
  <action>
Create 4 new Playwright e2e spec files covering major untested user journeys. Follow existing e2e conventions: use clearPersistedState in beforeEach, use wizardToResults helper, use page.getByRole/getByText selectors. The playwright.config.ts already has a "mobile" project using iPhone 14 device.

**e2e/mobile-wizard.spec.ts:**
Tests run with mobile viewport: `test.use({ viewport: { width: 375, height: 812 } })`
- "mobile wizard completes full flow": Run through full wizard on mobile (same as desktop wizard-flow test but on mobile viewport). Verify Step 1 relationship selection, Next via mobile bottom nav, Step 2 family, Step 3 skip, Step 4 Calculate Shares, Results visible.
- "mobile bottom nav shows Next button on steps 1-3": Go to step 1, select Father/Son/Yes, verify the fixed mobile nav bar contains a "Next" button (not hidden). Click Next, verify step 2 visible.
- "mobile Calculate Shares button on step 4": Navigate to step 4, verify "Calculate Shares" button visible in mobile nav area. Verify "Skip to Results" link also visible.
- "mobile Back button appears on steps 2+": Navigate to step 2, verify "Back" button visible in the mobile fixed bar. Navigate to step 1, verify Back is NOT visible.

**e2e/land-division.spec.ts:**
- "navigates to land division page": wizardToResults (adds property), click "Distribute Assets" button, then verify Asset Distribution page loads. Look for the "By Group" tab being selected.
- "shows property parcels in group cards": After reaching distribution, verify group cards appear with heir type labels (e.g., "Wife", "Sons", "Daughter").
- "randomize button reshuffles assignments": Click "Randomize" button, verify the page still shows group cards (no crash). The equilibrium indicator should be visible.
- "back to results navigation works": From distribution page, click "Back to Results", verify "Inheritance Results" heading is visible.

**e2e/asset-management.spec.ts:**
- "adds property via Add Property button on step 4": Go to step 4 (navigate through steps 1-3), click "Add Property", verify a property card/form appears.
- "adds movable asset on step 4": Go to step 4, click a category button (e.g., "Gold", "Vehicle", or whatever category picker shows), verify an asset entry appears.
- "property and movable assets appear in results": wizardToResults (which adds a property), verify EstateBreakdownCard shows the property. Check for "Land/Property" or similar text in the breakdown.
- "removes property": Go to step 4, add property, then find and click the remove/delete button on the property card, verify it is removed.

**e2e/scenarios.spec.ts:**
- "saves and loads a scenario": wizardToResults, navigate to "My Scenarios" page (click nav), click "Save Current" button, verify scenario card appears with auto-generated name. Click the scenario card to load it, verify navigates back to calculator.
- "renames a scenario": Save a scenario, find the rename button/icon on the card, click it, type new name, confirm. Verify new name appears.
- "deletes a scenario": Save a scenario, find delete button, click it, confirm deletion. Verify scenario card is removed.
- "compares two scenarios": Save two scenarios with different heir configurations, select both (checkbox/toggle), click "Compare", verify comparison view shows side-by-side data with diff highlighting (bg-amber-50 or data-diff attribute).

Important: For scenario tests, after wizardToResults, use the nav to go to "My Scenarios" page. The ScenariosPage has its own save/load/delete/compare UI. Use page.getByRole and page.getByText for selectors. If a button or element is not immediately obvious, use generous timeouts and flexible selectors (text-is, has-text, or regex).

Each test file should import { clearPersistedState, wizardToResults } from './helpers' and use them appropriately.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx playwright test e2e/mobile-wizard.spec.ts e2e/land-division.spec.ts e2e/asset-management.spec.ts e2e/scenarios.spec.ts --reporter=list 2>&1 | tail -30</automated>
  </verify>
  <done>
    - mobile-wizard.spec.ts has 4 passing tests covering mobile viewport wizard flow and nav buttons
    - land-division.spec.ts has 4 passing tests covering distribution page navigation and interaction
    - asset-management.spec.ts has 4 passing tests covering property/asset CRUD on step 4
    - scenarios.spec.ts has 4 passing tests covering save/load/rename/delete/compare
    - All existing e2e tests (wizard-flow, navigation, json-export-import, pdf-export, individual-distribution) still pass
  </done>
</task>

</tasks>

<verification>
1. Run full vitest suite: `npx vitest run` -- all tests pass (685 existing + new hook/component tests)
2. Run full playwright suite: `npx playwright test` -- all tests pass (existing 5 specs + 4 new specs)
3. No production code was modified -- only test files created
</verification>

<success_criteria>
- At least 15 new unit/integration tests for hooks and AppLayout
- At least 16 new e2e tests across 4 spec files
- Zero test failures in both vitest and playwright
- No new dependencies installed
- No production source code changes
</success_criteria>

<output>
After completion, create `.planning/quick/4-comprehensive-test-suite-unit-integratio/4-SUMMARY.md`
</output>
