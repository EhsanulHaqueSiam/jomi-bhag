# Quick Task 9: Fix CSS Issues

## Changes

### FOUC (Flash of Unstyled Content)
- Moved Google Font `@import url()` from `src/index.css` to `<link>` tags in `index.html`
- Added `preconnect` hints for `fonts.googleapis.com` and `fonts.gstatic.com`
- Fonts now load in parallel with CSS instead of blocking it

### Wizard Container Width
- Changed from `md:max-w-lg lg:max-w-xl` (512px/576px) to `md:max-w-2xl lg:max-w-3xl` (672px/768px)
- Gives heir cards, summary table, and estate breakdown more room on desktop

### HeirCard Text Clipping
- Reduced flex gaps from `gap-2` to `gap-1.5`
- Reduced percent text from `text-sm` to `text-xs`
- Added `truncate` to BDT amount spans to prevent overflow
