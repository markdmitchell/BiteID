# 🔬 BiteID Diagnostic Identification Methodology & Clinical Triage Architecture

## 1. Executive Summary & Diagnostic Philosophy

BiteID is a multimodal, Bayesian-assisted clinical triage application engineered to assist users and healthcare screeners in identifying **19 medical vector species** across the United States. 

The diagnostic engine combines:
1. **Red-Flag Anaphylaxis & Systemic Toxicity Short-Circuiting**
2. **50-State + DC Bayesian Geographic & Seasonal Prior Modeling**
3. **Micro-Habitat Exposure & Sensation Weighting**
4. **Computer Vision Dermatological Lesion Morphology Analysis**
5. **Fitzpatrick Phototype Equity Adjustments (Types I–VI)**
6. **Deterministic Clinical Safety Overrides (e.g., Lyme Disease Erythema Migrans Gate)**

> [!IMPORTANT]
> **Non-Diagnostic Educational Guardrail**: BiteID provides probabilistic risk stratification and educational reference data. It does not provide a formal medical diagnosis. Severe, expanding, or systemic symptoms immediately route users to emergency healthcare resources.

---

## 2. System Architecture & Multi-Stage Pipeline

The BiteID triage engine operates as a sequential 6-stage pipeline:

```
[ User Input / Photo ] 
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: Red-Flag Emergency Screening & Short-Circuit  │ ──► (If Systemic Red Flags) ──► IMMEDIATE 911 / POISON CONTROL ALERT
└────────────────────────────────────────────────────────┘
          │ (If No Emergency Red Flags)
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: Geographic & Seasonal Spatial Priors Engine   │ ──► Filters 19 species by State Endemicity & Peak Activity Month
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 3: Micro-Habitat & Sensation Profile Alignment   │ ──► Cross-references exposure location & patient sensation
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 4: Dermatological Morphology & Fitzpatrick Phototype│ ──► Analyzes lesion pattern, central feature & skin phototype
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 5: Deterministic Clinical Overrides & Safety Gate│ ──► Applies Lyme EM Gate & Entomologist Taxonomy Overrides
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 6: Probability Synthesis & Candidate Ranking     │ ──► Outputs Top-1 Candidate, Differential Ranking & First-Aid
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Stage Methodology

### Stage 1: Red-Flag Emergency Short-Circuit Protocol

Prior to performing algorithmic species identification, BiteID screens for 4 critical systemic red flags:
- **Respiratory Distress**: Difficulty breathing, stridor, or severe shortness of breath.
- **Angioedema**: Swelling of the lips, tongue, face, or throat.
- **Systemic Neuro-Circulatory Shock**: Severe dizziness, lightheadedness, confusion, or syncope.
- **Spreading Anaphylactic Urticaria**: Rapidly expanding hives distant from the initial bite site.

If **any** red flag is triggered, the system immediately halts triage processing and presents a high-visibility emergency modal with quick-dial options for **911** and **Poison Control (1-800-222-1222)**.

---

### Stage 2: 19-Species Geographic & Micro-Habitat Bayesian Prior Engine

BiteID models endemic presence, seasonal climate curves, and micro-habitat affinities for 19 medical vector species:

#### The 19 Medical Vector Species
1. **Blacklegged (Deer) Tick** (*Ixodes scapularis*) — Lyme Disease, Anaplasmosis, Babesiosis
2. **Lone Star Tick** (*Amblyomma americanum*) — STARI, Ehrlichiosis, Alpha-gal Syndrome
3. **American Dog Tick** (*Dermacentor variabilis*) — Rocky Mountain Spotted Fever (RMSF)
4. **Mosquito** (*Culex / Aedes spp.*) — West Nile Virus, Dengue, EEE
5. **Bed Bug** (*Cimex lectularius*) — Urticarial linear wheals
6. **Flea** (*Ctenocephalides felis*) — Bartonellosis, Murine Typhus
7. **Brown Recluse Spider** (*Loxosceles reclusa*) — Loxoscelism / Dermonecrosis
8. **Black Widow Spider** (*Latrodectus mactans*) — Latrodectism neurovenom
9. **Red Imported Fire Ant** (*Solenopsis invicta*) — Sterile pustules & Solenopsin venom
10. **Chigger / Harvest Mite** (*Trombiculidae*) — Waistband & ankle papules
11. **Kissing Bug / Triatomine** (*Triatoma spp.*) — Chagas Disease & Romaña sign
12. **Honey Bee** (*Apis mellifera*) — Barbed stinger & IgE Anaphylaxis risk
13. **Wasp / Yellow Jacket** (*Vespula / Polistes spp.*) — Smooth stinger & rapid local welt expansion
14. **Bark Scorpion** (*Centruroides sculpturatus*) — Severe burning pain & Neurotoxicity
15. **Horse Fly / Deer Fly** (*Tabanidae*) — Lacerating scissor bite & Tularemia risk
16. **Head / Body Lice** (*Pediculus humanus*) — Scalp & clothing line excoriated papules
17. **No-see-ums / Biting Midges** (*Ceratopogonidae*) — Microscopic pinpoint dots & delayed pruritus
18. **Black Fly / Buffalo Gnat** (*Simuliidae*) — Hemorrhagic slash bite & Black fly fever
19. **Blister Beetle** (*Meloidae*) — Cantharidin contact bullae without central punctum

#### Geographic Endemicity Scoring
- **State Endemicity ($P_{\text{geo}}$)**: Uses ISO 3166-2 state codes (e.g., `US-VA`, `US-TX`) and GPS auto-detection via `navigator.geolocation`. If a vector is non-endemic in the specified state (e.g., Brown Recluse in `US-WA`), its prior probability is heavily penalized to 0.0.
- **Seasonal Multipliers ($M_{\text{season}}$)**: A 12-element monthly array ($m_0 \dots m_{11}$) reflects climate activity. For example, Blacklegged Tick nymphal activity peaks in May–July ($1.0$), dropping in winter ($0.05$).

#### Micro-Habitat & Sensation Alignment
- **Micro-Habitats ($H_{\text{habitat}}$)**: Evaluates exposure context: `tall_grass_woods`, `yard_garden`, `bed`, `garage_shed`, `indoor_other`, `outdoor_other`.
- **Sensation Alignment ($S_{\text{sensation}}$)**: Matches primary patient sensation: `painless`, `mild_itch`, `intense_itch`, `moderate_pain`, `severe_pain`, `burning`.

---

### Stage 3: Dermatological Morphology & Fitzpatrick Phototype Analysis

#### Morphological Feature Extraction
Visual inspection analyzes 3 core dermatological dimensions:
1. **Lesion Pattern**: `solitary_wheal`, `annular_target`, `linear_cluster`, `scattered_papules`.
2. **Central Features**: `punctum_bite_mark`, `clear_halo`, `necrotic_eschar`, `retained_stinger`, `none`.
3. **Primary Reaction**: `urticarial_hive`, `expanding_erythema`, `fluid_pustule`, `necrotic_ulcer`, `excoriated_papule`.

#### Fitzpatrick Phototype Equity (Types I through VI)
To prevent diagnostic disparity across diverse skin tones, BiteID incorporates dermatological phototype adjustments:

| Fitzpatrick Scale Category | Skin Characteristics | Primary Inflammatory Visual Cue | Algorithm Adjustment |
| :--- | :--- | :--- | :--- |
| **Types I–II** | Fair / Light Skin | Vivid bright pink/red erythema | High weight on erythematous contrast & halo boundaries |
| **Types III–IV** | Medium / Olive Skin | Dusky pink or tan-red swelling | Balanced weighting between erythema and central punctum |
| **Types V–VI** | Dark Melanin-Rich Skin | Erythema masked by melanin; violaceous or dark purple hue shifts | **Erythema masking adjustment**: Algorithm emphasizes **palpable induration**, **violaceous color shifts**, **local warmth**, and **post-inflammatory hyperpigmentation (PIH)** |

---

### Stage 4: Deterministic Clinical Overrides & Safety Gates

To guarantee patient safety for high-consequence medical conditions, BiteID enforces deterministic clinical overrides:

1. **Lyme Disease (Erythema Migrans) Safety Gate**:
   - If lesion morphology is identified as `annular_target` (bullseye ring) in an endemic tick state (Northeast, Mid-Atlantic, or Upper Midwest), the system sets **Blacklegged Tick probability to $\ge 0.90$**, overriding lower-confidence nuisance predictions.
   - **Validation**: Ensures **100% Top-1 Lyme rank accuracy** across clinical benchmark suites.

2. **STARI (Lone Star Tick) Override**:
   - If an `annular_target` rash with `intense_itch` occurs in Southeastern endemic states (`US-NC`, `US-SC`, `US-GA`, `US-FL`), Lone Star Tick is elevated to top differential rank.

3. **Entomologist Taxonomy Direct Match**:
   - If an optional insect specimen photo or taxonomic label (e.g. *Ixodes scapularis*, *Centruroides sculpturatus*, *Meloidae*) is captured, direct binomial nomenclature matching applies a **98% confidence score override**.

---

### Stage 5: Multi-Factor Scoring Formula & Candidate Ranking

Candidate scores are calculated using the joint multiplicative likelihood formula:

$$\text{ProbabilityScore}_v = \text{BaseWeight}_v \times P_{\text{geo}} \times M_{\text{season}} \times H_{\text{habitat}} \times S_{\text{sensation}} \times M_{\text{morphology}}$$

Where:
- $\text{BaseWeight}_v$: Baseline clinical probability weight of species $v$.
- $P_{\text{geo}}$: Endemic geographic prior ($0.0 - 1.0$).
- $M_{\text{season}}$: Monthly seasonal activity multiplier ($0.05 - 1.0$).
- $H_{\text{habitat}}$: Micro-habitat affinity coefficient ($0.05 - 1.0$).
- $S_{\text{sensation}}$: Primary sensation match coefficient ($0.05 - 1.0$).
- $M_{\text{morphology}}$: Morphological match score ($0.20$ bonus for exact pattern match).

Candidates are sorted in descending order of $\text{ProbabilityScore}_v$ and assigned confidence tiers:
- **High Confidence**: Score $\ge 0.80$
- **Moderate Confidence**: Score $0.50 - 0.79$
- **Low Confidence**: Score $< 0.50$

---

## 4. Evaluation Framework & Benchmark Verification

BiteID is continuously evaluated using a 78-profile clinical benchmark dataset (`evals/data/goldenDataset.json`):

- **Morphology Extraction Accuracy**: $100.0\%$
- **Overall Top-1 Species Accuracy**: $64.1\%$ (across 19 species)
- **Top-3 Differential Recall Rate**: $88.5\%$
- **Lyme Disease (EM) Top-1 Rank Safety Gate**: **100.0% PASS**

---

## 5. Verification Commands

To run the automated verification suite for the diagnostic identification methodology:

```bash
# Run FastAPI Python Backend Unit Tests
python -m pytest backend/tests/

# Run Vitest Frontend Diagnostic Logic Tests
pnpm test

# Run 78-Profile Clinical Evaluation Benchmark
pnpm test:evals
```
