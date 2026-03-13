---
phase: 12
slug: json-import-and-export-for-assets
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | vite.config.ts (merged Vite+Vitest config) |
| **Quick run command** | `npx vitest run src/core/json/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/core/json/ src/components/__tests__/json.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | P12-01 | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | P12-02 | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-01-03 | 01 | 1 | P12-12 | unit | `npx vitest run src/core/json/__tests__/exportData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 1 | P12-03 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-02-02 | 02 | 1 | P12-04 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-02-03 | 02 | 1 | P12-05 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-02-04 | 02 | 1 | P12-06 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-02-05 | 02 | 1 | P12-07 | unit | `npx vitest run src/core/json/__tests__/importData.test.ts -x` | ❌ W0 | ⬜ pending |
| 12-03-01 | 03 | 2 | P12-08 | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | ❌ W0 | ⬜ pending |
| 12-03-02 | 03 | 2 | P12-09 | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | ❌ W0 | ⬜ pending |
| 12-03-03 | 03 | 2 | P12-10 | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | ❌ W0 | ⬜ pending |
| 12-03-04 | 03 | 2 | P12-11 | integration | `npx vitest run src/components/__tests__/json.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/core/json/__tests__/exportData.test.ts` — stubs for P12-01, P12-02, P12-12
- [ ] `src/core/json/__tests__/importData.test.ts` — stubs for P12-03 through P12-07
- [ ] `src/components/__tests__/json.test.tsx` — stubs for P12-08 through P12-11

*Existing infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop visual feedback | P12-09 | DnD events hard to simulate in jsdom | 1. Open Step 1, 2. Drag a .json file over drop zone, 3. Verify visual highlight appears, 4. Drop file, 5. Verify import triggers |
| File download triggers browser save | P12-08 | Anchor click download is browser-native | 1. Go to Results page, 2. Click "Export JSON", 3. Verify .json file downloads with correct name |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
