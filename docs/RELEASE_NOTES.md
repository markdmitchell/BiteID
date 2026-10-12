# BiteID: Release & Version Notes

This document provides a chronological record of clinical decision support (CDS) updates, vector database revisions, photographic atlas milestones, and architectural safety locks for BiteID.

---

## [v1.3.0]: October 2026

### **Dynamic Clinical Tie-Breaker, Pediatric Dosing Caps & 100% Vector Parity**

#### 1. Dynamic "Fork-in-the-Road" Clinical Tie-Breaker
- **Interactive Pairwise Clinical Discriminators**: Introduced targeted clinical tie-breakers for close lookalikes (Bed Bug vs. Flea, Brown Recluse vs. MRSA cellulitis, Lyme Tick vs. Mosquito, Chigger vs. Scabies, Fire Ant vs. Wasp, etc.) when top suspects have overlapping confidence.
- **Real-Time Bayesian Recalibration**: Selecting a clinically favored option dynamically recalibrates differential probabilities, promoting the selected culprit to rank 0, and instantly updates first-aid directives, warning signs, and skin-tone references with 1-click "Reset to AI Baseline".
- **Physician SBAR & ER Triage Integration**: Patient-confirmed tie-breaker rationale is automatically integrated into the Clinical Handoff Memo (SBAR memo, ER rapid triage presentation, and printable summary) to provide attending clinicians with full exposure history context.

#### 2. Pediatric Dosing Safety Hardening
- **Single-Dose Ceiling Caps**: Enforced strict clinical single-dose ceiling caps to eliminate supratherapeutic overdose risk for older or heavier children:
  - Acetaminophen capped at 650 mg per dose.
  - Ibuprofen capped at 400 mg per dose.
  - Diphenhydramine capped at 50 mg per dose.
- **Immutable Safety Locks Maintained**: Preserved strict renal safety block for Ibuprofen in infants `< 6 months` and respiratory depression lock for Antihistamines in children `< 2 years`.

#### 3. 100% Vector Browseability in "I Know What Bit Me"
- Expanded `KnownCulpritModal` to achieve 100% browseable coverage across all 39 vectors in the database, categorized across 9 hazard domains.
- Added comprehensive evidence-based folklore myth-busters and first-aid steps for all 39 species.

#### 4. Backcountry Offline Field Kit & Data Hygiene
- **Dynamic 39-Species Atlas**: Updated offline field kit and search queries to dynamically reflect the active 39-vector database.
- **Indoor Pest Filtering**: Added bird/rodent mites, lice, and indoor brown dog ticks to backcountry indoor habitat filters.
- **Tone Reference Pre-Caching**: Bundled Fitzpatrick tone reference images and core app icons into background service-worker cache warming for zero-connectivity backcountry use.
- **Health Data Hygiene & Sanitization**: Unified rash journal storage keys (`biteid_rash_journal_record_v2`) and updated auto-retention purge to clean up records older than 30 days while accurately reporting stored entries in the device privacy sanitization modal.

#### 5. Outdoor High-Contrast Mode & Comprehensive Testing
- Restored an unobtrusive High-Contrast Outdoor Glare mode toggle in the footer actions bar for clear visibility in direct sunlight.
- Expanded automated test suite (`scripts/test-clinical-logic.mjs`) to verify diagnostic integrity, reducer invariants, dosing caps, and storage hygiene across **809 total passing assertions**.

---

## [v1.2.0]: September 2026

### **Ethical Library Expansion & 100% Multi-Tone Verification**

#### 1. Ethical Vector Database Expansion (39 Vectors Total)
Following our **4-Pillar Clinical Decision Support Framework**, candidate species were evaluated against epidemiological reality, actionable clinical divergence, pre-test probability, and melanin-calibrated dermatological signs:
- **Bird & Rodent Mites (`bird_rodent_mite`)**:
  - *Taxonomy*: *Ornithonyssus sylviarum* (Northern fowl mite), *Dermanyssus gallinae* (Red poultry mite), *Liponyssoides sanguineus* (House mouse mite - vector of *Rickettsia akari* / rickettsialpox).
  - *Clinical Relevance*: Frequent cause of severe nocturnal papular urticaria when wild birds abandon eaves/attic nests or rodents infest structures. Solves a major diagnostic dilemma frequently misdiagnosed as scabies or bed bugs.
  - *Actionable Guidance*: Directs patients and caregivers toward environmental nest eradication and vent sealing rather than repeated, unnecessary applications of neurotoxic topical scabicides (permethrin 5%).
- **Pacific Coast Tick (`pacific_coast_tick`)**:
  - *Taxonomy*: *Dermacentor occidentalis*.
  - *Clinical Relevance*: Primary vector of *Rickettsia 364D* (*Rickettsia philipii*), the causative agent of Pacific Coast tick fever, producing pathognomonic black necrotic inoculation eschars (*tache noire*) with regional lymphadenopathy and acute febrile illness. Also transmits *Francisella tularensis* (tularemia) and Colorado tick fever virus.
  - *Strict Geo-Fencing*: Hard-locked to coastal California, Oregon, and Washington (non-endemic penalty applied to all other 47 states to eliminate false positives).

#### 2. 100% Photographic Multi-Tone Parity
- Sourced and registered high-resolution, dermatologically verified bite patterns across all three Fitzpatrick skin tone tiers (**I–II**, **III–IV**, **V–VI**) for all 39 vectors.
- Total asset count:
  - **39** Specimen field-guide reference photographs (`src/assets/creatures/`).
  - **117** Tone-stratified reaction pattern photographs (`src/assets/bite-patterns/`).
  - **30** Temporal progression stage photographs (Early, Peak, Late across all 3 skin tones for high-acuity species).
  - **3** Universal skin tone fallback references.
- Automated regression test suite (`scripts/test-critter-images.mjs`) passes **674 / 674 assertions**.

#### 3. Formalized Clinical & Ethical Safe Harbors
- **Exclusion of Medical Folklore**: Intentionally rejected debunked claims such as "hobo spider necrotic ulcers" (which modern toxicology proves are primarily MRSA or vascular ulcers) and excluded non-mystery trauma bites (e.g. Gila monster) from visual rash classification to preserve Bayesian accuracy.
- **Top Navigation Polish**: Streamlined header layout to prevent text clipping and overlapping on narrow mobile viewports.
- **In-App Release Notes**: Added accessible changelog and version modal in the footer.

---

## [v1.1.0]: September 2026

### **Backcountry 0-Cell Kit, Pediatric Dosing Locks & Rabies Screener**

- **Wilderness 0-Cell Service Protocol**: Localized GPS state detection and offline intake caching (`OfflineFieldKitModal`, `BackcountryPrintableGuideModal`).
- **Pediatric & Vulnerable Population Safety Locks**:
  - Weight-based dosing engine for cetirizine, diphenhydramine, and acetaminophen.
  - Immutable renal safety block for ibuprofen in infants `< 6 months`.
  - Immutable respiratory depression lock for antihistamines in children `< 2 years`.
  - Absolute Reye's syndrome black-box block for aspirin in viral/febrile illness.
- **Bat & Mammalian Rabies Exposure Gate**: Mandatory high-acuity screening for bat encounters and unprovoked wildlife bites requiring urgent Post-Exposure Prophylaxis (PEP).

---

## [v1.0.0]: September 2026

### **Initial Alpha Architecture**

- **TanStack Start + Vite 7 Architecture**: Client-side wizard (`src/routes/index.tsx`) coupled to server-only analysis functions (`analyseIntakeFn`).
- **Bayesian Geo-Pest Priors**: Multi-factor scoring engine correlating US state, month of exposure, habitat, body location, and reported sensation.
- **Red-Flag Emergency Gating**: Full-bleed persistent emergency modal triggering for systemic anaphylaxis, respiratory distress, and spreading lymphangitis.
