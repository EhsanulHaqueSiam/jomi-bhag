# Phase 1: Faraid Engine and Project Foundation - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Pure TypeScript Faraid calculation engine with exact fraction arithmetic, all Hajb blocking rules (16 total, 5 partial), Awl/Radd adjustments, Asaba distribution, and deployable project scaffolding (React + TypeScript + TailwindCSS + Bun + Netlify). No UI beyond scaffolding — the engine is tested programmatically.

</domain>

<decisions>
## Implementation Decisions

### MFLO vs Pure Faraid
- Default to pure Faraid (classical Hanafi), with MFLO Section 4 as an opt-in toggle
- MFLO support built into the engine in Phase 1 (calculation path), UI toggle comes in Phase 2/3
- When MFLO is active, show clear warning banner: "MFLO Section 4 applied — this modifies classical Faraid rules"
- MFLO scope: Section 4 (orphaned grandchildren) only, plus informational notes about succession certificates and pre-death gift (Hiba) rules
- MFLO toggle always visible regardless of heir composition (supports what-if exploration)
- Claude's discretion: whether pure Faraid or MFLO is the landing default

### Heir Type Scope
- Full heir taxonomy: sons, daughters, spouse(s), full/consanguine/uterine brothers and sisters
- Grandchildren: sons of sons, daughters of sons (needed for MFLO Section 4)
- Grandparents: paternal grandfather, paternal/maternal grandmother
- Distant kindred (dhawil-arham): supported when no closer heirs exist
- Polygamy: support up to 4 wives — spouse share divided equally among all wives
- Kalalah (no children, no father): fully handled, not an error state
- Siblings specified as three distinct types: full, consanguine (paternal half), uterine (maternal half)

### Edge Case Handling
- Umariyyatayn: follow Omar's (RA) ruling — mother gets 1/3 of remainder, not 1/3 of estate (Hanafi consensus)
- Mushtarakah: follow strict Hanafi (full siblings get nothing if blocked) BUT show note with Shafi'i/Maliki alternative opinion
- Awl: show full explanation — original shares, why they exceed 100%, proportional reduction with math
- Radd: explain Hanafi ruling that spouses are excluded from surplus redistribution, note why
- All edge cases must include educational explanations, not just adjusted numbers

### Quranic/Hadith Source Data
- Each share rule linked to specific Quranic ayah with full Arabic text + English translation
- Hadith references included alongside Quranic ayahs where applicable (e.g., Sahih Bukhari for blocking rules)
- Engine output includes per-heir annotations (which reference justifies each heir's share)
- Engine also produces a grouped "Islamic Basis" section with all references for the calculation
- Arabic script displayed in the app (requires Arabic font support from Phase 1 scaffolding)

### Claude's Discretion
- Default mode (pure Faraid vs MFLO) — pick best UX default
- Exact fraction arithmetic library integration approach
- Test suite structure and verification methodology
- Project scaffolding configuration details
- Arabic font selection for Quranic text display

</decisions>

<specifics>
## Specific Ideas

- App's core promise is "strictly follows Islam" — every calculation must be defensible with sources
- When showing alternative opinions (like Mushtarakah), clearly label which is Hanafi and which is other schools
- Engine must handle the FULL spectrum from simple (3 brothers splitting land) to complex (Awl with 8 heirs)
- Explanations are educational — users should understand WHY they get their share, building trust in the app

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — Phase 1 establishes the foundational patterns

### Integration Points
- Engine will be consumed by Phase 2 (Heir Input Wizard) and Phase 3 (Results Display)
- Quranic/Hadith reference data structure must be designed for both per-heir inline display and grouped section display
- MFLO toggle state needs to flow from UI (Phase 2) to engine — design the API accordingly

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-faraid-engine-and-project-foundation*
*Context gathered: 2026-03-12*
