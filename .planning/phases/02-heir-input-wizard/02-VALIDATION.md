---
phase: 2
slug: heir-input-wizard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | vite.config.ts (merged Vite+Vitest config) |
| **Quick run command** | `bun run test:run` |
| **Full suite command** | `bun run test:run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test:run`
- **After every plan wave:** Run `bun run test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HEIR-01 | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "relationship"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | HEIR-02 | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "brothers"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | HEIR-03 | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "sisters"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | HEIR-04 | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "children"` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | HEIR-05 | unit | `bun vitest run src/stores/__tests__/wizardStore.test.ts -t "parents"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DSGN-01 | component | `bun vitest run src/components/__tests__/wizard.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DSGN-02 | manual-only | Manual: Chrome DevTools 375px viewport | N/A | ⬜ pending |
| 02-02-03 | 02 | 1 | DSGN-03 | component | `bun vitest run src/components/__tests__/wizard.test.tsx -t "navigation"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/stores/__tests__/wizardStore.test.ts` — stubs for HEIR-01 through HEIR-05 (state logic, FaraidInput building)
- [ ] `src/components/__tests__/wizard.test.tsx` — stubs for DSGN-01, DSGN-03 (component rendering, step navigation)
- [ ] `src/components/__tests__/StepperButton.test.tsx` — stepper button min/max/increment behavior
- [ ] Vitest config already supports `*.test.tsx` in jsdom environment — no framework changes needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mobile viewport renders without overflow at 375px | DSGN-02 | Visual layout verification requires real browser viewport | Open Chrome DevTools, set viewport to 375x667 (iPhone SE), navigate through all 3 wizard steps, verify no horizontal scrollbar and all tap targets ≥ 44x44px |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
