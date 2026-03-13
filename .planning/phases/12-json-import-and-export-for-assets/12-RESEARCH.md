# Phase 12: JSON Import and Export for Assets - Research

**Researched:** 2026-03-13
**Domain:** File I/O, JSON serialization/deserialization, browser File API, Zustand state management
**Confidence:** HIGH

## Summary

Phase 12 adds JSON export (from Results page) and JSON import (on Step 1) for the full wizard state. The core challenge is serializing the `WizardState` (including `FaraidOutput` with Fraction objects, nested `Property` types, and discriminated-union `MovableAsset` types) into human-readable JSON and reconstructing valid state from partial/incomplete JSON input.

The project already has all the primitives needed: `fractionStorage.ts` implements Fraction serialization via `__frac__` tagged objects, `scenariosStore.ts` demonstrates bulk state loading via `useWizardStore.setState(state, true)`, and `usePdfExport.tsx` provides the anchor-click download pattern. No new libraries are needed -- this is pure browser APIs (`File`, `FileReader`, `Blob`, `URL.createObjectURL`, drag-and-drop events) plus Zustand state manipulation.

**Primary recommendation:** Build a pure-function export/import layer (`extractExportData` and `validateAndParseImport`) with no UI dependencies, then wire thin UI components (export button, drag-drop import zone, confirmation dialog, toast notification) using existing project patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Primary use case: backup & portability -- users export their own data to re-import on another device/browser
- Not a professional template system or sharing tool -- personal data safety net alongside Phase 8 localStorage
- Full state exported: heirs (relationship, gender, counts), all properties (land + house/tree/pond), movable assets (Phase 10), distribution assignments (Phase 11), estate value
- Inputs only -- computed results (Faraid shares, adjustments, steps, references) are NOT exported. Import triggers fresh Faraid engine recalculation. Guarantees consistency across engine versions
- Pretty-printed JSON (indented, human-readable)
- Standard `.json` file extension
- Metadata included: `schemaVersion: 1`, app version string, export date (ISO 8601)
- Default filename auto-generated from scenario name: e.g., `3-brothers-2-sisters-2026-03-13.json`
- Partial data accepted: if JSON has heirs but no properties, import heirs and leave properties empty. Missing fields get sensible defaults
- Import replaces current data with confirmation dialog: "Importing will replace your current data. Continue?"
- Basic type validation only on import: check numbers are numbers, strings are strings, enums are valid values. Don't check business logic
- Invalid/corrupted JSON shows a toast notification: "Invalid file -- could not parse JSON" or "Missing required fields"
- Export button on Results page near existing "Download PDF" and "Print" buttons
- Import on Step 1: "Import from file" as alternative to filling wizard manually
- File selection: drag-and-drop zone with visual feedback on drag-over, falling back to button click

### Claude's Discretion
- Post-import navigation (Step 1 vs Results)
- Drag-and-drop zone styling and animation
- Toast notification styling and duration
- Confirmation dialog design
- JSON key naming convention (camelCase vs snake_case)
- How distribution state (Phase 11) serializes to JSON
- Schema migration strategy for future schemaVersion bumps
- Export button icon and label text

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Browser File API | Native | File reading (FileReader) and download (Blob + anchor) | No library needed; project already uses anchor-click pattern in usePdfExport |
| Browser Drag-and-Drop API | Native | HTML5 drag-and-drop for file import zone | Standard browser feature, no library overhead |
| JSON | Native | Serialization with `JSON.stringify(data, null, 2)` and `JSON.parse` | Pretty-printed JSON per user requirement |
| Zustand | 5.0.11 | State management -- `useWizardStore.setState(data, true)` for bulk import | Already in project; `setState` with replace flag proven in scenariosStore |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react | 12.36.0 | Animate toast enter/exit and drag-over visual feedback | Already in project; used for step transitions and page animations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native DnD API | react-dropzone | Adds dependency for simple single-file drop -- not worth it for this use case |
| Custom toast | react-hot-toast / sonner | Project has no toast library yet; a simple 3-line toast component fits better than adding a dependency |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  core/
    json/
      exportData.ts      # extractExportData() -- pure function, store -> ExportSchema
      importData.ts       # validateAndParseImport() -- pure function, unknown -> WizardState partial
      schema.ts           # ExportSchema type, SCHEMA_VERSION constant, default values
  hooks/
    useJsonExport.ts      # useJsonExport() hook -- download trigger, reuses anchor-click pattern
    useJsonImport.ts      # useJsonImport() hook -- file reading, validation, state loading
  components/
    json/
      ImportDropZone.tsx   # Drag-and-drop zone + click-to-browse on Step 1
      ImportConfirmDialog.tsx  # Confirmation modal before replacing state
      Toast.tsx            # Simple toast notification component (reusable)
```

### Pattern 1: Export Data Extraction (Pure Function)
**What:** A pure function that reads wizard store state and produces a serializable export object, stripping computed results (FaraidOutput) and UI-only state (currentStep, expandedPropertyId, viewMode).
**When to use:** Called from the export hook when user clicks "Export JSON".
**Example:**
```typescript
// src/core/json/schema.ts
export const SCHEMA_VERSION = 1
export const APP_VERSION = '0.1.0' // from package.json or constant

export interface ExportSchema {
  schemaVersion: number
  appVersion: string
  exportDate: string // ISO 8601
  data: {
    // Step 1 -- relationship & identity
    relationship: RelationshipType | null
    deceasedGender: 'male' | 'female' | null
    userGender: 'male' | 'female' | null
    mfloEnabled: boolean
    motherAlive: boolean | null

    // Step 2 -- spouse & children
    wifeCount: number
    husbandPresent: boolean
    sonCount: number
    daughterCount: number

    // Step 3 -- siblings
    siblingTypeExpanded: boolean
    brotherFullCount: number
    brotherConsanguineCount: number
    brotherUterineCount: number
    sisterFullCount: number
    sisterConsanguineCount: number
    sisterUterineCount: number

    // Step 4 -- properties
    properties: Property[]

    // Step 4 -- movable assets
    movableAssets: MovableAsset[]

    // Estate value
    totalEstateValue: number
  }
}

// src/core/json/exportData.ts
export function extractExportData(state: WizardState): ExportSchema {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportDate: new Date().toISOString(),
    data: {
      relationship: state.relationship,
      deceasedGender: state.deceasedGender,
      // ... all input fields, NO results/FaraidOutput
    },
  }
}
```

### Pattern 2: Import with Partial Data + Defaults
**What:** A validation function that accepts `unknown` input, validates top-level structure and field types, and returns a partial WizardState with sensible defaults for missing fields.
**When to use:** Called when user selects or drops a JSON file.
**Example:**
```typescript
// src/core/json/importData.ts
export interface ImportResult {
  success: true
  state: WizardState
} | {
  success: false
  error: string
}

export function validateAndParseImport(raw: unknown): ImportResult {
  // 1. Check it's an object with schemaVersion
  // 2. Extract data field
  // 3. For each known field: type-check, use default if missing
  // 4. Validate enums (RelationshipType, PropertyType, etc.)
  // 5. Derive autoIncludes from relationship/userGender/motherAlive
  // 6. Return complete WizardState (no results -- will recalculate)
}
```

### Pattern 3: Filename Generation (Reuse Scenario Naming)
**What:** Reuse the `generateScenarioName` pattern from `scenariosStore.ts` to produce a slug filename.
**When to use:** When generating the default download filename.
**Example:**
```typescript
function generateExportFilename(state: WizardState): string {
  // Reuse heir-count logic from generateScenarioName
  // Format: "3-brothers-2-sisters-2026-03-13.json"
  const parts: string[] = []
  if (state.sonCount > 0) parts.push(`${state.sonCount}-son${state.sonCount > 1 ? 's' : ''}`)
  // ... similar for other heir types
  const date = new Date().toISOString().split('T')[0]
  const slug = parts.length > 0 ? parts.join('-') : 'scenario'
  return `${slug}-${date}.json`
}
```

### Pattern 4: Anchor-Click Download (From usePdfExport)
**What:** Create a Blob from JSON string, generate object URL, click hidden anchor, revoke URL.
**When to use:** JSON export download trigger.
**Example:**
```typescript
function downloadJson(data: ExportSchema, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### Pattern 5: File Reading with FileReader
**What:** Read dropped/selected file as text, parse JSON, validate.
**When to use:** Import flow after file selection.
**Example:**
```typescript
function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('Please select a JSON file'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string))
      } catch {
        reject(new Error('Invalid file -- could not parse JSON'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
```

### Pattern 6: State Loading (From ScenariosPage)
**What:** Use `useWizardStore.setState(importedState, true)` to replace entire store, then navigate.
**When to use:** After import validation succeeds and user confirms.
**Example:**
```typescript
// From ScenariosPage.tsx line 96 -- proven pattern:
useWizardStore.setState(state, true)
```

### Anti-Patterns to Avoid
- **Exporting FaraidOutput / computed results:** The decision explicitly excludes computed data. Fraction objects would need special serialization, and engine version drift would make saved results stale. Always recalculate on import.
- **Deep validation of business logic on import:** Don't validate "max 4 wives" or "can't have husband and wife simultaneously" -- the wizard's existing validation in `isStepValid` and the engine itself will catch these. Import should only do type-level validation.
- **Using `set()` with individual setters for import:** Don't call `setRelationship`, `setSonCount`, etc. sequentially -- each triggers state updates and autoIncludes recalculation. Use `setState(data, true)` for atomic replacement, then compute `autoIncludes` once.
- **Storing distribution state in the export:** Distribution state is ephemeral (no persist middleware) and derivable from wizard state + engine output. Exporting it would create consistency issues. Let the user re-run distribution after import.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File download | Custom download logic | Anchor-click pattern from usePdfExport | Battle-tested in this codebase, handles blob lifecycle correctly |
| State replacement | Multiple setter calls | `useWizardStore.setState(data, true)` | Atomic update, no intermediate renders, proven in scenariosStore |
| Fraction serialization | Custom JSON handler | Skip entirely -- export inputs only, not FaraidOutput | Decision explicitly excludes computed results; no Fractions in export |
| JSON pretty-print | Custom formatter | `JSON.stringify(data, null, 2)` | Native, reliable, produces clean 2-space indented output |
| Schema validation library | Zod/Joi/Yup | Simple manual type checks | Only basic type validation needed per requirements; no business logic validation; a schema library is overkill for checking ~20 fields |

**Key insight:** Because the export contains only primitive inputs (numbers, strings, enums, and arrays of plain objects), no Fraction serialization is needed at all. The `__frac__` pattern from `fractionStorage.ts` is unnecessary -- we skip exporting `results` entirely.

## Common Pitfalls

### Pitfall 1: Forgetting to Recompute autoIncludes on Import
**What goes wrong:** If you import `relationship: 'father'` and `userGender: 'male'` but don't recompute `autoIncludes`, the auto-included "son" heir won't appear.
**Why it happens:** `autoIncludes` is a derived field computed by `recalcAutoIncludes()` inside the store setters, but `setState(data, true)` bypasses setters.
**How to avoid:** After building the imported WizardState, explicitly call `getAutoIncludes(relationship, userGender, motherAlive)` and set the `autoIncludes` field before loading into the store.
**Warning signs:** Tests show 0 auto-included heirs after import despite relationship being set.

### Pitfall 2: Property/Asset IDs Must Be Regenerated
**What goes wrong:** If imported JSON reuses IDs from a different browser/session, and the user later saves to localStorage, ID collisions can occur.
**Why it happens:** IDs are `crypto.randomUUID()` generated -- they're globally unique in practice, but imported data could have manually-crafted or duplicate IDs.
**How to avoid:** On import, regenerate all `id` fields on properties and movable assets using `crypto.randomUUID()`. This is cheap and eliminates any collision risk.
**Warning signs:** Weird behavior when saving scenarios after import.

### Pitfall 3: Discriminated Union Validation for MovableAssets
**What goes wrong:** A `MovableAsset` is a discriminated union keyed on `category`. If imported JSON has `category: 'gold_silver'` but is missing `metalType`, `weight`, etc., the state is structurally invalid.
**Why it happens:** Each asset category has different required fields (GoldSilverAsset vs CashAsset vs VehicleAsset, etc.).
**How to avoid:** During import validation, check `category` first, then validate category-specific fields exist. If category-specific fields are missing, either skip the asset or fill defaults from `addMovableAsset()` in wizardStore.
**Warning signs:** Runtime errors when rendering asset forms after import.

### Pitfall 4: Drag-and-Drop Event Handling Subtleties
**What goes wrong:** Drag-over styling flickers or doesn't activate; file drop doesn't work.
**Why it happens:** The `dragenter`/`dragleave` events fire on child elements, causing rapid enter/leave cycles. Also, `preventDefault()` must be called on `dragover` to allow drop.
**How to avoid:** Use a counter to track enter/leave balance, or use `dragover` with `e.preventDefault()` for the visual state instead of `dragenter`/`dragleave`. Set `e.dataTransfer.dropEffect = 'copy'` on dragover.
**Warning signs:** Drop zone border/background flickers when dragging over it.

### Pitfall 5: Large File Guard
**What goes wrong:** User drops a 500MB file, browser hangs reading it.
**Why it happens:** `FileReader.readAsText` reads the entire file into memory.
**How to avoid:** Check `file.size` before reading. A reasonable JSON export will be under 100KB; reject files over 1MB with a toast.
**Warning signs:** Browser tab freezes on file drop.

### Pitfall 6: Import Replaces Without Resetting Derived State
**What goes wrong:** After import, the distributionStore or divisionStore still holds stale data from the previous calculation.
**Why it happens:** These are separate Zustand stores not affected by `useWizardStore.setState()`.
**How to avoid:** After import, also call `useDistributionStore.getState().resetDistribution()` (and similarly for divisionStore if it has a reset action) to clear ephemeral stores.
**Warning signs:** Distribution page shows items from previous scenario after import.

## Code Examples

### Complete Export Flow
```typescript
// src/hooks/useJsonExport.ts
import { useWizardStore } from '@/stores/wizardStore'
import { extractExportData } from '@/core/json/exportData'
import { generateExportFilename } from '@/core/json/exportData'

export function useJsonExport() {
  function exportJson() {
    const state = useWizardStore.getState()
    const exportData = extractExportData(state)
    const filename = generateExportFilename(state)
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  return { exportJson }
}
```

### Import Validation Pattern
```typescript
// src/core/json/importData.ts
const VALID_RELATIONSHIPS = ['father', 'mother', 'husband', 'wife', 'brother', 'sister', 'other']
const VALID_PROPERTY_TYPES = ['agricultural', 'residential', 'commercial', 'mixed']
const VALID_ASSET_CATEGORIES = ['gold_silver', 'cash', 'vehicle', 'jewelry', 'furniture', 'livestock', 'custom']

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v)
}

function isEnum<T extends string>(v: unknown, valid: T[]): v is T {
  return typeof v === 'string' && valid.includes(v as T)
}

// Validate and extract with defaults for missing fields
export function validateAndParseImport(raw: unknown): ImportResult {
  if (typeof raw !== 'object' || raw === null) {
    return { success: false, error: 'Invalid file -- not a JSON object' }
  }
  const obj = raw as Record<string, unknown>

  // Schema version check
  if ('schemaVersion' in obj && obj.schemaVersion !== 1) {
    return { success: false, error: `Unsupported schema version: ${obj.schemaVersion}` }
  }

  const data = (obj.data ?? obj) as Record<string, unknown>

  // Build state with defaults
  const state: WizardState = {
    currentStep: 1,
    completedSteps: [],
    relationship: isEnum(data.relationship, VALID_RELATIONSHIPS) ? data.relationship : null,
    // ... more fields with type checks and defaults
  }

  // Recompute autoIncludes
  state.autoIncludes = getAutoIncludes(state.relationship, state.userGender, state.motherAlive)

  return { success: true, state }
}
```

### Drag-and-Drop Zone with Counter Pattern
```typescript
// Prevent flicker using enter/leave counter
const [dragCount, setDragCount] = useState(0)
const isDragging = dragCount > 0

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault()
  setDragCount((c) => c + 1)
}

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault()
  setDragCount((c) => c - 1)
}

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
}

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  setDragCount(0)
  const file = e.dataTransfer.files[0]
  if (file) onFileSelected(file)
}
```

### Simple Toast Component
```typescript
// src/components/json/Toast.tsx
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface ToastProps {
  message: string | null
  type: 'success' | 'error'
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
            type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
          onClick={onDismiss}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## Discretion Recommendations

Based on the areas left to Claude's discretion, here are research-backed recommendations:

### Post-Import Navigation: Navigate to Step 1
**Recommendation:** After import, navigate to Step 1 with data pre-filled. This matches the mental model of "review before calculating" and lets the user verify imported data, especially for partial imports where defaults were applied. The existing `ScenariosPage.performLoad()` pattern navigates to wizard page after load, which is analogous. If all steps have data (relationship + heirs + properties), auto-mark completedSteps so the user can click through quickly.

### JSON Key Naming: camelCase
**Recommendation:** Use camelCase for all JSON keys. This is consistent with the TypeScript codebase (all WizardState fields are camelCase), avoids a naming translation layer, and is the JavaScript/TypeScript convention. The JSON output will be a direct reflection of the internal state shape.

### Distribution State: Do NOT Export
**Recommendation:** Distribution state (Phase 11) should NOT be serialized in the export. The CONTEXT.md decision says "inputs only -- computed results are NOT exported" and distribution is computed from wizard state + engine output. The `distributionStore` is already ephemeral (no persist middleware). After import, the user goes through the wizard, calculates shares, then can redistribute assets from scratch.

### Schema Migration Strategy: Version Check + Future Migration Map
**Recommendation:** Include `schemaVersion: 1` in export. On import, check the version number. For v1, use current parsing. In the future, add a `const MIGRATIONS: Record<number, (data: unknown) => unknown> = {}` map that transforms old formats to current. This is zero-cost now and provides a clean extension point. If version is unrecognized, show toast: "This file was created with a newer version of Jomi Bhag."

### Export Button: Download icon + "Export JSON" label
**Recommendation:** Use the same download icon SVG as the PDF button (consistency) with label "Export JSON". Place it after the PDF button. On mobile, hide label and show icon only (matching "Download PDF" responsive pattern).

### Toast Duration: 4 seconds, dismissable on click
**Recommendation:** 4-second auto-dismiss with click-to-dismiss. Error toasts can stay slightly longer (5 seconds). Use fixed positioning at bottom-center, above the mobile nav bar (bottom-20 to clear the pb-24 spacing).

### Confirmation Dialog: Inline amber banner (like ScenariosPage)
**Recommendation:** Use the same inline confirmation pattern as `ScenariosPage.tsx` load confirmation (amber border, amber background, "Save & Load" / "Load Without Saving" / "Cancel" buttons). For import, simplify to: "Importing will replace your current data. Continue?" with "Import" and "Cancel" buttons.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FileReader callback | FileReader (still standard) | Stable | fetch() can't read local files from file input; FileReader remains correct |
| Custom drag-and-drop | HTML5 DnD API | Stable | react-dropzone was popular but native API is sufficient for single-file drop |
| Schema validation libraries (Zod, etc.) | Manual validation | N/A for this project | Overkill for ~20 fields with simple type checks |

**Deprecated/outdated:**
- Nothing relevant -- browser File API, JSON, and Blob APIs are stable and unchanged.

## Open Questions

1. **Should the export include `completedSteps`?**
   - What we know: `completedSteps` is navigation state, not user data. But it affects which steps the user can navigate to.
   - What's unclear: Whether omitting it and auto-computing from filled fields is better than exporting it.
   - Recommendation: Do NOT export `completedSteps`. On import, compute it from which fields have data (e.g., if relationship is set, step 1 is complete; if heir counts > 0, step 2 is complete, etc.). This avoids stale navigation state.

2. **Should movable assets get new IDs on import?**
   - What we know: IDs are `crypto.randomUUID()`, collision is astronomically unlikely.
   - What's unclear: Whether there's any practical risk keeping original IDs.
   - Recommendation: Regenerate IDs to be safe. It's cheap (loop + `crypto.randomUUID()`) and eliminates any edge case.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vite.config.ts (merged Vite+Vitest config) |
| Quick run command | `npx vitest run src/core/json/` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P12-01 | Export produces valid JSON with schema metadata | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | Wave 0 |
| P12-02 | Export excludes FaraidOutput/computed results | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | Wave 0 |
| P12-03 | Import parses full JSON and produces valid WizardState | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | Wave 0 |
| P12-04 | Import handles partial JSON with sensible defaults | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | Wave 0 |
| P12-05 | Import rejects invalid/corrupted JSON gracefully | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | Wave 0 |
| P12-06 | Import validates enum values for relationship, propertyType, etc. | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | Wave 0 |
| P12-07 | Import recomputes autoIncludes from relationship/gender | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | Wave 0 |
| P12-08 | Export button renders on Results page | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | Wave 0 |
| P12-09 | Import drop zone renders on Step 1 | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | Wave 0 |
| P12-10 | Confirmation dialog appears before state replacement | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | Wave 0 |
| P12-11 | Toast displays on import error | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | Wave 0 |
| P12-12 | Filename follows "heirs-date.json" pattern | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/core/json/ src/components/__tests__/json.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/core/json/__tests__/exportData.test.ts` -- covers P12-01, P12-02, P12-12
- [ ] `src/core/json/__tests__/importData.test.ts` -- covers P12-03 through P12-07
- [ ] `src/components/__tests__/json.test.tsx` -- covers P12-08 through P12-11

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/stores/wizardStore.ts`, `src/types/wizard.ts` -- full WizardState shape
- Project codebase: `src/stores/scenariosStore.ts` -- bulk state loading via `setState(state, true)`, scenario naming pattern
- Project codebase: `src/hooks/usePdfExport.tsx` -- anchor-click download pattern
- Project codebase: `src/stores/fractionStorage.ts` -- Fraction serialization (not needed for export, but relevant context)
- Project codebase: `src/core/land/types.ts`, `src/core/assets/types.ts` -- nested type shapes for Property and MovableAsset
- Project codebase: `src/stores/distributionStore.ts` -- ephemeral distribution state, resetDistribution action
- Project codebase: `src/components/scenarios/ScenariosPage.tsx` -- confirmation dialog pattern, state reset pattern

### Secondary (MEDIUM confidence)
- MDN Web Docs: File API, FileReader, Blob, HTML Drag and Drop API -- standard browser APIs, stable

### Tertiary (LOW confidence)
- None -- all findings are from direct codebase analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all patterns exist in codebase
- Architecture: HIGH -- direct adaptation of existing patterns (PDF export, scenario loading)
- Pitfalls: HIGH -- identified from codebase analysis (autoIncludes derivation, discriminated unions, DnD event handling)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no fast-moving dependencies)
