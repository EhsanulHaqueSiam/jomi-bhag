---
phase: 6
slug: charts-and-visualization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.ts` (merged Vite+Vitest config) |
| **Quick run command** | `npx vitest run src/components/__tests__/charts.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/__tests__/charts.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | RSLT-04 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "RSLT-04"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | RSLT-04 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "center label"` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | RSLT-05 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "RSLT-05"` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | RSLT-05 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "no estate value"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/__tests__/charts.test.tsx` — stubs for RSLT-04, RSLT-05
- [ ] ResponsiveContainer mock in test file (jsdom doesn't support ResizeObserver)
- [ ] No framework install needed — Vitest already configured

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Emerald gradient visually distinguishable across heir types | RSLT-04 | Color perception is visual | Compare segment colors at 375px and desktop widths |
| Tooltip shows correct data on hover/tap | RSLT-04, RSLT-05 | Touch interaction not testable in jsdom | Hover segments/bars, verify fraction + % + BDT |
| Charts stack vertically on mobile (375px) | RSLT-04, RSLT-05 | Layout responsive behavior | Resize to 375px, verify vertical stacking |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
