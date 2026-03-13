---
phase: 7
slug: pdf-export-and-print
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x + @testing-library/react 16.3.x |
| **Config file** | `vite.config.ts` (merged Vite+Vitest config) |
| **Quick run command** | `npx vitest run src/components/__tests__/pdf.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/__tests__/pdf.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | OUTP-01 | integration | `npx vitest run src/components/__tests__/pdf.test.tsx -t "OUTP-01"` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | OUTP-01 | unit | `npx vitest run src/components/__tests__/pdf.test.tsx -t "heir table"` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | OUTP-02 | integration | `npx vitest run src/components/__tests__/pdf.test.tsx -t "OUTP-02"` | ❌ W0 | ⬜ pending |
| 07-01-04 | 01 | 1 | OUTP-03 | unit | `npx vitest run src/components/__tests__/pdf.test.tsx -t "OUTP-03"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/__tests__/pdf.test.tsx` — stubs for OUTP-01, OUTP-02, OUTP-03 (button rendering, PDF data assembly, disclaimer content)
- [ ] Font TTF files in `src/assets/fonts/` — Inter-Regular.ttf, Inter-SemiBold.ttf, Inter-Bold.ttf, NotoNaskhArabic-Regular.ttf
- [ ] Mock `@react-pdf/renderer` in tests (replace Document/Page/View/Text with div/span wrappers)
- [ ] Mock `html-to-image` toPng to return fake data URL
- [ ] No framework install needed — Vitest already configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF renders correct visual layout (tables, charts, spacing) | OUTP-01 | @react-pdf cannot be rendered in jsdom | Download PDF, visually inspect layout, tables, chart images, page breaks |
| Arabic Quranic text renders correctly in PDF | OUTP-01 | Font shaping/RTL rendering requires visual check | Verify Arabic text is readable, right-to-left, no broken glyphs |
| Print dialog opens with correct content | OUTP-02 | Browser print dialog not testable in jsdom | Click Print button, verify print preview matches PDF |
| Ink-friendly charts in print output | OUTP-02 | Print color rendering is hardware-dependent | Print to B&W, verify chart segments distinguishable |
| Page breaks keep sections together | OUTP-01 | Visual layout verification | Check multi-page PDFs for orphaned headers or split tables |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 8s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
