from typing import List, Dict, Any, Optional
from .schemas import TriageContext, CandidateCulprit

MID_ATLANTIC_STATES = {
    "US-VA", "US-MD", "US-PA", "US-NJ", "US-DE", "US-DC", "US-NC", "US-WV"
}

LONE_STAR_ENDEMIC_STATES = {
    "US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
    "US-KY", "US-AR", "US-LA", "US-TX", "US-OK", "US-MO", "US-IL", "US-IN",
    "US-OH", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-CT"
}

DEER_TICK_ENDEMIC_STATES = {
    "US-VA", "US-MD", "US-PA", "US-NJ", "US-DE", "US-DC", "US-NY", "US-CT",
    "US-MA", "US-RI", "US-NH", "US-VT", "US-ME", "US-WI", "US-MN", "US-NC"
}

VECTOR_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "deer_tick",
        "pestName": "Blacklegged (Deer) Tick",
        "name": "Blacklegged (Deer) Tick",
        "scientificName": "Ixodes scapularis",
        "endemicStates": list(DEER_TICK_ENDEMIC_STATES),
        "peakMonths": [4, 5, 6, 7, 8, 9, 10],
        "habitats": ["tall_grass_woods", "yard_garden"],
        "sensations": ["painless", "mild_itch"],
        "morphologies": ["annular_target"],
        "associatedPathogens": [
            "Lyme Disease (Borrelia burgdorferi)",
            "Anaplasmosis",
            "Babesiosis",
            "Powassan Virus"
        ],
        "delayedRisks": [
            "Post-Treatment Lyme Disease Syndrome",
            "Secondary Bacterial Skin Infection"
        ],
        "firstAidAdvice": [
            "Use fine-tipped tweezers to grasp the tick as close to the skin surface as possible.",
            "Pull upward with steady, even pressure without twisting or squeezing.",
            "Clean the bite area thoroughly with rubbing alcohol or soap and water.",
            "Save the tick in a sealed container for species identification if fever or rash develops."
        ],
        "warningSignsToWatch": [
            "Expanding circular 'bullseye' rash (Erythema Migrans) >5cm.",
            "Flu-like symptoms (fever, chills, body aches, fatigue).",
            "Joint pain or swelling."
        ]
    },
    {
        "id": "lone_star_tick",
        "pestName": "Lone Star Tick",
        "name": "Lone Star Tick",
        "scientificName": "Amblyomma americanum",
        "endemicStates": list(LONE_STAR_ENDEMIC_STATES),
        "peakMonths": [3, 4, 5, 6, 7, 8, 9],
        "habitats": ["tall_grass_woods", "yard_garden"],
        "sensations": ["painless", "mild_itch", "intense_itch"],
        "morphologies": ["annular_target", "edematous_wheal"],
        "associatedPathogens": [
            "Ehrlichiosis (Ehrlichia chaffeensis)",
            "STARI (Southern Tick-Associated Rash Illness)",
            "Heartland Virus",
            "Bourbon Virus"
        ],
        "delayedRisks": [
            "Alpha-gal syndrome (red meat allergy)",
            "Secondary bacterial skin infection"
        ],
        "firstAidAdvice": [
            "Grasp the tick as close to the skin as possible with fine tweezers and pull straight up.",
            "Disinfect the bite location with rubbing alcohol or iodine tincture.",
            "Monitor for 3 to 8 hour delayed allergic reactions after consuming red meat or dairy."
        ],
        "warningSignsToWatch": [
            "Delayed allergic reactions (hives, severe gastrointestinal cramps) 3-8 hours after consuming mammalian meat.",
            "Expanding circular target rash (STARI presentation).",
            "Unexplained high fever or body aches."
        ]
    },
    {
        "id": "mosquito",
        "pestName": "Mosquito",
        "name": "Mosquito",
        "scientificName": "Culex / Aedes spp.",
        "endemicStates": ["ALL"],
        "peakMonths": [4, 5, 6, 7, 8, 9],
        "habitats": ["yard_garden", "outdoor_other", "tall_grass_woods"],
        "sensations": ["intense_itch", "mild_itch"],
        "morphologies": ["edematous_wheal"],
        "associatedPathogens": [
            "West Nile Virus",
            "Eastern Equine Encephalitis",
            "Dengue Virus (regional)"
        ],
        "delayedRisks": [
            "Secondary Bacterial Infection from excoriation/scratching"
        ],
        "firstAidAdvice": [
            "Wash area with soap and water.",
            "Apply hydrocortisone cream (1%) or calamine lotion to reduce itching.",
            "Use a cold compress or ice pack for 10 minutes to reduce localized edema."
        ],
        "warningSignsToWatch": [
            "Signs of secondary infection (increasing redness, warmth, pus).",
            "High fever, stiff neck, or severe headache (West Nile warning signs)."
        ]
    },
    {
        "id": "bed_bug",
        "pestName": "Bed Bug",
        "name": "Bed Bug",
        "scientificName": "Cimex lectularius",
        "endemicStates": ["ALL"],
        "peakMonths": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "habitats": ["bed", "indoor_other"],
        "sensations": ["intense_itch"],
        "morphologies": ["linear_cluster"],
        "associatedPathogens": [],
        "delayedRisks": ["Secondary Excoriation Infection", "Sleep Disturbance & Anxiety"],
        "firstAidAdvice": [
            "Wash bite sites with soap and warm water.",
            "Apply topical anti-itch creams or oral antihistamines.",
            "Inspect mattress seams, bed frames, and baseboards for dark focal spotting."
        ],
        "warningSignsToWatch": [
            "Grouped linear bite clusters ('breakfast, lunch, dinner' distribution).",
            "Spreading redness or warmth indicating secondary bacterial infection."
        ]
    },
    {
        "id": "flea",
        "pestName": "Flea",
        "name": "Flea",
        "scientificName": "Ctenocephalides felis",
        "endemicStates": ["ALL"],
        "peakMonths": [4, 5, 6, 7, 8, 9, 10],
        "habitats": ["indoor_other", "yard_garden", "bed"],
        "sensations": ["intense_itch"],
        "morphologies": ["linear_cluster", "edematous_wheal"],
        "associatedPathogens": ["Murine Typhus", "Bartonellosis (Cat Scratch Disease)"],
        "delayedRisks": ["Secondary Bacterial Infection"],
        "firstAidAdvice": [
            "Wash with soap and cold water to relieve histamine itching.",
            "Apply hydrocortisone or calamine lotion.",
            "Treat domestic pets with veterinarian-approved flea preventative."
        ],
        "warningSignsToWatch": [
            "Multiple small, intensely itchy papules concentrated around ankles and lower legs."
        ]
    },
    {
        "id": "brown_recluse",
        "pestName": "Brown Recluse Spider",
        "name": "Brown Recluse Spider",
        "scientificName": "Loxosceles reclusa",
        "endemicStates": [
            "US-AL", "US-AR", "US-FL", "US-GA", "US-IL", "US-IN", "US-IA", "US-KS",
            "US-KY", "US-LA", "US-MS", "US-MO", "US-NE", "US-NC", "US-OH", "US-OK",
            "US-SC", "US-TN", "US-TX", "US-VA", "US-WV"
        ],
        "peakMonths": [3, 4, 5, 6, 7, 8, 9],
        "habitats": ["garage_shed", "indoor_other"],
        "sensations": ["severe_pain", "moderate_pain"],
        "morphologies": ["necrotic_macule"],
        "associatedPathogens": [],
        "delayedRisks": ["Loxoscelism (Dermonecrosis)", "Systemic Hemolysis (Rare)"],
        "firstAidAdvice": [
            "Clean the wound with mild soap and water.",
            "Apply ice pack wrapped in a clean cloth (10 min on, 10 min off).",
            "Elevate the affected limb above heart level.",
            "Seek urgent medical evaluation for violaceous lesion progression."
        ],
        "warningSignsToWatch": [
            "Central sunken bluish/violaceous macule surrounded by pale halo and erythematous ring.",
            "Expanding central necrosis or eschar formation over 24-72 hours."
        ]
    }
]


def calculate_geographic_priors(
    context: TriageContext,
    detected_taxonomy: Optional[str] = None,
    detected_morphology: Optional[str] = None
) -> List[CandidateCulprit]:
    """
    Calculates deterministic candidate scores based on location priors, seasonal alignment,
    habitat context, visual morphology, and detected bug taxonomy.
    """
    effective_morphology = detected_morphology or context.lesionMorphology
    if context.morphology and context.morphology.pattern == "annular_target":
        effective_morphology = "annular_target"

    state = context.usState
    month = context.monthIndex
    habitat = context.incidentLocation
    sensation = context.primarySensation

    scored_candidates = []

    for vector in VECTOR_DATABASE:
        score = 0.45
        factors = []

        # 1. Geographic State Prior
        is_endemic = ("ALL" in vector["endemicStates"]) or (state in vector["endemicStates"])
        if is_endemic:
            score += 0.15
            factors.append(f"Endemic presence confirmed in state ({state})")
        else:
            score -= 0.30

        # 2. Seasonal Alignment
        if month in vector["peakMonths"]:
            score += 0.10
            factors.append("Active seasonal window")

        # 3. Environmental Habitat Alignment
        if habitat in vector["habitats"]:
            score += 0.15
            factors.append(f"Matching habitat environment ({habitat.replace('_', ' ')})")

        # 4. Primary Sensation Alignment
        if sensation in vector["sensations"]:
            score += 0.10
            factors.append(f"Sensation profile match ({sensation.replace('_', ' ')})")

        # 5. Visual Lesion Morphology
        if effective_morphology and effective_morphology in vector["morphologies"]:
            score += 0.20
            factors.append(f"Distinct lesion morphology match ({effective_morphology})")

        # 6. Entomologist Taxonomy Match
        if detected_taxonomy:
            tax_lower = detected_taxonomy.lower()
            sci_lower = vector["scientificName"].lower()
            name_lower = vector["name"].lower()
            if (sci_lower in tax_lower) or (name_lower in tax_lower):
                score += 0.45
                factors.append(f"Direct taxonomy identification match ({detected_taxonomy})")

        # Clamp initial score
        score = max(0.01, min(0.99, score))

        candidate = CandidateCulprit(
            pestName=vector["pestName"],
            name=vector["name"],
            scientificName=vector["scientificName"],
            confidence="low",
            probabilityScore=round(score, 2),
            probability=round(score, 2),
            matchedFactors=factors,
            associatedPathogens=vector["associatedPathogens"],
            delayedRisks=vector["delayedRisks"],
            firstAidAdvice=vector["firstAidAdvice"],
            warningSignsToWatch=vector["warningSignsToWatch"],
            warningSigns=vector["warningSignsToWatch"]
        )
        scored_candidates.append((vector["id"], candidate))

    # --- DETERMINISTIC OVERRIDE RULES ---
    # Rule 1: Mid-Atlantic + annular_target morphology -> Prioritize Deer Tick / Ixodes scapularis (>90%) and cap Mosquito (<=5%)
    if state in MID_ATLANTIC_STATES and effective_morphology == "annular_target":
        for idx, (v_id, cand) in enumerate(scored_candidates):
            if v_id == "deer_tick":
                cand.probabilityScore = 0.92
                cand.probability = 0.92
                cand.confidence = "high"
                if "Mid-Atlantic Erythema Migrans prior override applied (>90%)" not in cand.matchedFactors:
                    cand.matchedFactors.append("Mid-Atlantic Erythema Migrans prior override applied (>90%)")
            elif v_id == "lone_star_tick":
                cand.probabilityScore = 0.78
                cand.probability = 0.78
                cand.confidence = "high"
                if "Regional tick vector prevalence in Mid-Atlantic" not in cand.matchedFactors:
                    cand.matchedFactors.append("Regional tick vector prevalence in Mid-Atlantic")
            elif v_id == "mosquito":
                cand.probabilityScore = 0.04
                cand.probability = 0.04
                cand.confidence = "low"
                if "Annular targetoid rash caps generic histamine wheals (Mosquito) to <=5%" not in cand.matchedFactors:
                    cand.matchedFactors.append("Annular targetoid rash caps generic histamine wheals (Mosquito) to <=5%")

    # Rule 2: Entomologist Identified Amblyomma americanum -> Boost Lone Star Tick and add Alpha-gal syndrome warnings
    if detected_taxonomy and "amblyomma americanum" in detected_taxonomy.lower():
        for v_id, cand in scored_candidates:
            if v_id == "lone_star_tick":
                cand.probabilityScore = 0.98
                cand.probability = 0.98
                cand.confidence = "high"
                if "Confirmed Amblyomma americanum (Lone Star Tick) taxonomy from photo" not in cand.matchedFactors:
                    cand.matchedFactors.append("Confirmed Amblyomma americanum (Lone Star Tick) taxonomy from photo")

    # Sort candidates descending by probabilityScore
    result_candidates = [cand for _, cand in scored_candidates]
    result_candidates.sort(key=lambda c: c.probabilityScore, reverse=True)

    # Assign confidence labels based on score
    for cand in result_candidates:
        if cand.probabilityScore >= 0.80:
            cand.confidence = "high"
        elif cand.probabilityScore >= 0.50:
            cand.confidence = "moderate"
        else:
            cand.confidence = "low"

    return result_candidates
