# Phase 6: Charts and Visualization - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Pie chart for proportional share distribution and bar chart for monetary comparison per heir, integrated into the Results page. No new data computation — charts consume existing `ShareResult` data from Phase 1/3 engine output and `totalEstateValue` from Phase 5. No PDF chart rendering (Phase 7), no interactive scenario comparison (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Chart Placement and Visibility
- Charts placed between EstateBreakdownCard and heir cards grid on Results page
- Both pie and bar charts always visible in both Simple and Detailed modes — no extra toggle
- Side-by-side on desktop (2-column grid: pie left, bar right), stacked vertically on mobile
- When no estate value entered: pie chart shows (fractions work without BDT), bar chart hides with hint "Enter estate value to see monetary comparison"

### Pie Chart Design
- Segments represent active heirs only — blocked heirs excluded (already shown in BlockedHeirsSection)
- Color scheme: emerald gradient — different shades of emerald/green per heir type, consistent with app palette
- External legend below/beside pie: colored dot + "Son x2 (41.7%)" — count shown when > 1
- No labels inside segments — keeps pie clean
- Pie center label shows total heir count (e.g., "5 heirs")
- Subtle section title "Share Distribution" above chart

### Bar Chart Design
- One bar per heir type showing total BDT amount (e.g., "Son x2: ৳10L total") — matches pie chart segments
- Horizontal bars: heir label on left, bar extends right — better for long heir type labels
- Bar chart uses same emerald gradient colors as pie for consistency
- Subtle section title "Monetary Comparison" above chart
- Only visible when totalEstateValue > 0

### Adjustment Treatment in Charts
- Charts show final adjusted values only (post-Awl/Radd) — AdjustmentBanner already explains the adjustment, no need to duplicate in charts

### Chart Interactivity
- Hover tooltips only: hover/tap a pie segment or bar shows tooltip with heir name, fraction, percentage, and BDT amount
- No click-to-highlight or scroll-to-card behavior — keep it simple
- Mobile (375px+): charts stack vertically, pie ~200px diameter, bar full-width, labels may abbreviate ("P. Brother")

### Claude's Discretion
- Chart library choice (Recharts suggested in roadmap, but open to alternatives)
- Exact emerald gradient shade assignments per heir type
- Tooltip styling and content formatting
- Pie chart inner/outer radius proportions
- Bar chart height scaling and spacing
- Legend positioning (below vs beside pie on desktop)
- Mobile label abbreviation strategy
- Animation on chart mount (fade-in, grow, etc.)

</decisions>

<specifics>
## Specific Ideas

- Charts bridge the gap between numbers and understanding — families can point at the pie and say "this is your share"
- Emerald gradient keeps charts feeling integrated with the app, not like a bolted-on analytics widget
- Horizontal bars work better for BD context where heir type names can be long ("Paternal Brother", "Son's Daughter")
- Center heir count in pie gives immediate context — "5 heirs sharing this estate"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ShareResult` type: `heirType`, `count`, `totalShare`, `sharePerHeir`, `shareType` — all chart data
- `HEIR_TYPE_LABELS`: Maps heir types to display names for chart labels
- `fractionToPercent()`: Converts fractions to percentage strings for tooltips
- `fractionToBDT()`: Converts fractions to BDT strings for bar chart / tooltips
- `shareTypeBadgeStyles` in HeirCard: Existing color mapping per share type (reference for consistency)
- `motion/react` AnimatePresence: For chart mount animations
- No chart library currently installed — needs adding

### Established Patterns
- Emerald + gold oklch palette in TailwindCSS 4
- Components read from `useWizardStore` directly (anti-prop-drilling)
- `Intl.NumberFormat('en-IN')` for BDT formatting in tooltips
- Results page filters `activeShares = results.shares.filter(s => s.shareType !== 'blocked')`

### Integration Points
- `ResultsPage.tsx`: Insert chart section between `EstateBreakdownCard` and heir cards grid (line ~53)
- `useWizardStore` selectors: `results` (FaraidOutput), `totalEstateValue` (number)
- Chart data derived from `results.shares` — same activeShares filter already used in ResultsPage

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-charts-and-visualization*
*Context gathered: 2026-03-13*
