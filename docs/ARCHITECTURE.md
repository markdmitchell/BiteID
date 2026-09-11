# Bite & Rash Triage — Frontend Architecture

## Stack

- **Framework:** TanStack Start v1 (full-stack React 19 framework, file-based routing) / Next.js 14 App Router
- **Build tool:** Vite 7 / Next.js Compiler
- **UI library:** React 19 / React 18
- **Styling:** Tailwind CSS with CSS-first theme variables in `src/styles.css` / `src/app/globals.css`
- **Components:** shadcn/ui primitives built on Radix UI (`@radix-ui/react-*`)
- **Icons:** Lucide React
- **Language:** TypeScript 5

> The app is intentionally a "dumb client." It captures user input, packages it, and sends it to a backend. It does not run any medical logic, hold any API keys, or interpret AI results locally.

## File map

```text
src/
  app/
    layout.tsx              # Root Next.js layout
    page.tsx                # BiteID Bento Dashboard homepage
    intake/page.tsx         # Guided 3-step triage intake wizard
    results/page.tsx        # Diagnostic results dashboard
    api/analyze/route.ts    # Unified API gateway route
  components/
    triage/
      UploadCard.tsx        # Photo dropzone / preview / remove
      EmergencyModal.tsx    # Red emergency warning modal
      ResultsDashboard.tsx  # Ranked results + Fitzpatrick skin-tone selector
  lib/
    triage.ts               # Types, option lists, and submitTriage() helper
    schema.ts               # Zod data contracts
    geminiTriage.ts         # Multi-node AI orchestration engine
    geoPestFilter.ts        # Vector database & geographic priors engine
```

## State model

All state lives in the triage intake component as local React state:

| State | Type | Purpose |
|---|---|---|
| `step` | `0 \| 1 \| 2` | Current wizard step (Photos, Context, Safety check) |
| `lesionImage` | `File \| null` | Required skin-lesion photo |
| `bugImage` | `File \| null` | Optional captured-bug photo |
| `environment` | `string` | Exposure location environment |
| `duration` | `string` | Symptom duration |
| `flags` | `string[]` | Checked emergency symptom IDs |
| `modalOpen` | `boolean` | Emergency modal visibility |
| `submitting` | `boolean` | Loading state during POST |
| `error` | `string \| null` | Backend/network error message |
| `results` | `TriageResponse \| null` | Opaque backend response |

No global state library is used; the wizard and results are a single-page state machine.

## Wizard flow

1. **Step 0 — Photos**
   - Two `UploadCard` instances: required "Skin lesion" and optional "Captured bug".
   - Supports click-to-choose, drag-and-drop, and mobile camera capture (`capture="environment"`).
   - Continue is disabled until `lesionImage` is set.

2. **Step 1 — Context**
   - Select dropdown for `environment` (woods, bed, yard, beach, travel, unsure).
   - Select dropdown for `duration` (under 24h, 1–3d, 4–7d, 1–4w, over 1m).
   - Continue is disabled until both fields are selected.

3. **Step 2 — Safety check**
   - Checkbox list of emergency symptoms.
   - Checking **any** symptom immediately opens `EmergencyModal`.
   - After dismissal, a persistent red inline warning remains on the step.
   - Submitting sends the payload to the backend and renders `ResultsDashboard`.

## Results dashboard

- Renders whatever the backend returns; no local ranking or filtering.
- Each result card shows `name`, optional `description`, and a horizontal confidence bar.
- Confidence is accepted as a 0–1 decimal or 0–100 percentage and clamped to `[0, 100]`.
- Includes a Fitzpatrick skin-tone selector (Tabs: I–II, III–IV, V–VI) that swaps reference image.
- Persistent disclaimer: this is not a diagnosis.
- "Start over" resets all state to step 0.

## Rules

### No medical logic or keys on the client
- The frontend never diagnoses, ranks, or filters conditions locally.
- The frontend never stores or exposes API keys, model names, or prompts.
- The backend response is treated as opaque JSON and rendered defensively.

### Loud emergency path
- Red (`--destructive`) is reserved **only** for emergency UI.
- Any checked emergency symptom triggers a blocking modal with a clear "call emergency services" action.
- The warning banner persists on the safety-check step after the modal is dismissed.

### Color / font conventions
- Colors are defined as semantic CSS variables using `oklch` / HSL.
- Tailwind utilities use semantic names only: `bg-primary`, `text-destructive`, `border-border`, etc.
- No hardcoded hex/rgb classes in components.
- Calm clinical palette: soft neutral background, deep teal primary, red strictly for emergencies.
- Generous spacing, rounded cards, mobile-first responsive layout.
