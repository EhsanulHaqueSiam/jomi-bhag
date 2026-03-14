---
phase: quick
plan: 12
type: execute
wave: 1
depends_on: []
files_modified: [README.md]
autonomous: true
requirements: []

must_haves:
  truths:
    - "README describes what the app is and who it's for"
    - "README lists all major features with enough detail for a first-time visitor to understand the app's scope"
    - "README includes tech stack, development setup, and live link"
    - "README reflects the app's current state (v1.0 complete, 17 phases shipped)"
  artifacts:
    - path: "README.md"
      provides: "Comprehensive project documentation"
      min_lines: 80
  key_links: []
---

<objective>
Rewrite README.md with comprehensive project details, full feature list, tech stack, usage guide, and development instructions for jomi-bhag — a Bangladeshi Islamic inheritance calculator web app.

Purpose: The current README is sparse (32 lines) and undersells a mature app that has completed 17 phases of development with rich features. A visitor or contributor needs to quickly understand what the app does, its full capabilities, and how to run it.

Output: A complete README.md that accurately represents the app's scope and capabilities.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/ROADMAP.md
@README.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite README.md with comprehensive content</name>
  <files>README.md</files>
  <action>
Rewrite README.md to include the following sections, drawing from PROJECT.md, ROADMAP.md, STATE.md, and the actual codebase structure. Keep the tone concise and informative — not marketing fluff.

**Header:**
- Project name: Jomi-Bhag (জমি-ভাগ) with brief tagline
- Live link: https://jomibhag.netlify.app
- Brief 2-3 sentence description: what it is, who it's for, what makes it unique (exact Faraid compliance, no rounding errors, Quranic references)

**Features section** — organized by category, each with a short description:

1. Faraid Calculation Engine
   - Exact fraction arithmetic (no floating-point rounding)
   - Full Hanafi jurisprudence support
   - 17 heir types with all blocking rules (16 Hajb Hirman + 5 Hajb Nuqsan)
   - Awl (proportional reduction) and Radd (surplus redistribution)
   - Special cases: Umariyyatayn, Mushtarakah, Kalalah
   - MFLO Section 4 opt-in toggle for orphaned grandchildren

2. Interactive Wizard
   - 4-step guided flow: Relationship, Family Members, Estate Inventory, Results
   - Supports spouse, children, siblings (full/consanguine/uterine)
   - Mobile-responsive design (375px+)

3. Property and Land Input
   - Multiple property types: agricultural, residential, commercial, mixed
   - Bangladesh-specific land units (decimal, katha, bigha) with regional conversion (Dhaka vs Rajshahi katha)
   - Sub-items: houses/structures, trees/crops, ponds
   - Government mouza rate auto-suggestion for 84 upazilas across 8 divisions

4. Movable Assets
   - Gold/silver (weight, purity, BAJUS rate suggestion)
   - Cash, vehicles, jewelry, furniture, livestock, custom items
   - Indivisible asset resolution: sell, buyout, or Qurah (Islamic lot drawing)

5. Asset Distribution Board
   - Drag-and-drop Kanban for distributing assets among heir groups
   - Real-time equilibrium indicators (green/amber/red)
   - Smart randomization algorithm
   - Per-individual breakdown (Son 1, Son 2, Daughter 1, etc.)
   - Parcel splitting for precise area-based division

6. Land Settlement Methods
   - Sell and Split proceeds
   - Physical Division by value with sub-parcels
   - Buyout with installment plan (no interest — Islamic finance compliant)
   - Joint Ownership with income calculator

7. Results and References
   - Dual mode: Simple (fractions/percentages) and Detailed (full calculation trace with legal citations)
   - Every share backed by Quranic ayah and/or Hadith reference
   - Step-by-step calculation explanation
   - Pie chart and bar chart visualizations

8. Export and Persistence
   - PDF download and print with full division report
   - JSON export/import for backup and portability
   - localStorage persistence (survives page refresh)
   - Scenario comparison (side-by-side "what if" analysis)

**Tech Stack section:**
- Frontend: React 19, TypeScript 5.9, TailwindCSS 4, Vite 8
- State: Zustand with localStorage persistence
- Charts: Recharts
- PDF: @react-pdf/renderer
- DnD: @dnd-kit
- Animations: Motion (Framer Motion)
- Math: fraction.js (exact arithmetic)
- Testing: Vitest + Testing Library + Playwright (E2E)
- Hosting: Netlify (static site)
- Runtime: Bun

**Development section:**
```
bun install
bun run dev        # Start dev server
bun run build      # Production build
bun run test:run   # Unit/integration tests
bun run test:e2e   # E2E tests (Playwright)
```

**Islamic Basis section** — brief note:
- All calculations follow Hanafi Faraid jurisprudence
- Every share allocation traceable to Quran (Surah An-Nisa) and Sunnah
- No favoritism, no manual override of Faraid rules
- App is a calculation aid, not a legal substitute — users advised to consult qualified scholars and lawyers

**License section:**
- Free forever — public service for the Bangladeshi community

Do NOT include:
- Badges or shields
- Table of contents (README is not that long)
- Contributing guidelines (solo project)
- Changelog (that's what git log is for)
- Screenshots placeholders (unless actual screenshot files exist in repo)
  </action>
  <verify>
    <automated>test -f README.md && wc -l README.md | awk '{if ($1 >= 80) print "PASS: " $1 " lines"; else print "FAIL: only " $1 " lines"}'</automated>
  </verify>
  <done>README.md contains comprehensive project description with all major features, tech stack, dev setup, Islamic basis note, and license. Content accurately reflects the app's current v1.0-complete state with 17 phases of features shipped.</done>
</task>

</tasks>

<verification>
- README.md exists with 80+ lines of content
- All 8 feature categories covered
- Tech stack matches package.json
- Dev commands match package.json scripts
- Live link present and correct
- No false claims about features that don't exist
</verification>

<success_criteria>
A first-time visitor to the GitHub repo can read the README and understand:
1. What the app does and who it's for
2. The full scope of features available
3. The Islamic jurisprudence basis
4. How to run it locally
5. Where to use it (live link)
</success_criteria>

<output>
After completion, create `.planning/quick/12-update-readme-with-details-and-features/12-SUMMARY.md`
</output>
