# Phase 6: Charts and Visualization - Research

**Researched:** 2026-03-13
**Domain:** React charting (Recharts), SVG data visualization, responsive chart layout
**Confidence:** HIGH

## Summary

This phase adds two chart components to the Results page: a pie chart showing proportional share distribution and a horizontal bar chart showing monetary amounts per heir. The charts consume existing `ShareResult` data from the Faraid engine (Phase 1/3) and `totalEstateValue` from Phase 5 -- no new computation logic needed.

Recharts 3.8.0 is the recommended chart library. It is the most popular React chart library, declarative/component-based, SVG-rendered, lightweight enough for this use case (2 chart types, small datasets of 2-8 heirs), and officially supports React 19 as a peer dependency. The project uses React 19.2.4, which is within Recharts' declared support range. One installation caveat: `react-is` must be installed at v19+ to match React 19 (currently at v17.0.2 from a transitive dependency).

**Primary recommendation:** Install `recharts` (3.8.0) and `react-is@^19.0.0`. Build two chart wrapper components (`SharePieChart`, `MonetaryBarChart`) in `src/components/results/` that read from `useWizardStore` directly, following the project's anti-prop-drilling pattern. Use the new `shape` prop (not deprecated `Cell`) for per-segment coloring.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Charts placed between EstateBreakdownCard and heir cards grid on Results page
- Both pie and bar charts always visible in both Simple and Detailed modes -- no extra toggle
- Side-by-side on desktop (2-column grid: pie left, bar right), stacked vertically on mobile
- When no estate value entered: pie chart shows (fractions work without BDT), bar chart hides with hint "Enter estate value to see monetary comparison"
- Pie segments represent active heirs only -- blocked heirs excluded
- Color scheme: emerald gradient -- different shades of emerald/green per heir type
- External legend below/beside pie: colored dot + "Son x2 (41.7%)" -- count shown when > 1
- No labels inside segments -- keeps pie clean
- Pie center label shows total heir count (e.g., "5 heirs")
- Subtle section title "Share Distribution" above pie chart
- Bar chart: one bar per heir type showing total BDT amount (e.g., "Son x2: 10L total")
- Horizontal bars: heir label on left, bar extends right
- Bar chart uses same emerald gradient colors as pie
- Subtle section title "Monetary Comparison" above bar chart
- Bar chart only visible when totalEstateValue > 0
- Charts show final adjusted values only (post-Awl/Radd)
- Hover tooltips only: hover/tap shows heir name, fraction, percentage, and BDT amount
- No click-to-highlight or scroll-to-card behavior
- Mobile (375px+): charts stack vertically, pie ~200px diameter, bar full-width

### Claude's Discretion
- Chart library choice (Recharts recommended -- DECIDED: Recharts 3.8.0)
- Exact emerald gradient shade assignments per heir type
- Tooltip styling and content formatting
- Pie chart inner/outer radius proportions
- Bar chart height scaling and spacing
- Legend positioning (below vs beside pie on desktop)
- Mobile label abbreviation strategy
- Animation on chart mount (fade-in, grow, etc.)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RSLT-04 | App displays pie chart showing proportional share distribution | Recharts PieChart with donut style (innerRadius), ResponsiveContainer for responsive sizing, shape prop for per-segment emerald gradient colors, custom center label for heir count |
| RSLT-05 | App displays bar chart showing monetary amount per heir | Recharts BarChart with layout="vertical" for horizontal bars, conditional rendering when totalEstateValue > 0, same emerald color palette as pie chart |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.0 | Pie and bar chart rendering | Most popular React chart library (3700+ dependents), declarative component API, React 19 peer dep support, SVG rendering, built-in ResponsiveContainer/Tooltip/Legend |
| react-is | ^19.0.0 | React element type checking (Recharts peer dep) | Required by recharts internals; must match React 19 major version |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion/react | ^12.36.0 | Chart mount animations | AnimatePresence for fade-in when charts appear |
| zustand | ^5.0.11 | State access | Charts read activeShares and totalEstateValue from useWizardStore |
| fraction.js | ^5.3.4 | Fraction arithmetic | Convert ShareResult fractions to percentage values for chart data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Nivo | More beautiful defaults but ~2x larger bundle; overkill for 2 simple chart types |
| Recharts | Visx | Most flexible/lightweight but requires D3 knowledge and far more boilerplate code |
| Recharts | Chart.js + react-chartjs-2 | Canvas-based (not SVG), harder to style with Tailwind, less React-idiomatic |

**Installation:**
```bash
npm install recharts react-is@^19.0.0
```

Note: The project already has `react-is@17.0.2` as a transitive dependency. Installing `react-is@^19.0.0` explicitly ensures it matches React 19. Recharts 3.7+ is moving away from react-is dependency, but it's still needed in 3.8.0.

## Architecture Patterns

### Recommended Project Structure
```
src/components/results/
  SharePieChart.tsx        # Pie chart component (RSLT-04)
  MonetaryBarChart.tsx     # Bar chart component (RSLT-05)
  ChartSection.tsx         # Wrapper: 2-col grid, conditional bar visibility
  ResultsPage.tsx          # (existing) Insert ChartSection between EstateBreakdownCard and heir grid
```

### Pattern 1: Chart Data Derivation from ShareResult
**What:** Transform `activeShares` from engine output into Recharts-compatible data arrays
**When to use:** Both charts consume the same source data but format differently

```typescript
// Derive chart data from activeShares (already filtered in ResultsPage)
interface ChartDatum {
  name: string       // "Son x2", "Wife"
  value: number      // percentage (0-100) for pie, BDT amount for bar
  fraction: string   // "2/3" for tooltip
  percentage: string  // "66.7%" for tooltip
  bdtAmount: string   // "৳8,00,000" for tooltip
  fill: string       // emerald shade
}

function buildChartData(
  activeShares: ShareResult[],
  totalEstateValue: number
): ChartDatum[] {
  return activeShares.map((share, i) => {
    const label = HEIR_TYPE_LABELS[share.heirType]
    const name = share.count > 1 ? `${label} x${share.count}` : label
    const pct = share.totalShare.valueOf() * 100
    const bdt = Math.round(share.totalShare.valueOf() * totalEstateValue)
    return {
      name,
      value: pct,          // for pie
      bdtValue: bdt,       // for bar
      fraction: share.totalShare.toFraction(),
      percentage: pct.toFixed(1) + '%',
      bdtAmount: fractionToBDT(share.totalShare, totalEstateValue),
      fill: EMERALD_COLORS[i % EMERALD_COLORS.length],
    }
  })
}
```

### Pattern 2: Store-Direct Reading (Anti-Prop-Drilling)
**What:** Chart components read from `useWizardStore` directly, consistent with all other results components
**When to use:** Always -- this is the established project pattern

```typescript
export function SharePieChart() {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  if (!results) return null

  const activeShares = results.shares.filter((s) => s.shareType !== 'blocked')
  const chartData = buildChartData(activeShares, totalEstateValue)
  // ... render PieChart
}
```

### Pattern 3: Emerald Gradient Color Palette
**What:** Consistent emerald shades for chart segments, matching the app's emerald + gold theme
**When to use:** Both pie segments and bar fills use the same ordered color array

```typescript
// 8 distinct emerald/green shades for up to 8 active heir types
// Using oklch values consistent with TailwindCSS 4 emerald scale
const EMERALD_COLORS = [
  'oklch(72% 0.17 160)',   // emerald-500
  'oklch(62% 0.17 160)',   // emerald-600
  'oklch(52% 0.15 160)',   // emerald-700
  'oklch(82% 0.15 160)',   // emerald-400
  'oklch(42% 0.12 160)',   // emerald-800
  'oklch(90% 0.12 160)',   // emerald-300
  'oklch(65% 0.14 168)',   // teal-600 (overflow)
  'oklch(75% 0.16 168)',   // teal-500 (overflow)
]
```

Alternatively, use standard hex values from Tailwind's emerald palette for maximum compatibility:
```typescript
const EMERALD_COLORS = [
  '#10b981', // emerald-500
  '#059669', // emerald-600
  '#047857', // emerald-700
  '#34d399', // emerald-400
  '#065f46', // emerald-800
  '#6ee7b7', // emerald-300
  '#0d9488', // teal-600
  '#14b8a6', // teal-500
]
```

### Pattern 4: Recharts v3.8 Shape Prop (NOT Cell)
**What:** Use `shape` prop on `<Pie>` for per-segment colors instead of deprecated `<Cell>`
**When to use:** Always -- Cell is deprecated in Recharts 3.7+ and will be removed in 4.0

```typescript
import { Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'

// Embed fill color directly in data objects
// Then use shape prop to apply fill from data
<Pie
  data={chartData}
  dataKey="value"
  nameKey="name"
  innerRadius="55%"
  outerRadius="85%"
  shape={(props: PieSectorDataItem) => (
    <Sector {...props} fill={props.fill} />
  )}
/>
```

Note: Since each data item has a `fill` property, Recharts will use it automatically without needing a custom `shape` -- the `shape` prop is only needed if you want to override the default Sector rendering. Including `fill` in data objects is the simplest approach.

### Pattern 5: ResponsiveContainer with Fixed Aspect
**What:** Wrap all charts in `<ResponsiveContainer>` for responsive sizing
**When to use:** Always -- charts must resize with their container

```typescript
<ResponsiveContainer width="100%" height={280}>
  <PieChart>
    {/* ... */}
  </PieChart>
</ResponsiveContainer>
```

### Anti-Patterns to Avoid
- **Using deprecated Cell component:** Cell is deprecated in 3.7+ and removed in 4.0. Use `fill` in data objects or `shape` prop instead.
- **Hardcoding chart dimensions:** Use ResponsiveContainer -- never set fixed pixel widths on charts.
- **Computing shares in chart components:** All share computation happens in the Faraid engine. Charts only transform existing `ShareResult` data into visualization format.
- **Creating separate data transforms for each chart:** Build one shared data array used by both pie and bar, with separate `dataKey` props.
- **Importing from recharts/es6 or recharts/lib:** Use top-level `recharts` imports. v3.x ships ESM by default.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG pie/bar rendering | Custom SVG path math | Recharts PieChart/BarChart | Arc calculations, hit testing, animation timing are complex |
| Responsive chart sizing | window.onresize listeners | ResponsiveContainer | Uses ResizeObserver, handles debouncing, parent-aware |
| Chart tooltips | Custom hover state + positioned div | Recharts Tooltip (custom content) | Handles mouse tracking, portal rendering, boundary detection |
| Legend rendering | Manual color dot + label list | Recharts Legend (custom content) | Automatic data sync, responsive layout |

**Key insight:** For 2 standard chart types with small datasets (2-8 items), Recharts provides everything out of the box. The only custom code needed is data transformation and styling.

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Requires a Parent with Defined Dimensions
**What goes wrong:** Chart renders at 0x0 -- invisible
**Why it happens:** ResponsiveContainer inherits from parent. If parent has no explicit height, chart collapses.
**How to avoid:** Always ensure the parent div has a defined height (or use fixed height on ResponsiveContainer itself, e.g., `height={280}`).
**Warning signs:** Chart area is empty/white with no errors in console.

### Pitfall 2: react-is Version Mismatch with React 19
**What goes wrong:** Runtime errors or chart fails to render
**Why it happens:** Recharts internally uses react-is for element type checking. If react-is is at v17 (transitive) while React is v19, mismatches occur.
**How to avoid:** Explicitly install `react-is@^19.0.0` as a dependency.
**Warning signs:** Console errors about element types, or charts render blank.

### Pitfall 3: Fraction.js Objects in Chart Data
**What goes wrong:** Charts show NaN or "[object Object]" instead of values
**Why it happens:** Recharts expects primitive numbers for `dataKey` values. `ShareResult.totalShare` is a Fraction object, not a number.
**How to avoid:** Always call `.valueOf()` when converting Fraction to chart data numbers. Use `share.totalShare.valueOf() * 100` for percentages.
**Warning signs:** Chart bars/segments at wrong size or NaN in tooltips.

### Pitfall 4: Testing Charts in jsdom
**What goes wrong:** ResponsiveContainer renders nothing -- tests can't find chart elements
**Why it happens:** jsdom doesn't implement ResizeObserver or layout dimensions. ResponsiveContainer gets 0x0 size.
**How to avoid:** Mock ResponsiveContainer in tests to pass through children with fixed dimensions, or test at the data-transformation level rather than SVG rendering.
**Warning signs:** Tests pass with no chart content assertions, or all chart-related queries return null.

### Pitfall 5: Pie Chart Label Rendering in Recharts 3.x
**What goes wrong:** Center label (showing "5 heirs") doesn't appear
**Why it happens:** The `<Label>` component with `position="center"` had a known issue in early Recharts 3.x versions. Some users reported it not rendering.
**How to avoid:** Use `<Customized>` component to render custom SVG text at the center coordinates, or use the `<Label>` component and verify it renders in 3.8.0. Fallback: overlay a positioned div using CSS.
**Warning signs:** Donut chart renders but center is empty.

### Pitfall 6: Mobile Tooltip Interaction
**What goes wrong:** Tooltips don't appear on mobile tap, or get stuck
**Why it happens:** Recharts tooltips are hover-based. Touch events may not trigger hover consistently.
**How to avoid:** Recharts 3.x has `accessibilityLayer` enabled by default which helps with touch. Test on actual mobile viewport. Consider adding `cursor` prop on the Pie/Bar to improve touch targeting.
**Warning signs:** Users report unable to see tooltips on phone.

## Code Examples

### Pie Chart (Donut with Center Label)
```typescript
// Source: Recharts 3.8.0 API docs + project conventions
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts'

interface PieChartData {
  name: string
  value: number      // percentage
  fill: string
  fraction: string
  percentage: string
  bdtAmount: string
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as PieChartData
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="font-medium text-gray-900">{d.name}</p>
      <p className="text-sm text-gray-600">Share: {d.fraction} ({d.percentage})</p>
      {d.bdtAmount && (
        <p className="text-sm font-medium text-emerald-700">{d.bdtAmount}</p>
      )}
    </div>
  )
}

export function SharePieChart() {
  // ... derive chartData from store ...
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-500">
        Share Distribution
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
          >
            <Label
              position="center"
              content={() => (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-gray-700 text-lg font-semibold"
                >
                  {chartData.length} heirs
                </text>
              )}
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Horizontal Bar Chart
```typescript
// Source: Recharts 3.8.0 API docs + project conventions
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function MonetaryBarChart() {
  // ... derive chartData (with bdtValue) from store ...
  // Only render when totalEstateValue > 0

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-500">
        Monetary Comparison
      </h3>
      <ResponsiveContainer width="100%" height={chartData.length * 48 + 40}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 13 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="bdtValue"
            radius={[0, 4, 4, 0]}
            barSize={28}
            shape={(props: any) => {
              const { fill, ...rest } = props
              return <rect {...rest} fill={chartData[props.index]?.fill ?? fill} />
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Chart Section Wrapper
```typescript
// ChartSection.tsx -- 2-col grid wrapper
export function ChartSection() {
  const results = useWizardStore((s) => s.results)
  const totalEstateValue = useWizardStore((s) => s.totalEstateValue)
  if (!results) return null

  const showBarChart = totalEstateValue > 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SharePieChart />
      {showBarChart ? (
        <MonetaryBarChart />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 p-8">
          <p className="text-sm italic text-gray-400">
            Enter estate value to see monetary comparison
          </p>
        </div>
      )}
    </div>
  )
}
```

### Integration into ResultsPage
```typescript
// In ResultsPage.tsx, insert after EstateBreakdownCard:
<EstateBreakdownCard />
<ChartSection />         {/* NEW: pie + bar charts */}
<AdjustmentBanner ... />
```

### Test Setup -- Mock ResponsiveContainer
```typescript
// In test file or setup:
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  }
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cell component for per-item colors | `fill` in data objects or `shape` prop | Recharts 3.7.0 (Jan 2025) | Cell deprecated, removed in 4.0 |
| Recharts 2.x state model | Recharts 3.x hooks-based state | Recharts 3.0.0 (2024) | Internal state via hooks, not props |
| Manual resize handling | ResizeObserver via ResponsiveContainer | Long-standing | accessibilityLayer on by default in 3.x |
| react-is required peer dep | Moving away from react-is (partial) | 3.7+ | Still needed in 3.8.0 but targeted for removal |

**Deprecated/outdated:**
- `<Cell>` component: deprecated in 3.7, will be removed in 4.0. Use `fill` in data objects.
- `CategoricalChartState` prop pattern: removed in 3.0. Use hooks to access chart state in custom components.

## Open Questions

1. **Label position="center" reliability in 3.8.0**
   - What we know: Had issues in early 3.x; GitHub issue #5985 reports problems in 3.0
   - What's unclear: Whether 3.8.0 has fully resolved this
   - Recommendation: Implement with `<Label>`, have fallback using `<Customized>` or CSS overlay if it fails

2. **Mobile tooltip behavior on touch devices**
   - What we know: accessibilityLayer is on by default in 3.x, which should help with touch
   - What's unclear: Exact touch UX quality on small screens (375px)
   - Recommendation: Build first, test on mobile viewport, add `cursor={false}` if touch feedback needs tuning

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | `vite.config.ts` (merged Vite+Vitest config) |
| Quick run command | `npx vitest run src/components/__tests__/charts.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RSLT-04 | Pie chart renders with correct segment count matching active heirs | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "RSLT-04"` | No -- Wave 0 |
| RSLT-04 | Pie chart shows center label with heir count | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "center label"` | No -- Wave 0 |
| RSLT-05 | Bar chart renders when totalEstateValue > 0 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "RSLT-05"` | No -- Wave 0 |
| RSLT-05 | Bar chart hidden with hint when totalEstateValue is 0 | integration | `npx vitest run src/components/__tests__/charts.test.tsx -t "no estate value"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/__tests__/charts.test.tsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/__tests__/charts.test.tsx` -- covers RSLT-04, RSLT-05
- [ ] ResponsiveContainer mock in test file (jsdom doesn't support ResizeObserver)
- [ ] No framework install needed -- Vitest already configured

## Sources

### Primary (HIGH confidence)
- [recharts npm package](https://www.npmjs.com/package/recharts) -- v3.8.0, peerDependencies verified via `npm info recharts`
- [Recharts API: PieChart](https://recharts.github.io/en-US/api/PieChart/) -- Pie props, innerRadius, outerRadius, Label
- [Recharts API: BarChart](https://recharts.github.io/en-US/api/BarChart/) -- layout="vertical", XAxis/YAxis config
- [Recharts API: ResponsiveContainer](https://recharts.github.io/en-US/api/ResponsiveContainer/) -- width, height, aspect props
- [Recharts Cell Migration Guide](https://recharts.github.io/en-US/guide/cell/) -- Cell deprecated, shape prop pattern
- [Recharts 3.0 Migration Wiki](https://github.com/recharts/recharts/wiki/3.0-migration-guide) -- Breaking changes, new hooks API

### Secondary (MEDIUM confidence)
- [GitHub Issue #6857](https://github.com/recharts/recharts/issues/6857) -- React 19.2.3 rendering issue (Preact-specific, not React)
- [Recharts Releases](https://github.com/recharts/recharts/releases) -- v3.8.0 release notes, v3.7 Cell deprecation
- [GitHub Issue #5985](https://github.com/recharts/recharts/issues/5985) -- Label center position in PieChart 3.0
- [GitHub Issue #2268](https://github.com/recharts/recharts/issues/2268) -- ResponsiveContainer testing with jsdom

### Tertiary (LOW confidence)
- [LogRocket: Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) -- Recharts vs Nivo vs Visx comparison
- [Querio: Top React Chart Libraries 2026](https://querio.ai/articles/top-react-chart-libraries-data-visualization) -- ecosystem survey

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Recharts 3.8.0 peerDependencies verified directly via npm info, React 19 support confirmed
- Architecture: HIGH -- Project patterns well-established from 5 prior phases, chart components follow identical conventions
- Pitfalls: HIGH -- ResponsiveContainer testing issue is well-documented; react-is version checked against actual node_modules
- Code examples: MEDIUM -- Based on official docs for 3.8.0 API; `shape` prop replacing Cell is documented but fewer community examples yet

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- Recharts releases are incremental, no 4.0 expected soon)
