# 🦟 BiteID - Multimodal Insect & Spider Bite Triage Prototype

BiteID is a functional, self-contained Next.js & Streamlit application for insect and spider bite triage. The app triages bite reactions by combining:
1. **Multimodal Vision**: Lesion image + optional captured culprit pest image.
2. **Geo-Seasonal Intelligence**: Endemic state maps, temperature activity curves, and habitat/temporal context.
3. **Deterministic Safety Interception**: Red-flag emergency screening for anaphylaxis/systemic symptoms (911 / Poison Control quick-dial).
4. **Clinical Reference Engine**: Side-by-side visual reference comparisons across Fitzpatrick skin types I–VI with verified CDC PHIL attributions.
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

## 📄 Medical Disclaimer

BiteID is an educational prototype assistant and does not provide professional medical diagnosis. In cases of severe systemic reactions or expanding skin infections, consult a licensed healthcare provider or seek emergency care immediately.
