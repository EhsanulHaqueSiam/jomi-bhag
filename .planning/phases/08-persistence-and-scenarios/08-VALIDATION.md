---
phase: 8
slug: persistence-and-scenarios
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PRST-01 | unit | `npx vitest run src/stores/__tests__/fractionStorage.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | PRST-01 | unit | `npx vitest run src/stores/__tests__/wizardStore.test.ts -t "persist" -x` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | PRST-02, PRST-03 | unit | `npx vitest run src/stores/__tests__/scenariosStore.test.ts -x` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | PRST-02 | unit | `npx vitest run src/components/__tests__/scenarios.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/stores/__tests__/fractionStorage.test.ts` — Fraction replacer/reviver roundtrip tests for PRST-01
- [ ] `src/stores/__tests__/scenariosStore.test.ts` — scenario CRUD, 20-scenario limit, comparison selection for PRST-02/PRST-03
- [ ] `src/components/__tests__/scenarios.test.tsx` — ScenariosPage rendering, comparison view, empty state for PRST-02
- [ ] Update `src/stores/__tests__/wizardStore.test.ts` — persist middleware integration (beforeEach needs localStorage.clear()) for PRST-01

*Existing infrastructure covers test framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Data persists across actual browser refresh | PRST-01 | localStorage survival requires real browser | 1. Fill wizard, 2. Refresh page, 3. Verify data restored |
| Side-by-side comparison visual layout | PRST-02 | Visual layout verification | 1. Save 2 scenarios, 2. Select both, 3. Click Compare, 4. Verify two-column layout |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
