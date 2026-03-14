---
phase: 15
slug: fix-json-import-and-persistence-gaps
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
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
| 15-01-01 | 01 | 1 | P14-18 | unit | `npx vitest run src/hooks/__tests__/useJsonImport.test.ts -x` | Exists (needs new cases) | pending |
| 15-01-02 | 01 | 1 | P14-18 | unit | `npx vitest run src/hooks/__tests__/useJsonImport.test.ts -x` | Exists (needs new cases) | pending |
| 15-01-03 | 01 | 1 | PRST-02 | unit | `npx vitest run src/components/scenarios/__tests__/ScenariosPage.test.ts -x` | Needs creation | pending |
| 15-01-04 | 01 | 1 | TECH-01 | unit | `npx vitest run src/stores/__tests__/individualDistributionStore.test.ts -x` | Needs creation | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/__tests__/useJsonImport.test.ts` — add test cases for individual data restoration (customNames, qurahUsed, reset on no individual data)
- [ ] `src/stores/__tests__/individualDistributionStore.test.ts` — add splitOrigins persistence and Record operation tests

*Existing infrastructure covers framework setup — only new test cases needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| splitOrigins survives actual page reload | TECH-01 | Full browser reload can't be simulated in vitest | 1. Split a parcel in individual view 2. Refresh browser 3. Verify merge button still works |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
