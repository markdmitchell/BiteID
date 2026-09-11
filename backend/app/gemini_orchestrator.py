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
    Extracts insect taxonomy from the provided culprit bug photo using fine-grained morphological criteria.
    """
    prompt = """You are Node A (The Entomologist), an expert medical entomologist.
Analyze the insect or arthropod photo provided. Identify key anatomical landmarks and classify the species/genus.

Morphological anatomical diagnostic criteria:
- Female Lone Star Tick (Amblyomma americanum): Distinct central white/silver spot or single star on posterior scutum.
- Male Lone Star Tick (Amblyomma americanum): White festoons and inverted horseshoe/garland markings along scutum edges.
- Blacklegged / Deer Tick (Ixodes scapularis): Dark dark brown to black scutum, oval teardrop body shape, long slender palps, no scutum ornamentation.
- American Dog Tick (Dermacentor variabilis): Ornate whitish/grey marbling patterns on dark scutum, short blunt palps.
- Brown Recluse Spider (Loxosceles reclusa): Dark brown violin/fiddle pattern on cephalothorax pointing toward abdomen, 6 eyes in 3 pairs (dyads).
- Black Widow Spider (Latrodectus mactans): Shiny black spherical abdomen with red/orange hourglass marking on ventral surface.
- Bed Bug (Cimex lectularius): Oval, flat, reddish-brown, wingless insect with broad segmented abdomen.
- Flea (Ctenocephalides felis / Pulex irritans): Small (1-3mm), laterally compressed brown body with long hind legs built for jumping.
- Mosquito (Culicidae): Slender body, long delicate legs, narrow scaled wings, long forward-pointing proboscis.

Output MUST be valid JSON strictly adhering to:
{
  "bugPhotoProvided": true,
  "identifiedBugTaxonomy": "Scientific taxonomy name (e.g., Amblyomma americanum, Ixodes scapularis, Loxosceles reclusa, Cimex lectularius, Culicidae) or null"
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
    Classifies skin lesion visual morphology from the provided photo, accounting for Fitzpatrick skin tone variations (Types I-VI).
    """
    prompt = """You are Node B (The Dermatologist), a board-certified dermatologist specializing in arthropod bite reactions and tropical dermatology.
Analyze the provided skin reaction photo and classify its primary visual morphology.

Account for skin tone variations (Fitzpatrick Types I-VI):
- On Fair/Light skin (Types I-III): Erythema presents as bright pink/red. Targetoid clearance is pale or skin-toned.
- On Dark/Deep Dark skin (Types IV-VI): Erythema may present as subtle violaceous, dark purple, hyperpigmented brown rings, or indurated plaques.

Select exactly one lesionMorphology enum value:
- "annular_target": Expanding circular or oval rash with distinct outer margin and central clearing or central punctum (>5cm diameter) characteristic of Erythema Migrans (Lyme disease tick bite) or STARI.
- "edematous_wheal": Small acute urticarial hive or localized histamine papule (<2cm) with central punctum (mosquito, fly, or immediate histamine flare).
- "linear_cluster": Sequential linear, zigzag, or triangular grouping of 3+ pruritic papules ('breakfast, lunch, dinner' distribution) typical of bed bug or flea bites.
- "necrotic_macule": Indurated plaque with violaceous central necrosis, central bulla/blistering, or dark eschar surrounded by pale ischemic ring (Brown Recluse spider bite).
- "other": Non-specific papular rash, diffuse excoriation, or non-arthropod cutaneous presentation.

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
    Multi-node AI Orchestrator running Nodes A, B, and C with deterministic prior engine and uncertainty calibration.
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
    second_candidate = ranked_candidates[1] if len(ranked_candidates) > 1 else None

    primary_cause = top_candidate.name if top_candidate else "Unknown Vector"

    vision_analysis = VisionAnalysisOutput(
        bugPhotoProvided=bool(culprit_bytes and len(culprit_bytes) > 0),
        identifiedBugTaxonomy=identified_taxonomy,
        lesionMorphology=detected_morphology, # type: ignore
        primarySuspectedCause=primary_cause
    )

    # Construct DermatologicalMorphology summary
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
    elif detected_morphology == "linear_cluster":
        morph_obj = DermatologicalMorphology(
            pattern="linear_grouped",
            centralFeatures="clear_halo",
            primaryReaction="urticarial_hive"
        )
    elif detected_morphology == "necrotic_macule":
        morph_obj = DermatologicalMorphology(
            pattern="indurated_plaque",
            centralFeatures="necrotic_ulcer",
            primaryReaction="ischemic_purpura"
        )

    # Uncertainty Calibration: Check if top 2 candidates are close in score (differential margin <= 15%)
    summary_text = ""
    if top_candidate and second_candidate and (top_candidate.probabilityScore - second_candidate.probabilityScore <= 0.15):
        summary_text = (
            f"Primary candidate: {top_candidate.name} ({top_candidate.probabilityScore * 100:.0f}% match). "
            f"Differential candidate: {second_candidate.name} ({second_candidate.probabilityScore * 100:.0f}% match). "
            "Both possibilities remain clinically plausible based on the presented context and morphology."
        )
    elif top_candidate:
        summary_text = f"Primary suspected vector: {primary_cause} ({top_candidate.probabilityScore * 100:.0f}% confidence score)."
    else:
        summary_text = "Analysis complete."

    results_list = [
        {
            "name": c.name,
            "scientificName": c.scientificName,
            "description": f"Match probability {c.probabilityScore * 100:.0f}%. Matched: {', '.join(c.matchedFactors[:2]) if c.matchedFactors else 'Endemic geographic prior'}",
            "confidence": c.probabilityScore,
            "matchedFactors": c.matchedFactors,
            "associatedPathogens": c.associatedPathogens,
            "delayedRisks": c.delayedRisks,
            "firstAidAdvice": c.firstAidAdvice,
            "warningSignsToWatch": c.warningSignsToWatch,
        }
        for c in ranked_candidates
    ]

    return AnalysisResult(
        isEmergencyRedirect=False,
        emergencyMessage=None,
        culpritDetectedFromPhoto=bool(identified_taxonomy is not None),
        morphology=morph_obj,
        visionAnalysis=vision_analysis,
        rankedCandidates=ranked_candidates,
        results=results_list, # type: ignore
        summary=summary_text,
        disclaimer="DISCLAIMER: BiteID is an AI educational decision-support tool. It does not provide definitive medical diagnosis or treatment advice. Consult a healthcare provider for diagnosis."
    )
