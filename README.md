# 🦟 BiteID - Multimodal Insect & Spider Bite Triage Prototype

BiteID is a functional, self-contained Next.js & Streamlit application for 19-species insect and spider bite triage. For a detailed breakdown of our multi-stage Bayesian prior engine, red-flag emergency screening, and Fitzpatrick phototype equity methodology, see [docs/METHODOLOGY.md](file:///c:/Users/MarkD/Documents/antigravity/bold-franklin/docs/METHODOLOGY.md).

The app triages bite reactions by combining:
1. **Multimodal Vision**: Lesion image + optional captured culprit pest image.
2. **Geo-Seasonal Intelligence**: 50-State endemicity maps, monthly activity curves, and habitat/temporal context.
3. **Deterministic Safety Interception**: Red-flag emergency screening for anaphylaxis/systemic symptoms (911 / Poison Control quick-dial).
4. **Clinical Reference Engine**: Side-by-side visual reference comparisons across discrete Fitzpatrick skin types I–VI with verified CDC PHIL attributions.
5. **Bento Box & Liquid Glass UI**: Responsive modular dashboard design system.

---

## 🌟 Deployment Targets

BiteID supports three deployment targets out-of-the-box:

| Platform | Entrypoint | Configuration |
|---|---|---|
| **Streamlit Community Cloud (`streamlit.io`)** | `streamlit_app.py` | `requirements.txt`, `.streamlit/config.toml` |
| **Vercel** | Next.js App Router | `vercel.json`, `package.json` |
| **Docker / Cloud Run** | Node.js Standalone Container | `Dockerfile`, `.dockerignore` |

---

## ☁️ Deploying to Streamlit Community Cloud (`streamlit.io`)

1. Push this repository to GitHub (**`markdmitchell/BiteID`**).
2. Log in to [Streamlit Community Cloud](https://share.streamlit.io/).
3. Click **New App**.
4. Select:
   - **Repository:** `markdmitchell/BiteID`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app.py`
5. *(Optional)* Under **Advanced settings -> Secrets**, add:
   ```toml
   GEMINI_API_KEY = "your_gemini_api_key_here"
   ```
6. Click **Deploy!**

---

## 💻 Local Development & Testing

### Option 1: Streamlit Python App
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

### Option 2: Next.js Web App
```bash
pnpm install
pnpm dev
```

---

## ⚠️ Alpha Release & Testing Disclaimer

> [!CAUTION]
> **FOR TESTING AND EVALUATION PURPOSES ONLY**  
> BiteID is an early-stage **alpha prototype** software application. It is designed strictly for technical testing, algorithmic evaluation, and user interface feedback. It is **not a medical device** and must **not be used for actual clinical medical diagnosis or treatment decisions**.

---

## 📄 Medical Disclaimer

BiteID is an educational prototype assistant and does not provide professional medical diagnosis. In cases of severe systemic reactions or expanding skin infections, consult a licensed healthcare provider or seek emergency care immediately.
