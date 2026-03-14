# Quick Task 7: Fix PDF Download and Print

## Changes

### src/hooks/usePdfExport.tsx
- **Chart capture:** Wrapped in try/catch — chart capture failure is non-critical, PDF generates without charts
- **Error state:** Added `error` and `dismissError` to hook return
- **downloadPdf:** Now catches errors and sets error message instead of silently failing
- **printPdf:** Changed from `window.open()` (popup-blocked on mobile) to hidden iframe approach with fallback to `window.open()` if iframe cross-origin print fails
- **Cleanup:** Added 100ms delay before DOM cleanup in download to ensure download starts

### src/components/results/ResultsPage.tsx
- Added red error banner at top of results when `pdfError` is set
- Dismiss button clears the error

## Root Cause
- No try/catch around async PDF generation — errors silently swallowed
- `window.open()` for print blocked by mobile popup blockers
- Chart DOM elements may not exist when PDF generated (conditional rendering)
