# Triage page error safety net

## Goal
If something breaks on the triage page, people see a calm, clear message with a Reload button instead of a blank screen. Emergency guidance stays visible so a crash never hides urgent advice.

## What the user sees
- Heading: "Something went wrong with this intake"
- Short note: their photos weren't sent anywhere new, and reloading starts a fresh intake.
- Primary button: **Reload page** (full reload). Secondary: **Try again** (re-render without reload).
- A red-bordered emergency line: "If you have trouble breathing, facial swelling, or spreading redness with fever, call 911 now." plus a call link.
- Alpha badge and existing Clinical Green styling.

## Technical details
- New `src/components/triage/TriageErrorFallback.tsx` using semantic tokens, `role="alert"`, focus moved to heading on mount, 44px buttons.
- `src/routes/index.tsx`: add `errorComponent` (TanStack route boundary; Try again = `router.invalidate()` + `reset()`, Reload = `window.location.reload()`), calling `reportLovableError` with `boundary: "triage_route"`.
- Also wrap the results dashboard section in a small React class `ErrorBoundary` so a failure inside results (cards, skin-tone tabs, modals) falls back in place while the header stays usable.
- `src/router.tsx`: set `defaultErrorComponent` to the same fallback for other routes.
- No changes to analysis, ranking, or medical logic.
- Verify by temporarily forcing a throw in Playwright (via a dev-only query flag that is removed after checking) and confirming the fallback renders with no blank screen.
