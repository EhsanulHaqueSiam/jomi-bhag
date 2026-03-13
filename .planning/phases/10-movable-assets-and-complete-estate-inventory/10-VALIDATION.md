---
phase: 10
slug: movable-assets-and-complete-estate-inventory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `npx vitest run src/core/assets/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/core/assets/ src/components/__tests__/assets.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | SC-1 | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | SC-1 | unit | `npx vitest run src/components/__tests__/assets.test.tsx -x` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | SC-2 | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | SC-3 | unit | `npx vitest run src/stores/__tests__/wizardStore.test.ts -x` | ✅ extend | ⬜ pending |
| 10-02-01 | 02 | 2 | SC-4 | unit | `npx vitest run src/core/assets/__tests__/indivisible.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | SC-4 | unit | `npx vitest run src/core/assets/__tests__/indivisible.test.ts -x` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 2 | SC-5 | unit | `npx vitest run src/core/assets/__tests__/valuation.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/assets/__tests__/valuation.test.ts` — stubs for SC-1, SC-2, SC-3, SC-5 (gold value computation, asset total, unit conversion)
- [ ] `src/core/assets/__tests__/indivisible.test.ts` — stubs for SC-4 (buyout calculation, sell & divide amounts)
- [ ] `src/components/__tests__/assets.test.tsx` — stubs for SC-1 (asset card rendering, form rendering, store integration)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Qurah ceremony animation and reveal | SC-4 | Complex animation sequence with staggered timing | Trigger Qurah for indivisible item, verify bismillah display, staggered reveal, gold accent theme |
| Gold unit conversion live display | SC-2 | Visual UX feedback below input | Enter gold weight in vori, switch to grams/tola, verify live conversion renders correctly |
| Estate breakdown card expansion | SC-3 | Visual layout and expandable detail | Add land + movable assets, verify expanded breakdown shows per-category movable detail |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
