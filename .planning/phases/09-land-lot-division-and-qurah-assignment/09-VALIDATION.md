---
phase: 9
slug: land-lot-division-and-qurah-assignment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `npx vitest run src/core/land/__tests__/division.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/core/land/__tests__/division.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | P9-SC1 | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "creates groups from shares"` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | P9-SC2 | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "greedy best-fit"` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | P9-SC2 | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "cash compensation"` | ❌ W0 | ⬜ pending |
| 09-01-04 | 01 | 1 | P9-SC3 | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "qurah shuffle"` | ❌ W0 | ⬜ pending |
| 09-01-05 | 01 | 1 | P9-SC3 | unit | `npx vitest run src/core/land/__tests__/division.test.ts -t "move parcel"` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | P9-SC3 | component | `npx vitest run src/components/__tests__/division.test.tsx` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | P9-SC4 | component | `npx vitest run src/components/__tests__/division.test.tsx -t "compensation banner"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/land/__tests__/division.test.ts` — stubs for P9-SC1, P9-SC2, P9-SC3 (algorithm), P9-SC4
- [ ] `src/components/__tests__/division.test.tsx` — stubs for P9-SC3 (UI), P9-SC4 (banner)

*Existing infrastructure covers framework and fixtures — no new installs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gold-accented Qurah ceremony feel | P9-SC3 | Visual/aesthetic quality | Verify bismillah header, gold styling, animation timing feel respectful |
| Staggered card reveal animation | P9-SC3 | Animation timing subjective | Click "Draw Lots" and verify cards appear one-by-one with smooth stagger |
| PDF land division section layout | P9-SC4 | PDF visual layout | Export PDF and verify section appears after Property Breakdown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
