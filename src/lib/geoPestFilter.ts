import { TriageContext, DermatologicalMorphology } from "./schema";

export interface VectorInfo {
  id: string;
  name: string;
  scientificName: string;
  endemicStates: string[] | "ALL";
  nonEndemicStates: string[];
  seasonalMultiplier: number[]; // 12 elements for months 0-11
  habitatScores: Record<string, number>;
  sensationScores: Record<string, number>;
  baseWeight: number;
  firstAidAdvice: string[];
  warningSigns: string[];
}

export const VECTOR_DATABASE: Record<string, VectorInfo> = {
  mosquito: {
    id: "mosquito",
    name: "Mosquito",
    scientificName: "Culicidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.1, 0.1, 0.3, 0.6, 0.9, 1.0, 1.0, 1.0, 0.8, 0.5, 0.2, 0.1],
    habitatScores: {
      yard_garden: 1.0,
      outdoor_other: 0.9,
      tall_grass_woods: 0.8,
      garage_shed: 0.4,
      indoor_other: 0.3,
      bed: 0.2,
    },
    sensationScores: {
      intense_itch: 1.0,
      mild_itch: 0.9,
      painless: 0.3,
      moderate_pain: 0.2,
      severe_pain: 0.1,
    },
    baseWeight: 0.25,
    firstAidAdvice: [
      "Wash the area gently with soap and water.",
      "Apply an ice pack for 10 minutes to decrease swelling and itch.",
      "Apply 1% hydrocortisone cream or calamine lotion to relieve itching.",
      "Avoid scratching to prevent secondary bacterial skin infections.",
    ],
    warningSigns: [
      "High fever, severe headache, or body aches (West Nile/Dengue screening).",
      "Spreading redness, warmth, or pus indicating secondary infection.",
    ],
  },
  blacklegged_tick: {
    id: "blacklegged_tick",
    name: "Blacklegged (Deer) Tick",
    scientificName: "Ixodes scapularis",
    endemicStates: [
      "US-VA", "US-MD", "US-PA", "US-NY", "US-NJ", "US-CT", "US-MA", "US-RI",
      "US-NH", "US-VT", "US-ME", "US-WI", "US-MN", "US-MI", "US-NC", "US-WV",
      "US-DE", "US-OH", "US-IN", "US-IL"
    ],
    nonEndemicStates: ["US-WA", "US-OR", "US-CA", "US-NV", "US-AZ", "US-NM", "US-AK", "US-HI"],
    seasonalMultiplier: [0.05, 0.05, 0.3, 0.7, 1.0, 1.0, 0.9, 0.6, 0.8, 0.8, 0.4, 0.1],
    habitatScores: {
      tall_grass_woods: 1.0,
      yard_garden: 0.7,
      outdoor_other: 0.5,
      garage_shed: 0.2,
      indoor_other: 0.1,
      bed: 0.1,
    },
    sensationScores: {
      painless: 1.0,
      mild_itch: 0.9,
      intense_itch: 0.5,
      moderate_pain: 0.3,
      severe_pain: 0.1,
    },
    baseWeight: 0.25,
    firstAidAdvice: [
      "If tick is attached, use fine-tipped tweezers to grasp as close to skin as possible and pull straight up.",
      "Clean bite area thoroughly with rubbing alcohol or soap and water.",
      "Save the tick in a sealed container or photo for potential identification.",
      "Monitor the site for 30 days for expanding targetoid Erythema Migrans rash.",
      "Consult a healthcare provider immediately for prophylactic antibiotics (e.g. Doxycycline) if Erythema Migrans develops."
    ],
    warningSigns: [
      "Expanding circular target/bullseye rash (Erythema Migrans hallmark of Lyme disease).",
      "Fever, chills, body aches, fatigue, or joint pain occurring within 3-30 days post-exposure.",
    ],
  },
  bed_bug: {
    id: "bed_bug",
    name: "Bed Bug",
    scientificName: "Cimex lectularius",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    habitatScores: {
      bed: 1.0,
      indoor_other: 0.9,
      garage_shed: 0.2,
      yard_garden: 0.1,
      tall_grass_woods: 0.05,
      outdoor_other: 0.05,
    },
    sensationScores: {
      intense_itch: 1.0,
      mild_itch: 0.8,
      painless: 0.6,
      moderate_pain: 0.2,
      severe_pain: 0.05,
    },
    baseWeight: 0.2,
    firstAidAdvice: [
      "Wash bites with soap and warm water.",
      "Apply OTC anti-itch cream (hydrocortisone) or take oral antihistamine.",
      "Inspect mattress seams, headboard, and box spring for small dark spots or cast skins.",
      "Wash and dry bedding on high heat (at least 120°F) for 30 minutes.",
    ],
    warningSigns: [
      "Severe allergic reaction or localized skin infection from excessive scratching.",
      "Multiple sequential linear bite clusters ('breakfast, lunch, dinner' pattern).",
    ],
  },
  flea: {
    id: "flea",
    name: "Flea",
    scientificName: "Siphonaptera",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.4, 0.4, 0.5, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.5, 0.4],
    habitatScores: {
      bed: 0.9,
      yard_garden: 0.8,
      indoor_other: 0.8,
      tall_grass_woods: 0.5,
      outdoor_other: 0.5,
      garage_shed: 0.4,
    },
    sensationScores: {
      intense_itch: 1.0,
      mild_itch: 0.8,
      moderate_pain: 0.2,
      painless: 0.2,
      severe_pain: 0.1,
    },
    baseWeight: 0.15,
    firstAidAdvice: [
      "Wash bites thoroughly with antiseptic soap.",
      "Apply ice or cold compress to reduce swelling.",
      "Use calamine lotion or topical antihistamines to curb itching.",
      "Treat household pets with vet-approved flea control medication.",
    ],
    warningSigns: [
      "Pus-filled blisters or signs of secondary bacterial infection.",
    ],
  },
  brown_recluse: {
    id: "brown_recluse",
    name: "Brown Recluse Spider",
    scientificName: "Loxosceles reclusa",
    endemicStates: [
      "US-TX", "US-OK", "US-KS", "US-MO", "US-AR", "US-LA", "US-MS", "US-AL",
      "US-TN", "US-KY", "US-IL", "US-IN", "US-GA", "US-NE", "US-IA"
    ],
    nonEndemicStates: [
      "US-WA", "US-OR", "US-CA", "US-ID", "US-NV", "US-AZ", "US-UT", "US-MT",
      "US-WY", "US-CO", "US-NM", "US-ND", "US-SD", "US-MN", "US-WI", "US-MI",
      "US-NY", "US-VT", "US-NH", "US-ME", "US-MA", "US-RI", "US-CT", "US-AK", "US-HI"
    ],
    seasonalMultiplier: [0.2, 0.2, 0.4, 0.6, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2],
    habitatScores: {
      garage_shed: 1.0,
      indoor_other: 0.8,
      bed: 0.5,
      yard_garden: 0.3,
      outdoor_other: 0.3,
      tall_grass_woods: 0.2,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      painless: 0.5,
      mild_itch: 0.3,
      intense_itch: 0.2,
    },
    baseWeight: 0.1,
    firstAidAdvice: [
      "Clean the bite area thoroughly with mild soap and water.",
      "Apply a cold compress or ice pack wrapped in a cloth (10 min on, 10 min off).",
      "Elevate the affected limb if possible to reduce localized edema.",
      "Keep calm and avoid heating the bite site.",
    ],
    warningSigns: [
      "Central bluish/purplish ulceration, necrotic skin lesion, or spreading black tissue.",
      "Nausea, vomiting, fever, muscle aches, or dark urine (signs of loxoscelism).",
    ],
  },
  black_widow: {
    id: "black_widow",
    name: "Black Widow Spider",
    scientificName: "Latrodectus",
    endemicStates: "ALL",
    nonEndemicStates: ["US-AK", "US-HI"],
    seasonalMultiplier: [0.2, 0.2, 0.4, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.8, 0.5, 0.2],
    habitatScores: {
      garage_shed: 1.0,
      yard_garden: 0.8,
      outdoor_other: 0.7,
      indoor_other: 0.4,
      tall_grass_woods: 0.4,
      bed: 0.1,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.8,
      intense_itch: 0.2,
      mild_itch: 0.1,
      painless: 0.1,
    },
    baseWeight: 0.1,
    firstAidAdvice: [
      "Wash the bite site with soap and water immediately.",
      "Apply an ice pack to slow venom absorption and ease pain.",
      "Do NOT apply a tourniquet or attempt to cut/suck the venom.",
      "Seek prompt medical evaluation for potential antivenom administration if symptoms progress.",
    ],
    warningSigns: [
      "Severe abdominal cramping or rigidity, muscle spasms, chest pain, or nausea.",
      "Profuse sweating, hypertension, or difficulty breathing (systemic latrodectism).",
    ],
  },
};

export function evaluateRegionalLikelihood(
  context: TriageContext,
  morphology?: DermatologicalMorphology
): Record<string, number> {
  const rawScores: Record<string, number> = {};

  const state = context.usState || "US-VA";
  const month = typeof context.monthIndex === "number" ? context.monthIndex : new Date().getMonth();
  const location = context.incidentLocation || "yard_garden";
  const sensation = context.primarySensation || "intense_itch";

  for (const [key, vector] of Object.entries(VECTOR_DATABASE)) {
    // 1. Geographic factor
    let geoFactor = 1.0;
    if (vector.nonEndemicStates.includes(state)) {
      geoFactor = 0.0; // Hard geographic penalty!
    } else if (Array.isArray(vector.endemicStates)) {
      if (vector.endemicStates.includes(state)) {
        geoFactor = 1.2;
      } else {
        geoFactor = 0.3;
      }
    }

    // 2. Seasonal factor
    const seasonalFactor = vector.seasonalMultiplier[month] ?? 0.5;

    // 3. Habitat factor
    const habitatFactor = vector.habitatScores[location] ?? 0.5;

    // 4. Sensation factor
    const sensationFactor = vector.sensationScores[sensation] ?? 0.5;

    // Calculate composite base score
    let score = vector.baseWeight * geoFactor * seasonalFactor * habitatFactor * sensationFactor;

    // 5. Morphological Overrides & Multipliers
    if (morphology) {
      // Linear grouped pattern ('breakfast, lunch, dinner') -> Bed Bug / Flea
      if (morphology.pattern === "linear_grouped") {
        if (key === "bed_bug") score *= 5.0;
        if (key === "flea") score *= 3.0;
      }
      // Solitary wheal + punctum bite mark -> Mosquito / Stings
      if (morphology.pattern === "solitary_wheal" && morphology.centralFeatures === "punctum_bite_mark") {
        if (key === "mosquito") score *= 3.0;
      }
      // Scattered papules or excoriated papule -> Flea / Bed Bug
      if (morphology.pattern === "scattered_papules" || morphology.primaryReaction === "excoriated_papule") {
        if (key === "flea") score *= 4.0;
        if (key === "bed_bug") score *= 2.0;
      }
      // Necrotic ulcer or ischemic purpura -> Brown Recluse
      if (
        morphology.centralFeatures === "necrotic_ulcer" ||
        morphology.primaryReaction === "ischemic_purpura" ||
        morphology.pattern === "indurated_plaque"
      ) {
        if (key === "brown_recluse") score *= 8.0;
      }
    }

    rawScores[key] = score;
  }

  // Mandatory Precedence Override for Erythema Migrans (Lyme Disease / Blacklegged Tick)
  if (
    morphology &&
    morphology.pattern === "annular_target" &&
    morphology.primaryReaction === "expanding_erythema"
  ) {
    // Automatically set Deer Tick / Lyme Disease likelihood to >= 0.90 regardless of minor sensory inputs
    const otherSum = Object.entries(rawScores)
      .filter(([k]) => k !== "blacklegged_tick")
      .reduce((sum, [, val]) => sum + val, 0);

    rawScores["blacklegged_tick"] = Math.max(rawScores["blacklegged_tick"] || 1.0, otherSum * 10.0);
  }

  // Normalize scores to probabilities summing to 1.0
  const totalScore = Object.values(rawScores).reduce((sum, val) => sum + val, 0);

  const probabilities: Record<string, number> = {};
  if (totalScore <= 0) {
    const count = Object.keys(VECTOR_DATABASE).length;
    for (const key of Object.keys(VECTOR_DATABASE)) {
      probabilities[key] = 1 / count;
    }
    return probabilities;
  }

  for (const [key, score] of Object.entries(rawScores)) {
    probabilities[key] = Math.round((score / totalScore) * 1000) / 1000;
  }

  return probabilities;
}
