# Jomi-Bhag (জমি ভাগ)

## What This Is

An Islamic inheritance land division web application that helps Bangladeshi families and legal professionals calculate and visualize property shares strictly according to Faraid (Islamic inheritance law). Users input heir details (brothers, sisters, spouses) and property information (land, houses, trees, ponds) to receive precise share breakdowns with Quranic/Hadith references, charts, and printable reports.

## Core Value

Accurate, unbiased Islamic inheritance division — the app strictly follows Faraid rules for every calculation, simple or complex, without favoring any heir.

## Requirements

### Validated

- ✓ Full Faraid calculation engine (Awl, Radd, Asaba, standard shares) — Phase 1
- ✓ Heir input system — number of brothers, sisters, and their spouse status — Phase 2
- ✓ User identifies as male/female heir and enters own spouse status — Phase 2
- ✓ Detailed share breakdown — fractions, percentages, and monetary values per heir — Phase 3
- ✓ Quran/Hadith references justifying each allocation — Phase 3
- ✓ Simple mode for general public, detailed mode for legal professionals — Phase 3

### Active

- [ ] Parents assumed deceased — division among children/siblings and spouses
- [ ] All property types: agricultural, residential, commercial, mixed, ponds, orchards
- [ ] House valuation — structures on land affecting total property value
- [ ] Tree/crop valuation — trees, bamboo groves, orchards affecting value
- [ ] Property price: auto-suggest from BD govt/market data with user override
- [ ] Data visualizations and charts showing division
- [ ] Printable PDF/report generation with full division details
- [ ] Optional account system — calculate without login, save with optional account
- [ ] Modern, exceptional frontend design (React + TypeScript + TailwindCSS)

### Out of Scope

- Bangla language support — deferred to future milestone
- Mobile native app — web-first
- Monetization/payment features — free forever
- Living parent scenarios — app assumes parents have passed
- Non-Islamic inheritance law calculations

## Context

- **Target audience:** Bangladeshi families dividing inherited property + lawyers, land surveyors, deed writers
- **Islamic basis:** Strict Faraid rules from Quran and Sunnah — no compromise, no favoritism
- **Reference site:** uttoradhikar.gov.bd (BD govt inheritance site — may not strictly follow Islam or have updated data)
- **Property pricing:** Must use updated prices from govt land listings and market data; cross-verify accuracy
- **Names are optional:** Users enter counts of heirs (e.g., 3 brothers, 2 sisters) and spouse status, not necessarily names

## Constraints

- **Tech stack**: React, TypeScript, TailwindCSS, Bun, Netlify
- **Islamic accuracy**: Every calculation must be traceable to Quran/Hadith source
- **Design**: Must use frontend-design skill for exceptional, modern UI
- **Pricing data**: Must attempt auto-fetch from BD govt sources with manual override fallback
- **Free**: No paywalls, completely free public service

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Parents assumed deceased | Simplifies v1 scope — most common real-world scenario | — Pending |
| Counts over names for heirs | Privacy-friendly, faster input — names optional | — Pending |
| Full Faraid engine in v1 | Users need accurate complex case handling from day one | — Pending |
| Both audience modes | Simple for families, detailed for professionals — wider reach | — Pending |
| Free forever model | Public service for BD community, no monetization barriers | — Pending |

---
*Last updated: 2026-03-13 after Phase 3*
