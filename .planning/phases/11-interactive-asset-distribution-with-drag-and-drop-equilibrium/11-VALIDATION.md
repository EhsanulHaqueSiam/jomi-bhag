---
phase: 11
slug: interactive-asset-distribution-with-drag-and-drop-equilibrium
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `bunx vitest run src/core/distribution/ src/components/__tests__/distribution.test.tsx` |
| **Full suite command** | `bunx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bunx vitest run src/core/distribution/ src/stores/__tests__/distributionStore.test.ts src/components/__tests__/distribution.test.tsx`
- **After every plan wave:** Run `bunx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 0 | P11-01 | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 0 | P11-02 | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 0 | P11-03 | unit | `bunx vitest run src/core/distribution/__tests__/algorithm.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-04 | 01 | 0 | P11-06 | unit | `bunx vitest run src/stores/__tests__/distributionStore.test.ts` | ❌ W0 | ⬜ pending |
| 11-01-05 | 01 | 0 | P11-04 | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx` | ❌ W0 | ⬜ pending |
| 11-01-06 | 01 | 0 | P11-05 | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx` | ❌ W0 | ⬜ pending |
| 11-01-07 | 01 | 0 | P11-07 | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx` | ❌ W0 | ⬜ pending |
| 11-01-08 | 01 | 0 | P11-08 | integration | `bunx vitest run src/components/__tests__/distribution.test.tsx` | ❌ W0 | ⬜ pending |
| 11-01-09 | 01 | 0 | P11-09 | unit | `bunx vitest run src/components/__tests__/pdf.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/distribution/__tests__/algorithm.test.ts` — stubs for P11-01, P11-02, P11-03 (unified items, smart shuffle, equilibrium status)
- [ ] `src/stores/__tests__/distributionStore.test.ts` — stubs for P11-06 (undo)
- [ ] `src/components/__tests__/distribution.test.tsx` — stubs for P11-04, P11-05, P11-07, P11-08 (board rendering, item moves, button visibility, mobile fallback)
- [ ] PDF distribution tests added to existing `src/components/__tests__/pdf.test.tsx` — covers P11-09

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop feel on mobile (touch sensor 500ms) | P11-04 | Requires real touch hardware | Long-press an item card on mobile device, verify drag activates after ~500ms hold |
| Shuffle animation smoothness | P11-02 | Visual quality assessment | Click Randomize, verify items animate smoothly to new positions |
| Celebratory animation on all-green | P11-03 | Visual quality assessment | Balance all groups, verify celebratory animation triggers |
| Kanban column scroll on many items | P11-04 | Layout stress test | Add 20+ items, verify columns scroll independently without layout breaks |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
