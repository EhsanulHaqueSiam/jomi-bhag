# Jomi-Bhag (জমি-ভাগ)

**Islamic inheritance (Faraid) land and property division calculator for Bangladeshi families.**

**Live:** [jomibhag.netlify.app](https://jomibhag.netlify.app)

Jomi-Bhag helps Bangladeshi families and legal professionals calculate and divide inherited property strictly according to Hanafi Faraid jurisprudence. Every share allocation uses exact fraction arithmetic (no floating-point rounding errors) and is traceable to its Quranic ayah or Hadith source. The app covers the full lifecycle from heir input to asset distribution to printable legal reports.

## Features

### Faraid Calculation Engine

- Exact fraction arithmetic using fraction.js -- no floating-point rounding
- Full Hanafi jurisprudence support with 17 heir types
- All 16 Hajb Hirman (total blocking) and 5 Hajb Nuqsan (partial reduction) rules
- Awl (proportional reduction when shares exceed estate) and Radd (surplus redistribution)
- Special cases: Umariyyatayn, Mushtarakah, Kalalah
- MFLO Section 4 opt-in toggle for orphaned grandchildren

### Interactive Wizard

- 4-step guided flow: Relationship, Family Members, Estate Inventory, Results
- Supports spouse, children (sons/daughters/grandchildren), siblings (full/consanguine/uterine)
- Mobile-responsive design (375px+)

### Property and Land Input

- Multiple property types: agricultural, residential, commercial, mixed
- Bangladesh-specific land units (decimal, katha, bigha) with regional conversion (Dhaka vs Rajshahi katha)
- Sub-items: houses/structures, trees/crops, ponds
- Government mouza rate auto-suggestion for 84 upazilas across 8 divisions

### Movable Assets

- Gold and silver input with weight, purity, and BAJUS rate suggestion
- Cash, vehicles, jewelry, furniture, livestock, and custom items
- Indivisible asset resolution: sell, buyout, or Qurah (Islamic lot drawing)

### Asset Distribution Board

- Drag-and-drop Kanban board for distributing assets among heir groups
- Real-time equilibrium indicators (green/amber/red) showing Faraid target alignment
- Smart randomization algorithm for near-optimal distribution
- Per-individual breakdown (Son 1, Son 2, Daughter 1, etc.) with inline rename
- Parcel splitting for precise area-based division

### Land Settlement Methods

- Sell and Split proceeds among heirs
- Physical Division by value with sub-parcels and cash compensation
- Buyout with installment plan (no interest -- Islamic finance compliant)
- Joint Ownership with income calculator (rent/crop)

### Results and References

- Dual mode: Simple (fractions/percentages) and Detailed (full calculation trace with legal citations)
- Every share backed by Quranic ayah and/or Hadith reference
- Step-by-step calculation explanation
- Pie chart and bar chart visualizations

### Export and Persistence

- PDF download and print with full division report, settlement plan, and individual breakdown
- JSON export/import for backup and portability
- localStorage persistence (survives page refresh)
- Scenario comparison (side-by-side "what if" analysis)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, TailwindCSS 4, Vite 8 |
| State | Zustand with localStorage persistence |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Drag and Drop | @dnd-kit |
| Animations | Motion (Framer Motion) |
| Math | fraction.js (exact arithmetic) |
| Testing | Vitest + Testing Library + Playwright (E2E) |
| Hosting | Netlify (static site) |
| Runtime | Bun |

## Development

```bash
bun install
bun run dev          # Start dev server
bun run build        # Production build
bun run test:run     # Unit/integration tests
bun run test:e2e     # E2E tests (Playwright)
```

## Islamic Basis

All calculations follow Hanafi Faraid jurisprudence as derived from the Quran (primarily Surah An-Nisa 4:11-12, 4:176) and Sunnah. Every share allocation in the app is traceable to its specific scriptural source. The engine enforces Faraid rules without manual override or favoritism toward any heir.

This app is a calculation aid, not a legal substitute. Users are advised to consult qualified Islamic scholars and lawyers before executing any inheritance division or property registration.

## License

Free forever -- public service for the Bangladeshi community.
