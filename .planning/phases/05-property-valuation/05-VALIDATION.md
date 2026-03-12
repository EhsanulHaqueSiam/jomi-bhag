---
phase: 5
slug: property-valuation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x + @testing-library/react 16.3.x |
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
| 05-01-01 | 01 | 1 | VALP-01 | unit | `npx vitest run src/data/__tests__/mouza-rates.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | VALP-01 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | VALP-01 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | VALP-02 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 1 | VALP-02 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | VALP-03 | unit | `npx vitest run src/core/land/__tests__/valuation.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | VALP-03 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | VALP-03 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 1 | VALP-04 | unit | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-05 | 02 | 1 | VALP-04 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-06 | 02 | 1 | VALP-04 | integration | `npx vitest run src/components/__tests__/valuation.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/__tests__/mouza-rates.test.ts` — stubs for VALP-01 (rate lookup unit tests)
- [ ] `src/core/land/__tests__/valuation.test.ts` — stubs for VALP-03 (breakdown computation)
- [ ] `src/components/__tests__/valuation.test.tsx` — stubs for VALP-01/02/03/04 (integration tests)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rate suggestion visual placement below land value input | VALP-01 | Layout/visual positioning | Inspect property card with division+upazila+type set; verify suggestion appears below land value field |
| Govt rate vs manual badge visual distinction | VALP-03 | Color/styling verification | Add properties with both auto and manual values; verify green "Govt rate" and gray "Manual" badges |
| Estate breakdown card responsive layout | VALP-03 | Responsive design | Resize browser 375px-1280px; verify breakdown card layout adapts |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
