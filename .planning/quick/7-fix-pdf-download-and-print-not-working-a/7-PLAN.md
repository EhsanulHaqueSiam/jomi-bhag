---
phase: quick-fix
plan: 7
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/usePdfExport.tsx
  - src/components/results/ResultsPage.tsx
autonomous: true
---

<objective>
Fix PDF download and print not working. Add error handling and mobile-safe mechanisms.
</objective>

<tasks>
<task type="auto">
  <name>Fix PDF export error handling and print mechanism</name>
  <files>src/hooks/usePdfExport.tsx, src/components/results/ResultsPage.tsx</files>
  <action>
    1. Wrap chart capture in try/catch (non-critical)
    2. Add error state to usePdfExport hook
    3. Catch errors in downloadPdf/printPdf, surface via error state
    4. Use hidden iframe for print instead of window.open (avoids popup blockers)
    5. Add error banner in ResultsPage with dismiss button
  </action>
</task>
</tasks>
