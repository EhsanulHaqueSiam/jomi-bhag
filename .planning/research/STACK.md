# Technology Stack

**Project:** Jomi-Bhag (Islamic Inheritance Land Division Calculator)
**Researched:** 2026-03-12
**Overall Confidence:** HIGH (core stack is decided; supporting libraries thoroughly verified)

---

## Decided Stack (Per PROJECT.md Constraints)

| Technology | Purpose | Notes |
|------------|---------|-------|
| React 19 | UI framework | Latest stable, concurrent features |
| TypeScript 5.5+ | Type safety | Required by Zod 4, shadcn/ui |
| TailwindCSS 4 | Styling | Utility-first CSS |
| Bun | Runtime & package manager | Fast installs, native TS support |
| Netlify | Hosting | Static SPA deployment |
| Vite | Build tool | Standard for React + Bun + Netlify |

---

## Recommended Supporting Libraries

### PDF Generation

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **@react-pdf/renderer** | ^4.3.2 | Generate downloadable PDF reports | HIGH |

**Why @react-pdf/renderer:** It is the only React-native PDF library that provides full programmatic control over PDF layout using JSX components. This matters because the inheritance reports need structured tables, Quranic references, fraction breakdowns, and professional formatting -- not a screenshot of the UI. It supports custom font registration (TTF/OTF/WOFF2) via `Font.register()`, which is critical for future Bangla language support (e.g., Noto Sans Bengali, SolaimanLipi fonts). Weekly downloads: 860K+. Stars: 15.9K+.

**Why NOT jsPDF:** jsPDF has a well-documented, unresolved issue with Bengali/Bangla complex script rendering (GitHub issue #2587). Since Bangla support is a future milestone, choosing jsPDF now would force a rewrite later. jsPDF also lacks JSX-based layout -- you build PDFs imperatively, which is painful for complex reports.

**Why NOT pdfmake:** JSON-based document definition is awkward when you already have React components. No JSX integration. Would require maintaining two separate layout systems (React UI + pdfmake JSON).

**Why NOT react-to-print:** Captures what the user sees on screen, which is wrong for this use case. Reports need different formatting than the interactive UI (page breaks, headers/footers, print-optimized layout). Not suitable for generating downloadable PDF files.

### Charts & Visualization

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Recharts** | ^3.8.0 | Share breakdown pie/donut charts, bar charts | HIGH |

**Why Recharts:** Built on React + D3 with a component-based API that fits naturally into React. Supports pie charts, donut charts, bar charts, and responsive containers -- all needed for share breakdowns. 3,730+ dependent projects. Actively maintained (v3.8.0 released March 2026). The inheritance breakdown UI needs multiple chart types: pie for proportional shares, bar for comparing heirs, and potentially treemap for property-level breakdowns. Recharts handles all of these.

**Why NOT react-minimal-pie-chart:** At 2kB gzipped it is impressively small, but it only does pie/donut charts. The app needs bar charts for comparing heir shares and potentially stacked charts for property-type breakdowns. Switching libraries mid-project when you need a bar chart is worse than starting with Recharts.

**Why NOT Chart.js (react-chartjs-2):** Canvas-based rendering is harder to style with TailwindCSS and produces blurry output when embedded in PDFs. Recharts uses SVG, which integrates cleanly with @react-pdf/renderer's SVG support.

**Why NOT Nivo:** Heavier than Recharts with more chart types than needed. Adds unnecessary bundle weight for a calculator app.

### Math & Fraction Calculations

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **fraction.js** | ^5.3.4 | Exact rational number arithmetic for Faraid | HIGH |

**Why fraction.js:** Islamic inheritance shares are defined as exact fractions (1/2, 1/3, 1/4, 1/6, 1/8, 2/3). Floating-point arithmetic will produce rounding errors that are unacceptable for a Faraid calculator claiming Islamic accuracy. fraction.js stores numerator and denominator as BigInt internally, ensuring zero precision loss. It handles addition, subtraction, multiplication, division, GCD, and LCM of fractions -- all operations needed for Awl (proportional reduction when shares exceed 1) and Radd (redistribution when shares are less than 1). Weekly downloads: 2.6M+. Zero dependencies.

**Critical for Faraid:** The Awl algorithm requires finding LCM of share denominators, then checking if total shares exceed the base. fraction.js does this natively: `new Fraction(1,2).add(new Fraction(2,3)).add(new Fraction(1,6))` gives exact results, not 1.3333333333.

**Why NOT mathjs:** Full math library is massive overkill. mathjs includes matrix operations, complex numbers, units, and hundreds of functions. fraction.js is focused and tiny. mathjs actually uses fraction.js internally for its fraction type.

**Why NOT native BigInt alone:** You would have to implement fraction arithmetic (add, subtract, multiply, divide, simplify, LCM, GCD) from scratch. fraction.js is battle-tested.

### Faraid Calculation Engine

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Custom engine (build from scratch)** | -- | Core Faraid calculation logic | HIGH |

**Why build custom:** The only existing npm library (`@hu-bcs1/islamic-inheritance-calculator` v1.4.2) is inadequate:
- Last updated June 2023 (abandoned for 2.5+ years)
- Only 15 GitHub stars
- Self-described as "work in progress"
- TODO list shows incomplete grandfather and half-sibling support
- Uses fraction.js v4 (outdated; current is v5.3.4)
- Depends on lodash (unnecessary weight)
- Limited to basic heir types (wife, son, daughter in examples)
- No Quranic/Hadith reference mapping (a core requirement)

The Faraid engine is the core value proposition of this app. It must handle:
- All Quranic fixed shares (Dhawul Furud): 1/2, 1/4, 1/8, 2/3, 1/3, 1/6
- Asaba (residuary) heir calculations
- Awl (proportional reduction when shares > 1)
- Radd (redistribution when shares < 1 and no Asaba)
- Hajb (blocking rules between heirs)
- Quran/Hadith source mapping per allocation

Building this on top of fraction.js gives full control and auditability. The algorithm is well-documented in Islamic jurisprudence (Quran 4:11, 4:12, 4:176) and academic papers. A custom engine can be unit-tested against known Faraid case outcomes.

**Reference implementations to study (not use as dependencies):**
- Al-Wirasat (alwirasat.com) -- well-regarded online calculator
- uttoradhikar.gov.bd -- BD government inheritance calculator
- Academic paper: "A Modular Algorithmic Framework for Islamic Inheritance" (Al-Kharaj Journal)

### State Management & Persistence

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Zustand** | ^5.0.11 | Client state management with localStorage persistence | HIGH |

**Why Zustand:** The app needs "calculate without login, save with optional account." Zustand's built-in `persist` middleware serializes state to localStorage automatically, enabling users to close the browser and return to their calculation. Zero boilerplate: define a store, wrap with `persist()`, done. TypeScript-first with excellent type inference. No providers needed (unlike Redux or Context). Tiny bundle (~1KB). 50K+ GitHub stars.

**Key persist features needed:**
- `partialize` -- persist only calculation data, not UI state
- `version` + `migrate` -- handle schema changes across app updates
- `onRehydrateStorage` -- show loading state while restoring saved data

**Why NOT Redux Toolkit:** Massive overkill for a calculator app. Boilerplate-heavy (slices, reducers, selectors). The app has maybe 3-4 stores (heirs, properties, calculations, UI).

**Why NOT React Context:** No built-in persistence. Re-renders entire tree on state changes. Adequate for theme/locale but not for complex calculation state.

### Optional Authentication

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Supabase Auth** | latest | Optional account creation for saving calculations | MEDIUM |

**Why Supabase Auth:** Supports anonymous sign-ins natively -- users get a real auth session without providing any PII. When they decide to save, they can "upgrade" to a permanent account (email/password or OAuth) without losing data. Free tier is generous (50K monthly active users). Supabase also provides a Postgres database for storing saved calculations server-side, which means the "optional account" feature gets both auth and storage from one service.

**Architecture:** localStorage (via Zustand persist) is the primary storage. Supabase is additive -- only activated when the user explicitly chooses to create an account. This keeps the app fully functional without any backend.

**Why NOT Firebase Auth:** Heavier SDK, Google ecosystem lock-in, Firestore pricing can surprise. Supabase is open-source and Postgres-based.

**Why NOT roll your own:** Authentication is a solved problem with edge cases (token refresh, session management, password reset). Do not build this.

**Confidence note:** MEDIUM because the "optional account" feature is a nice-to-have that can be deferred. The app works fully with just localStorage. Evaluate Supabase need in later phases.

### Form Handling & Validation

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **React Hook Form** | ^7.71.2 | Heir input forms, property forms | HIGH |
| **Zod** | ^4.3.6 | Schema validation, type inference | HIGH |
| **@hookform/resolvers** | latest | Connect Zod schemas to React Hook Form | HIGH |

**Why React Hook Form + Zod:** The heir input system (number of brothers, sisters, spouse status) and property forms need validation. React Hook Form uses uncontrolled components for minimal re-renders -- important when forms trigger recalculations. Zod provides TypeScript-first schema validation with static type inference, meaning form types and validation rules are defined once. Formik is unmaintained (no commits in over a year). React Hook Form has 2x the downloads.

**Why Zod 4 specifically:** Released July 2025. 2kB core bundle (gzipped). Zero dependencies. Significant performance improvement over Zod 3. The `z.infer<>` type utility eliminates duplicate type definitions.

### UI Components

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **shadcn/ui** | CLI v4 (March 2026) | Accessible, customizable React components | HIGH |

**Why shadcn/ui:** Not a library -- it copies component source code into your project, giving full ownership. Built on Radix UI primitives (accessible by default) + TailwindCSS (already in the stack). Perfect for the "exceptional, modern UI" requirement because every component is fully customizable. Latest CLI v4 released March 2026. Works with Vite + React.

**Components needed from shadcn/ui:** Button, Card, Dialog, Select, Input, Tabs (simple/detailed mode toggle), Table, Accordion (Quranic references), Toast, Sheet (mobile navigation).

**Why NOT daisyUI:** CSS-only approach means less control over interactive behavior. shadcn/ui components are React-native with proper state management, accessibility, and keyboard navigation built in.

**Why NOT MUI/Chakra:** Heavy, opinionated design systems that fight TailwindCSS. The project explicitly uses TailwindCSS -- adding another styling system creates conflicts.

### Routing

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **react-router** | ^7.13.1 | Client-side SPA routing | HIGH |

**Why react-router v7:** This is a calculator app, not a complex SPA. It needs maybe 4-5 routes (home, calculator, results, about, saved calculations). react-router v7 is the standard, well-documented choice. In v7, the unified `react-router` package replaces `react-router-dom`. Note: Netlify requires a `_redirects` file with `/* /index.html 200` for SPA routing.

**Why NOT @tanstack/react-router:** Superior type safety and data loading, but overkill for a simple calculator with a handful of routes. Adds complexity without proportional benefit for this app size.

### Icons

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **lucide-react** | latest | Icon set (default for shadcn/ui) | HIGH |

**Why lucide-react:** Default icon library for shadcn/ui. Tree-shakeable, SVG-based, consistent design. No reason to use anything else when shadcn/ui is in the stack.

---

## Bangladesh Property Pricing Data

| Source | Type | Confidence |
|--------|------|------------|
| **No public API exists** | -- | HIGH (verified absence) |

**Research findings:** Bangladesh does not offer a public API for mouza rates or land prices. The situation:

1. **Mouza rates** are set by the government under "Minimum Market Price Rules" and were last officially updated in **2016**. They represent minimum registration prices, not market values.

2. **DLRS (land.gov.bd)** provides khatian records and mouza maps digitally, but no pricing data API. The "Land Single Gateway" launched December 2025 consolidates existing services but does not expose pricing.

3. **landvalue.jomibaba.com** appears to be a third-party aggregator but has no documented API.

4. **Government direction:** The Revenue Implementation Division has drafted a policy to align official prices with market rates, but this is not yet implemented.

**Recommended approach for the app:**

1. **Phase 1:** User manually enters property value (with helpful UI guidance on per-katha/per-shotangsho rates). This is the only reliable approach.
2. **Phase 2:** Build a static JSON dataset of mouza rates by district/upazila, scraped from publicly available government gazette PDFs. Update periodically. Clearly label as "government minimum rate" vs. actual market value.
3. **Phase 3 (if BD govt releases API):** Integrate with official source. Monitor land.gov.bd for API announcements.

**Critical design decision:** Always allow manual override. Even with auto-suggested prices, the user must be able to enter their own value. BD land prices vary wildly within the same mouza.

---

## Alternatives Considered (Summary)

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| PDF Generation | @react-pdf/renderer | jsPDF | No Bangla script support, imperative API |
| PDF Generation | @react-pdf/renderer | pdfmake | JSON-based layout, no JSX |
| PDF Generation | @react-pdf/renderer | react-to-print | Screenshots UI, wrong for reports |
| Charts | Recharts | react-minimal-pie-chart | Pie-only, no bar/stacked charts |
| Charts | Recharts | Chart.js | Canvas-based, poor SVG/PDF integration |
| Charts | Recharts | Nivo | Heavier than needed |
| Math | fraction.js | mathjs | Massive overkill, uses fraction.js internally |
| Faraid Engine | Custom | @hu-bcs1/islamic-inheritance-calculator | Abandoned, incomplete, outdated deps |
| State | Zustand | Redux Toolkit | Overkill, boilerplate-heavy |
| State | Zustand | React Context | No persistence, full-tree re-renders |
| Forms | React Hook Form | Formik | Unmaintained, worse TypeScript support |
| Validation | Zod 4 | Yup | Zod is TypeScript-native, smaller bundle |
| UI Components | shadcn/ui | daisyUI | CSS-only, less interactive control |
| UI Components | shadcn/ui | MUI/Chakra | Fights TailwindCSS, heavy |
| Routing | react-router v7 | @tanstack/react-router | Overkill for 4-5 routes |
| Auth | Supabase | Firebase | Heavier, vendor lock-in |

---

## Full Installation

```bash
# Core framework (already decided)
bun add react react-dom
bun add -D typescript @types/react @types/react-dom

# Build tool
bun add -D vite @vitejs/plugin-react

# Styling
bun add -D tailwindcss @tailwindcss/vite

# UI Components (shadcn/ui is installed via CLI, not npm)
bunx shadcn@latest init
# Then add components as needed:
# bunx shadcn@latest add button card dialog input select tabs table accordion toast sheet

# Icons (comes with shadcn/ui but explicit for clarity)
bun add lucide-react

# Routing
bun add react-router

# State Management
bun add zustand

# Forms & Validation
bun add react-hook-form zod @hookform/resolvers

# Math (Faraid calculations)
bun add fraction.js

# Charts
bun add recharts

# PDF Generation
bun add @react-pdf/renderer

# Optional (Phase 3+): Authentication & Cloud Storage
# bun add @supabase/supabase-js
```

---

## Version Summary Table

| Package | Version | Weekly Downloads | Last Updated |
|---------|---------|-----------------|--------------|
| @react-pdf/renderer | 4.3.2 | 860K+ | Jan 2026 |
| recharts | 3.8.0 | High (3730+ dependents) | Mar 2026 |
| fraction.js | 5.3.4 | 2.6M+ | Nov 2025 |
| zustand | 5.0.11 | High (50K+ stars) | Feb 2026 |
| react-hook-form | 7.71.2 | 4.9M+ | Feb 2026 |
| zod | 4.3.6 | High | Feb 2026 |
| react-router | 7.13.1 | High | Feb 2026 |
| shadcn/ui CLI | v4 | N/A (CLI tool) | Mar 2026 |

---

## Sources

- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) -- version, downloads
- [react-pdf.org fonts](https://react-pdf.org/fonts) -- custom font support documentation
- [jsPDF Bangla font issue #2587](https://github.com/parallax/jsPDF/issues/2587) -- confirmed Bangla unsupported
- [Recharts npm](https://www.npmjs.com/package/recharts) -- version, dependents
- [Fraction.js GitHub](https://github.com/infusion/Fraction.js/) -- BigInt internals, API
- [fraction.js npm](https://www.npmjs.com/package/fraction.js) -- version 5.3.4
- [HU-BCS1/islamic-inheritance-calculator](https://github.com/HU-BCS1/islamic-inheritance-calculator) -- evaluated and rejected
- [Al-Kharaj Journal: Modular Algorithmic Framework for Islamic Inheritance](https://ejournal.iainpalopo.ac.id/index.php/alkharaj/article/view/9731) -- algorithm reference
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- persist API
- [Supabase anonymous sign-ins docs](https://supabase.com/docs/guides/auth/auth-anonymous) -- anonymous auth feature
- [React Hook Form npm](https://www.npmjs.com/package/react-hook-form) -- version, downloads
- [Zod v4 release notes](https://zod.dev/v4) -- Zod 4 features
- [shadcn/ui CLI v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) -- latest release
- [react-router npm](https://www.npmjs.com/package/react-router-dom) -- v7 unified package
- [BD Business Insider: Market value to determine official prices](https://www.businessinsiderbd.com/bangladesh/news/30761/market-value-of-land-likely-to-determine-official-prices) -- mouza rate context
- [TBS News: Govt plans to align land prices](https://www.tbsnews.net/economy/govt-plans-align-official-land-price-market-rates-1141781) -- BD pricing policy
- [landvalue.jomibaba.com](https://landvalue.jomibaba.com/) -- third-party BD land value site
- [uttoradhikar.gov.bd](https://uttoradhikar.gov.bd/) -- BD government inheritance calculator reference
- [Netlify Vite docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) -- deployment config
- [6 Open-Source PDF Libraries for React 2025](https://dev.to/ansonch/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025-13g0) -- PDF library comparison
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) -- charting library comparison
- [react-minimal-pie-chart GitHub](https://github.com/toomuchdesign/react-minimal-pie-chart) -- evaluated
