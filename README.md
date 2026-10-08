# BiteID

**BiteID** is an AI-assisted dermatological and entomological triage web application designed to help individuals quickly assess unknown insect, spider, and arthropod bites, stings, and skin reactions. 

It bridges visual analysis with geographic epidemiology and safety-first clinical triage, helping users understand what likely bit them, how to administer immediate first aid, and when to seek emergency medical attention.

---

### Core Mission & Safety-First Philosophy

* **Triage, Not Diagnosis**: BiteID is an educational decision-support tool. It does not provide formal medical diagnoses or prescribe prescription treatments; instead, it offers probabilistic risk ranking and guidance on next steps.
* **Aggressive Emergency Gating**: If a user reports systemic or life-threatening red-flag symptoms (difficulty breathing, facial/lip swelling, dizziness, hives spreading far from the site, or signs of anaphylaxis), the system immediately triggers a full-bleed emergency redirection modal urging 911/ER contact and halts non-emergency intake.

---

### Key Capabilities & Workflow

#### 1. Three-Step Intake Wizard
* **Step 1: Visual Capture**: Users upload a required photo of the skin lesion and an optional photo of the captured specimen (insect/spider).
* **Step 2: Environmental & Temporal Context**: Collects the geographic location (US state), time elapsed since onset, and the encounter environment (woods/tall grass, bed/indoors, yard/garden, water, or travel).
* **Step 3: Clinical Safety Checklist**: Screens for severe systemic reactions before processing.

#### 2. Dual-Engine Intelligence Pipeline
* **Multimodal AI Vision Pass**: Powered by **Google Gemini** (`gemini-3.6-flash`) and Lovable AI Gateway to perform a two-part extraction:
  * *Entomology Node*: Identifies visible genus/species of photographed specimens.
  * *Dermatology Node*: Characterizes lesion morphology (e.g., solitary wheal, annular target, linear grouped, punctum mark, central necrosis) without diagnostic bias.
* **Bayesian Epidemiological Engine**: Corroborates visual observations against a curated vector database covering North American arthropods (Blacklegged Ticks, Lone Star Ticks, Dog Ticks, Brown Recluses, Black Widows, Bed Bugs, Fleas, Mosquitoes, Bees, Wasps, Fire Ants, Chiggers, Scorpions, etc.). Calculates probabilities weighted by:
  * State endemicity (presence vs. non-endemic status)
  * Month/season multiplier (activity cycles)
  * Micro-habitat affinity (e.g., bed vs. forest)
  * Sensation (intense itch vs. acute burning pain)
* **Offline / Graceful Fallback**: If an AI vision key is absent or a network call times out, the engine gracefully falls back to the regional prior probability model so users always receive structured triage guidance instead of a blank screen.

#### 3. Fitzpatrick Skin Phototype Inclusivity (Types I–VI)
Bite reactions present differently depending on melanin levels (erythema vs. hyperpigmentation or induration). The results dashboard features interactive **Fitzpatrick Skin Tone Reference Tabs**:
* **Types I–II** (Fair/Light skin: classic erythema, pink/red borders)
* **Types III–IV** (Medium/Olive skin: deeper red, dusky borders)
* **Types V–VI** (Deep/Dark skin: hyperpigmentation, violaceous edges, subtle swelling)

#### 4. Actionable First-Aid & Red-Flag Guidance
* **Ranked Probability Cards**: Displays the top-5 likely culprits with percentage confidence bars and matched epidemiological factors.
* **Vector-Specific First Aid**: Clear instructions (e.g., proper mechanical tick extraction with fine-tipped tweezers, stinger scraping, ice and elevation).
* **Delayed Risk Warnings**: Flags time-sensitive risks such as Lyme disease (erythema migrans in Mid-Atlantic/Northeast), Rocky Mountain spotted fever, or secondary bacterial infections.

---

### Technical Architecture & Stack

* **Framework**: [TanStack Start v1](https://tanstack.com/start) (full-stack React 19 on Vite + Nitro).
* **Runtime Target**: Cloudflare Module / Node serverless.
* **Styling**: Tailwind CSS v4 with semantic tokens and Radix UI primitives.
* **Security & Privacy Boundary**:
  * **Dumb Client**: The browser UI contains zero medical scoring logic, vector databases, or API keys.
  * **Server Functions (`createServerFn`)**: Vision API keys (`GEMINI_API_KEY`, `LOVABLE_API_KEY`) and epidemiological scoring run inside the server boundary only.
