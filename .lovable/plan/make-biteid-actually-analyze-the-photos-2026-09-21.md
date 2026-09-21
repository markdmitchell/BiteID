# Make BiteID actually analyze the photos

Right now the app collects the photos and answers but never sends them anywhere: no analysis service address is configured, so it always falls back to the neutral "no ranked findings" screen. Your GitHub repo has the analysis logic, but it isn't running anywhere the app can reach.

Fix: build the analysis into this app itself, mirroring the logic from your repo, so uploads get a real ranked assessment with nothing to host separately.

## What changes for you

1. The intake gains one small field: the US state (and it uses the current month automatically), because your engine's ranking depends on where and when the bite happened.
2. Pressing "Get assessment" now sends both photos plus your answers for analysis and shows real ranked results: suspected culprit, confidence bar, why it matched, diseases it can carry, first aid, and warning signs to watch.
3. If an emergency symptom is ticked, the app skips analysis entirely and shows the urgent-care message immediately — same behavior as your repo's safety short-circuit.
4. If analysis fails or is unavailable, the current calm fallback screen still appears — no scary error banners.
5. The alpha disclaimer stays everywhere it is today.

## How it works (technical)

- New server-side analysis step in this app (a TanStack `createServerFn`), so no API keys or medical logic ever reach the browser. The client keeps posting the same intake, just to this app instead of an external URL.
- Vision analysis via Lovable AI (`openai/gpt-6-astra` on the Responses API, streamed and consumed server-side) with the lesion photo and optional culprit photo as image input. Prompt and reasoning structure ported from `src/lib/geminiTriage.ts` and `backend/app/gemini_orchestrator.py` in the repo: entomologist node (identify the bug), dermatologist node (lesion morphology), then ranked culprits.
- Geo/seasonal priors ported from the repo's `geoPestFilter.ts` / `geo_priors.py`: state endemicity plus month activity narrow and reweight candidate species before ranking.
- Structured output shaped to the repo's `AnalysisResult` / `TriageResultItem` contract: `name`, `scientificName`, `description`, `confidence`, `matchedFactors`, `associatedPathogens`, `delayedRisks`, `firstAidAdvice`, `warningSignsToWatch`, plus `isEmergencyRedirect` / `emergencyMessage`.
- `src/lib/triage.ts` calls the new server function instead of `VITE_API_URL`; existing alias tolerance and sorting stay. Deterministic emergency short-circuit runs before any model call.
- `ProbabilityCard` extended to render the richer fields (matched factors, pathogens, first aid, warning signs) using existing semantic tokens.
- Docs updated: `docs/BACKEND_CONTRACT.md` and `docs/ARCHITECTURE.md` describe the in-app analysis step rather than the external POST.

## Not included

- Deploying or changing your GitHub repo. If you later host that engine, pointing the app back at it is a small change.
- Replacing the Fitzpatrick reference images (still AI-generated placeholders).
