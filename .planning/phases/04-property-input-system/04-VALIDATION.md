---
phase: 04
slug: property-input-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts (merged Vite+Vitest config) |
| **Quick run command** | `bunx vitest run --reporter=verbose` |
| **Full suite command** | `bunx vitest run --reporter=verbose && npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bunx vitest run --reporter=verbose`
- **After every plan wave:** Run `bunx vitest run --reporter=verbose && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PROP-01, PROP-06 | unit | `bunx vitest run src/core/__tests__/land-units.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | PROP-02 | unit+integration | `bunx vitest run src/components/__tests__/property.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | PROP-03, PROP-04, PROP-05 | unit+integration | `bunx vitest run src/components/__tests__/property.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | PROP-01-06 | integration | `bunx vitest run src/components/__tests__/property.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/__tests__/land-units.test.ts` — stubs for PROP-01, PROP-06 land unit conversion
- [ ] `src/components/__tests__/property.test.tsx` — stubs for PROP-02 through PROP-05 property input components

*Existing vitest infrastructure and @testing-library/react cover framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live conversion display updates in real-time | PROP-01 | Visual timing/animation | Enter area value, verify conversion text updates without delay |
| Inline card expand/collapse animation | PROP-02 | Visual smoothness | Add property, verify card expands smoothly with motion/react |
| Mobile layout at 375px | PROP-02 | Responsive visual | Resize to 375px, verify cards stack correctly and touch targets are adequate |
| Regional katha value correctness | PROP-06 | Domain accuracy | Select Dhaka (720 sqft/katha) vs Rajshahi (1620 sqft/katha), verify displayed conversions match |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
