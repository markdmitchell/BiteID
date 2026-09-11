# BiteID — Architecture

BiteID is an **alpha** front end for bite / sting / rash intake. It is a *dumb client*:
it collects photos and answers, POSTs them to an external service, and renders whatever
JSON comes back. It contains **no medical logic, no scoring, no API keys**.

## Stack

- TanStack Start v1 (React 19, file-based routing) on Vite 7 — **not** Next.js.
- Tailwind CSS v4 via `src/styles.css` (`@theme` tokens, no `tailwind.config.js`).
- shadcn/Radix primitives in `src/components/ui`.
- lucide-react icons.
- No backend in this repo: no Lovable Cloud, no database, no server functions.

## File map

| Path | Role |
| --- | --- |
| `src/routes/index.tsx` | The whole app: 3-step wizard + results dashboard. Owns all state. |
| `src/routes/__root.tsx` | App shell, font `<link>` tags, base metadata. |
| `src/lib/triage.ts` | Options, state reducer, FormData builder, POST call, response helpers. |
| `src/components/triage/UploadCard.tsx` | File picker + drag/drop + preview + remove/replace. |
| `src/components/triage/StepNav.tsx` | Step indicator (`Photos → Context → Safety check`). |
| `src/components/triage/EmergencyModal.tsx` | Red full-bleed dialog shown when an emergency symptom is ticked. |
| `src/components/triage/ProbabilityCard.tsx` | One ranked finding: percent, animated bar, urgency chip. |
| `src/components/triage/FitzpatrickTabs.tsx` | Types I–II / III–IV / V–VI tabs swapping a reference image. |
| `src/assets/fitz-*.jpg` | **AI-generated placeholders.** Replace with real clinical references. |

## State

All wizard state lives in one reducer (`triageReducer` in `src/lib/triage.ts`) held by
`TriagePage` via `useReducer`. Step components are presentational — they receive values
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
step 1  context     environment + duration                     -> Continue gated on both
step 2  safety      emergency checklist                        -> Submit
        any symptom ticked -> EmergencyModal opens immediately
                            + persistent red banner + submit-button reminder
submit  buildTriageFormData -> POST -> await res.json() -> status "done"
done    ResultsDashboard (ranked cards, guidance, Fitzpatrick tabs, disclaimer)
        "Start over" -> reset()
```

## Rules for agents editing this app

1. **Never** add diagnosis, scoring, ranking heuristics, or symptom interpretation on the
   client. Sorting by the confidence value the backend supplies is the only allowed
   derivation.
2. **Never** put an API key or secret in this repo. The only config is `VITE_API_URL`.
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

See [BACKEND_CONTRACT.md](./BACKEND_CONTRACT.md) for the request/response shape.
