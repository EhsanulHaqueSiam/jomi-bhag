---
phase: 17
slug: dead-code-cleanup-and-documentation-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (via vite.config.ts) |
| **Config file** | `vite.config.ts` (unified Vite+Vitest config) |
| **Quick run command** | `npx vitest run --reporter=verbose 2>&1 \| tail -20` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `npx vitest run && npx tsc -b --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green + TypeScript compilation clean
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | P9-SC3 | manual-only | N/A — documentation change, verify by reading REQUIREMENTS.md | N/A | ⬜ pending |
| 17-01-02 | 01 | 1 | SC-1 | build | `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 17-01-03 | 01 | 1 | SC-2 | unit | `npx vitest run src/components/__tests__/charts.test.tsx` | ✅ | ⬜ pending |
| 17-01-04 | 01 | 1 | SC-3 | build | `npx tsc -b --noEmit` | ✅ | ⬜ pending |
| 17-01-05 | 01 | 1 | SC-4 | unit | `npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test files needed. The deleted test file (`division.test.tsx`) tested dead components.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| REQUIREMENTS.md traceability shows "Complete" for Phase 9-14 | P9-SC3 | Documentation change — no automated assertion needed | Read REQUIREMENTS.md, verify all Phase 9-14 rows show "Complete" with checked boxes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
