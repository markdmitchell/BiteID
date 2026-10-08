# BiteID: Release & Version Notes

This document provides a chronological record of clinical decision support (CDS) updates, vector database revisions, photographic atlas milestones, and architectural safety locks for BiteID.

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
