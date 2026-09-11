# BiteID — Backend contract

The client talks to exactly one endpoint, read from `import.meta.env.VITE_API_URL`
(see `.env.example`). If it is unset, step 3 shows an inline notice and `submitTriage`
throws instead of failing silently.

## Request

`POST {VITE_API_URL}` with a browser-native `FormData` body.
No `Content-Type` header is set — the browser adds the multipart boundary. Do not set it.

| Field | Type | Notes |
| --- | --- | --- |
| `skin_lesion_image` | binary file | required; only omitted if the user bypassed the gate |
| `bug_image` | binary file | optional |
| `environment` | string | one of `woods`, `bed`, `yard`, `water`, `travel`, `unsure` |
| `duration` | string | one of `under-24h`, `1-3d`, `4-7d`, `1-2w`, `over-2w` |
| `emergency_symptoms` | JSON string | array of `breathing`, `swelling`, `streaks`, `confusion`, `expanding`, `neck` |
| `has_emergency_symptoms` | `"true"` / `"false"` | convenience flag |

Built by `buildTriageFormData()` in `src/lib/triage.ts`. Changing a field name here means
changing that function and this table together.

## Response

JSON. Every field is optional and rendered as-is; unknown keys are ignored.

```json
{
  "results": [
    {
      "name": "Mosquito bite",
      "probability": 0.62,
      "description": "Short human-readable explanation.",
      "urgency": "low"
    }
  ],
  "guidance": "Free text shown under \"What to do next\". Newlines preserved.",
  "disclaimer": "Optional extra text shown at the bottom of the results."
}
```

Tolerated aliases (handled in `src/lib/triage.ts`):

- list: `results` or `predictions`
- name: `name` | `condition` | `label`
- confidence: `probability` | `confidence` | `score` — `0–1` is scaled to `0–100`, `>1` used as-is
- text: `description` | `summary`
- urgency chip: `urgency` | `severity` — matched case-insensitively against
  `emerg|urgent|high|severe` (red), `moderate|medium|soon` (amber), else teal
- guidance: `guidance` | `advice`

The client sorts results by confidence descending. It performs no other interpretation.

## Errors

- Non-2xx → `The service responded with an error (<status>).`
- Network / thrown error → message surfaced in a red box on step 3 with a "Try again" button.
- Missing `VITE_API_URL` → `No backend address is configured yet, so the intake cannot be sent.`

## Local testing

```sh
echo 'VITE_API_URL=http://localhost:4000/api/triage' > .env
```

Any stub returning the JSON above renders the full dashboard.
