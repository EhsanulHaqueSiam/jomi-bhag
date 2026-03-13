---
phase: 14
slug: per-heir-asset-breakdown-individual-kanban-cards-showing-each-heir-s-land-parcels-and-assets-separately
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-14
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vite.config.ts (unified Vite+Vitest) |
| **Quick run command** | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| P14-01 | 02 | 2 | Toggle between group and individual views | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | ✅ TDD | ⬜ pending |
| P14-02 | 01 | 1 | Individual columns created from group expansion | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | ✅ TDD | ⬜ pending |
| P14-03 | 02 | 2 | DnD between individual columns | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | ✅ TDD | ⬜ pending |
| P14-04 | 02 | 1 | Parcel split/merge creates sub-parcel items | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | ✅ TDD | ⬜ pending |
| P14-05 | 02 | 1 | Per-individual equilibrium bars (2%/5% thresholds) | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | ✅ TDD | ⬜ pending |
| P14-06 | 03 | 2 | Cash compensation between individuals (greedy min transfers) | unit | `npx vitest run src/core/distribution/__tests__/individual-algorithm.test.ts -x` | ✅ TDD | ⬜ pending |
| P14-07 | 01 | 1 | Inline rename with keyboard support | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | ✅ TDD | ⬜ pending |
| P14-08 | 03 | 2 | Qurah ceremony with 200ms stagger | component | `npx vitest run src/components/__tests__/individual-distribution.test.tsx -x` | ✅ TDD | ⬜ pending |
| P14-09 | 01 | 1 | Custom names persist in store and JSON export | unit | `npx vitest run src/stores/__tests__/individualDistributionStore.test.ts -x` | ✅ TDD | ⬜ pending |
| P14-10 | 04 | 2 | PDF individual breakdown section | component | `npx vitest run src/components/__tests__/pdf-individual.test.tsx -x` | ✅ TDD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Test Files — Created via TDD in Wave 1/2/3 Tasks

All test files are created inline by TDD tasks (tdd="true") during execution. No separate Wave 0 plan is needed.

- `src/core/distribution/__tests__/individual-algorithm.test.ts` — created by Plan 01 Task 1 (Wave 1, tdd=true)
- `src/stores/__tests__/individualDistributionStore.test.ts` — created by Plan 01 Task 2 (Wave 1, tdd=true)
- `src/components/__tests__/individual-distribution.test.tsx` — created by Plan 02 Task 2 (Wave 2)
- `src/core/json/__tests__/individual-json.test.ts` — created by Plan 03 Task 2 (Wave 2, tdd=true)
- `src/components/__tests__/pdf-individual.test.tsx` — created by Plan 04 Task 2 (Wave 3, tdd=true)

*No Wave 0 stubs required — test scaffolds are written as RED step in each TDD task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Qurah ceremony visual animation | P14-08 | Animation timing is visual | Trigger Qurah, verify staggered reveal ~200ms per column |
| Mobile DnD de-emphasis | P14-03 | Touch interaction UX | Test on mobile device, verify "Move to..." dropdown is primary |
| Celebratory animation | P14-05 | Visual animation | Balance all heirs, verify celebration triggers |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 not needed — tests created via TDD tasks
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
