# BiteID UX/UI refinement

## Goal
Polish BiteID into a calmer, more focused clinical intake while preserving the existing three-step workflow, analysis behavior, emergency safeguards, alpha framing, and all current tools.

## Selected direction
- **Palette:** Clinical Green — `#F8FAF7`, `#236B4E`, `#CBE2D4`, amber caution, red emergencies only.
- **Typography:** Outfit headings with Figtree body text.
- **Structure:** Focused single-column flow inspired by the selected modern medical concept, adapted to BiteID’s real content rather than the prototype’s placeholder content.
- **Interaction:** Quiet 150–200ms feedback, clear focus states, and reduced-motion support.

## What will improve

### 1. Simplify the first-screen hierarchy
- Rework the crowded mobile header so BiteID and the alpha status remain clear while Known Bug, Snakebite SOS, and Field Kit stay reachable without competing with the main task.
- Keep the known-culprit shortcut, but reduce its visual weight beneath the primary intake heading.
- Replace the wide two-card mobile upload layout with one dominant lesion-photo control and a compact secondary bug-photo control.
- Tighten desktop spacing and constrain the working area so the screen no longer leaves a large unused region.
- Make disabled and ready-to-continue states unmistakable without relying on color alone.

### 2. Improve wizard clarity and accessibility
- Give every selector a programmatic label and clear required-field guidance.
- Mark the active step for assistive technology while retaining the three-step visual progress indicator.
- Use at least 44px touch targets for mobile actions and stronger visible keyboard focus.
- Add useful file-type/size feedback for invalid uploads.
- Announce loading, emergency notices, and completed results; move focus to the results heading after analysis.
- Use proper accessible title and description elements in the emergency dialog.
- Add reduced-motion behavior for transitions and confidence bars.

### 3. Make later steps easier to scan
- Group the context questions into clear location, exposure, and symptom sections rather than one uninterrupted field stack.
- Keep the emergency checklist visually distinct and preserve the immediate modal, persistent warning, and server-side emergency short-circuit.
- Preserve entered data when navigating unless the user explicitly chooses Start over.

### 4. Refine the results dashboard
- Establish a clear action hierarchy instead of presenting every result tool at equal weight.
- Consolidate repeated Doctor Summary, Urgent Care, and Rash Tracker actions while keeping them easy to find during long-page scrolling.
- Reduce repetitive card styling and distinguish ranked findings, recommended next steps, clinical notices, and supporting references through hierarchy rather than extra decoration.
- Improve mobile alignment for result names, confidence values, urgency labels, and expanding details.
- Keep all creature and skin-tone references, AI-reference labels, rankings, medical copy, and safety behavior unchanged.

### 5. Unify the visual system
- Update semantic color tokens and load Outfit/Figtree through the document head.
- Standardize alpha badges, card radii at 8px or less, spacing, icon emphasis, borders, and elevation.
- Apply the same interaction and typography rules to supporting pages and shared navigation without changing their content.

## Validation
- Test every wizard step, upload/replace/remove flow, emergency selection, submission, results expansion, skin-tone tabs, and Start over behavior.
- Verify keyboard-only navigation, focus order, labels, live announcements, dialog behavior, contrast, touch-target sizing, and reduced motion.
- Check compact mobile, standard mobile, tablet, and desktop layouts for clipping, overlap, and readable line lengths.
- Confirm all content pages retain unique metadata and the preview builds without runtime or console errors.

## Technical boundaries
- Frontend presentation and interaction only; no changes to ranking, medical interpretation, server prompts, image analysis, or response data.
- Continue using the existing design-system controls and semantic tokens.
- Preserve emergency red exclusively for urgent states and amber for alpha/caution notices.
