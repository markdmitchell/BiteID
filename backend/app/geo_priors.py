from typing import List, Dict, Any, Optional
from .schemas import TriageContext, CandidateCulprit

MID_ATLANTIC_STATES = {
    "US-VA", "US-MD", "US-PA", "US-NJ", "US-DE", "US-DC", "US-NC", "US-WV"
}

LONE_STAR_PRIMARY_STATES = {
    "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
    "US-KY", "US-AR", "US-LA", "US-TX", "US-OK", "US-MO"
}

DEER_TICK_PRIMARY_STATES = {
    "US-VA", "US-MD", "US-PA", "US-NJ", "US-DE", "US-DC", "US-WV", "US-NY", "US-CT",
    "US-MA", "US-RI", "US-NH", "US-VT", "US-ME", "US-WI", "US-MN"
}

DOG_TICK_PRIMARY_STATES = {
    "US-NC", "US-TN", "US-OK", "US-VA", "US-GA", "US-AR", "US-MO"
}

VECTOR_DATABASE: List[Dict[str, Any]] = [
    {
        "id": "deer_tick",
        "pestName": "Blacklegged (Deer) Tick",
        "name": "Blacklegged (Deer) Tick",
        "scientificName": "Ixodes scapularis",
        "endemicStates": [
            "US-VA", "US-MD", "US-PA", "US-NY", "US-NJ", "US-CT", "US-MA", "US-RI",
            "US-NH", "US-VT", "US-ME", "US-WI", "US-MN", "US-MI", "US-NC", "US-WV",
            "US-DE", "US-OH", "US-IN", "US-IL"
        ],
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
            "Use fine-tipped tweezers to grasp tick near skin and pull straight up.",
            "Clean bite area thoroughly with rubbing alcohol or soap and water.",
            "Save tick for potential species identification."
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
        "endemicStates": [
            "US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
            "US-KY", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-OH",
            "US-IN", "US-IL", "US-MO", "US-AR", "US-LA", "US-TX", "US-OK", "US-KS"
        ],
        "peakMonths": [3, 4, 5, 6, 7, 8, 9],
        "habitats": ["tall_grass_woods", "yard_garden"],
        "sensations": ["painless", "mild_itch", "intense_itch"],
        "morphologies": ["annular_target", "edematous_wheal"],
        "associatedPathogens": [
            "Ehrlichiosis (Ehrlichia chaffeensis)",
            "STARI (Southern Tick-Associated Rash Illness)",
            "Heartland Virus"
        ],
        "delayedRisks": [
            "Alpha-gal syndrome (red meat allergy)",
            "Secondary bacterial skin infection"
        ],
        "firstAidAdvice": [
            "Grasp tick near skin with fine tweezers and pull straight up.",
            "Disinfect bite site with rubbing alcohol or iodine.",
            "Monitor for 3 to 8 hour delayed allergic reactions after consuming red meat or dairy."
        ],
        "warningSignsToWatch": [
            "Delayed allergic reactions (hives, gastrointestinal cramps) 3-8h after eating red meat.",
            "Expanding targetoid rash (STARI presentation)."
        ]
    },
    {
        "id": "dog_tick",
        "pestName": "American Dog Tick",
        "name": "American Dog Tick",
        "scientificName": "Dermacentor variabilis",
        "endemicStates": [
            "US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
            "US-KY", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-OH",
            "US-IN", "US-IL", "US-MO", "US-AR", "US-LA", "US-TX", "US-OK", "US-KS",
            "US-CA", "US-AZ"
        ],
        "peakMonths": [4, 5, 6, 7, 8],
        "habitats": ["tall_grass_woods", "yard_garden"],
        "sensations": ["painless", "mild_itch"],
        "morphologies": ["edematous_wheal"],
        "associatedPathogens": [
            "Rocky Mountain Spotted Fever (Rickettsia rickettsii)",
            "Tularemia (Francisella tularensis)",
            "Tick Paralysis"
        ],
        "delayedRisks": ["RMSF Vasculitis & Systemic Illness"],
        "firstAidAdvice": [
            "Remove tick immediately with tweezers without twisting.",
            "Disinfect bite area with soap and alcohol.",
            "Seek urgent care if high fever or spotted wrist/ankle rash develops within 2-14 days."
        ],
        "warningSignsToWatch": [
            "Sudden high fever, severe headache, and spotted maculopapular rash spreading from wrists and ankles."
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
        "associatedPathogens": ["West Nile Virus", "Eastern Equine Encephalitis", "Dengue Virus"],
        "delayedRisks": ["Secondary Bacterial Infection from excoriation/scratching"],
        "firstAidAdvice": [
            "Wash area with soap and water.",
            "Apply hydrocortisone cream (1%) or calamine lotion.",
            "Use ice pack for 10 minutes to reduce localized edema."
        ],
        "warningSignsToWatch": [
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
            "Apply anti-itch creams or oral antihistamines.",
            "Inspect mattress seams for dark focal spotting."
        ],
        "warningSignsToWatch": [
            "Grouped linear bite clusters ('breakfast, lunch, dinner' distribution)."
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
            "Wash with soap and cold water to relieve itching.",
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
            "Clean wound with mild soap and water.",
            "Apply cold compress (10 min on, 10 min off).",
            "Elevate affected limb above heart level.",
            "Seek urgent medical evaluation for violaceous lesion progression."
        ],
        "warningSignsToWatch": [
            "Central sunken bluish/violaceous macule surrounded by pale halo and erythematous ring."
        ]
    },
    {
        "id": "black_widow",
        "pestName": "Black Widow Spider",
        "name": "Black Widow Spider",
        "scientificName": "Latrodectus mactans",
        "endemicStates": ["ALL"],
        "peakMonths": [3, 4, 5, 6, 7, 8, 9, 10],
        "habitats": ["garage_shed", "outdoor_other", "yard_garden"],
        "sensations": ["severe_pain", "moderate_pain"],
        "morphologies": ["edematous_wheal", "other"],
        "associatedPathogens": ["Alpha-latrotoxin Neurovenom"],
        "delayedRisks": ["Latrodectism (Severe Muscle Spasms & Pain)"],
        "firstAidAdvice": [
            "Wash bite site with soap and water immediately.",
            "Apply cold compress or ice pack.",
            "Seek prompt emergency evaluation if muscle cramps, abdominal pain, or chest tightness occur."
        ],
        "warningSignsToWatch": [
            "Severe abdominal muscle rigidity, chest pain, profuse sweating, or muscle cramping."
        ]
    },
    {
        "id": "fire_ant",
        "pestName": "Fire Ant",
        "name": "Fire Ant",
        "scientificName": "Solenopsis invicta",
        "endemicStates": [
            "US-TX", "US-FL", "US-GA", "US-AL", "US-MS", "US-LA", "US-SC", "US-NC",
            "US-TN", "US-AR", "US-OK", "US-VA", "US-CA"
        ],
        "peakMonths": [3, 4, 5, 6, 7, 8, 9, 10],
        "habitats": ["yard_garden", "outdoor_other"],
        "sensations": ["severe_pain", "intense_itch"],
        "morphologies": ["edematous_wheal", "linear_cluster", "other"],
        "associatedPathogens": ["Solenopsin Alkaloid Venom"],
        "delayedRisks": ["Sterile Pustule Formation", "Anaphylaxis (Systemic Allergy)"],
        "firstAidAdvice": [
            "Wash sting area with soap and water.",
            "Apply cold compress to dull pain and burning.",
            "Do NOT pop sterile pustules to avoid secondary infection."
        ],
        "warningSignsToWatch": [
            "Clusters of intense burning stings turning into sterile white pustules within 24 hours."
        ]
    },
    {
        "id": "chigger",
        "pestName": "Chigger (Harvest Mite)",
        "name": "Chigger (Harvest Mite)",
        "scientificName": "Trombiculidae",
        "endemicStates": ["ALL"],
        "peakMonths": [4, 5, 6, 7, 8, 9],
        "habitats": ["tall_grass_woods", "yard_garden"],
        "sensations": ["intense_itch"],
        "morphologies": ["linear_cluster", "edematous_wheal"],
        "associatedPathogens": [],
        "delayedRisks": ["Severe Pruritic Excoriation Infection"],
        "firstAidAdvice": [
            "Take a warm soapy shower or bath immediately after outdoor exposure.",
            "Wash clothing in hot water.",
            "Apply hydrocortisone cream, calamine, or OTC anti-itch lotion."
        ],
        "warningSignsToWatch": [
            "Clusters of intensely itchy red papules around ankles, waistbands, or skin folds."
        ]
    },
    {
        "id": "kissing_bug",
        "pestName": "Kissing Bug (Triatomine)",
        "name": "Kissing Bug (Triatomine)",
        "scientificName": "Triatoma spp.",
        "endemicStates": [
            "US-TX", "US-AZ", "US-NM", "US-CA", "US-FL", "US-GA", "US-AL", "US-LA"
        ],
        "peakMonths": [4, 5, 6, 7, 8, 9],
        "habitats": ["indoor_other", "bed", "garage_shed"],
        "sensations": ["painless", "mild_itch"],
        "morphologies": ["edematous_wheal", "other"],
        "associatedPathogens": ["Chagas Disease (Trypanosoma cruzi)"],
        "delayedRisks": ["Chronic Chagas Cardiomyopathy & Megacolon"],
        "firstAidAdvice": [
            "Wash bite site thoroughly with soap and water.",
            "Do NOT rub or scratch the bite site.",
            "Consult a physician for blood smear or PCR testing if bitten in an endemic region."
        ],
        "warningSignsToWatch": [
            "Painless facial/eyelid edema (Romaña sign) or firm painless nodule at bite site."
        ]
    }
]


def calculate_geographic_priors(
    context: TriageContext,
    detected_taxonomy: Optional[str] = None,
    detected_morphology: Optional[str] = None
) -> List[CandidateCulprit]:
    """
    Calculates candidate scores based on location priors, seasonal alignment,
    habitat context, visual morphology, latency, and detected bug taxonomy.
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
        else:
            if vector["id"] in ["deer_tick", "mosquito", "lone_star_tick", "dog_tick", "chigger"]:
                score -= 0.15

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

    # --- DETERMINISTIC CLINICAL OVERRIDE RULES ---

    # Rule 1: Annular Targetoid Rash Differentiation
    if effective_morphology == "annular_target":
        if state in DEER_TICK_PRIMARY_STATES or state in MID_ATLANTIC_STATES:
            # Northeast & Mid-Atlantic -> Deer Tick primary
            for v_id, cand in scored_candidates:
                if v_id == "deer_tick":
                    cand.probabilityScore = 0.95
                    cand.probability = 0.95
                    cand.confidence = "high"
                    if "Erythema Migrans prior override applied (>90%)" not in cand.matchedFactors:
                        cand.matchedFactors.append("Erythema Migrans prior override applied (>90%)")
                elif v_id == "lone_star_tick":
                    cand.probabilityScore = 0.70
                    cand.probability = 0.70
                    cand.confidence = "moderate"
                elif v_id == "dog_tick":
                    cand.probabilityScore = 0.65
                    cand.probability = 0.65
                    cand.confidence = "moderate"
                elif v_id in ["mosquito", "flea", "bed_bug", "fire_ant", "chigger"]:
                    cand.probabilityScore = 0.04
                    cand.probability = 0.04
                    cand.confidence = "low"
        elif state in LONE_STAR_PRIMARY_STATES:
            # Deep South -> Lone Star Tick (STARI) primary if sensation is itching, or Deer Tick secondary
            for v_id, cand in scored_candidates:
                if v_id == "lone_star_tick" and sensation in ["intense_itch", "mild_itch"]:
                    cand.probabilityScore = 0.92
                    cand.probability = 0.92
                    cand.confidence = "high"
                    if "STARI targetoid rash prior override applied" not in cand.matchedFactors:
                        cand.matchedFactors.append("STARI targetoid rash prior override applied")
                elif v_id == "deer_tick":
                    cand.probabilityScore = 0.91
                    cand.probability = 0.91
                    cand.confidence = "high"
                    if "Lyme disease vector endemic prior" not in cand.matchedFactors:
                        cand.matchedFactors.append("Lyme disease vector endemic prior")
                elif v_id == "dog_tick":
                    cand.probabilityScore = 0.88
                    cand.probability = 0.88
                    cand.confidence = "high"
                elif v_id in ["mosquito", "flea", "bed_bug", "fire_ant", "chigger"]:
                    cand.probabilityScore = 0.04
                    cand.probability = 0.04
                    cand.confidence = "low"

    # Rule 2: Entomologist Taxonomy Overrides
    if detected_taxonomy:
        lower_tax = detected_taxonomy.lower()
        if "amblyomma americanum" in lower_tax:
            for v_id, cand in scored_candidates:
                if v_id == "lone_star_tick":
                    cand.probabilityScore = 0.98
                    cand.probability = 0.98
                    cand.confidence = "high"
        elif "dermacentor" in lower_tax:
            for v_id, cand in scored_candidates:
                if v_id == "dog_tick":
                    cand.probabilityScore = 0.98
                    cand.probability = 0.98
                    cand.confidence = "high"
        elif "solenopsis" in lower_tax or "fire ant" in lower_tax:
            for v_id, cand in scored_candidates:
                if v_id == "fire_ant":
                    cand.probabilityScore = 0.98
                    cand.probability = 0.98
                    cand.confidence = "high"

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
