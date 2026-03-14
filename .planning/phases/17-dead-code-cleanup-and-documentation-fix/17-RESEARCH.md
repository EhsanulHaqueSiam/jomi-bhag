# Phase 17: Dead Code Cleanup & Documentation Fix - Research

**Researched:** 2026-03-14
**Domain:** Code cleanup, dead code removal, Recharts bar chart coloring, documentation updates
**Confidence:** HIGH

## Summary

Phase 17 is a housekeeping phase that removes dead code left behind when Quick-8 merged wizard steps and Phase 11 superseded Phase 9's LotDivisionPage. It also fixes a minor visual bug in MonetaryBarChart (missing per-bar emerald coloring), removes a stale comment, and updates REQUIREMENTS.md traceability.

The scope is precisely defined by the v1.0 audit report and the CONTEXT.md discussion. All files to delete or modify exist and have been verified. The critical subtlety is that some components in the `division/` directory (CompensationBanner, QurahCeremony) are imported by live code (DistributionPage, IndivisibleCard) and MUST NOT be deleted. The `core/land/division.ts` module is also live -- its `CashCompensation` type is re-exported through `core/distribution/types.ts` and used by the distribution algorithm.

**Primary recommendation:** Delete dead files first, then clean all import references, then fix bar chart and stale comment, then run `vitest run` and `tsc -b` to confirm zero breakage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full cascade removal: delete all files AND all references that are only alive because of divisionStore/LotDivisionPage
- Files to delete: LotDivisionPage.tsx, divisionStore.ts, StepFamily.tsx, StepSiblings.tsx, PdfLotDivisionSection.tsx, division.test.tsx
- Code to clean: remove PdfLotDivision types from pdfTypes.ts, remove divisionResult param from extractPdfData, remove divisionStore import from usePdfExport, remove divisionStore mock from usePdfExport.test.ts, remove LotDivisionPage import and route from App.tsx
- Bar chart: Use graded emerald shades from EMERALD_COLORS array (same approach as pie chart), add Recharts Cell components inside Bar element
- Stale comment: Remove "Stub - types to be implemented" from src/core/distribution/types.ts line 1
- REQUIREMENTS.md: Change "Planned" to "Complete" for all Phase 9-14 requirements in traceability table; check boxes for P14-16 through P14-20

### Claude's Discretion
- Exact order of file deletions and edits
- Whether to add fill prop vs Cell components for bar chart (implementation detail)
- Any additional dead imports discovered during cleanup

### Deferred Ideas
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| P9-SC3 | User can assign groups to heirs via Qurah (Islamic lot drawing) with staggered reveal, or manually reassign parcels between groups | Documentation-only: REQUIREMENTS.md traceability update to reflect that Phase 11 DistributionPage + Phase 14 IndividualQurah supersede the old LotDivisionPage Qurah. The dead LotDivisionPage removal is the cleanup action; P9-SC3's functional satisfaction is already achieved through smart shuffle + individual Qurah. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 2.x (existing) | Chart rendering | Already used for pie and bar charts |
| Vitest | (existing) | Test runner | Project standard for all tests |
| TypeScript | (existing) | Type checking | Build verification via `tsc -b` |

### Supporting
No new libraries needed for this phase. All work uses existing project infrastructure.

## Architecture Patterns

### Recommended Deletion Order

The safest deletion order to avoid transient broken import states:

```
1. Delete leaf files first (files with no importers):
   - src/components/wizard/StepFamily.tsx
   - src/components/wizard/StepSiblings.tsx
   - src/components/division/LotDivisionPage.tsx
   - src/components/division/GroupCard.tsx
   - src/components/division/ParcelRow.tsx
   - src/components/division/QurahReference.tsx
   - src/components/pdf/PdfLotDivisionSection.tsx
   - src/components/__tests__/division.test.tsx (tests dead components)

2. Delete store after removing its only live importer (usePdfExport):
   - src/stores/divisionStore.ts

3. Clean import references in surviving files:
   - App.tsx
   - usePdfExport.tsx
   - usePdfExport.test.ts
   - extractPdfData.ts
   - pdfTypes.ts
   - PdfDocument.tsx
   - AppLayout.tsx (remove 'division' from isWide check)
   - types/scenario.ts (remove 'division' from AppPage union)

4. Fix bar chart and stale comment
5. Update REQUIREMENTS.md
```

### Files That MUST NOT Be Deleted (Live Code in division/ directory)

| File | Live Importer | Why It Stays |
|------|---------------|-------------|
| `CompensationBanner.tsx` | `DistributionPage.tsx` | Used for group-level compensation display |
| `QurahCeremony.tsx` | `IndivisibleCard.tsx` | Used for movable asset Qurah drawing |
| `core/land/division.ts` | `core/distribution/types.ts`, `extractPdfData.ts`, tests | `CashCompensation` type re-exported, `DivisionResult` type still used in extractPdfData |

### Bar Chart Fix Pattern

The MonetaryBarChart currently renders all bars in Recharts default blue because no fill/Cell is specified. Two approaches:

**Approach A: Cell components (explicit, recommended by CONTEXT.md)**
```typescript
import { Cell } from 'recharts'
import { EMERALD_COLORS } from '@/components/results/chartData'

<Bar dataKey="bdtValue" radius={[0, 4, 4, 0]} barSize={28}>
  {chartData.map((entry, index) => (
    <Cell key={entry.name} fill={EMERALD_COLORS[index % EMERALD_COLORS.length]} />
  ))}
</Bar>
```

**Approach B: Use data's fill property**
Each `ChartDatum` already has a `fill` field set from EMERALD_COLORS. However, Recharts `Bar` does NOT auto-read `fill` from data objects (unlike `Pie`). You must use Cell components or set a static fill. Cell is the correct approach.

**Recommendation:** Use Approach A (Cell components). The data already computes the right color; Cell just applies it per bar.

### Anti-Patterns to Avoid
- **Deleting CompensationBanner or QurahCeremony:** These are shared components imported by live DistributionPage and IndivisibleCard code.
- **Deleting core/land/division.ts:** The module exports `CashCompensation` which is re-exported by `core/distribution/types.ts` and used throughout the distribution system.
- **Removing lotDivision entirely from extractPdfData:** The `divisionResult` parameter to extractPdfData can be removed since it's only passed from usePdfExport which reads divisionStore (being deleted). But the lotDivision mapping logic inside extractPdfData becomes dead code too and should be removed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-bar coloring | Custom SVG fill logic | Recharts Cell component | Standard Recharts pattern for per-element styling |

## Common Pitfalls

### Pitfall 1: Accidentally Deleting Shared Division Components
**What goes wrong:** CompensationBanner.tsx and QurahCeremony.tsx are in the division/ directory alongside dead code, creating a temptation to delete the entire directory.
**Why it happens:** The division/ directory was created for Phase 9 but some components were reused by Phase 11 (DistributionPage) and Phase 10 (IndivisibleCard).
**How to avoid:** Only delete LotDivisionPage.tsx, GroupCard.tsx, ParcelRow.tsx, and QurahReference.tsx from division/. Keep CompensationBanner.tsx and QurahCeremony.tsx.
**Warning signs:** Import errors in DistributionPage.tsx or IndivisibleCard.tsx.

### Pitfall 2: Breaking extractPdfData Signature Without Updating All Callers
**What goes wrong:** Removing `divisionResult` parameter from extractPdfData changes its signature; usePdfExport.test.ts mock and pdf-distribution.test.tsx calls must also be updated.
**Why it happens:** Multiple test files call or mock extractPdfData.
**How to avoid:** Search for all usages of `extractPdfData` and update every call site. Currently: extractPdfData.ts (definition), usePdfExport.tsx (caller), usePdfExport.test.ts (mock), pdf-distribution.test.tsx (direct calls with divisionResult arg).
**Warning signs:** TypeScript compilation errors, test failures.

### Pitfall 3: Not Removing 'division' from AppPage Type
**What goes wrong:** The AppPage type union in types/scenario.ts includes 'division'. After removing the route, the type should be narrowed but it's still valid TypeScript with the extra member.
**Why it happens:** Unused union members don't cause TypeScript errors.
**How to avoid:** Remove 'division' from `AppPage` type union. Also update AppLayout.tsx which checks `page === 'division'` for wide layout.
**Warning signs:** Dead code in AppLayout isWide check; type is broader than actual usage.

### Pitfall 4: REQUIREMENTS.md Already Updated
**What goes wrong:** The audit noted stale "Planned" statuses and unchecked boxes, but the current REQUIREMENTS.md already shows all Phase 9-14 items as "Complete" with checked boxes. Double-checking is harmless but the planner should verify current state before making changes.
**Why it happens:** REQUIREMENTS.md may have been updated since the audit was generated.
**How to avoid:** Verify the current file state before applying changes. If already correct, no edits needed for this item.

### Pitfall 5: core/land/__tests__/division.test.ts vs components/__tests__/division.test.tsx
**What goes wrong:** There are TWO division test files. The CONTEXT.md mentions deleting `division.test.tsx` (the component test in `components/__tests__/`). The `core/land/__tests__/division.test.ts` tests the core algorithm (divideParcels, qurahShuffle, moveParcel) which is still live code.
**Why it happens:** Same name in different directories.
**How to avoid:** Only delete `src/components/__tests__/division.test.tsx`. Keep `src/core/land/__tests__/division.test.ts`.

## Code Examples

### Cell Import and Usage for Bar Chart
```typescript
// In MonetaryBarChart.tsx
import {
  BarChart,
  Bar,
  Cell,   // ADD THIS
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { EMERALD_COLORS } from '@/components/results/chartData'

// Inside the <Bar> element:
<Bar dataKey="bdtValue" radius={[0, 4, 4, 0]} barSize={28}>
  {chartData.map((entry, index) => (
    <Cell key={entry.name} fill={EMERALD_COLORS[index % EMERALD_COLORS.length]} />
  ))}
</Bar>
```

### Stale Comment Removal
```typescript
// src/core/distribution/types.ts
// REMOVE line 1: "// Stub - types to be implemented"
// File starts with: import type { HeirType } from '@/core/faraid/types'
```

### App.tsx After Cleanup
```typescript
// Remove: import { LotDivisionPage } from '@/components/division/LotDivisionPage'
// Remove: {page === 'division' && <LotDivisionPage onNavigate={setPage} />}
```

### extractPdfData After Cleanup
```typescript
// Remove parameter: divisionResult?: DivisionResult | null
// Remove import: import type { DivisionResult } from '@/core/land/division'
// Remove import: PdfLotDivision from pdfTypes import
// Remove: entire lotDivision mapping block (lines 271-297)
// Remove: lotDivision from return object
// Remove: lotDivision = undefined in distribution block
```

### usePdfExport After Cleanup
```typescript
// Remove these two lines:
//   const divisionState = (await import('@/stores/divisionStore')).useDivisionStore.getState()
//   const divisionResult = divisionState.divisionResult
// Remove divisionResult from extractPdfData call
```

### AppPage Type After Cleanup
```typescript
// src/types/scenario.ts
export type AppPage = 'wizard' | 'scenarios' | 'distribution'
// Remove 'division' from the union
```

### AppLayout After Cleanup
```typescript
// Change:
const isWide = page === 'distribution' || page === 'division'
// To:
const isWide = page === 'distribution'
```

## Complete File Impact Map

### Files to DELETE (8 files)
| File | Reason |
|------|--------|
| `src/components/division/LotDivisionPage.tsx` | Dead -- no navigation entry point |
| `src/components/division/GroupCard.tsx` | Only imported by LotDivisionPage |
| `src/components/division/ParcelRow.tsx` | Only imported by GroupCard |
| `src/components/division/QurahReference.tsx` | Only imported by LotDivisionPage |
| `src/stores/divisionStore.ts` | Only imported by LotDivisionPage and usePdfExport |
| `src/components/wizard/StepFamily.tsx` | Dead -- replaced by StepFamilyAndSiblings |
| `src/components/wizard/StepSiblings.tsx` | Dead -- replaced by StepFamilyAndSiblings |
| `src/components/__tests__/division.test.tsx` | Tests dead LotDivisionPage components |
| `src/components/pdf/PdfLotDivisionSection.tsx` | Only used for lotDivision PDF section (dead path) |

### Files to EDIT (9 files)
| File | Change |
|------|--------|
| `src/App.tsx` | Remove LotDivisionPage import and division route |
| `src/types/scenario.ts` | Remove 'division' from AppPage union |
| `src/components/layout/AppLayout.tsx` | Remove `page === 'division'` from isWide |
| `src/hooks/usePdfExport.tsx` | Remove divisionStore import and divisionResult usage |
| `src/hooks/__tests__/usePdfExport.test.ts` | Remove divisionStore mock |
| `src/components/pdf/extractPdfData.ts` | Remove DivisionResult import, divisionResult param, lotDivision mapping, PdfLotDivision import |
| `src/components/pdf/pdfTypes.ts` | Remove PdfLotDivision, PdfLotDivisionGroup types, lotDivision field from PdfData |
| `src/components/pdf/PdfDocument.tsx` | Remove PdfLotDivisionSection import and conditional render |
| `src/components/results/MonetaryBarChart.tsx` | Add Cell import and per-bar coloring |
| `src/core/distribution/types.ts` | Remove stale comment on line 1 |
| `.planning/REQUIREMENTS.md` | Verify/update traceability (may already be correct) |

### Files to KEEP (often confused as dead)
| File | Why |
|------|-----|
| `src/components/division/CompensationBanner.tsx` | Imported by DistributionPage.tsx |
| `src/components/division/QurahCeremony.tsx` | Imported by IndivisibleCard.tsx |
| `src/core/land/division.ts` | CashCompensation type used by distribution system |
| `src/core/land/__tests__/division.test.ts` | Tests live division algorithm |

## State of the Art

No external technology changes relevant to this phase. All changes are internal cleanup.

| Old State | New State | Impact |
|-----------|-----------|--------|
| 9 dead files in codebase | 0 dead files | Cleaner codebase, smaller bundle |
| Bar chart: single default color | Bar chart: graded emerald shades | Visual consistency with pie chart |
| Stale "stub" comment on implemented file | No stale comments | Accurate code documentation |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vite.config.ts) |
| Config file | `vite.config.ts` (unified Vite+Vitest config) |
| Quick run command | `npx vitest run --reporter=verbose 2>&1 | tail -20` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P9-SC3 | Documentation traceability update | manual-only | N/A -- documentation change, verify by reading REQUIREMENTS.md | N/A |

### Cleanup Verification Tests
| What | Test Type | Automated Command | Note |
|------|-----------|-------------------|------|
| No broken imports after deletion | build | `npx tsc -b --noEmit` | TypeScript catches all dangling imports |
| Existing tests still pass | unit/integration | `npx vitest run` | Full suite must stay green (684+ tests minus deleted test file) |
| Bar chart renders with colors | existing test | `npx vitest run src/components/__tests__/charts.test.tsx` | Existing RSLT-05 tests verify bar chart renders |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose 2>&1 | tail -20`
- **Per wave merge:** `npx vitest run && npx tsc -b --noEmit`
- **Phase gate:** Full suite green + TypeScript compilation clean before `/gsd:verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. No new test files needed. The deleted test file (`division.test.tsx`) tested dead components.

## Open Questions

1. **REQUIREMENTS.md Current State**
   - What we know: The current REQUIREMENTS.md appears to already have all Phase 9-14 items marked "Complete" with checked boxes. The audit was generated before the most recent updates.
   - What's unclear: Whether the updates happened after the audit or the audit read a different version.
   - Recommendation: Verify current state during execution. If already correct, skip REQUIREMENTS.md edits. If stale, apply the updates.

2. **pdf-distribution.test.tsx calls extractPdfData with divisionResult**
   - What we know: `src/components/__tests__/pdf-distribution.test.tsx` has test cases passing `makeDivisionResult()` to extractPdfData (lines 201, 228).
   - What's unclear: Whether these tests should be updated to remove the divisionResult argument or if there are other implications.
   - Recommendation: Update the test calls to remove the divisionResult argument after the extractPdfData signature changes. Verify the tests still pass.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection via Read tool -- all files verified to exist at stated paths
- v1.0 Milestone Audit report (`.planning/v1.0-MILESTONE-AUDIT.md`) -- authoritative list of dead code
- CONTEXT.md (`.planning/phases/17-dead-code-cleanup-and-documentation-fix/17-CONTEXT.md`) -- user-locked decisions
- Grep results for all import/usage references -- cross-verified which files are live vs dead

### Secondary (MEDIUM confidence)
- Recharts Cell pattern for per-element coloring -- verified by existing pie chart usage pattern in codebase and Recharts standard API

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, using existing project tools
- Architecture: HIGH -- all files and import chains verified by direct inspection
- Pitfalls: HIGH -- all edge cases (shared components, two division test files) discovered through grep analysis

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable -- no external dependency changes)
