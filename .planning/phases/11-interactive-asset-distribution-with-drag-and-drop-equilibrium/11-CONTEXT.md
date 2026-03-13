# Phase 11: Interactive Asset Distribution with Drag-and-Drop Equilibrium - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade Phase 9's group card UI into a full drag-and-drop Kanban-style distribution board for ALL assets (land parcels + movable assets from Phase 10). Users can randomize toward equilibrium, drag individual items between heir group columns, and see real-time progress bars showing how close each group is to its Faraid share target. Replaces and upgrades Phase 9's simpler "Move to..." button interface.

</domain>

<decisions>
## Implementation Decisions

### Drag-and-Drop Interaction
- Individual items dragged: each asset (land parcel, vehicle, gold entry, etc.) is a draggable card. User drags one item at a time between heir group columns
- Horizontal column layout (Kanban-style): each heir group is a vertical column side by side. Items stack vertically within each column. Scrollable if many items
- Mobile: long-press (500ms) to activate drag mode. Item follows finger, drop zones highlight. Fallback: "Move to..." buttons from Phase 9 always available
- One-level undo: "Undo" button appears after each move, reverting the last drag. Disappears after the next action

### Equilibrium Indicator (Green Bar)
- Tolerance range: green when within ±2% of Faraid share target, amber within ±5%, red when further off
- Top border bar with percentage: colored bar at the top of each heir group column showing fill level relative to target. Label shows "98% of target"
- Over-allocation visible: bar extends beyond 100% with red/amber tint for surplus. Text shows "+৳50,000 over target". Helps user see they need to move items OUT
- Overall summary banner above all columns: "3/4 groups balanced ✔" or "All groups balanced! ✔". Celebratory animation when all groups hit green

### Randomize Algorithm
- Smart shuffle toward equilibrium: randomly redistribute all items but weighted toward balance — larger items assigned to under-filled groups first, smaller items fill gaps. Close to equilibrium but not perfectly optimized. Feels random yet fair
- Unlimited re-randomize: each click produces a new distribution. Undo reverts to pre-randomize state
- Simple action button (no Qurah ceremony): "Randomize" is a utility action with brief shuffle animation. The full Qurah ceremony stays in Phase 9/10 for dedicated lot drawing
- Cash compensation alongside DnD: remaining imbalance after manual DnD adjustments shows as cash compensation (Phase 9 pattern). User can keep moving items to get closer, or accept the cash adjustment

### Relationship to Phase 9/10
- Replaces and upgrades Phase 9's UI: Phase 9's greedy best-fit algorithm runs as the initial assignment, but the UI becomes the DnD Kanban columns instead of Phase 9's simpler group cards + "Move to..." buttons
- All assets combined: one DnD board with ALL assets — land parcels, vehicles, gold, livestock, custom items. Items visually distinguished by category (color/icon). Unified experience
- Entry point: "Distribute Assets" button on Results page (replaces Phase 9's "Divide Land" button). Only appears when properties or movable assets exist
- Saved and in PDF: distribution state saved with scenario (Phase 8 persistence). PDF includes "Distribution Summary" section showing group assignments + cash adjustments

### Claude's Discretion
- DnD library choice (dnd-kit, react-beautiful-dnd, or native HTML5 DnD)
- Item card visual design and category color/icon scheme
- Shuffle animation timing and easing
- Kanban column responsive breakpoints
- Celebratory animation when all groups balanced
- How DnD state integrates with Zustand store
- PDF distribution summary layout
- Touch drag sensitivity and drop zone sizing

</decisions>

<specifics>
## Specific Ideas

- The Kanban layout should feel like Trello/Linear boards — familiar pattern that users understand intuitively
- Green bar lighting up when balanced is the core "aha moment" — it should feel satisfying, like progress bars completing
- Randomize is the starting point, DnD is the fine-tuning tool — families discuss "let's move the car to the daughters and the gold to the sons" while watching the bars adjust in real-time
- Cash compensation remains as a safety valve — perfect balance is impossible with indivisible assets, and Islamic jurisprudence explicitly allows cash adjustment
- Items should be clearly labeled by category so users can instantly see "this is land" vs "this is a vehicle" in the mixed column

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 9 grouping algorithm (greedy best-fit by value): provides initial assignment before DnD
- Phase 9 Qurah ceremony components: remain available as separate flow, not used by Randomize
- Phase 9 cash compensation calculation: reuse for real-time imbalance display
- `Property` type + `computePropertyTotal()`: land parcel data and valuation
- Phase 10 movable asset types and valuation: gold, vehicles, livestock, custom items
- `HeirCard.tsx` pattern: card-per-heir-group visual language
- `motion/react` (Framer Motion): animations for shuffle, undo feedback, celebration
- `formatBDT()`: currency display for target/actual values on progress bars
- Gold palette (oklch): for equilibrium indicators and Islamic accents

### Established Patterns
- Zustand store for state management — extend for distribution state
- Component-per-file in src/components/ subdirectories
- Colored banners for status (amber Awl, blue Radd — extend with green/red equilibrium)
- Real-time value computation (Phase 5 estate total pattern)

### Integration Points
- ResultsPage.tsx: "Distribute Assets" button replacing/enhancing Phase 9's "Divide Land"
- New DistributionBoard component with DnD columns
- wizardStore or dedicated store for distribution state (group assignments, undo stack)
- Phase 8 persistence: distribution state included in saved scenario
- PdfDocument.tsx: new PdfDistributionSection for PDF export
- extractPdfData.ts: extract distribution assignments for PDF

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-interactive-asset-distribution-with-drag-and-drop-equilibrium*
*Context gathered: 2026-03-13*
