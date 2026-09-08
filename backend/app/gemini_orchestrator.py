import os
import json
import re
from typing import Optional, Tuple
from google import genai
from google.genai import types

from .schemas import (
    TriageContext,
    EntomologistNodeOutput,
    DermatologistNodeOutput,
    VisionAnalysisOutput,
    AnalysisResult,
    DermatologicalMorphology,
)
from .geo_priors import calculate_geographic_priors


def get_genai_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not configured.")
    return genai.Client(api_key=api_key)


async def run_entomologist_node(
    client: genai.Client,
    culprit_bytes: bytes,
    mime_type: str = "image/jpeg"
) -> EntomologistNodeOutput:
    """
    Node A: The Entomologist
    Extracts insect taxonomy from the provided culprit bug photo.
    """
    prompt = """You are Node A (The Entomologist), an expert medical entomologist.
Analyze the insect/arthropod photo provided.
Identify the insect's taxonomic species or genus.
Morphological criteria:
- Female Lone Star Tick (Amblyomma americanum): Distinct central white/silver dot on scutum.
- Male Lone Star Tick (Amblyomma americanum): White festoon / inverted horseshoe edge markings along scutum.
- Blacklegged Tick (Ixodes scapularis): Dark scutum, teardrop body shape, long palps.
- Brown Recluse Spider (Loxosceles reclusa): Dark violin/fiddle pattern on cephalothorax.

Output MUST be valid JSON strictly adhering to:
{
  "bugPhotoProvided": true,
  "identifiedBugTaxonomy": "Scientific taxonomy name (e.g., Amblyomma americanum, Ixodes scapularis) or null"
}"""

    try:
        image_part = types.Part.from_bytes(data=culprit_bytes, mime_type=mime_type)
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(temperature=0.1)
        )
        text = response.text or ""
        json_match = re.search(r"```json\s*([\s\S]*?)\s*```", text) or re.search(r"({[\s\S]*})", text)
        if not json_match:
            raise ValueError(f"Entomologist Node returned non-JSON response: {text}")
        
        data = json.loads(json_match.group(1) if json_match.group(1) else json_match.group(0))
        return EntomologistNodeOutput(
            bugPhotoProvided=bool(data.get("bugPhotoProvided", True)),
            identifiedBugTaxonomy=data.get("identifiedBugTaxonomy")
        )
    except Exception as e:
        raise RuntimeError(f"Entomologist Node execution failed: {str(e)}")


async def run_dermatologist_node(
    client: genai.Client,
    lesion_bytes: bytes,
    mime_type: str = "image/jpeg"
) -> DermatologistNodeOutput:
    """
    Node B: The Dermatologist
    Classifies skin lesion visual morphology from the provided lesion photo.
    """
    prompt = """You are Node B (The Dermatologist), a board-certified dermatologist specializing in arthropod bite reactions.
Analyze the provided skin reaction photo and classify its primary visual morphology.
Select exactly one lesionMorphology enum value from:
- "annular_target": Expanding circular rash with central clearing (>5cm) characteristic of Erythema Migrans (tick bite).
- "edematous_wheal": Small localized hives or acute histamine papule (<2cm) (mosquito/fly).
- "linear_cluster": Sequential linear bite pattern ('breakfast, lunch, dinner') (bed bug/flea).
- "necrotic_macule": Violaceous plaque with central ulceration or necrosis (brown recluse).
- "other": Non-specific rash or other skin presentation.

Output MUST be valid JSON strictly adhering to:
{
  "lesionMorphology": "annular_target" | "edematous_wheal" | "linear_cluster" | "necrotic_macule" | "other"
}"""

    try:
        image_part = types.Part.from_bytes(data=lesion_bytes, mime_type=mime_type)
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(temperature=0.1)
        )
        text = response.text or ""
        json_match = re.search(r"```json\s*([\s\S]*?)\s*```", text) or re.search(r"({[\s\S]*})", text)
        if not json_match:
            raise ValueError(f"Dermatologist Node returned non-JSON response: {text}")

        data = json.loads(json_match.group(1) if json_match.group(1) else json_match.group(0))
        morph = data.get("lesionMorphology", "other")
        if morph not in ["annular_target", "edematous_wheal", "linear_cluster", "necrotic_macule", "other"]:
            morph = "other"
        return DermatologistNodeOutput(lesionMorphology=morph)
    except Exception as e:
        raise RuntimeError(f"Dermatologist Node execution failed: {str(e)}")


async def orchestrate_triage_pipeline(
    context: TriageContext,
    lesion_bytes: Optional[bytes] = None,
    lesion_mime: str = "image/jpeg",
    culprit_bytes: Optional[bytes] = None,
    culprit_mime: str = "image/jpeg"
) -> AnalysisResult:
    """
    Multi-node AI Orchestrator running Nodes A, B, and C with deterministic prior engine.
    """
    # 0. Emergency Short-Circuit Check
    emerg = context.emergencyScreening
    if emerg.difficultyBreathing or emerg.facialSwelling or emerg.dizzinessOrConfusion or emerg.spreadingHives:
        return AnalysisResult(
            isEmergencyRedirect=True,
            emergencyMessage="CRITICAL: Severe systemic symptoms detected (anaphylaxis/red-flag). Please call emergency services (911/112) or seek an urgent care emergency department immediately.",
            culpritDetectedFromPhoto=False,
            rankedCandidates=[],
            summary="Emergency screening flagged severe systemic symptoms requiring immediate medical evaluation.",
            disclaimer="DISCLAIMER: BiteID is an educational decision-support tool and does not provide formal medical diagnosis or replace emergency services."
        )

    client = get_genai_client()

    identified_taxonomy: Optional[str] = None
    detected_morphology: str = context.lesionMorphology or "other"

    # Node A Execution (if culprit image provided)
    if culprit_bytes and len(culprit_bytes) > 0:
        node_a = await run_entomologist_node(client, culprit_bytes, culprit_mime)
        identified_taxonomy = node_a.identifiedBugTaxonomy

    # Node B Execution (if lesion image provided)
    if lesion_bytes and len(lesion_bytes) > 0:
        node_b = await run_dermatologist_node(client, lesion_bytes, lesion_mime)
        detected_morphology = node_b.lesionMorphology

    # Node C: Synthesize Vision + Geographic Priors Engine
    ranked_candidates = calculate_geographic_priors(
        context=context,
        detected_taxonomy=identified_taxonomy,
        detected_morphology=detected_morphology
    )

    top_candidate = ranked_candidates[0] if ranked_candidates else None
    primary_cause = top_candidate.name if top_candidate else "Unknown Vector"

    vision_analysis = VisionAnalysisOutput(
        bugPhotoProvided=bool(culprit_bytes and len(culprit_bytes) > 0),
        identifiedBugTaxonomy=identified_taxonomy,
        lesionMorphology=detected_morphology, # type: ignore
        primarySuspectedCause=primary_cause
    )

    # Construct DermatologicalMorphology summary if targetoid
    morph_obj = None
    if detected_morphology == "annular_target":
        morph_obj = DermatologicalMorphology(
            pattern="annular_target",
            centralFeatures="clear_halo",
            primaryReaction="expanding_erythema"
        )
    elif detected_morphology == "edematous_wheal":
        morph_obj = DermatologicalMorphology(
            pattern="solitary_wheal",
            centralFeatures="punctum_bite_mark",
            primaryReaction="urticarial_hive"
        )

    summary_text = f"Primary suspected vector: {primary_cause} ({top_candidate.probabilityScore * 100:.0f}% confidence score)." if top_candidate else "Analysis complete."

    return AnalysisResult(
        isEmergencyRedirect=False,
        emergencyMessage=None,
        culpritDetectedFromPhoto=bool(identified_taxonomy is not None),
        morphology=morph_obj,
        visionAnalysis=vision_analysis,
        rankedCandidates=ranked_candidates,
        summary=summary_text,
        disclaimer="DISCLAIMER: BiteID is an AI educational decision-support tool. It does not provide definitive medical diagnosis or treatment advice. Consult a healthcare provider for diagnosis."
    )
