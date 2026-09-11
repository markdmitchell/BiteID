import json
import os
from typing import Optional, List
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .schemas import (
    TriageContext,
    EmergencySymptoms,
    AnalysisResult,
    map_environment_string,
    map_duration_string,
)
from .gemini_orchestrator import orchestrate_triage_pipeline

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit per image

app = FastAPI(
    title="BiteID Triage API",
    description="Headless Python FastAPI backend for arthropod bite triage & multi-node diagnostic analysis.",
    version="1.0.0",
)

# Enable CORS for Next.js web client, Lovable preview, and local dev
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
@app.post("/triage", response_model=AnalysisResult, tags=["Triage"])
@app.post("/api/triage", response_model=AnalysisResult, tags=["Triage"])
async def analyze_bite(
    context: Optional[str] = Form(None, description="JSON string encoded TriageContext model"),
    environment: Optional[str] = Form(None, description="Lovable environment string"),
    duration: Optional[str] = Form(None, description="Lovable duration string"),
    emergency_flags: Optional[str] = Form(None, description="Lovable JSON emergency flags string"),
    skin_lesion_image: Optional[UploadFile] = File(None, description="Skin lesion photo (Lovable key)"),
    lesion_image: Optional[UploadFile] = File(None, description="Skin lesion photo (standard key)"),
    lesionImage: Optional[UploadFile] = File(None, description="Skin lesion photo (camelCase key)"),
    bug_image: Optional[UploadFile] = File(None, description="Culprit bug photo (Lovable key)"),
    culprit_image: Optional[UploadFile] = File(None, description="Culprit bug photo (standard key)"),
    culpritImage: Optional[UploadFile] = File(None, description="Culprit bug photo (camelCase key)"),
):
    """
    Analyzes arthropod bite images and context via multi-node AI orchestration & geographic priors.
    Accepts both BiteID multi-node context JSON and Lovable intake FormData keys seamlessly.
    """
    # 1. Resolve Lesion and Culprit Image Files from aliases
    target_lesion_file = skin_lesion_image or lesion_image or lesionImage
    target_culprit_file = bug_image or culprit_image or culpritImage

    # 2. Resolve or Build TriageContext
    parsed_context: TriageContext
    if context and context.strip():
        try:
            context_data = json.loads(context)
            parsed_context = TriageContext.model_validate(context_data)
        except (json.JSONDecodeError, ValidationError) as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Malformed context payload: {str(err)}"
            )
    else:
        # Parse Lovable individual form parameters
        parsed_flags: List[str] = []
        if emergency_flags:
            try:
                parsed_flags = json.loads(emergency_flags)
                if not isinstance(parsed_flags, list):
                    parsed_flags = [str(parsed_flags)]
            except Exception:
                parsed_flags = []

        emerg = EmergencySymptoms(
            difficultyBreathing="breathing" in parsed_flags or "difficultyBreathing" in parsed_flags,
            facialSwelling="swelling" in parsed_flags or "facialSwelling" in parsed_flags,
            dizzinessOrConfusion="confusion" in parsed_flags or "dizzinessOrConfusion" in parsed_flags,
            spreadingHives="hives" in parsed_flags or "spreadingHives" in parsed_flags or "expanding" in parsed_flags,
        )

        parsed_context = TriageContext(
            usState="US-VA",
            incidentLocation=map_environment_string(environment), # type: ignore
            timeElapsed=map_duration_string(duration), # type: ignore
            emergencyScreening=emerg,
        )

    # 3. Emergency Short-Circuit (before reading heavy image buffers)
    emerg = parsed_context.emergencyScreening
    if emerg.difficultyBreathing or emerg.facialSwelling or emerg.dizzinessOrConfusion or emerg.spreadingHives:
        return await orchestrate_triage_pipeline(context=parsed_context)

    # 4. Read & Validate Lesion Image Buffer (Max 10MB)
    lesion_bytes: Optional[bytes] = None
    lesion_mime: str = "image/jpeg"
    if target_lesion_file:
        lesion_bytes = await target_lesion_file.read()
        if len(lesion_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesion image payload size ({len(lesion_bytes)} bytes) exceeds the 10MB limit."
            )
        lesion_mime = target_lesion_file.content_type or "image/jpeg"

    # 5. Read & Validate Culprit Image Buffer (Max 10MB)
    culprit_bytes: Optional[bytes] = None
    culprit_mime: str = "image/jpeg"
    if target_culprit_file:
        culprit_bytes = await target_culprit_file.read()
        if len(culprit_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Culprit image payload size ({len(culprit_bytes)} bytes) exceeds the 10MB limit."
            )
        culprit_mime = target_culprit_file.content_type or "image/jpeg"

    # 6. Check GEMINI_API_KEY environment variable (No Silent Fallback)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY environment variable is missing on server. Cannot execute triage analysis."
        )

    # 7. Execute Multi-Node AI Orchestration Pipeline
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
