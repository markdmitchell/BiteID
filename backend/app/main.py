import json
import os
from typing import Optional
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .schemas import TriageContext, AnalysisResult
from .gemini_orchestrator import orchestrate_triage_pipeline

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit per image

app = FastAPI(
    title="BiteID Triage API",
    description="Headless Python FastAPI backend for arthropod bite triage & multi-node diagnostic analysis.",
    version="1.0.0",
)

# Enable CORS for Next.js web client and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for container and deployment monitoring."""
    api_key_configured = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "service": "BiteID FastAPI Backend",
        "geminiKeyConfigured": api_key_configured,
        "version": "1.0.0"
    }


@app.post("/api/analyze", response_model=AnalysisResult, tags=["Triage"])
async def analyze_bite(
    context: str = Form(..., description="JSON string encoded TriageContext model"),
    lesion_image: Optional[UploadFile] = File(None, description="Skin lesion photo (max 10MB)"),
    culprit_image: Optional[UploadFile] = File(None, description="Culprit bug photo (max 10MB)"),
):
    """
    Analyzes arthropod bite images and context via multi-node AI orchestration & geographic priors.
    """
    # 1. Parse and validate JSON TriageContext
    try:
        context_data = json.loads(context)
        parsed_context = TriageContext.model_validate(context_data)
    except (json.JSONDecodeError, ValidationError) as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed context payload: {str(err)}"
        )

    # 2. Emergency Short-Circuit (before reading heavy image buffers)
    emerg = parsed_context.emergencyScreening
    if emerg.difficultyBreathing or emerg.facialSwelling or emerg.dizzinessOrConfusion or emerg.spreadingHives:
        return await orchestrate_triage_pipeline(context=parsed_context)

    # 3. Read & Validate Lesion Image Buffer (Max 10MB)
    lesion_bytes: Optional[bytes] = None
    lesion_mime: str = "image/jpeg"
    if lesion_image:
        lesion_bytes = await lesion_image.read()
        if len(lesion_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesion image payload size ({len(lesion_bytes)} bytes) exceeds the 10MB limit."
            )
        lesion_mime = lesion_image.content_type or "image/jpeg"

    # 4. Read & Validate Culprit Image Buffer (Max 10MB)
    culprit_bytes: Optional[bytes] = None
    culprit_mime: str = "image/jpeg"
    if culprit_image:
        culprit_bytes = await culprit_image.read()
        if len(culprit_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Culprit image payload size ({len(culprit_bytes)} bytes) exceeds the 10MB limit."
            )
        culprit_mime = culprit_image.content_type or "image/jpeg"

    # 5. Check GEMINI_API_KEY environment variable (No Silent Fallback)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY environment variable is missing on server. Cannot execute triage analysis."
        )

    # 6. Execute Multi-Node AI Orchestration Pipeline
    try:
        result = await orchestrate_triage_pipeline(
            context=parsed_context,
            lesion_bytes=lesion_bytes,
            lesion_mime=lesion_mime,
            culprit_bytes=culprit_bytes,
            culprit_mime=culprit_mime,
        )
        return result
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multi-node AI inference pipeline failed: {str(err)}"
        )
