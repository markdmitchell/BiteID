from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field


class EmergencySymptoms(BaseModel):
    difficultyBreathing: bool = False
    facialSwelling: bool = False
    dizzinessOrConfusion: bool = False
    spreadingHives: bool = False


class Coordinates(BaseModel):
    lat: float
    lng: float


class DermatologicalMorphology(BaseModel):
    pattern: Literal[
        "solitary_wheal",
        "annular_target",
        "linear_grouped",
        "scattered_papules",
        "indurated_plaque",
    ]
    centralFeatures: Literal[
        "punctum_bite_mark",
        "clear_halo",
        "vesicle_blister",
        "necrotic_ulcer",
        "none",
    ]
    primaryReaction: Literal[
        "urticarial_hive",
        "expanding_erythema",
        "excoriated_papule",
        "ischemic_purpura",
    ]


class TriageContext(BaseModel):
    coordinates: Optional[Coordinates] = None
    usState: str = "US-VA"
    monthIndex: int = Field(default=8, ge=0, le=11)
    incidentLocation: Literal[
        "bed",
        "tall_grass_woods",
        "yard_garden",
        "garage_shed",
        "indoor_other",
        "outdoor_other",
    ] = "yard_garden"
    timeElapsed: Literal[
        "under_2h",
        "2_to_12h",
        "1_to_2_days",
        "over_2_days",
    ] = "under_2h"
    primarySensation: Literal[
        "severe_pain",
        "moderate_pain",
        "intense_itch",
        "mild_itch",
        "painless",
    ] = "intense_itch"
    lesionMorphology: Optional[
        Literal["annular_target", "edematous_wheal", "linear_cluster", "necrotic_macule", "other"]
    ] = None
    morphology: Optional[DermatologicalMorphology] = None
    emergencyScreening: EmergencySymptoms = Field(default_factory=EmergencySymptoms)


class EntomologistNodeOutput(BaseModel):
    bugPhotoProvided: bool
    identifiedBugTaxonomy: Optional[str] = None


class DermatologistNodeOutput(BaseModel):
    lesionMorphology: Literal[
        "annular_target",
        "edematous_wheal",
        "linear_cluster",
        "necrotic_macule",
        "other",
    ]


class VisionAnalysisOutput(BaseModel):
    bugPhotoProvided: bool
    identifiedBugTaxonomy: Optional[str] = Field(
        default=None,
        description="Scientific name of insect identified in culprit photo if provided",
    )
    lesionMorphology: Literal[
        "annular_target",
        "edematous_wheal",
        "linear_cluster",
        "necrotic_macule",
        "other",
    ]
    primarySuspectedCause: str


class CandidateCulprit(BaseModel):
    pestName: str = "Unknown Pest"
    name: str = "Unknown Vector"
    scientificName: str = ""
    confidence: Literal["high", "medium", "moderate", "low"] = "low"
    probabilityScore: float = Field(default=0.0, ge=0.0, le=1.0)
    probability: float = Field(default=0.0, ge=0.0, le=1.0)
    matchedFactors: List[str] = Field(default_factory=list)
    associatedPathogens: List[str] = Field(
        default_factory=list,
        description='e.g., ["Lyme Disease", "Rocky Mountain Spotted Fever"]',
    )
    delayedRisks: List[str] = Field(
        default_factory=list,
        description='e.g., ["Alpha-gal syndrome (red meat allergy)"]',
    )
    firstAidAdvice: List[str] = Field(default_factory=list)
    warningSignsToWatch: List[str] = Field(default_factory=list)
    warningSigns: List[str] = Field(default_factory=list)


class TriageResultItem(BaseModel):
    name: str
    scientificName: Optional[str] = None
    description: Optional[str] = None
    confidence: float = 0.0
    matchedFactors: List[str] = Field(default_factory=list)
    associatedPathogens: List[str] = Field(default_factory=list)
    delayedRisks: List[str] = Field(default_factory=list)
    firstAidAdvice: List[str] = Field(default_factory=list)
    warningSignsToWatch: List[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    isEmergencyRedirect: bool
    emergencyMessage: Optional[str] = None
    culpritDetectedFromPhoto: bool = False
    morphology: Optional[DermatologicalMorphology] = None
    visionAnalysis: Optional[VisionAnalysisOutput] = None
    rankedCandidates: List[CandidateCulprit]
    results: List[TriageResultItem] = Field(default_factory=list)
    summary: str
    disclaimer: str


def map_environment_string(env: Optional[str]) -> str:
    if not env:
        return "yard_garden"
    env_lower = env.lower().strip()
    if env_lower in ["woods", "tall_grass_woods", "forest", "trail"]:
        return "tall_grass_woods"
    if env_lower in ["yard", "yard_garden", "garden", "lawn"]:
        return "yard_garden"
    if env_lower in ["bed", "bedroom", "mattress"]:
        return "bed"
    if env_lower in ["garage", "garage_shed", "shed", "attic", "woodpile"]:
        return "garage_shed"
    if env_lower in ["indoor", "indoor_other", "office", "travel"]:
        return "indoor_other"
    return "outdoor_other"


def map_duration_string(dur: Optional[str]) -> str:
    if not dur:
        return "under_2h"
    dur_lower = dur.lower().strip()
    if dur_lower in ["under-24h", "under_24h", "under_2h", "<2h", "hours"]:
        return "under_2h"
    if dur_lower in ["1-3d", "2_to_12h", "1_to_2_days", "1-2d", "days"]:
        return "1_to_2_days"
    return "over_2_days"
