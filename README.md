# 🦟 BiteID - Multimodal Insect & Spider Bite Triage Prototype

BiteID is a functional, self-contained Next.js (App Router) TypeScript web application for insect and spider bite triage. The app triages bite reactions by combining:
1. **Multimodal Vision**: Lesion image + optional captured culprit pest image.
2. **Geo-Seasonal Intelligence**: Endemic state maps, temperature activity curves, and habitat/temporal context.
3. **Deterministic Safety Interception**: Red-flag emergency screening for anaphylaxis/systemic symptoms (911 / Poison Control quick-dial).
4. **Clinical Reference Engine**: Side-by-side visual reference comparisons across Fitzpatrick skin types I–VI with verified CDC PHIL attributions.
5. **Bento Box & Liquid Glass UI**: Responsive modular dashboard design system.

---

## 🌟 Key Features

- **Red-Flag Emergency Short-Circuit**: Checks for breathing difficulty, facial swelling, severe dizziness, or spreading hives. If present, halts triage immediately with 0 external API calls and displays emergency contacts.
- **Geo-Seasonal Filter Engine**: Includes a deterministic database of 6 key biting vectors (Mosquito, Blacklegged Tick, Bed Bug, Flea, Brown Recluse, Black Widow). Features hard geographic penalties (e.g. 0% Brown Recluse probability in Washington State) and seasonal temperature curves.
- **Fitzpatrick Skin Tone Support (I–VI)**: Compares user photos against typical clinical presentations tailored across fair, medium/olive, and deep skin tones.
- **Clinical Summary Card**: Generates exportable summary cards formatted for healthcare provider review.

---

## 🛠️ Stack & Architecture

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS (Bento Grid & Liquid Glass design systems)
- **Icons**: Lucide-React
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash Vision)
- **Validation**: Zod
- **Testing**: Vitest & Playwright E2E

---

## 🚀 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Optional: Gemini API Key for live AI vision analysis.
# If omitted, BiteID automatically operates in intelligent regional mock fallback mode.
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💻 Local Development & Testing

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Unit & E2E Tests
```bash
# Run ESLint compliance check
pnpm lint

# Run TypeScript type check
pnpm tsc --noEmit

# Run Vitest unit suite
pnpm vitest run

# Run Playwright E2E browser tests
pnpm test:e2e
```

---

## 📦 Production & Beta Deployment Guide

### Option A: Deploying to Vercel (Recommended)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set the build environment settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
4. *(Optional)* Add `GEMINI_API_KEY` under Environment Variables.
5. Click **Deploy**.

### Option B: Containerized Deployment (Google Cloud Run / Docker)

Build and run the container locally or deploy to Google Cloud Run:

```bash
# Build the Docker image
docker build -t bite-id .

# Run the container locally on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key_here bite-id
```

---

## 📄 Medical Disclaimer

BiteID is an educational prototype assistant and does not provide professional medical diagnosis. In cases of severe systemic reactions or expanding skin infections, consult a licensed healthcare provider or seek emergency care immediately.
