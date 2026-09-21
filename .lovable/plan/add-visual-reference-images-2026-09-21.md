# Add visual reference images

## Goal
Add consistent AI-generated reference imagery to the skin-tone guide and to common creature results, while clearly presenting every image as a visual aid rather than diagnostic evidence.

## What will change

### Skin-tone guide
- Replace the three current placeholder files with new clinical-photo-style close-ups for Types I–II, III–IV, and V–VI.
- Use consistent crop, lighting, scale, and a representative mild bite-like reaction across all three images.
- Keep the existing tabs and descriptive copy, with accessible alternative text and an explicit “AI-generated reference” label.

### Common creature references
- Generate a cohesive field-guide macro set for:
  - Blacklegged tick
  - Lone star tick
  - American dog tick
  - Mosquito
  - Bed bug
  - Flea
  - Brown recluse spider
  - Black widow spider
  - Honey bee
  - Wasp / yellow jacket
- Use realistic proportions, identifying markings, natural neutral settings, and consistent framing. No text will be baked into the images.
- Add a stable server-returned creature ID to each ranked result, then map that ID to a bundled reference asset in the browser. This avoids fragile name matching and keeps ranking logic server-side.
- Show the image within each matching result card, labeled “AI-generated visual reference — not confirmation.” Results without a generated asset will keep their current text-only layout.

## Presentation and safety
- Keep cards compact and readable on mobile, using a fixed image area that cannot shift the result layout.
- Preserve the current ranking, confidence bars, emergency flow, alpha warning, and all analysis behavior unchanged.
- Do not generate wounds, diagnoses, treatment imagery, or images based on a user’s uploaded photo.

## Validation
- Confirm all three skin tabs swap to the correct image.
- Test result cards with common-creature images and with a creature that has no image fallback.
- Check image loading, alternative text, mobile/desktop layout, and the current BiteID assessment flow.
- Verify the app builds cleanly and update the architecture/response documentation for the new result ID and assets.

## Technical details
- Store generated files under the app’s bundled assets; no remote image URLs or runtime image-generation calls.
- Extend `EngineResultItem` and `TriageResultItem` with an optional `id` field sourced from the existing vector key.
- Centralize creature asset lookup in a small client-safe module and import that helper into the result card.
