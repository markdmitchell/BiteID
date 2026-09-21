# Dynamic bite-pattern skin references

## Goal
Make the skin-tone reference section respond to the top-ranked common creature, so a bed bug result shows a clustered/linear pattern while preserving the three skin-tone tabs.

## What will change
- Create a consistent clinical-photo reference set for the 10 common pictured creatures across Types I–II, III–IV, and V–VI (30 images total).
- Give each creature a cautious, visually representative pattern: for example, bed bugs show several small grouped or linear bumps; mosquitoes show a small number of raised wheals; tick references show a single localized reaction.
- Pass the top-ranked result’s stable ID into the skin reference section and select the matching three-image set.
- Keep the current general skin-tone images as the fallback when a result has no matching pattern set or no ranked result.
- Update the heading/copy so the section names the selected result and clearly states that images are AI-generated visual references, not confirmation or diagnosis.
- Preserve the creature photos, ranking engine, emergency behavior, and analysis flow unchanged.

## Safety and presentation
- Avoid wounds, severe presentations, treatment imagery, and claims that one appearance confirms a culprit.
- Use consistent lighting, framing, body area, scale, and image proportions across tones so comparisons remain useful.
- Add descriptive alt text that names the skin-tone group and illustrated reaction pattern without diagnosing it.
- Keep tab switching and image loading stable on mobile and desktop.

## Technical details
- Add a client-safe lookup keyed by the existing vector IDs (`bed_bug`, `mosquito`, tick IDs, and the other common pictured creatures).
- Update `FitzpatrickTabs` to accept the top result ID/name and resolve the appropriate tone-specific assets.
- Keep all images bundled; do not generate images at runtime or send user photos to image generation.
- Document the new result-to-pattern asset mapping and fallback behavior.

## Validation
- Verify a bed bug result displays multiple grouped/linear small bumps in all three tone tabs.
- Verify at least one tick and one flying-insect result select different pattern sets.
- Verify an unmapped result falls back to the general references.
- Check labels, alt text, layout, and tab switching on desktop and mobile.
- Confirm the app builds successfully and the assessment flow remains unchanged.
