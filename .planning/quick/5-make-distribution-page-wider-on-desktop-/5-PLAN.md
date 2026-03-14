---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/AppLayout.tsx
  - src/components/distribution/DistributionBoard.tsx
  - src/components/distribution/IndividualBoard.tsx
  - src/components/distribution/HeirColumn.tsx
  - src/components/distribution/IndividualColumn.tsx
autonomous: true
requirements: [QUICK-5]

must_haves:
  truths:
    - "Distribution and division pages use full available width on desktop (up to 7xl/1280px)"
    - "Wizard and scenarios pages retain the current narrow centered layout (max-w-lg/max-w-xl)"
    - "Mobile layout is completely unchanged across all pages"
    - "Kanban columns are comfortably wide on desktop with no cramped scrolling"
    - "Column card bodies grow tall enough to show assets without excessive scrolling"
  artifacts:
    - path: "src/components/layout/AppLayout.tsx"
      provides: "Page-aware responsive container widths"
      contains: "max-w-5xl"
    - path: "src/components/distribution/HeirColumn.tsx"
      provides: "Taller column body on desktop"
    - path: "src/components/distribution/IndividualColumn.tsx"
      provides: "Taller column body on desktop"
  key_links:
    - from: "AppLayout.tsx"
      to: "page prop"
      via: "conditional className on main element"
      pattern: "distribution|division"
---

<objective>
Make distribution and division pages wider on desktop/laptop screens for comfortable kanban board use.

Purpose: The current AppLayout constrains ALL pages to md:max-w-lg (512px) / lg:max-w-xl (576px), which is far too narrow for kanban boards with multiple columns. Distribution and division pages need full-width layouts while wizard/scenarios pages should keep their narrow centered card design.

Output: Page-aware responsive layout where kanban pages get wide containers and wizard pages stay narrow.
</objective>

<execution_context>
@/home/siam/.claude/get-shit-done/workflows/execute-plan.md
@/home/siam/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/layout/AppLayout.tsx
@src/components/distribution/DistributionBoard.tsx
@src/components/distribution/IndividualBoard.tsx
@src/components/distribution/HeirColumn.tsx
@src/components/distribution/IndividualColumn.tsx
@src/types/scenario.ts

<interfaces>
From src/types/scenario.ts:
```typescript
export type AppPage = 'wizard' | 'scenarios' | 'division' | 'distribution'
```

From src/components/layout/AppLayout.tsx:
```typescript
interface AppLayoutProps {
  children: ReactNode
  page: AppPage
  onNavigate: (page: AppPage) => void
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make AppLayout width page-aware</name>
  <files>src/components/layout/AppLayout.tsx</files>
  <action>
    In AppLayout.tsx, make the `<main>` element's max-width and the inner white card wrapper responsive to the `page` prop.

    1. Define a helper constant or inline ternary that determines if the page is a "wide" page:
       ```typescript
       const isWide = page === 'distribution' || page === 'division'
       ```

    2. Change the `<main>` element className from the current static:
       ```
       className="relative px-4 pb-32 md:mx-auto md:max-w-lg md:pb-8 lg:max-w-xl"
       ```
       To page-aware classes:
       - For wide pages (distribution/division): `md:max-w-5xl lg:max-w-7xl md:px-6 lg:px-8`
       - For narrow pages (wizard/scenarios): keep current `md:max-w-lg lg:max-w-xl`
       - Keep shared classes: `relative px-4 pb-32 md:mx-auto md:pb-8`

    3. For the inner white card `<div>`, conditionally apply:
       - For wide pages: remove `rounded-2xl border border-gray-100 shadow-sm` and white background (let the kanban board breathe without a constraining card wrapper). Use transparent/no-card styling: just `p-0 md:p-4` with no border/shadow/bg.
       - For narrow pages: keep current `rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-8`

    IMPORTANT: Do NOT change ANY mobile classes. The `px-4`, `pb-32`, and all non-prefixed classes must remain identical. Only `md:` and `lg:` prefixed classes change.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>AppLayout renders wide container (max-w-5xl/7xl) for distribution/division pages and narrow container (max-w-lg/xl) for wizard/scenarios. Mobile layout unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: Increase kanban column min-width and remove maxHeight cap on desktop</name>
  <files>
    src/components/distribution/DistributionBoard.tsx
    src/components/distribution/IndividualBoard.tsx
    src/components/distribution/HeirColumn.tsx
    src/components/distribution/IndividualColumn.tsx
  </files>
  <action>
    With the wider container from Task 1, columns now have room to breathe. Make these adjustments:

    **DistributionBoard.tsx (line 119):**
    Change the column wrapper min-width from `lg:min-w-[280px]` to `lg:min-w-[300px]` for more comfortable columns.

    **IndividualBoard.tsx (line 254):**
    Change the column wrapper min-width from `lg:min-w-[260px]` to `lg:min-w-[280px]` for more comfortable columns.

    **HeirColumn.tsx (line 81):**
    Change the body div from:
    ```tsx
    <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4" style={{ maxHeight: '400px' }}>
    ```
    To use a responsive approach -- keep 400px on mobile but allow taller on desktop:
    ```tsx
    <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4 max-h-[400px] lg:max-h-[600px]">
    ```
    Remove the inline `style={{ maxHeight: '400px' }}` and use Tailwind classes instead so the lg breakpoint can override.

    **IndividualColumn.tsx (line 137):**
    Same change as HeirColumn -- replace the inline style maxHeight with Tailwind classes:
    ```tsx
    <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4 max-h-[400px] lg:max-h-[600px]">
    ```
    Remove the inline `style={{ maxHeight: '400px' }}`.

    IMPORTANT: Do NOT change DnD sensor configuration, drag overlay, collision detection, or any non-layout code. Only touch layout/sizing classes.
  </action>
  <verify>
    <automated>cd /home/siam/Personal/jomi-bhag && npx tsc --noEmit 2>&1 | head -20 && npx vitest run --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>Kanban columns have comfortable min-widths (300px/280px) on desktop. Column card bodies allow 600px height on lg+ screens instead of being capped at 400px. Mobile layout completely unchanged. All existing tests pass. DnD functionality unaffected.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no type errors
2. `npx vitest run` -- all existing tests pass
3. Visual check: open distribution page on desktop browser (>1024px width) -- kanban columns should spread across the full width comfortably
4. Visual check: open wizard page on desktop -- layout should look identical to before (narrow centered card)
5. Visual check: open any page on mobile viewport (375px) -- layout should be identical to before
</verification>

<success_criteria>
- Distribution/division pages use max-w-5xl (md) / max-w-7xl (lg) container
- Wizard/scenarios pages retain max-w-lg (md) / max-w-xl (lg) container
- Kanban column bodies allow 600px height on desktop (up from 400px)
- Column min-widths increased for comfortable desktop use
- Mobile layout is pixel-identical to before
- All tests pass, no type errors
- DnD drag-and-drop still works correctly
</success_criteria>

<output>
After completion, create `.planning/quick/5-make-distribution-page-wider-on-desktop-/5-SUMMARY.md`
</output>
