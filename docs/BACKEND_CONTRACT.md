# Bite & Rash Triage — Backend Contract

## Endpoint

The frontend POSTs to:

```text
${VITE_API_URL}/triage
```

If `VITE_API_URL` is not set, it falls back to relative endpoint:

```text
/api/analyze
```

> `VITE_API_URL` is read at build time from the environment. The frontend does not hold any API keys.

## Request

### Method

`POST`

### Content-Type

`multipart/form-data`

### FormData fields

| Field | Type | Required | Description |
|---|---|---|---|
| `skin_lesion_image` / `lesionImage` | File | Yes | The skin lesion / bite / rash photo. Sent with its original filename. |
| `bug_image` / `culpritImage` | File | No | Optional photo of the captured insect. Sent with its original filename if provided. |
| `environment` | string | Yes | Exposure location value. One of: `woods`, `bed`, `yard`, `beach`, `travel`, `unsure`. |
| `duration` | string | Yes | Symptom duration value. One of: `under-24h`, `1-3d`, `4-7d`, `1-4w`, `over-1m`. |
| `emergency_flags` | JSON string array | Yes | Stringified array of checked emergency symptom IDs. Example: `["breathing","fever"]`. Empty array `[]` when none selected. |

### Example payload (conceptual)

```ts
const formData = new FormData();
formData.append("skin_lesion_image", lesionImage, lesionImage.name);
formData.append("bug_image", bugImage, bugImage.name);           // optional
formData.append("environment", "woods");
formData.append("duration", "1-3d");
formData.append("emergency_flags", JSON.stringify(["swelling"]));
```

## Response

### Success

HTTP `200 OK` with JSON body:

```json
{
  "isEmergencyRedirect": false,
  "culpritDetectedFromPhoto": true,
  "summary": "Primary suspected vector: Blacklegged (Deer) Tick (92% confidence score).",
  "disclaimer": "DISCLAIMER: BiteID is an AI educational decision-support tool.",
  "results": [
    {
      "name": "Blacklegged (Deer) Tick",
      "scientificName": "Ixodes scapularis",
      "description": "Expanding red rash that may have a bull's-eye appearance.",
      "confidence": 0.92,
      "matchedFactors": [
        "Endemic presence confirmed in state (US-VA)",
        "Distinct lesion morphology match (annular_target)"
      ],
      "associatedPathogens": [
        "Lyme Disease (Borrelia burgdorferi)",
        "Anaplasmosis"
      ],
      "delayedRisks": [
        "Post-Treatment Lyme Disease Syndrome",
        "Alpha-gal syndrome (red meat allergy)"
      ],
      "firstAidAdvice": [
        "Remove tick with fine-tipped tweezers.",
        "Disinfect bite site with rubbing alcohol."
      ],
      "warningSignsToWatch": [
        "Expanding circular bullseye rash >5cm."
      ]
    }
  ]
}
```

### Field definitions

| Field | Type | Required | Description |
|---|---|---|---|
| `results` | array | Yes | Ranked list of possible conditions. |
| `results[].name` | string | Yes | Short condition name displayed as the card title. |
| `results[].description` | string | No | Longer explanation shown below the name. |
| `results[].confidence` | number | No | Confidence score. Accepts `0.0–1.0` decimal **or** `0–100` percentage. Rendered as a percentage bar. |
| `results[].matchedFactors` | array | No | Diagnostic matched factors. |
| `results[].associatedPathogens` | array | No | Known transmissible pathogens. |
| `results[].delayedRisks` | array | No | Long-term or delayed medical risks. |

### Defensive rendering

The frontend:

- Expects `results` to be an array. If missing or not an array, it renders an empty-results message.
- Renders each item even if `description` or `confidence` is missing.
- Clamps confidence to `[0, 100]` and rounds to the nearest whole percent.
- Stores the raw response in `TriageResponse.raw` for debugging but never acts on it.

### Errors

If the response status is not OK (`2xx`), the frontend displays the error to the user and allows retry. The error message is surfaced as plain text.

Example error shown to the user:

```text
The analysis service returned an error (503).
```
