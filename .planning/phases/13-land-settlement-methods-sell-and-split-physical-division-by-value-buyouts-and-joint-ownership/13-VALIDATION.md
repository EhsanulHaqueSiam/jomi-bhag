---
phase: 13
slug: land-settlement-methods-sell-and-split-physical-division-by-value-buyouts-and-joint-ownership
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1 |
| **Config file** | vite.config.ts (merged Vite+Vitest config) |
| **Quick run command** | `npx vitest run src/core/land/__tests__/settlement.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/core/land/__tests__/settlement.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | P13-01 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "sellSplit"` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | P13-02 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "actualSalePrice"` | ❌ W0 | ⬜ pending |
| 13-01-03 | 01 | 1 | P13-03 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "subParcelTargets"` | ❌ W0 | ⬜ pending |
| 13-01-04 | 01 | 1 | P13-04 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "physicalCompensation"` | ❌ W0 | ⬜ pending |
| 13-01-05 | 01 | 1 | P13-05 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "landBuyout"` | ❌ W0 | ⬜ pending |
| 13-01-06 | 01 | 1 | P13-06 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "installment"` | ❌ W0 | ⬜ pending |
| 13-01-07 | 01 | 1 | P13-07 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "ownershipShares"` | ❌ W0 | ⬜ pending |
| 13-01-08 | 01 | 1 | P13-08 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "incomeDistribution"` | ❌ W0 | ⬜ pending |
| 13-01-09 | 01 | 1 | P13-09 | unit | `npx vitest run src/core/land/__tests__/settlement.test.ts -t "propertySettlement"` | ❌ W0 | ⬜ pending |
| 13-01-10 | 01 | 1 | P13-10 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -t "settlement"` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 2 | P13-11 | manual | N/A - visual integration test | N/A | ⬜ pending |
| 13-03-01 | 03 | 3 | P13-12 | manual | N/A - PDF rendering | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/land/__tests__/settlement.test.ts` — stubs for P13-01 through P13-09
- [ ] Update `src/core/json/__tests__/importData.test.ts` — stubs for P13-10 (settlement field handling)

*Existing vitest infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Settlement panel renders in distribution board | P13-11 | Visual integration with DnD Kanban | 1. Add properties in Step 4, 2. Navigate to distribution board, 3. Verify settlement method selector appears on each property card, 4. Test expand/collapse of each method |
| PDF settlement section renders per-property details | P13-12 | PDF rendering output | 1. Configure settlement methods on properties, 2. Generate PDF, 3. Verify Settlement Plan section shows per-property details with correct method-specific data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
