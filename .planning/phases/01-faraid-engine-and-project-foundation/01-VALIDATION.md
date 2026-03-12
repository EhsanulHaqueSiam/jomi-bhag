---
phase: 1
slug: faraid-engine-and-project-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `bun run test` |
| **Full suite command** | `bun run test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test`
- **After every plan wave:** Run `bun run test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DSGN-04 | build | `bun run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FARD-01 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FARD-05 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | FARD-06 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | FARD-07, FARD-08 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | FARD-02 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | FARD-03 | unit | `bun run test` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | FARD-04 | unit | `bun run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` — install and configure vitest
- [ ] `src/core/faraid/__tests__/` — test directory structure
- [ ] `fraction.js` — install for exact arithmetic

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Netlify deploy | DSGN-04 | Requires Netlify account and deploy | Build locally, verify dist/ output is valid static site |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
