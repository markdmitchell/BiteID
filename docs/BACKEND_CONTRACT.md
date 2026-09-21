# BiteID — Analysis pipeline contract

Analysis now runs **inside this app**. There is no external endpoint and no
`VITE_API_URL`. The browser never sees prompts, scoring data, or API keys.

```text
client  submitTriage(state)                    src/lib/triage.ts
          ↓ files -> data URLs
        analyseIntakeFn({ data })              src/lib/triage.functions.ts  (createServerFn, POST)
          ↓ (server only)
        analyseIntake(intake)                  src/lib/triage-engine.server.ts
          ├─ emergency short-circuit
          ├─ vision pass (Lovable AI, openai/gpt-6-astra, Responses API, streamed)
          └─ evaluateRegionalLikelihood(...)   src/lib/geo-pest.server.ts
```

## Server function input

`analyseIntakeFn` (`src/lib/triage.functions.ts`), validated in `validate()`:

| Field | Type | Notes |
| --- | --- | --- |
| `lesionImage` | string | required `data:image/...;base64,...` URL |
| `bugImage` | string \| null | optional data URL |
| `environment` | string | `woods`, `bed`, `yard`, `water`, `travel`, `unsure` |
| `duration` | string | `under-24h`, `1-3d`, `4-7d`, `1-2w`, `over-2w` |
| `usState` | string | `US-XX` (see `src/lib/us-states.ts`), defaults `US-VA` |
| `monthIndex` | number | 0–11, set from the browser clock |
| `symptoms` | string[] | emergency checklist values |

## Server-side steps

1. **Emergency gate** — any `symptoms` entry returns `emergencyResponse()`
   immediately: no model call, empty `results`, urgent-care guidance.
2. **Vision pass** — one streamed Responses-API call with the lesion image and,
   when present, the arthropod image. It returns JSON only:
   `bugTaxonomy`, `bugCommonName`, `pattern`, `centralFeatures`,
   `primaryReaction`, `primarySensation`, `lesionDescription`.
   Every enum value is clamped to the allowed list before use.
3. **Ranking** — `evaluateRegionalLikelihood(context, morphology, bugTaxonomy)`,
   ported verbatim from the engine repo (`src/lib/geoPestFilter.ts`): state
   endemicity, monthly activity, habitat, sensation, bug-taxonomy overrides,
   morphology multipliers, targetoid-rash priors, and the hard Mid-Atlantic
   annular-target override. Probabilities are normalised; the top five are returned.

## Response shape

```json
{
  "results": [
    {
      "name": "Blacklegged (Deer) Tick",
      "scientificName": "Ixodes scapularis",
      "confidence": 92,
      "description": "Descriptive lesion reading (top card only).",
      "matchedFactors": ["Present in Virginia", "Peak activity in September"],
      "associatedPathogens": ["Lyme Disease"],
      "delayedRisks": ["Post-Treatment Lyme Disease Syndrome"],
      "firstAidAdvice": ["Grasp tick close to skin with tweezers…"],
      "warningSignsToWatch": ["Expanding bullseye rash >5cm."]
    }
  ],
  "guidance": "Shown under \"What to do next\". Newlines preserved.",
  "disclaimer": "Alpha version — for testing only…",
  "isEmergencyRedirect": false,
  "culpritDetectedFromPhoto": true
}
```

`confidence` is a percentage (0–100). `src/lib/triage.ts` still tolerates the
older aliases (`predictions`, `condition`/`label`, `probability`/`score`,
`summary`, `advice`) and sorts by confidence descending — no other interpretation
happens in the client.

## Failure behaviour

Nothing throws and no error banner exists. Any failure — missing
`LOVABLE_API_KEY`, gateway error, unparsable model output, RPC failure — returns
`unavailableResponse()` / `FALLBACK_RESPONSE`: empty `results` plus neutral
guidance and the alpha disclaimer.

## Secrets

`LOVABLE_API_KEY` is read with `process.env` inside the server boundary only.
Never expose it through `VITE_*`, loader data, or client props.
