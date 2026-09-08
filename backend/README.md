# BiteID Dedicated FastAPI Backend

A headless, high-performance Python FastAPI backend microservice for the BiteID clinical arthropod bite triage application.

## Features

- **Multi-Node AI Orchestration**: Uses `@google/genai` Python SDK with `gemini-3.6-flash`:
  - **Node A (Entomologist)**: Insect taxonomy extraction from culprit photos.
  - **Node B (Dermatologist)**: Visual lesion morphology classification.
  - **Node C (Synthesizer)**: Multi-factor triage synthesis.
- **Deterministic Geographic Priors Engine**: Mid-Atlantic Erythema Migrans prior rules enforcing *Ixodes scapularis* (Deer Tick) prioritization (>90%) and mosquito capping (<=5%), plus Alpha-gal syndrome warnings for *Amblyomma americanum* (Lone Star Tick).
- **Multipart Data Handling**: Accepts up to 10MB binary images and structured JSON context.
- **Explicit Error Handling**: Strict HTTP 400 size/payload validation and HTTP 500 API key error enforcement with 0 silent fallbacks.

## Quickstart & Local Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
Set your Gemini API key in your terminal session:
```bash
export GEMINI_API_KEY="your_api_key_here"
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000/api/analyze`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 4. Run Pytest Suite
```bash
pytest tests/
```
