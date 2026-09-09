# Medical Triage Intake UI

A guided 3-step intake flow plus a results dashboard. The app stays a pure front end: no medical logic, no keys, no local interpretation of results — it collects input, sends it to your backend, and displays whatever comes back.

One note on framework: this project runs on TanStack Start (React + Tailwind), not Next.js. Everything requested works the same way; the only difference is that the backend address is read from an environment value named `VITE_API_URL` instead of `NEXT_PUBLIC_API_URL`.

## Step 1 — Image capture
- Two upload cards side by side: **Skin Lesion** (required) and **Captured Bug** (optional).
- Each card supports file picking and drag-and-drop, shows a thumbnail preview, file name, and a remove button.
- Continue stays disabled until the lesion photo is present.

## Step 2 — Context
- Dropdown: exposure environment (Woods / Tall grass, Bed / Indoors, Yard / Garden, Beach / Water, Travel abroad, Unsure).
- Dropdown: symptom duration (Under 24 hours, 1–3 days, 4–7 days, 1–2 weeks, Over 2 weeks).
- Both required before continuing.

## Step 3 — Safety screener
- Checklist of emergency symptoms: trouble breathing / throat tightness, face or lip swelling, spreading red streaks with fever, confusion or fainting, rapidly expanding painful area, stiff neck with severe headache.
- Checking any item immediately opens a prominent red warning modal urging emergency care. The modal can be dismissed to continue, but a persistent red banner remains and the submit button carries an emergency-care reminder.
- A "none of these apply" option clears the list.

## Submission
- On submit, everything is packaged into a `FormData` object (both image files as binary plus the text selections and checked symptoms) and POSTed to the configured backend URL.
- Loading state with progress messaging; clear error state with retry if the request fails.
- The JSON response is displayed as-is — no local parsing or scoring.

## Results dashboard
- Ranked probability cards, highest first: condition name, confidence percentage, animated horizontal confidence bar, short description, and urgency tag from the response.
- **Fitzpatrick skin tone selector**: tabs for Types I–II, III–IV, V–VI that swap the medical reference image so the user can compare against a tone closer to their own.
- Sections for guidance text returned by the backend, plus a standing medical disclaimer.
- "Start over" resets the wizard.

## Design
Clinical but warm: calm off-white surfaces, deep teal primary, amber for caution and a strong red reserved solely for emergency states. Compact sans-serif type, generous card spacing, subtle step-transition motion. Fully responsive, mobile-first (photos get taken on phones).

## Technical notes
- Routes: `/` for the wizard, results rendered in-place after a successful response (shareable state kept client-side).
- State held in a single wizard reducer; step components are presentational.
- Reference images for the Fitzpatrick tabs are generated placeholder illustrations stored as local assets, replaceable later with real clinical references.
- API base URL read from `import.meta.env.VITE_API_URL`, with a visible inline notice if it is unset rather than a silent failure.
- Reusable pieces: `UploadCard`, `StepNav`, `EmergencyModal`, `ProbabilityCard`, `FitzpatrickTabs`.
