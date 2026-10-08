# BiteID: Architecture

BiteID is an **alpha** app for bite / sting / rash intake. The browser stays a *dumb
client*: it collects photos and answers, hands them to one server function, and renders
what comes back. All medical logic, prompts, priors, and secrets live server-side only
(`*.server.ts` + `createServerFn`). See
[BACKEND_CONTRACT.md](BACKEND_CONTRACT.md) for the pipeline.

## Stack

- TanStack Start v1 (React 19, file-based routing) on Vite 7: **not** Next.js.
- Tailwind CSS v4 via `src/styles.css` (`@theme` tokens, no `tailwind.config.js`).
- shadcn/Radix primitives in `src/components/ui`.
- lucide-react icons.
- No database and no Lovable Cloud. Analysis runs in a TanStack `createServerFn`
  calling Lovable AI (`openai/gpt-6-astra`, Responses API) plus local geo/seasonal priors.

## File map

| Path | Role |
| --- | --- |
| `src/routes/index.tsx` | The whole app: 3-step wizard + results dashboard. Owns all state. |
| `src/routes/__root.tsx` | App shell, font `<link>` tags, base metadata. |
| `src/lib/triage.ts` | Options, state reducer, `submitTriage()` (files → data URLs → server fn), response helpers. |
| `src/lib/triage.functions.ts` | `analyseIntakeFn`: the only client→server entry point. |
| `src/lib/triage-engine.server.ts` | Emergency gate, vision pass, ranking, guidance. Server only. |
| `src/lib/geo-pest.server.ts` | Vector database + `evaluateRegionalLikelihood()` (geo/season/habitat priors). |
| `src/lib/ai-gateway.server.ts` | Lovable AI Gateway provider (Responses API, run-id passthrough). |
| `src/lib/us-states.ts` | `US_STATE_OPTIONS` for the step-1 state selector. |
| `src/components/triage/UploadCard.tsx` | File picker + drag/drop + preview + remove/replace. |
| `src/components/triage/StepNav.tsx` | Step indicator (`Photos → Context → Safety check`). |
| `src/components/triage/EmergencyModal.tsx` | Red full-bleed dialog shown when an emergency symptom is ticked. |
| `src/components/triage/ProbabilityCard.tsx` | One ranked finding: percent, animated bar, urgency chip. |
| `src/components/triage/FitzpatrickTabs.tsx` | Tone tabs showing reaction-pattern references for the top-ranked result. |
| `src/lib/creature-images.ts` | Client-safe map from stable vector IDs to bundled visual-reference assets. |
| `src/lib/bite-pattern-images.ts` | Client-safe map from stable vector IDs to three tone-specific reaction images, with a general fallback. |
| `src/assets/fitz-*.jpg` | AI-generated skin-reaction references, labeled as non-clinical visual aids. |
| `src/assets/creatures/*.jpg` | AI-generated field-guide references for common ranked creatures. |
| `src/assets/bite-patterns/*.jpg` | AI-generated mild reaction-pattern references for 10 common results across three tone groups. |

## State

All wizard state lives in one reducer (`triageReducer` in `src/lib/triage.ts`) held by
`TriagePage` via `useReducer`. Step components are presentational; they receive values
and a change callback, never their own copy of the data.

Local `useState` in `TriagePage` covers UI-only concerns: `step`, `modalOpen`,
`status` (`idle | sending | error | done`), `error`, `response`.

Reducer invariants:
- Ticking any emergency symptom clears `noneOfThese`.
- Ticking `noneOfThese` clears `symptoms`.
- `reset` returns `initialFormState`.

## Flow

```text
step 0  photos      lesion photo REQUIRED, bug photo optional  -> Continue gated on lesionImage
step 1  context     environment + US state + duration          -> Continue gated on all three
step 2  safety      emergency checklist                        -> Submit
        any symptom ticked -> EmergencyModal opens immediately
                            + persistent red banner + submit-button reminder
submit  submitTriage -> analyseIntakeFn (server) -> status "done" (never throws)
done    ResultsDashboard (ranked cards, guidance, top-result reaction references, disclaimer)
        "Start over" -> reset()
```

## Rules for agents editing this app

1. **Never** add diagnosis, scoring, ranking heuristics, or symptom interpretation on the
   client. Sorting by the confidence the server returns is the only allowed derivation.
   Medical logic belongs in `*.server.ts` behind `analyseIntakeFn`.
2. **Never** put an API key or secret in client code. `LOVABLE_API_KEY` is read with
   `process.env` inside the server boundary only.
3. Keep the emergency path loud: modal on first tick, banner while any symptom is set,
   reminder next to submit. Do not make the modal blocking-only or silently dismissible
   without the banner.
4. Use semantic tokens (`bg-card`, `text-muted-foreground`, `bg-destructive`,
   `bg-caution/15`, `text-caution-foreground`). No hardcoded colors like `text-white`.
5. `destructive` (red) is reserved for emergency states only; `caution` (amber) is for
   alpha / warning notices.
6. Fonts: `font-display` (Sora) for headings, `font-sans` (DM Sans) for body.
7. This is a single-route app. Add new routes as files in `src/routes/`; never edit
   `src/routeTree.gen.ts`.
8. Keep the alpha framing (header pill + footer note) until the user says the app is out
   of alpha.
9. Reaction images are non-diagnostic visual references selected from the top result's
   stable ID. Keep the general `fitz-*.jpg` set as the fallback for unknown or absent IDs.
10. **AI Diagnoser Architecture & Clinical Safety Gates**: BiteID operates as an
    advanced **AI Diagnoser** delivering calibrated clinical differential diagnoses (DDx)
    with 95% Confidence Intervals, precision weight-based pediatric dosing engines, and
    multi-day serial photo progression monitoring. To protect human life and adhere to
    rigid clinical standards:
    - We provide assistive diagnostic intelligence, but explicitly state that software
      cannot substitute for in-person physician palpation, vital sign assessment, or formal
      medical evaluation.
    - Life-safety gates are absolute: mandatory emergency alerts for spreading red streaks
      (lymphangitis), airway compromise, rabies bat exposures, and progressive envenomations.
    - Pediatric safety locks are immutable: strict `< 6 Months` Ibuprofen renal block,
      `< 2 Years` antihistamine respiratory depression block, and Aspirin/Reye's syndrome black-box contraindications.

See [BACKEND_CONTRACT.md](./BACKEND_CONTRACT.md) for the request/response shape.
