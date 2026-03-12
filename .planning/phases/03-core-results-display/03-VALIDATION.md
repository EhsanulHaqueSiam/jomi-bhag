---
phase: 3
slug: core-results-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.0 |
| **Config file** | `vite.config.ts` (merged Vite+Vitest defineConfig) |
| **Quick run command** | `npx vitest run src/components/__tests__/results.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/__tests__/results.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | RSLT-01 | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "displays fraction percentage and monetary"` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | RSLT-02 | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "shows Quranic reference"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | RSLT-03 | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "step accordion"` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | RSLT-06 | integration | `npx vitest run src/components/__tests__/results.test.tsx -t "mode toggle"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/__tests__/results.test.tsx` — stubs for RSLT-01, RSLT-02, RSLT-03, RSLT-06
- [ ] Test helper: mock `FaraidOutput` factory for consistent test data (various scenarios: simple, awl, radd, blocked heirs, special cases)

*Existing test infrastructure (Vitest, jsdom, React Testing Library) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Arabic text renders RTL correctly with Noto Naskh Arabic | RSLT-02 | Font rendering + RTL layout require visual inspection | Open expandable Quran reference, verify Arabic text is right-aligned and renders diacritics |
| Accordion animation smooth open/close | RSLT-03 | Animation quality is visual | Toggle accordion items, verify no flicker or layout jump |
| Mobile responsive layout (375px+) | RSLT-06 | Responsive breakpoints need visual check | Resize browser to 375px, verify cards stack single-column and controls are tappable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
