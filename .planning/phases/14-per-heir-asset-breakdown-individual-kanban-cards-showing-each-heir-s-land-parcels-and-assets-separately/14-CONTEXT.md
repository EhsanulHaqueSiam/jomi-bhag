# Phase 14: Per-Heir Asset Breakdown - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Add an individual-level distribution view as a tab/toggle on the Phase 11 distribution page. Currently the kanban board shows one column per heir TYPE (Sons, Daughters, Wife). Phase 14 adds a "By Individual" view showing one column per INDIVIDUAL heir (Son 1, Son 2, Son 3, Daughter 1, Daughter 2, etc.) with full DnD, parcel splitting, area-based equilibrium, and cash compensation between individuals.

</domain>

<decisions>
## Implementation Decisions

### View & Navigation
- Tab/toggle on distribution page: "By Group" vs "By Individual" segmented control (role='tablist' for accessibility)
- Both views are fully independent — switching views never affects the other's state
- Individual view initializes by snapshotting from group distribution, splitting each group's assets equally among its members
- If group distribution doesn't exist when individual view is selected, auto-compute it first, then snapshot
- Individual view has its own Qurah (Draw Lots) and Undo controls in the top controls bar
- No separate Randomize button — Qurah replaces Randomize in individual view (global, all items across all individuals)
- All heirs shown including single-count types (wife gets her own column)
- Hide toggle entirely when no assets exist (same as Phase 11's "Distribute Assets" button behavior)
- Grouped with heir type section headers ("Sons", "Daughters", etc.) — individuals grouped visually under their type
- Desktop: horizontal scroll for columns (same as Phase 11)
- Mobile: vertical stack with section headers, "Move to..." dropdown is primary interaction (DnD de-emphasized)
- Mobile "Move to..." dropdown: flat list of all individual heir names
- Mobile toggle placement: Claude's discretion

### Individual Identification
- Auto-numbered per subtype: "Full Brother 1", "Consanguine Brother 1", "Son 1", "Daughter 1"
- Optional inline rename: click name text to edit, Enter to save, Escape to cancel. Full keyboard support (Enter/Space to activate)
- When renamed, custom name is primary, original type+number as subtitle (e.g., "Rahim" with "Son 1" subtitle)
- Male/female heir icon on each individual card (reuse HeirIcon from HeirCard)
- Faraid share fraction and percentage shown on each individual column header
- Per-subtype numbering (Full Brother 1, Consanguine Brother 1 — not combined "Brother 1, 2, 3")
- Section header group share info: Claude's discretion
- Custom names included in JSON export/import for round-trip fidelity
- Custom names saved with scenario (Phase 8 persistence)

### Drag-and-Drop Interaction
- Full DnD between ALL individuals — cross-type allowed (Son 1 to Daughter 2)
- Same DnD sensors as Phase 11: PointerSensor(distance:5), TouchSensor(delay:500ms), KeyboardSensor
- Drag overlay styling: Claude's discretion
- AssetCard and IndividualColumn wrapped in React.memo for performance
- No virtualization needed — typical cases have ≤10 heirs and ≤60 assets

### Area-Based Equilibrium
- Equilibrium measured by LAND AREA (shotok), not BDT value — this is the primary metric for land division
- Per-individual equilibrium bars: green within ±2% of target shotok, amber within ±5%, red beyond ±5%
- Summary banner at top: "5/7 heirs balanced ✔" pattern
- Celebratory animation when all individuals are green (same pattern as Phase 11)
- Cross-type moves allowed freely — equilibrium bars show deviations, no warnings or restrictions
- Empty columns show "Drag items here" drop zone, equilibrium at 0% (red)
- Blocked heirs excluded from individual view (only heirs with actual shares appear)
- No column scroll limit — scrollable within column (maxHeight like Phase 11)

### Parcel Splitting
- Users can SPLIT a parcel into sub-parcels within the individual view for precise area-based division
- Split action on parcel card (button or context menu) — user enters split amounts (e.g., "Beki 9 shotok" → "Beki 5 shotok" + "Beki 4 shotok")
- Each sub-parcel becomes a separate draggable card
- Split preserves the original parcel name with area annotation
- Essential for achieving exact Faraid area targets when whole parcels don't divide evenly
- Splits are reversible (merge sub-parcels back) — Claude's discretion on UX

### Cash Compensation
- Pairwise net settlements between individuals: "Son 1 → Daughter 1: ৳30,000"
- Minimize number of transfers using greedy algorithm
- Compensation banner display: Claude's discretion (all transfers listed vs net per individual)
- Cash compensation is the fallback when even with parcel splitting, perfect area balance isn't achievable

### Within-Group Subdivision (Initial Split)
- Equal target within same heir type: 3 sons = each targets 1/3 of Sons group total area
- Indivisible items (if any movable assets) assigned to first individual + cash compensation to others
- Divisible value assets split into individual cards (each person gets their share card)
- Round-robin by value for remainder items when count doesn't divide evenly
- Auto-recompute on wizard data changes (properties added/removed, heir counts changed)

### Qurah Ceremony (Individual View)
- Full overlay ceremony: bismillah header, shuffle animation, staggered reveal across all columns
- Global scope: Qurah redistributes ALL items across ALL individuals (cross-type)
- Faster stagger: ~200ms per column (vs Phase 9's 400ms) — 7 columns = 1.4s total reveal
- Quranic/Hadith reference included in overlay
- Unlimited redraws via "Draw Again" button
- Button label: "Draw Lots (Qurah)" — same as Phase 9
- Respects prefers-reduced-motion: instant reveal, no animations

### Accessibility
- Tab through cards, arrow keys between columns for keyboard DnD
- @dnd-kit live announcements for drag operations ("Picked up Gold from Son 1...")
- ARIA section announcements when focus enters new type group
- Inline rename: full keyboard support (Enter/Space activate, Escape cancel)
- Screen reader fallback: MobileFallback select lists individual heir names

### State & Persistence
- New individualDistributionStore (separate Zustand store with persist middleware)
- Independent from distributionStore — own groups, items, undo stack, custom names
- Store coupling to distributionStore: Claude's discretion (direct read vs pure input)
- Separate one-level undo stack from group view
- View toggle state preservation: Claude's discretion (preserved until group changes, or always preserved)
- Fingerprint includes property IDs+values, movable asset IDs+values, AND heir type counts
- Saved with Phase 8 scenarios (localStorage persist)
- Full restoration on JSON import (assignments, names, distribution state)
- Scenario comparison includes individual-level differences (show all, mark extras for mismatched heir counts)

### Type-Based Colors
- Different Tailwind built-in accent colors per heir type section (Sons=emerald, Daughters=rose, Wife=blue, etc.)
- Subtle color on section headers and column borders
- Equilibrium bars stay standard (green/amber/red) regardless of section color

### PDF Output
- "Individual Asset Breakdown" section appears ONLY when individual view was used
- Placed after Distribution Summary (Phase 11 groups) section
- Individual sections grouped by heir type with section breaks per type (new page per type if needed)
- Each heir: name with type subtitle — "Rahim (Son 1)" or "Son 1" if not renamed
- Colored equilibrium status indicator per heir (✔ 100%, ⚠ 95%, ✖ 82%)
- Full pairwise compensation details ("Son 1 → Dtr 1: ৳30,000")
- Overall summary line at bottom: "6/7 heirs balanced ✔ | Total: 332.5 shotok | Compensation: ৳120,000"
- Islamic-accented section title with Quranic reference
- Qurah reference included when mini Qurah was used
- Asset list format per heir: Claude's discretion (table vs bulleted list)

### Testing
- Full E2E: unit tests (individual distribution algorithm, split logic, compensation), component tests (board, columns, rename, toggle), integration tests (DnD interactions, Qurah ceremony, PDF generation)
- DnD tests: simulate events via fireEvent/userEvent (same as Phase 11)

### Claude's Discretion
- Toggle label text ("By Group" / "By Individual" or similar)
- View state persistence behavior (reset on group change vs always preserve)
- Store coupling approach (direct distributionStore read vs pure input)
- Component file structure (same distribution/ dir vs new subdirectory)
- Responsive breakpoints (same as Phase 11 or adjusted)
- Compensation banner format (all transfers vs net per individual)
- Split parcel merge/undo UX
- Results page HeirCard link to individual view
- Drag overlay styling
- PDF asset list format (table vs bullets)
- Column width (same 280px min or narrower)
- Mobile toggle placement

</decisions>

<specifics>
## Specific Ideas

- **Real-world use case:** User has 58 land parcels totaling 332.5 shotok to divide among 5 sons and 2 daughters. Each son gets 55.42 shotok (2/12), each daughter gets 27.71 shotok (1/12). This is THE primary use case for the app.
- Area-based equilibrium is essential — this family divides by LAND AREA (shotok), not monetary value. The green bar lighting up when a son's column reaches ~55.42 shotok is the core "aha moment"
- Some parcels share names because the same physical land was listed multiple times in manual division attempts — each entry is a separate parcel in the app
- Parcel splitting is critical: 58 parcels of 2-20 shotok sizes won't divide exactly into 7 individual targets. Splitting "Beki (9 shotok)" into "Beki (5)" + "Beki (4)" enables precise division
- Cash compensation is the Islamic-approved fallback when perfect area division isn't possible even with splitting
- The Kanban with color-coded equilibrium is what makes this better than pen-and-paper: families can see in real-time as they drag parcels whether the division is fair
- "I tried to divide it before creating the site" — the user attempted manual division by listing parcels multiple times. This tool replaces that manual process

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DistributionBoard.tsx`: Phase 11 DnD kanban — adapt pattern for individual columns
- `HeirColumn.tsx`: group column component — basis for individual column
- `AssetCard.tsx`: draggable item card — reuse directly
- `EquilibriumBar.tsx` + `getColumnBorderColor()`: equilibrium indicator — adapt for area-based
- `MobileFallback.tsx`: "Move to..." select — extend with individual heir names
- `SummaryBanner.tsx`: "N/M balanced" banner — reuse pattern
- `DistributionControls.tsx`: Randomize/Undo controls — adapt for Qurah/Undo
- `distributionStore.ts`: group distribution Zustand store — pattern for new individual store
- `@dnd-kit/core`: DnD library already installed and configured
- `HeirIcon` component in `HeirCard.tsx`: male/female silhouette icons
- `HEIR_TYPE_LABELS`: display labels per heir type
- Phase 9 Qurah ceremony components: reuse full ceremony overlay
- `formatBDT()`: currency formatting for compensation
- `motion/react`: Framer Motion for animations
- Gold palette (oklch): Islamic accent colors
- PDF components: PdfDistributionSection pattern for new PdfIndividualSection

### Established Patterns
- Zustand store per domain (wizardStore, distributionStore, divisionStore, scenariosStore)
- Component-per-file in src/components/ subdirectories
- @dnd-kit sensors: PointerSensor(5), TouchSensor(500ms), KeyboardSensor
- Colored equilibrium bars (green/amber/red)
- motion/react AnimatePresence for enter/exit animations
- Role='tablist' pattern not yet in codebase — new for toggle control
- Staggered reveal via setInterval with revealed count state

### Integration Points
- DistributionPage.tsx: add toggle control and conditional render (group board vs individual board)
- New individualDistributionStore with persist middleware
- distributionStore: snapshot data source for individual initialization
- PdfDocument.tsx: new PdfIndividualSection component
- extractPdfData.ts: extract individual distribution data
- JSON export schema: add individual distribution state + custom names
- scenariosStore: include individual state in saved scenarios
- ComparisonView: add individual-level diff display

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-per-heir-asset-breakdown-individual-kanban-cards-showing-each-heir-s-land-parcels-and-assets-separately*
*Context gathered: 2026-03-14*
