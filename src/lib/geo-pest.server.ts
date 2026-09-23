// Ported from the BiteID engine repo (src/lib/geoPestFilter.ts).
// Server-only: vector database + regional/seasonal likelihood scoring.

export type DermatologicalMorphology = {
  pattern:
    | "solitary_wheal"
    | "annular_target"
    | "linear_grouped"
    | "scattered_papules"
    | "indurated_plaque"
    | "vesiculobullous_cluster";
  primaryLesion?:
    | "urticarial_wheal"
    | "papule"
    | "vesicle_bulla"
    | "sterile_pustule"
    | "plaque"
    | "eschar_necrosis"
    | "macule"
    | undefined;
  centralFeatures:
    | "punctum_bite_mark"
    | "twin_punctures"
    | "vesicle_pustule"
    | "clear_halo"
    | "necrotic_ulcer"
    | "none";
  primaryReaction:
    | "urticarial_hive"
    | "expanding_erythema"
    | "excoriated_papule"
    | "ischemic_purpura"
    | "vesiculobullous";
  estimatedDiameter?: "under_1cm" | "1_to_5cm" | "over_5cm" | "diffuse" | undefined;
  fitzpatrickTone?: "type_i_ii" | "type_iii_iv" | "type_v_vi" | "indeterminate" | undefined;
};

export type TriageContext = {
  usState?: string;
  monthIndex?: number;
  incidentLocation?: string;
  primarySensation?: string;
};

import type { VulnerablePopulationGuidance } from "./triage";
import { VECTOR_URGENCY_MAP, VULNERABLE_GUIDANCE_MAP } from "./vulnerable-guidance.data";

export interface VectorInfo {
  id: string;
  name: string;
  scientificName: string;
  endemicStates: string[] | "ALL";
  nonEndemicStates: string[];
  seasonalMultiplier: number[]; // 12 elements for months 0-11
  habitatScores: Record<string, number>;
  bodyLocationScores?: Record<string, number> | undefined;
  sensationScores: Record<string, number>;
  baseWeight: number;
  urgency?: "critical" | "urgent" | "non_urgent";
  associatedPathogens: string[];
  delayedRisks: string[];
  firstAidAdvice: string[];
  warningSigns: string[];
  vulnerableGuidance?: VulnerablePopulationGuidance;
}

export const VECTOR_DATABASE: Record<string, VectorInfo> = {
  mosquito: {
    id: "mosquito",
    bodyLocationScores: {
      lower_leg_ankle: 1.2,
      arms_hands: 1.4,
      face_head: 1.3,
      trunk_chest_back: 0.6,
      waist_groin_axilla: 0.3,
      feet: 1,
      any_unspecified: 1,
    },

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
    associatedPathogens: ["West Nile Virus", "Dengue Virus", "Eastern Equine Encephalitis"],
    delayedRisks: ["Secondary bacterial skin infection"],
    firstAidAdvice: ["Wash with soap and water.", "Apply ice pack or 1% hydrocortisone cream."],
    warningSigns: ["High fever, severe headache, or body aches."],
  },
  blacklegged_tick: {
    id: "blacklegged_tick",
    bodyLocationScores: {
      waist_groin_axilla: 1.6,
      lower_leg_ankle: 1.3,
      face_head: 1.2,
      trunk_chest_back: 1,
      arms_hands: 0.7,
      feet: 0.5,
      any_unspecified: 1,
    },

    name: "Blacklegged (Deer) Tick",
    scientificName: "Ixodes scapularis",
    endemicStates: [
      "US-VA",
      "US-MD",
      "US-PA",
      "US-NY",
      "US-NJ",
      "US-CT",
      "US-MA",
      "US-RI",
      "US-NH",
      "US-VT",
      "US-ME",
      "US-WI",
      "US-MN",
      "US-MI",
      "US-NC",
      "US-WV",
      "US-DE",
      "US-OH",
      "US-IN",
      "US-IL",
    ],
    nonEndemicStates: ["US-WA", "US-OR", "US-CA", "US-NV", "US-AZ", "US-NM", "US-AK", "US-HI"],
    seasonalMultiplier: [0.05, 0.05, 0.3, 0.7, 1.0, 1.0, 0.9, 0.6, 0.8, 0.8, 0.4, 0.1],
    habitatScores: {
      tall_grass_woods: 1.0,
      yard_garden: 0.8,
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
    baseWeight: 0.5,
    associatedPathogens: ["Lyme Disease", "Anaplasmosis", "Babesiosis"],
    delayedRisks: ["Post-Treatment Lyme Disease Syndrome"],
    firstAidAdvice: ["Grasp tick close to skin with tweezers and pull straight up."],
    warningSigns: ["Expanding circular target/bullseye rash (Erythema Migrans) >5cm."],
  },
  lone_star_tick: {
    id: "lone_star_tick",
    bodyLocationScores: {
      lower_leg_ankle: 1.5,
      waist_groin_axilla: 1.5,
      trunk_chest_back: 1,
      arms_hands: 0.7,
      face_head: 0.8,
      feet: 0.6,
      any_unspecified: 1,
    },

    name: "Lone Star Tick",
    scientificName: "Amblyomma americanum",
    endemicStates: [
      "US-VA",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-FL",
      "US-AL",
      "US-MS",
      "US-TN",
      "US-KY",
      "US-WV",
      "US-MD",
      "US-DE",
      "US-NJ",
      "US-PA",
      "US-NY",
      "US-OH",
      "US-IN",
      "US-IL",
      "US-MO",
      "US-AR",
      "US-LA",
      "US-TX",
      "US-OK",
      "US-KS",
    ],
    nonEndemicStates: ["US-WA", "US-OR", "US-CA", "US-NV", "US-AZ", "US-UT", "US-AK", "US-HI"],
    seasonalMultiplier: [0.05, 0.1, 0.4, 0.8, 1.0, 1.0, 1.0, 0.9, 0.6, 0.3, 0.1, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      yard_garden: 0.9,
      outdoor_other: 0.7,
      garage_shed: 0.3,
      indoor_other: 0.1,
      bed: 0.1,
    },
    sensationScores: {
      painless: 0.9,
      mild_itch: 1.0,
      intense_itch: 0.9,
      moderate_pain: 0.4,
      severe_pain: 0.1,
    },
    baseWeight: 0.3,
    associatedPathogens: ["Ehrlichiosis", "STARI"],
    delayedRisks: ["Alpha-gal syndrome (red meat allergy)"],
    firstAidAdvice: ["Grasp tick close to skin with tweezers and pull straight up."],
    warningSigns: ["Delayed allergic reaction 3-8h after eating red meat."],
  },
  dog_tick: {
    id: "dog_tick",
    bodyLocationScores: {
      face_head: 1.6,
      waist_groin_axilla: 1.3,
      lower_leg_ankle: 1.2,
      trunk_chest_back: 1,
      arms_hands: 0.8,
      feet: 0.5,
      any_unspecified: 1,
    },

    name: "American Dog Tick",
    scientificName: "Dermacentor variabilis",
    endemicStates: [
      "US-VA",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-FL",
      "US-AL",
      "US-MS",
      "US-TN",
      "US-KY",
      "US-WV",
      "US-MD",
      "US-DE",
      "US-NJ",
      "US-PA",
      "US-NY",
      "US-OH",
      "US-IN",
      "US-IL",
      "US-MO",
      "US-AR",
      "US-LA",
      "US-TX",
      "US-OK",
      "US-KS",
      "US-CA",
      "US-AZ",
    ],
    nonEndemicStates: ["US-AK", "US-HI"],
    seasonalMultiplier: [0.05, 0.1, 0.3, 0.7, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2, 0.1, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      yard_garden: 0.9,
      outdoor_other: 0.7,
      garage_shed: 0.3,
      indoor_other: 0.2,
      bed: 0.1,
    },
    sensationScores: {
      painless: 1.0,
      mild_itch: 0.8,
      intense_itch: 0.4,
      moderate_pain: 0.3,
      severe_pain: 0.1,
    },
    baseWeight: 0.3,
    associatedPathogens: ["Rocky Mountain Spotted Fever", "Tularemia"],
    delayedRisks: ["RMSF Vasculitis & Systemic Illness"],
    firstAidAdvice: ["Remove tick immediately with tweezers."],
    warningSigns: ["High fever and spotted rash spreading inward from wrists/ankles."],
  },
  bed_bug: {
    id: "bed_bug",
    bodyLocationScores: {
      trunk_chest_back: 1.5,
      arms_hands: 1.4,
      face_head: 1.3,
      lower_leg_ankle: 0.8,
      feet: 0.7,
      waist_groin_axilla: 0.6,
      any_unspecified: 1,
    },

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
    baseWeight: 0.45,
    associatedPathogens: [],
    delayedRisks: ["Secondary excoriation infection"],
    firstAidAdvice: ["Wash bites with soap and water.", "Inspect mattress seams."],
    warningSigns: ["Multiple linear bite clusters ('breakfast, lunch, dinner')."],
  },
  flea: {
    id: "flea",
    bodyLocationScores: {
      lower_leg_ankle: 1.8,
      feet: 1.4,
      waist_groin_axilla: 0.4,
      arms_hands: 0.4,
      trunk_chest_back: 0.4,
      face_head: 0.2,
      any_unspecified: 1,
    },

    name: "Flea",
    scientificName: "Ctenocephalides felis",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.4, 0.4, 0.5, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.5, 0.4],
    habitatScores: {
      bed: 0.8,
      yard_garden: 0.9,
      indoor_other: 0.9,
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
    baseWeight: 0.25,
    associatedPathogens: ["Bartonellosis (Cat Scratch Disease)"],
    delayedRisks: ["Secondary bacterial infection"],
    firstAidAdvice: ["Wash bites with soap and cold water."],
    warningSigns: ["Multiple small itchy papules around ankles."],
  },
  brown_recluse: {
    id: "brown_recluse",
    bodyLocationScores: {
      trunk_chest_back: 1.5,
      arms_hands: 1.4,
      waist_groin_axilla: 1.3,
      lower_leg_ankle: 0.9,
      face_head: 0.5,
      feet: 1,
      any_unspecified: 1,
    },

    name: "Brown Recluse Spider",
    scientificName: "Loxosceles reclusa",
    endemicStates: [
      "US-TX",
      "US-OK",
      "US-KS",
      "US-MO",
      "US-AR",
      "US-LA",
      "US-MS",
      "US-AL",
      "US-TN",
      "US-KY",
      "US-IL",
      "US-IN",
      "US-GA",
      "US-NE",
      "US-IA",
    ],
    nonEndemicStates: [
      "US-WA",
      "US-OR",
      "US-CA",
      "US-ID",
      "US-NV",
      "US-AZ",
      "US-UT",
      "US-MT",
      "US-WY",
      "US-CO",
      "US-NM",
      "US-ND",
      "US-SD",
      "US-MN",
      "US-WI",
      "US-MI",
      "US-NY",
      "US-VT",
      "US-NH",
      "US-ME",
      "US-MA",
      "US-RI",
      "US-CT",
      "US-AK",
      "US-HI",
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
    baseWeight: 0.25,
    associatedPathogens: ["Sphingomyelinase D venom"],
    delayedRisks: ["Loxoscelism (Dermonecrosis)"],
    firstAidAdvice: ["Clean wound with soap and water.", "Apply cold compress."],
    warningSigns: ["Central sunken violaceous macule surrounded by pale halo."],
  },
  black_widow: {
    id: "black_widow",
    bodyLocationScores: {
      arms_hands: 1.7,
      feet: 1.5,
      lower_leg_ankle: 1.1,
      trunk_chest_back: 0.5,
      waist_groin_axilla: 0.4,
      face_head: 0.3,
      any_unspecified: 1,
    },

    name: "Black Widow Spider",
    scientificName: "Latrodectus mactans",
    endemicStates: "ALL",
    nonEndemicStates: ["US-AK", "US-HI"],
    seasonalMultiplier: [0.2, 0.2, 0.4, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.8, 0.5, 0.2],
    habitatScores: {
      garage_shed: 1.0,
      outdoor_other: 0.9,
      yard_garden: 0.8,
      indoor_other: 0.4,
      tall_grass_woods: 0.4,
      bed: 0.1,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      intense_itch: 0.2,
      mild_itch: 0.1,
      painless: 0.1,
    },
    baseWeight: 0.25,
    associatedPathogens: ["Alpha-latrotoxin neurovenom"],
    delayedRisks: ["Latrodectism (Severe Muscle Spasms & Pain)"],
    firstAidAdvice: ["Wash bite site with soap and water.", "Apply cold compress."],
    warningSigns: ["Severe abdominal muscle rigidity, chest pain, profuse sweating."],
  },
  fire_ant: {
    id: "fire_ant",
    bodyLocationScores: {
      feet: 1.8,
      lower_leg_ankle: 1.7,
      arms_hands: 1.4,
      trunk_chest_back: 0.4,
      waist_groin_axilla: 0.4,
      face_head: 0.2,
      any_unspecified: 1,
    },

    name: "Fire Ant",
    scientificName: "Solenopsis invicta",
    endemicStates: [
      "US-TX",
      "US-FL",
      "US-GA",
      "US-AL",
      "US-MS",
      "US-LA",
      "US-SC",
      "US-NC",
      "US-TN",
      "US-AR",
      "US-OK",
      "US-VA",
      "US-CA",
    ],
    nonEndemicStates: [
      "US-ME",
      "US-NH",
      "US-VT",
      "US-MA",
      "US-NY",
      "US-WI",
      "US-MN",
      "US-AK",
      "US-HI",
    ],
    seasonalMultiplier: [0.2, 0.3, 0.6, 0.8, 1.0, 1.0, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2],
    habitatScores: {
      yard_garden: 1.0,
      outdoor_other: 0.9,
      tall_grass_woods: 0.5,
      garage_shed: 0.3,
      indoor_other: 0.1,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.8,
      intense_itch: 0.3,
      mild_itch: 0.1,
      painless: 0.05,
    },
    baseWeight: 0.25,
    associatedPathogens: ["Solenopsin alkaloid venom"],
    delayedRisks: ["Sterile pustule development"],
    firstAidAdvice: ["Wash stings gently with soap and water.", "Apply cold compress."],
    warningSigns: ["Multiple burning stings forming sterile pustules."],
  },
  chigger: {
    id: "chigger",
    bodyLocationScores: {
      waist_groin_axilla: 1.9,
      lower_leg_ankle: 1.7,
      arms_hands: 0.5,
      trunk_chest_back: 0.6,
      face_head: 0.2,
      feet: 0.6,
      any_unspecified: 1,
    },

    name: "Chigger (Harvest Mite)",
    scientificName: "Trombiculidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.1, 0.3, 0.6, 0.9, 1.0, 1.0, 1.0, 0.8, 0.5, 0.2, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      yard_garden: 0.9,
      outdoor_other: 0.6,
      garage_shed: 0.2,
      indoor_other: 0.1,
      bed: 0.1,
    },
    sensationScores: {
      intense_itch: 1.0,
      mild_itch: 0.7,
      moderate_pain: 0.2,
      painless: 0.1,
      severe_pain: 0.05,
    },
    baseWeight: 0.25,
    associatedPathogens: [],
    delayedRisks: ["Severe excoriation & secondary infection"],
    firstAidAdvice: ["Take a hot, soapy shower immediately after exposure."],
    warningSigns: ["Intensely itchy red papules around waistbands or ankles."],
  },
  kissing_bug: {
    id: "kissing_bug",
    bodyLocationScores: {
      face_head: 2,
      trunk_chest_back: 0.9,
      arms_hands: 0.9,
      lower_leg_ankle: 0.3,
      feet: 0.3,
      waist_groin_axilla: 0.3,
      any_unspecified: 1,
    },

    name: "Kissing Bug (Triatomine)",
    scientificName: "Triatoma spp.",
    endemicStates: ["US-TX", "US-AZ", "US-NM", "US-CA", "US-FL", "US-GA", "US-AL", "US-LA"],
    nonEndemicStates: ["US-NY", "US-MA", "US-ME", "US-WI", "US-MN", "US-AK", "US-HI"],
    seasonalMultiplier: [0.2, 0.3, 0.5, 0.8, 1.0, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2, 0.1],
    habitatScores: {
      indoor_other: 0.9,
      bed: 0.9,
      garage_shed: 0.8,
      outdoor_other: 0.4,
      yard_garden: 0.3,
      tall_grass_woods: 0.2,
    },
    sensationScores: {
      painless: 1.0,
      mild_itch: 0.8,
      intense_itch: 0.4,
      moderate_pain: 0.2,
      severe_pain: 0.05,
    },
    baseWeight: 0.25,
    associatedPathogens: ["Chagas Disease"],
    delayedRisks: ["Chronic Chagas Cardiomyopathy"],
    firstAidAdvice: ["Wash bite site thoroughly with soap and water."],
    warningSigns: ["Painless facial/eyelid edema (Romaña sign)."],
  },
  honey_bee: {
    id: "honey_bee",
    bodyLocationScores: {
      feet: 1.7,
      arms_hands: 1.6,
      face_head: 1.3,
      lower_leg_ankle: 0.8,
      trunk_chest_back: 0.5,
      waist_groin_axilla: 0.2,
      any_unspecified: 1,
    },

    name: "Honey Bee",
    scientificName: "Apis mellifera",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.1, 0.2, 0.5, 0.8, 1.0, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2, 0.1],
    habitatScores: {
      yard_garden: 1.0,
      outdoor_other: 0.9,
      tall_grass_woods: 0.6,
      garage_shed: 0.3,
      indoor_other: 0.2,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      intense_itch: 0.2,
      mild_itch: 0.1,
      painless: 0.05,
    },
    baseWeight: 0.35,
    associatedPathogens: [],
    delayedRisks: ["Anaphylaxis (IgE allergy)", "Secondary infection"],
    firstAidAdvice: [
      "Scrape stinger off immediately with fingernail or card. Wash with soap and water.",
    ],
    warningSigns: ["Barbed stinger in skin, difficulty breathing, or facial swelling."],
  },
  wasp: {
    id: "wasp",
    bodyLocationScores: {
      arms_hands: 1.7,
      face_head: 1.5,
      feet: 1.3,
      lower_leg_ankle: 1,
      trunk_chest_back: 0.7,
      waist_groin_axilla: 0.3,
      any_unspecified: 1,
    },

    name: "Wasp / Yellow Jacket",
    scientificName: "Vespula / Polistes spp.",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.1, 0.2, 0.5, 0.8, 1.0, 1.0, 1.0, 1.0, 0.8, 0.5, 0.2, 0.1],
    habitatScores: {
      yard_garden: 1.0,
      outdoor_other: 0.9,
      garage_shed: 0.8,
      tall_grass_woods: 0.5,
      indoor_other: 0.3,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      intense_itch: 0.2,
      mild_itch: 0.1,
      painless: 0.05,
    },
    baseWeight: 0.35,
    associatedPathogens: [],
    delayedRisks: ["Anaphylactic Shock", "Toxic reaction"],
    firstAidAdvice: ["Wash with soap and cold water. Apply ice pack."],
    warningSigns: ["Rapidly expanding red welt, dizziness, or breathing difficulty."],
  },
  scorpion: {
    id: "scorpion",
    bodyLocationScores: {
      feet: 1.9,
      arms_hands: 1.5,
      lower_leg_ankle: 1.1,
      trunk_chest_back: 0.4,
      waist_groin_axilla: 0.3,
      face_head: 0.1,
      any_unspecified: 1,
    },

    name: "Bark Scorpion",
    scientificName: "Centruroides sculpturatus",
    endemicStates: ["US-AZ", "US-NM", "US-NV", "US-CA", "US-TX", "US-UT"],
    nonEndemicStates: ["US-NY", "US-MA", "US-ME", "US-WI", "US-MN", "US-AK", "US-HI"],
    seasonalMultiplier: [0.2, 0.3, 0.6, 0.8, 1.0, 1.0, 1.0, 1.0, 0.8, 0.6, 0.3, 0.2],
    habitatScores: {
      garage_shed: 1.0,
      indoor_other: 0.9,
      outdoor_other: 0.8,
      yard_garden: 0.6,
      bed: 0.4,
      tall_grass_woods: 0.3,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.7,
      painless: 0.1,
      intense_itch: 0.1,
      mild_itch: 0.1,
    },
    baseWeight: 0.4,
    associatedPathogens: ["Neurotoxic venom"],
    delayedRisks: ["Autonomic hyperactivation", "Neurotoxicity"],
    firstAidAdvice: ["Wash sting site with soap and water. Apply cool compress."],
    warningSigns: ["Severe burning pain, localized numbness/tingling, or muscle twitching."],
  },
  horse_fly: {
    id: "horse_fly",
    bodyLocationScores: {
      face_head: 1.7,
      arms_hands: 1.4,
      trunk_chest_back: 1.3,
      lower_leg_ankle: 1.1,
      feet: 0.6,
      waist_groin_axilla: 0.4,
      any_unspecified: 1,
    },

    name: "Horse Fly / Deer Fly",
    scientificName: "Tabanidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.1, 0.3, 0.6, 0.9, 1.0, 1.0, 1.0, 0.7, 0.4, 0.1, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      outdoor_other: 0.9,
      yard_garden: 0.7,
      garage_shed: 0.3,
      indoor_other: 0.2,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      intense_itch: 0.3,
      mild_itch: 0.1,
      painless: 0.05,
    },
    baseWeight: 0.35,
    associatedPathogens: ["Tularemia"],
    delayedRisks: ["Secondary infection of laceration"],
    firstAidAdvice: ["Clean bite wound with soap and water. Apply hydrocortisone cream."],
    warningSigns: ["Painful lacerated bite mark with central bleeding punctum."],
  },
  lice: {
    id: "lice",
    bodyLocationScores: {
      face_head: 2,
      trunk_chest_back: 1.3,
      waist_groin_axilla: 0.8,
      arms_hands: 0.2,
      lower_leg_ankle: 0.1,
      feet: 0.1,
      any_unspecified: 1,
    },

    name: "Head / Body Lice",
    scientificName: "Pediculus humanus",
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
      painless: 0.3,
      moderate_pain: 0.1,
      severe_pain: 0.05,
    },
    baseWeight: 0.35,
    associatedPathogens: ["Louse-borne Typhus", "Trench Fever"],
    delayedRisks: ["Secondary excoriation infection"],
    firstAidAdvice: ["Use pediculicide treatment or shampoo. Wash bedding in hot water."],
    warningSigns: ["Itchy papules around nape of neck or along clothing seams."],
  },
  no_see_um: {
    id: "no_see_um",
    name: "No-see-ums / Biting Midges",
    scientificName: "Ceratopogonidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.1, 0.2, 0.4, 0.7, 1.0, 1.0, 1.0, 1.0, 0.8, 0.5, 0.2, 0.1],
    habitatScores: {
      outdoor_other: 1.0,
      yard_garden: 0.9,
      tall_grass_woods: 0.8,
      garage_shed: 0.3,
      indoor_other: 0.2,
      bed: 0.1,
    },
    sensationScores: {
      intense_itch: 1.0,
      mild_itch: 0.8,
      painless: 0.2,
      moderate_pain: 0.2,
      severe_pain: 0.1,
    },
    baseWeight: 0.3,
    associatedPathogens: ["Mansonella filariasis (rare)"],
    delayedRisks: ["Severe persistent pruritus & excoriation"],
    firstAidAdvice: ["Wash with cool water and soap. Apply 1% hydrocortisone cream."],
    warningSigns: ["Clusters of microscopic pinpoint red dots with severe delayed itching."],
  },
  black_fly: {
    id: "black_fly",
    bodyLocationScores: {
      face_head: 1.9,
      arms_hands: 1.3,
      lower_leg_ankle: 1,
      trunk_chest_back: 0.7,
      waist_groin_axilla: 0.3,
      feet: 0.5,
      any_unspecified: 1,
    },

    name: "Black Fly / Buffalo Gnat",
    scientificName: "Simuliidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.1, 0.4, 0.8, 1.0, 1.0, 0.9, 0.6, 0.3, 0.1, 0.05, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      outdoor_other: 0.9,
      yard_garden: 0.6,
      garage_shed: 0.2,
      indoor_other: 0.1,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.9,
      intense_itch: 0.3,
      mild_itch: 0.1,
      painless: 0.05,
    },
    baseWeight: 0.35,
    associatedPathogens: ["Bovine Onchocerca"],
    delayedRisks: ["Black fly fever from multiple bites"],
    firstAidAdvice: ["Clean biting slash wound with warm soap and water. Apply cool compress."],
    warningSigns: ["Painful slash bite mark with central hemorrhagic blood spot."],
  },
  blister_beetle: {
    id: "blister_beetle",
    bodyLocationScores: {
      face_head: 1.7,
      arms_hands: 1.5,
      trunk_chest_back: 1.1,
      lower_leg_ankle: 1.1,
      feet: 0.8,
      waist_groin_axilla: 0.4,
      any_unspecified: 1,
    },

    name: "Blister Beetle",
    scientificName: "Meloidae",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.1, 0.3, 0.6, 0.9, 1.0, 1.0, 1.0, 0.8, 0.4, 0.1, 0.05],
    habitatScores: {
      yard_garden: 1.0,
      outdoor_other: 0.9,
      tall_grass_woods: 0.8,
      garage_shed: 0.4,
      indoor_other: 0.3,
      bed: 0.1,
    },
    sensationScores: {
      burning: 1.0,
      painless: 0.7,
      mild_itch: 0.4,
      moderate_pain: 0.3,
      severe_pain: 0.1,
      intense_itch: 0.1,
    },
    baseWeight: 0.35,
    associatedPathogens: ["Cantharidin Chemical Dermatitis"],
    delayedRisks: ["Secondary infection if blister ruptures"],
    firstAidAdvice: ["Wash with cool soapy water to remove cantharidin. Do NOT pop blisters."],
    warningSigns: ["Tense translucent fluid-filled blister without central bite punctum mark."],
  },
  pit_viper: {
    id: "pit_viper",
    bodyLocationScores: {
      feet: 1.8,
      lower_leg_ankle: 1.9,
      arms_hands: 1.4,
      trunk_chest_back: 0.2,
      waist_groin_axilla: 0.1,
      face_head: 0.1,
      any_unspecified: 1,
    },
    name: "Pit Viper (Copperhead / Rattlesnake)",
    scientificName: "Crotalinae",
    endemicStates: "ALL",
    nonEndemicStates: ["US-AK", "US-HI"],
    seasonalMultiplier: [0.05, 0.1, 0.3, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.6, 0.2, 0.05],
    habitatScores: {
      tall_grass_woods: 1.0,
      outdoor_other: 0.9,
      yard_garden: 0.7,
      garage_shed: 0.5,
      indoor_other: 0.1,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.7,
      painless: 0.05,
      intense_itch: 0.05,
      mild_itch: 0.05,
    },
    baseWeight: 0.25,
    associatedPathogens: ["Hemotoxic & Cytotoxic Envenomation"],
    delayedRisks: ["Tissue necrosis, compartment syndrome, coagulopathy"],
    firstAidAdvice: [
      "Keep calm and immediately immobilize the bitten limb at heart level.",
      "Remove rings, watches, and tight clothing before swelling expands.",
      "DO NOT apply a tourniquet, DO NOT ice, DO NOT cut or attempt venom suction.",
      "Call 911 or dispatch Emergency Satellite SOS for urgent antivenom transport.",
    ],
    warningSigns: [
      "Two distinct deep puncture marks with rapid spreading swelling, severe burning pain, or ecchymosis.",
    ],
  },
  coral_snake: {
    id: "coral_snake",
    bodyLocationScores: {
      feet: 1.6,
      lower_leg_ankle: 1.8,
      arms_hands: 1.9,
      trunk_chest_back: 0.1,
      waist_groin_axilla: 0.1,
      face_head: 0.1,
      any_unspecified: 1,
    },
    name: "Coral Snake",
    scientificName: "Micrurus fulvius / tener",
    endemicStates: [
      "US-FL",
      "US-GA",
      "US-SC",
      "US-NC",
      "US-AL",
      "US-MS",
      "US-LA",
      "US-TX",
      "US-AR",
    ],
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.1, 0.4, 0.8, 1.0, 1.0, 0.9, 0.9, 0.9, 0.6, 0.2, 0.05],
    habitatScores: {
      yard_garden: 1.0,
      tall_grass_woods: 1.0,
      outdoor_other: 0.8,
      garage_shed: 0.5,
      indoor_other: 0.1,
      bed: 0.05,
    },
    sensationScores: {
      mild_pain: 0.9,
      moderate_pain: 0.6,
      painless: 0.8,
      severe_pain: 0.2,
      intense_itch: 0.05,
      mild_itch: 0.1,
    },
    baseWeight: 0.2,
    associatedPathogens: ["Neurotoxic Envenomation (Postsynaptic Neurotoxin)"],
    delayedRisks: ["Respiratory paralysis, ptosis, bulbar palsy, respiratory arrest"],
    firstAidAdvice: [
      "CRITICAL: Keep victim completely calm and still; immobilize the bitten limb at heart level.",
      "Do NOT wait for symptoms or pain — coral snake venom causes minimal local swelling but causes delayed respiratory collapse.",
      "Call 911 / emergency services immediately for transport to an antivenin-capable facility (North American Coral Snake Antivenin).",
      "DO NOT cut, apply ice, tourniquet, or use suction devices.",
    ],
    warningSigns: [
      "Small subtle puncture marks followed hours later by drooping eyelids (ptosis), double vision, difficulty swallowing, or slurred speech.",
    ],
  },
  giant_centipede: {
    id: "giant_centipede",
    bodyLocationScores: {
      feet: 1.8,
      lower_leg_ankle: 1.7,
      arms_hands: 1.5,
      trunk_chest_back: 0.5,
      waist_groin_axilla: 0.3,
      face_head: 0.2,
      any_unspecified: 1,
    },
    name: "Giant Desert Centipede",
    scientificName: "Scolopendra heros / polymorpha",
    endemicStates: [
      "US-TX",
      "US-AZ",
      "US-NM",
      "US-UT",
      "US-NV",
      "US-CA",
      "US-OK",
      "US-AR",
      "US-LA",
      "US-MO",
    ],
    nonEndemicStates: [],
    seasonalMultiplier: [0.1, 0.1, 0.4, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.6, 0.2, 0.1],
    habitatScores: {
      outdoor_other: 1.0,
      garage_shed: 0.8,
      yard_garden: 0.8,
      tall_grass_woods: 0.6,
      indoor_other: 0.4,
      bed: 0.2,
    },
    sensationScores: {
      severe_pain: 1.0,
      moderate_pain: 0.8,
      mild_pain: 0.1,
      intense_itch: 0.1,
      painless: 0.01,
    },
    baseWeight: 0.2,
    associatedPathogens: ["Secondary bacterial infection"],
    delayedRisks: ["Local tissue necrosis, cellulitis, lymphangitis"],
    firstAidAdvice: [
      "Wash thoroughly with soap and water.",
      "Immerse bite area in hot water (as hot as comfortably tolerable, 104°F–113°F / 40°C–45°C) or apply hot compresses to denature heat-sensitive toxins.",
      "Apply ice packs afterwards if heat is unavailable or for residual throbbing edema.",
      "Take oral analgesics (ibuprofen or acetaminophen) and ensure tetanus vaccination is up to date.",
    ],
    warningSigns: [
      "Paired claw puncture marks with excruciating burning pain, spreading red streaking (lymphangitis), or expanding dark necrosis.",
    ],
  },
  asp_caterpillar: {
    id: "asp_caterpillar",
    bodyLocationScores: {
      arms_hands: 1.9,
      face_head: 1.2,
      trunk_chest_back: 0.9,
      lower_leg_ankle: 0.8,
      feet: 0.5,
      waist_groin_axilla: 0.3,
      any_unspecified: 1,
    },
    name: "Puss Caterpillar (Asp)",
    scientificName: "Megalopyge opercularis",
    endemicStates: [
      "US-TX",
      "US-FL",
      "US-GA",
      "US-SC",
      "US-NC",
      "US-VA",
      "US-MD",
      "US-AL",
      "US-MS",
      "US-LA",
      "US-AR",
      "US-OK",
    ],
    nonEndemicStates: [],
    seasonalMultiplier: [0.05, 0.05, 0.2, 0.5, 0.8, 1.0, 0.9, 0.9, 1.0, 0.8, 0.3, 0.05],
    habitatScores: {
      yard_garden: 1.0,
      tall_grass_woods: 1.0,
      outdoor_other: 0.9,
      garage_shed: 0.3,
      indoor_other: 0.1,
      bed: 0.05,
    },
    sensationScores: {
      severe_pain: 1.0,
      intense_itch: 0.9,
      moderate_pain: 0.7,
      mild_pain: 0.1,
      painless: 0.01,
    },
    baseWeight: 0.25,
    associatedPathogens: ["Urticating spine envenomation"],
    delayedRisks: ["Radiating neuropathic limb pain, regional lymphadenopathy, systemic shock"],
    firstAidAdvice: [
      "DO NOT rub or brush with a cloth — this drives spines deeper and breaks off more venom sacs.",
      "Apply adhesive tape (duct tape, cellophane tape) over the sting site and gently strip it off repeatedly to extract embedded spines.",
      "Wash area gently with soap and cool water.",
      "Apply an ice pack to suppress burning and pain; apply 1% hydrocortisone cream for itching.",
      "Seek urgent care if pain radiates up the limb to the chest/axilla, or if nausea/vomiting occurs.",
    ],
    warningSigns: [
      "Characteristic 'grid-like' or 'tire-tread' hemorrhagic track pattern accompanied by severe throbbing pain radiating up the limb, nausea, or breathing distress.",
    ],
  },

  jellyfish: {
    id: "jellyfish",
    name: "Jellyfish / Man O' War",
    scientificName: "Physalia physalis / Chrysaora",
    endemicStates: [
      "US-FL",
      "US-TX",
      "US-CA",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-AL",
      "US-MS",
      "US-LA",
      "US-VA",
      "US-MD",
      "US-NJ",
      "US-NY",
      "US-MA",
      "US-RI",
      "US-CT",
      "US-DE",
      "US-HI",
      "US-WA",
      "US-OR",
    ],
    nonEndemicStates: [
      "US-CO",
      "US-WY",
      "US-MT",
      "US-ID",
      "US-UT",
      "US-NV",
      "US-AZ",
      "US-NM",
      "US-ND",
      "US-SD",
      "US-NE",
      "US-KS",
      "US-OK",
      "US-IA",
      "US-MO",
      "US-AR",
      "US-MN",
      "US-WI",
      "US-IL",
      "US-IN",
      "US-KY",
      "US-TN",
      "US-WV",
      "US-OH",
      "US-PA",
      "US-VT",
    ],
    seasonalMultiplier: [0.3, 0.4, 0.6, 0.8, 1.0, 1.3, 1.5, 1.5, 1.3, 0.9, 0.6, 0.4],
    habitatScores: {
      beach_coastal: 2.5,
      open_water_lake: 0.1,
      woods_trail: 0.0,
      yard_garden: 0.0,
      indoor_home: 0.0,
      other_outdoor: 0.2,
    },
    bodyLocationScores: {
      lower_leg_ankle: 1.4,
      arms_hands: 1.4,
      trunk_chest_back: 1.1,
      face_head: 0.5,
      feet: 1.3,
      waist_groin_axilla: 0.8,
      any_unspecified: 1.0,
    },
    sensationScores: {
      severe_pain: 1.5,
      moderate_pain: 1.2,
      burning: 1.5,
      intense_itch: 0.8,
      mild_itch: 0.2,
      painless: 0.0,
    },
    baseWeight: 0.9,
    associatedPathogens: [
      "Nematocyst envenomation (hypnotoxin)",
      "Secondary marine Vibrio infection",
    ],
    delayedRisks: [
      "Recurrent contact dermatitis",
      "Anaphylaxis in sensitized individuals",
      "Scarring hyperpigmentation",
    ],
    firstAidAdvice: [
      "Immediately rinse area thoroughly with SEA WATER to flush away unfired stinging cells. NEVER use fresh water (osmotic shift causes nematocysts to fire).",
      "Do NOT rub with sand or towels, and do NOT apply urine (myth; triggers mass nematocyst discharge).",
      "Carefully lift off remaining tentacle fragments using tweezers, a stick, or a credit card edge.",
      "Immerse the affected area in non-scalding HOT water (110°F–113°F / 43°C–45°C) or apply hot packs for 20–45 minutes to denature heat-sensitive toxins.",
      "Seek emergency care immediately if experiencing shortness of breath, chest tightness, throat swelling, dizziness, or widespread blistering.",
    ],
    warningSigns: [
      "Linear, whip-like urticarial tracks with beaded sting marks, accompanied by systemic nausea, breathing difficulty, or confusion.",
    ],
  },

  stingray: {
    id: "stingray",
    name: "Stingray",
    scientificName: "Dasyatidae (Hypanus americanus / sabina)",
    endemicStates: [
      "US-FL",
      "US-TX",
      "US-CA",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-AL",
      "US-MS",
      "US-LA",
      "US-VA",
      "US-MD",
      "US-DE",
      "US-NJ",
      "US-HI",
    ],
    nonEndemicStates: [
      "US-CO",
      "US-WY",
      "US-MT",
      "US-ID",
      "US-UT",
      "US-NV",
      "US-AZ",
      "US-NM",
      "US-ND",
      "US-SD",
      "US-NE",
      "US-KS",
      "US-OK",
      "US-IA",
      "US-MO",
      "US-AR",
      "US-MN",
      "US-WI",
      "US-IL",
      "US-IN",
      "US-KY",
      "US-TN",
      "US-WV",
      "US-OH",
      "US-PA",
      "US-VT",
    ],
    seasonalMultiplier: [0.3, 0.4, 0.6, 0.9, 1.2, 1.5, 1.5, 1.4, 1.2, 0.8, 0.5, 0.3],
    habitatScores: {
      beach_coastal: 2.5,
      open_water_lake: 0.0,
      woods_trail: 0.0,
      yard_garden: 0.0,
      indoor_home: 0.0,
      other_outdoor: 0.1,
    },
    bodyLocationScores: {
      feet: 1.8,
      lower_leg_ankle: 1.5,
      arms_hands: 0.3,
      trunk_chest_back: 0.1,
      face_head: 0.0,
      waist_groin_axilla: 0.0,
      any_unspecified: 1.0,
    },
    sensationScores: {
      severe_pain: 2.0,
      moderate_pain: 1.2,
      burning: 1.4,
      intense_itch: 0.1,
      mild_itch: 0.0,
      painless: 0.0,
    },
    baseWeight: 0.8,
    associatedPathogens: [
      "Proteinaceous cardiotoxic / myotoxic venom",
      "Vibrio vulnificus",
      "Aeromonas hydrophila",
    ],
    delayedRisks: [
      "Retained radiopaque serrated spine barb fragments",
      "Secondary marine soft-tissue necrosis",
      "Reflex sympathetic dystrophy / osteomyelitis",
    ],
    firstAidAdvice: [
      "IMMEDIATELY immerse the wounded foot or leg in non-scalding HOT water (110°F–115°F / 43°C–46°C) for 30–90 minutes. Stingray venom proteins are heat-labile and break down in hot water, providing rapid dramatic pain relief.",
      "Cleanse the wound thoroughly with clean water and mild soap after heat immersion.",
      "Do NOT attempt deep surgical extraction of embedded barbs yourself; have a medical clinician inspect the puncture for retained venomous spine fragments.",
      "Tetanus prophylaxis is mandatory if not current within 5 years.",
      "Obtain prescription empiric oral antibiotic coverage for marine pathogens (e.g., doxycycline, ciprofloxacin, or levofloxacin) if wound is deep or signs of infection appear.",
    ],
    warningSigns: [
      "Excruciating throbbing pain out of proportion to puncture size, grayish-ashen ischemic tissue around wound, retained barb, or expanding redness/heat.",
    ],
  },

  velvet_ant: {
    id: "velvet_ant",
    name: "Velvet Ant ('Cow Killer')",
    scientificName: "Dasymutilla occidentalis",
    endemicStates: [
      "US-TX",
      "US-FL",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-VA",
      "US-MD",
      "US-AL",
      "US-MS",
      "US-TN",
      "US-KY",
      "US-MO",
      "US-AR",
      "US-LA",
      "US-OK",
      "US-KS",
      "US-IN",
      "US-IL",
      "US-OH",
      "US-WV",
      "US-NM",
      "US-AZ",
    ],
    nonEndemicStates: ["US-AK", "US-HI", "US-VT", "US-NH", "US-ME", "US-WA", "US-OR"],
    seasonalMultiplier: [0.1, 0.1, 0.3, 0.6, 1.1, 1.4, 1.5, 1.4, 1.1, 0.6, 0.2, 0.1],
    habitatScores: {
      woods_trail: 1.4,
      yard_garden: 1.4,
      other_outdoor: 1.3,
      beach_coastal: 0.8,
      open_water_lake: 0.2,
      indoor_home: 0.2,
    },
    bodyLocationScores: {
      feet: 1.5,
      lower_leg_ankle: 1.4,
      arms_hands: 1.2,
      trunk_chest_back: 0.5,
      face_head: 0.3,
      waist_groin_axilla: 0.4,
      any_unspecified: 1.0,
    },
    sensationScores: {
      severe_pain: 2.0,
      moderate_pain: 1.3,
      burning: 1.5,
      intense_itch: 0.3,
      mild_itch: 0.1,
      painless: 0.0,
    },
    baseWeight: 0.7,
    associatedPathogens: [
      "Sterile hymenopteran polypeptide venom (non-lethal but Schmidt Index 3.0)",
    ],
    delayedRisks: [
      "Severe local inflammatory induration",
      "Secondary excoriation infection",
      "Rare systemic allergic anaphylaxis",
    ],
    firstAidAdvice: [
      "Wash the sting area thoroughly with soap and water.",
      "Apply a cold pack or ice wrapped in cloth for 15–20 minutes at a time to reduce acute swelling and blunt sharp throbbing pain.",
      "Take an oral analgesic (ibuprofen 400 mg or acetaminophen) and oral antihistamine to calm intense local histamine flare.",
      "Apply 1% hydrocortisone cream or calamine lotion to the raised wheal.",
      "Seek immediate emergency evaluation if signs of generalized allergic reaction (hives, lip/facial swelling, wheezing, dizziness) develop.",
    ],
    warningSigns: [
      "Solitary bright fiery red wheal with sudden excruciating sharp burning pain (often on bare feet or ankles in pastures or yards), resolving over 24 hours unless allergic.",
    ],
  },

  wheel_bug: {
    id: "wheel_bug",
    name: "Wheel Bug / Assassin Bug",
    scientificName: "Arilus cristatus",
    endemicStates: [
      "US-TX",
      "US-FL",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-VA",
      "US-MD",
      "US-PA",
      "US-NJ",
      "US-DE",
      "US-WV",
      "US-OH",
      "US-IN",
      "US-IL",
      "US-KY",
      "US-TN",
      "US-MO",
      "US-AR",
      "US-LA",
      "US-MS",
      "US-AL",
      "US-OK",
      "US-KS",
    ],
    nonEndemicStates: [
      "US-AK",
      "US-HI",
      "US-WA",
      "US-OR",
      "US-ID",
      "US-MT",
      "US-WY",
      "US-ND",
      "US-ME",
    ],
    seasonalMultiplier: [0.1, 0.1, 0.2, 0.5, 0.9, 1.2, 1.4, 1.5, 1.4, 0.9, 0.4, 0.1],
    habitatScores: {
      yard_garden: 1.5,
      woods_trail: 1.3,
      other_outdoor: 1.2,
      indoor_home: 0.3,
      beach_coastal: 0.4,
      open_water_lake: 0.1,
    },
    bodyLocationScores: {
      arms_hands: 1.6,
      face_head: 0.8,
      trunk_chest_back: 0.7,
      lower_leg_ankle: 0.9,
      feet: 0.6,
      waist_groin_axilla: 0.3,
      any_unspecified: 1.0,
    },
    sensationScores: {
      severe_pain: 1.8,
      moderate_pain: 1.4,
      burning: 1.5,
      intense_itch: 0.3,
      mild_itch: 0.1,
      painless: 0.0,
    },
    baseWeight: 0.7,
    associatedPathogens: [
      "Cytotoxic digestive salivary enzymes (proteinases/hyaluronidase); NOT a vector of Chagas disease",
    ],
    delayedRisks: [
      "Tender indurated cutaneous nodule lasting weeks",
      "Local numbness / sensory paresthesia",
      "Superficial dermal necrosis",
    ],
    firstAidAdvice: [
      "Wash the puncture site thoroughly with soap and water to clear insect salivary enzymes.",
      "Apply a cold compress or ice pack for 15 minutes to reduce acute tissue swelling and dull the intense burning sensation.",
      "Take oral over-the-counter NSAIDs (ibuprofen or naproxen) for local throbbing pain and inflammation.",
      "Keep clean and dry; a hard nodule may persist at the puncture site for 1–3 weeks before fully remodeling.",
      "Seek medical attention if red streaking (lymphangitis), fever, or spreading fluctuant purulence develops.",
    ],
    warningSigns: [
      "Single deep puncture wound with intense immediate pain (often rated worse than a hornet sting), followed by a firm, persistent, tender red nodule with localized numbness.",
    ],
  },

  yellow_sac_spider: {
    id: "yellow_sac_spider",
    name: "Yellow Sac Spider",
    scientificName: "Cheiracanthium inclusum / mildei",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.6, 0.6, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.8, 0.7],
    habitatScores: {
      indoor_home: 1.6,
      yard_garden: 1.2,
      woods_trail: 1.0,
      other_outdoor: 1.0,
      beach_coastal: 0.4,
      open_water_lake: 0.2,
    },
    bodyLocationScores: {
      arms_hands: 1.3,
      lower_leg_ankle: 1.3,
      trunk_chest_back: 1.2,
      face_head: 0.9,
      feet: 1.0,
      waist_groin_axilla: 0.8,
      any_unspecified: 1.0,
    },
    sensationScores: {
      moderate_pain: 1.4,
      burning: 1.3,
      intense_itch: 1.1,
      mild_itch: 0.8,
      severe_pain: 0.9,
      painless: 0.2,
    },
    baseWeight: 1.0,
    associatedPathogens: [
      "Mild cytotoxic polypeptide venom",
      "Secondary Staphylococcus / Streptococcus entry",
    ],
    delayedRisks: [
      "Small superficial crust / pustule mistaken for Brown Recluse",
      "Local mild excoriation infection",
    ],
    firstAidAdvice: [
      "Wash the bite area with antiseptic soap and water.",
      "Apply a cool compress to calm mild swelling and stinging.",
      "Reassurance: Yellow sac spider venom causes minor localized discomfort and does NOT cause severe deep tissue ulceration or systemic loxoscelism.",
      "Avoid scratching to protect the central vesicle or small scab from secondary bacterial infection.",
      "Consult a physician if erythema spreads progressively beyond 5 cm or if purulence/fever arises.",
    ],
    warningSigns: [
      "Sharp stinging sensation followed by a small, raised red papule with a tiny central pustular vesicle; heals cleanly in 7–10 days without progressive sinking necrosis.",
    ],
  },

  scabies: {
    id: "scabies",
    name: "Scabies Mite (Itch Mite)",
    scientificName: "Sarcoptes scabiei var. hominis",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    habitatScores: {
      indoor_home: 1.6,
      bed: 1.6,
      other_indoor: 1.4,
      yard_garden: 0.2,
      woods_trail: 0.1,
      beach_coastal: 0.1,
      open_water_lake: 0.1,
      other_outdoor: 0.1,
    },
    bodyLocationScores: {
      arms_hands: 1.9,
      waist_groin_axilla: 1.8,
      trunk_chest_back: 1.2,
      lower_leg_ankle: 0.9,
      feet: 0.9,
      face_head: 0.1,
      any_unspecified: 1.0,
    },
    sensationScores: {
      intense_itch: 2.0,
      mild_itch: 1.2,
      moderate_pain: 0.3,
      severe_pain: 0.1,
      burning: 0.4,
      painless: 0.0,
    },
    baseWeight: 0.9,
    associatedPathogens: [
      "Microscopic burrowing mite (delayed Type IV hypersensitivity)",
      "Secondary Staphylococcal / Streptococcal pyoderma",
    ],
    delayedRisks: [
      "Severe impetiginization / cellulitis from intense excoriation",
      "Crusted (Norwegian) scabies in immunocompromised patients",
      "Post-streptococcal glomerulonephritis",
    ],
    firstAidAdvice: [
      "Medical prescription required: Apply 5% permethrin topical cream to the ENTIRE body from the neck down to the soles of feet; leave on for 8–14 hours before washing off. Repeat in 7 days.",
      "Treat ALL household members and intimate contacts simultaneously, even if currently asymptomatic.",
      "Machine wash all bed linens, towels, and clothing worn in the past 4 days in HOT water (>= 130°F / 54°C) and dry on high heat.",
      "Items that cannot be washed must be sealed in a plastic trash bag for at least 72 hours (mites dehydrate and die away from human skin within 48–72 hours).",
      "Take oral antihistamines (cetirizine or hydroxyzine) and apply topical pramoxine or hydrocortisone to soothe post-scabetic itch, which may linger 2–4 weeks after successful mite eradication.",
    ],
    warningSigns: [
      "Intolerable worsening nocturnal itch with thread-like wavy gray burrows between fingers, wrists, or waistband; household members developing similar pruritus.",
    ],
  },

  brown_dog_tick: {
    id: "brown_dog_tick",
    name: "Brown Dog Tick",
    scientificName: "Rhipicephalus sanguineus",
    endemicStates: "ALL",
    nonEndemicStates: [],
    seasonalMultiplier: [0.8, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.8],
    habitatScores: {
      indoor_home: 1.6,
      other_indoor: 1.5,
      yard_garden: 1.2,
      other_outdoor: 1.0,
      woods_trail: 0.7,
      bed: 1.4,
      beach_coastal: 0.3,
      open_water_lake: 0.1,
    },
    bodyLocationScores: {
      lower_leg_ankle: 1.5,
      feet: 1.3,
      waist_groin_axilla: 1.3,
      arms_hands: 1.1,
      trunk_chest_back: 1.0,
      face_head: 0.9,
      any_unspecified: 1.0,
    },
    sensationScores: {
      painless: 1.5,
      mild_itch: 1.2,
      intense_itch: 0.7,
      moderate_pain: 0.2,
      severe_pain: 0.0,
      burning: 0.1,
    },
    baseWeight: 0.7,
    associatedPathogens: [
      "Rickettsia rickettsii (Rocky Mountain Spotted Fever - especially AZ/NM)",
      "Ehrlichia canis (Canine monocytic ehrlichiosis)",
      "Babesia vogeli",
    ],
    delayedRisks: [
      "Rocky Mountain Spotted Fever (fever, wrist/ankle petechial rash, headache, vasculitis)",
      "Secondary tick bite granuloma",
    ],
    firstAidAdvice: [
      "Remove tick immediately using fine-tipped tweezers: grasp mouthparts as close to the skin as possible and pull upward with steady, even pressure.",
      "Do NOT crush, twist, or smother with petroleum jelly or heat.",
      "Disinfect the attachment site thoroughly with rubbing alcohol or antiseptic soap.",
      "Check domestic pets and treat animals with veterinarian-approved ectoparasiticides.",
      "Seek emergency medical evaluation for prophylactic or prompt doxycycline if fever, severe headache, confusion, or a petechial rash spreading inward from wrists/ankles develops within 2–14 days.",
    ],
    warningSigns: [
      "Sudden high fever, severe frontal headache, muscle aches, or petechial spotted rash on wrists/ankles 2–14 days following tick exposure in a home or kennel environment.",
    ],
  },

  minute_pirate_bug: {
    id: "minute_pirate_bug",
    name: "Minute Pirate Bug & Thrips",
    scientificName: "Orius insidiosus",
    endemicStates: "ALL",
    nonEndemicStates: ["US-AK", "US-HI"],
    seasonalMultiplier: [0.0, 0.0, 0.1, 0.2, 0.5, 0.8, 1.4, 1.6, 1.5, 1.0, 0.2, 0.0],
    habitatScores: {
      yard_garden: 1.6,
      other_outdoor: 1.4,
      woods_trail: 1.2,
      beach_coastal: 0.5,
      indoor_home: 0.4,
      other_indoor: 0.3,
      bed: 0.1,
      open_water_lake: 0.2,
    },
    bodyLocationScores: {
      arms_hands: 1.7,
      face_head: 1.4,
      trunk_chest_back: 0.9,
      lower_leg_ankle: 0.9,
      feet: 0.6,
      waist_groin_axilla: 0.3,
      any_unspecified: 1.0,
    },
    sensationScores: {
      moderate_pain: 1.6,
      burning: 1.4,
      mild_itch: 1.2,
      intense_itch: 1.0,
      severe_pain: 0.7,
      painless: 0.0,
    },
    baseWeight: 0.6,
    associatedPathogens: [
      "Non-vector (mechanical piercing rostrum only; no human pathogens transmitted)",
    ],
    delayedRisks: [
      "Secondary excoriation dermatitis",
      "Exaggerated local histamine wheal in sensitive individuals",
    ],
    firstAidAdvice: [
      "Reassurance: Minute pirate bugs are beneficial agricultural predators that eat garden pests (aphids and mites). They do NOT feed on human blood and do NOT transmit diseases.",
      "Wash the puncture site with mild soap and clean water.",
      "Apply a cold compress or ice pack for 10–15 minutes to reduce acute localized swelling and stinging.",
      "Apply over-the-counter 1% hydrocortisone cream or calamine lotion to relieve itching.",
      "Avoid scratching to protect the central micro-puncture from secondary bacterial contamination.",
    ],
    warningSigns: [
      "Sharp sudden needle-like jab outdoors during sunny late-summer days, resolving within 2–5 days; seek care only if spreading redness indicates bacterial cellulitis.",
    ],
  },

  soft_tick: {
    id: "soft_tick",
    name: "Soft Tick (Relapsing Fever Tick)",
    scientificName: "Ornithodoros hermsi / turicata",
    endemicStates: [
      "US-CA",
      "US-WA",
      "US-OR",
      "US-ID",
      "US-MT",
      "US-CO",
      "US-NV",
      "US-UT",
      "US-AZ",
      "US-NM",
      "US-WY",
      "US-TX",
      "US-OK",
      "US-KS",
    ],
    nonEndemicStates: [
      "US-ME",
      "US-VT",
      "US-NH",
      "US-MA",
      "US-CT",
      "US-RI",
      "US-NY",
      "US-NJ",
      "US-PA",
      "US-DE",
      "US-MD",
      "US-VA",
      "US-NC",
      "US-SC",
      "US-GA",
      "US-FL",
    ],
    seasonalMultiplier: [0.3, 0.4, 0.6, 0.9, 1.2, 1.4, 1.5, 1.4, 1.1, 0.7, 0.4, 0.3],
    habitatScores: {
      indoor_home: 1.4,
      woods_trail: 1.5,
      other_indoor: 1.3,
      bed: 1.5,
      other_outdoor: 1.1,
      yard_garden: 0.6,
      beach_coastal: 0.1,
      open_water_lake: 0.2,
    },
    bodyLocationScores: {
      trunk_chest_back: 1.5,
      arms_hands: 1.3,
      lower_leg_ankle: 1.2,
      waist_groin_axilla: 1.2,
      face_head: 1.1,
      feet: 0.8,
      any_unspecified: 1.0,
    },
    sensationScores: {
      painless: 1.6,
      mild_itch: 1.1,
      intense_itch: 0.7,
      moderate_pain: 0.3,
      severe_pain: 0.0,
      burning: 0.1,
    },
    baseWeight: 0.7,
    associatedPathogens: [
      "Borrelia hermsii (Tick-Borne Relapsing Fever - TBRF)",
      "Borrelia turicatae",
    ],
    delayedRisks: [
      "Tick-Borne Relapsing Fever (cyclical episodes of high fever, rigors, headache, and drenching sweats every 4–7 days)",
      "Jarisch-Herxheimer reaction upon initial antibiotic treatment",
    ],
    firstAidAdvice: [
      "Clean the bite area thoroughly with antiseptic wash or soap and water.",
      "Monitor closely for Tick-Borne Relapsing Fever (TBRF): high spiking fever (up to 104°F–105°F), chills, severe headache, and myalgias developing 4–18 days after staying in a mountain cabin or rustic structure.",
      "Soft ticks feed quickly (15–30 minutes) at night while you sleep and fall off immediately; the vast majority of patients NEVER find a tick on their body.",
      "Seek medical consultation immediately if cyclical fever episodes occur; standard curative treatment is oral doxycycline 100 mg twice daily for 7–10 days.",
      "Inspect and rodent-proof mountain cabins (soft ticks live in rodent nesting materials in attic and subfloor spaces).",
    ],
    warningSigns: [
      "Unexplained purpuric or dark crusty bite mark after sleeping in a western mountain cabin, followed 1–2 weeks later by sudden shaking chills, high fever, and sweats.",
    ],
  },
};

// Decorate vector entries with clinical urgency and vulnerable population safety guidance
for (const [key, vector] of Object.entries(VECTOR_DATABASE)) {
  vector.urgency = VECTOR_URGENCY_MAP[key] ?? "non_urgent";
  vector.vulnerableGuidance = VULNERABLE_GUIDANCE_MAP[key];
}

export const DEFAULT_MCNAIR_VA_COORDINATES = {
  lat: 38.9056,
  lng: -77.3995,
};

export const MID_ATLANTIC_STATES = [
  "US-VA",
  "US-MD",
  "US-PA",
  "US-NJ",
  "US-DE",
  "US-DC",
  "US-WV",
  "US-NC",
];

export function evaluateRegionalLikelihood(
  context: TriageContext,
  morphology?: DermatologicalMorphology | string,
  bugTaxonomy?: string | null,
): Record<string, number> {
  const rawScores: Record<string, number> = {};

  const state = context.usState || "US-VA";
  const month = typeof context.monthIndex === "number" ? context.monthIndex : new Date().getMonth();
  const location = context.incidentLocation || "yard_garden";
  const sensation = context.primarySensation || "intense_itch";

  const isMidAtlantic = MID_ATLANTIC_STATES.includes(state);

  // Normalize morphology input
  let morphObj: DermatologicalMorphology | undefined;
  let isAnnularTarget = false;

  if (typeof morphology === "string") {
    if (morphology === "annular_target") {
      isAnnularTarget = true;
      morphObj = {
        pattern: "annular_target",
        centralFeatures: "punctum_bite_mark",
        primaryReaction: "expanding_erythema",
      };
    } else if (morphology === "edematous_wheal") {
      morphObj = {
        pattern: "solitary_wheal",
        centralFeatures: "punctum_bite_mark",
        primaryReaction: "urticarial_hive",
      };
    } else if (morphology === "linear_cluster") {
      morphObj = {
        pattern: "linear_grouped",
        centralFeatures: "clear_halo",
        primaryReaction: "urticarial_hive",
      };
    } else if (morphology === "necrotic_macule") {
      morphObj = {
        pattern: "indurated_plaque",
        centralFeatures: "necrotic_ulcer",
        primaryReaction: "ischemic_purpura",
      };
    }
  } else if (morphology) {
    morphObj = morphology;
    if (
      morphology.pattern === "annular_target" ||
      morphology.primaryReaction === "expanding_erythema"
    ) {
      isAnnularTarget = true;
    }
  }

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

    // Entomologist bug taxonomy override if bug photo detected arthropod
    if (bugTaxonomy) {
      const lower = bugTaxonomy.toLowerCase();
      if (
        (lower.includes("cimex") || lower.includes("bed bug") || lower.includes("bedbug")) &&
        key === "bed_bug"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("ixodes") ||
          lower.includes("deer tick") ||
          lower.includes("blacklegged")) &&
        key === "blacklegged_tick"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("amblyomma") || lower.includes("lone star")) &&
        key === "lone_star_tick"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("dermacentor") ||
          lower.includes("dog tick") ||
          lower.includes("wood tick")) &&
        key === "dog_tick"
      ) {
        score *= 100.0;
      }
      if ((lower.includes("solenopsis") || lower.includes("fire ant")) && key === "fire_ant") {
        score *= 100.0;
      }
      if (
        (lower.includes("apis") || lower.includes("honey bee") || lower.includes("bee")) &&
        key === "honey_bee"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("vespula") ||
          lower.includes("polistes") ||
          lower.includes("wasp") ||
          lower.includes("yellow jacket") ||
          lower.includes("hornet")) &&
        key === "wasp"
      ) {
        score *= 100.0;
      }
      if ((lower.includes("centruroides") || lower.includes("scorpion")) && key === "scorpion") {
        score *= 100.0;
      }
      if (
        (lower.includes("tabanidae") ||
          lower.includes("tabanus") ||
          lower.includes("chrysops") ||
          lower.includes("horse fly") ||
          lower.includes("deer fly")) &&
        key === "horse_fly"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("pediculus") ||
          lower.includes("phthirus") ||
          lower.includes("lice") ||
          lower.includes("louse")) &&
        key === "lice"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("culicidae") ||
          lower.includes("anopheles") ||
          lower.includes("aedes") ||
          lower.includes("culex") ||
          lower.includes("mosquito")) &&
        key === "mosquito"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("ctenocephalides") || lower.includes("pulex") || lower.includes("flea")) &&
        key === "flea"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("loxosceles") ||
          lower.includes("brown recluse") ||
          lower.includes("recluse")) &&
        key === "brown_recluse"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("latrodectus") ||
          lower.includes("black widow") ||
          lower.includes("widow")) &&
        key === "black_widow"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("trombiculidae") ||
          lower.includes("trombicula") ||
          lower.includes("chigger") ||
          lower.includes("harvest mite")) &&
        key === "chigger"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("triatoma") ||
          lower.includes("kissing bug") ||
          lower.includes("triatomine") ||
          lower.includes("reduviid")) &&
        key === "kissing_bug"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("ceratopogonidae") ||
          lower.includes("culicoides") ||
          lower.includes("no-see-um") ||
          lower.includes("midge") ||
          lower.includes("punkie")) &&
        key === "no_see_um"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("simuliidae") ||
          lower.includes("simulium") ||
          lower.includes("black fly") ||
          lower.includes("buffalo gnat")) &&
        key === "black_fly"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("meloidae") ||
          lower.includes("epicauta") ||
          lower.includes("blister beetle")) &&
        key === "blister_beetle"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("crotalus") ||
          lower.includes("agkistrodon") ||
          lower.includes("copperhead") ||
          lower.includes("rattlesnake") ||
          lower.includes("cottonmouth") ||
          lower.includes("pit viper") ||
          lower.includes("viper") ||
          lower.includes("snake")) &&
        key === "pit_viper"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("physalia") ||
          lower.includes("chrysaora") ||
          lower.includes("cyanea") ||
          lower.includes("jellyfish") ||
          lower.includes("man o war") ||
          lower.includes("man-of-war") ||
          lower.includes("sea nettle")) &&
        key === "jellyfish"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("dasyatis") ||
          lower.includes("hypanus") ||
          lower.includes("urobatis") ||
          lower.includes("myliobatis") ||
          lower.includes("stingray") ||
          lower.includes("skate")) &&
        key === "stingray"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("dasymutilla") ||
          lower.includes("velvet ant") ||
          lower.includes("cow killer") ||
          lower.includes("mutillid")) &&
        key === "velvet_ant"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("arilus") ||
          lower.includes("wheel bug") ||
          lower.includes("assassin bug")) &&
        key === "wheel_bug"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("cheiracanthium") ||
          lower.includes("yellow sac") ||
          lower.includes("sac spider")) &&
        key === "yellow_sac_spider"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("sarcoptes") || lower.includes("scabies") || lower.includes("itch mite")) &&
        key === "scabies"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("rhipicephalus") ||
          lower.includes("brown dog tick") ||
          lower.includes("kennel tick")) &&
        key === "brown_dog_tick"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("orius") || lower.includes("pirate bug") || lower.includes("thrips")) &&
        key === "minute_pirate_bug"
      ) {
        score *= 100.0;
      }
      if (
        (lower.includes("ornithodoros") ||
          lower.includes("soft tick") ||
          lower.includes("relapsing fever")) &&
        key === "soft_tick"
      ) {
        score *= 100.0;
      }
    }

    // 5. Morphological Overrides & Multipliers
    if (morphObj) {
      if (morphObj.pattern === "linear_grouped") {
        if (key === "scabies") score *= 25.0;
        if (key === "jellyfish") score *= 25.0;
        if (key === "bed_bug") score *= 15.0;
        if (key === "flea") score *= 4.0;
        if (key === "chigger") score *= 4.0;
        if (key === "lice") score *= 4.0;
      }
      if (
        morphObj.pattern === "solitary_wheal" &&
        morphObj.centralFeatures === "punctum_bite_mark"
      ) {
        if (key === "mosquito") score *= 4.0;
        if (key === "minute_pirate_bug") score *= 8.0;
        if (key === "brown_dog_tick") score *= 6.0;
        if (key === "soft_tick") score *= 6.0;
        if (key === "fire_ant" && (sensation === "severe_pain" || sensation === "intense_itch"))
          score *= 9.0;
        if (key === "honey_bee" && (sensation === "severe_pain" || sensation === "moderate_pain"))
          score *= 9.0;
        if (key === "wasp" && (sensation === "severe_pain" || sensation === "moderate_pain"))
          score *= 9.0;
        if (key === "velvet_ant" && (sensation === "severe_pain" || sensation === "burning"))
          score *= 12.0;
        if (key === "wheel_bug" && (sensation === "severe_pain" || sensation === "moderate_pain"))
          score *= 10.0;
        if (key === "stingray" && sensation === "severe_pain") score *= 15.0;
        if (key === "scorpion" && sensation === "severe_pain") score *= 9.0;
        if (key === "horse_fly" && (sensation === "severe_pain" || sensation === "moderate_pain"))
          score *= 9.0;
        if (
          key === "giant_centipede" &&
          (sensation === "severe_pain" || sensation === "moderate_pain")
        )
          score *= 10.0;
        if (
          key === "asp_caterpillar" &&
          (sensation === "severe_pain" || sensation === "intense_itch")
        )
          score *= 10.0;
      }
      if (morphObj.pattern === "linear_grouped") {
        if (key === "scabies") score *= 25.0;
        if (key === "jellyfish") score *= 25.0;
        if (key === "asp_caterpillar") score *= 20.0;
        if (key === "bed_bug") score *= 6.0;
        if (key === "flea") score *= 5.0;
        if (key === "chigger") score *= 5.0;
        if (key === "lice") score *= 4.0;
      }
      if (
        morphObj.pattern === "scattered_papules" ||
        morphObj.primaryReaction === "excoriated_papule"
      ) {
        if (key === "scabies") score *= 10.0;
        if (key === "bed_bug") score *= 6.0;
        if (key === "flea") score *= 5.0;
        if (key === "chigger") score *= 5.0;
        if (key === "lice") score *= 4.0;
      }
      if (
        morphObj.centralFeatures === "necrotic_ulcer" ||
        morphObj.primaryReaction === "ischemic_purpura" ||
        morphObj.pattern === "indurated_plaque" ||
        morphObj.primaryLesion === "eschar_necrosis"
      ) {
        if (key === "brown_recluse") score *= 8.0;
        if (key === "soft_tick") score *= 7.0;
      }
      if (morphObj.centralFeatures === "twin_punctures") {
        if (key === "pit_viper") score *= 35.0;
        if (key === "coral_snake") score *= 30.0;
        if (key === "giant_centipede") score *= 25.0;
        if (key === "black_widow") score *= 12.0;
        if (key === "brown_recluse") score *= 10.0;
      }
      if (
        morphObj.centralFeatures === "vesicle_pustule" ||
        morphObj.primaryLesion === "sterile_pustule"
      ) {
        if (key === "fire_ant") score *= 18.0;
        if (key === "blister_beetle") score *= 10.0;
      }
      if (
        morphObj.pattern === "vesiculobullous_cluster" ||
        morphObj.primaryLesion === "vesicle_bulla" ||
        morphObj.primaryReaction === "vesiculobullous"
      ) {
        if (key === "blister_beetle") score *= 16.0;
        if (key === "fire_ant") score *= 12.0;
      }
      if (morphObj.centralFeatures === "clear_halo") {
        if (key === "blacklegged_tick" || key === "lone_star_tick") score *= 6.0;
        if (key === "brown_recluse") score *= 4.0;
      }
      if (morphObj.estimatedDiameter === "over_5cm" && isAnnularTarget) {
        if (key === "blacklegged_tick") score *= 3.0;
      }
    }

    rawScores[key] = score;
  }

  // Targetoid Rash Prior Alignment
  if (isAnnularTarget) {
    if (
      [
        "US-NY",
        "US-CT",
        "US-MA",
        "US-RI",
        "US-NH",
        "US-VT",
        "US-ME",
        "US-WI",
        "US-MN",
        "US-PA",
        "US-NJ",
        "US-VA",
      ].includes(state)
    ) {
      rawScores["blacklegged_tick"] = (rawScores["blacklegged_tick"] || 1.0) * 100.0;
    } else if (
      [
        "US-NC",
        "US-SC",
        "US-GA",
        "US-FL",
        "US-AL",
        "US-MS",
        "US-TN",
        "US-KY",
        "US-AR",
        "US-LA",
        "US-TX",
        "US-OK",
        "US-MO",
      ].includes(state)
    ) {
      rawScores["lone_star_tick"] = (rawScores["lone_star_tick"] || 1.0) * 8.0;
      rawScores["blacklegged_tick"] = (rawScores["blacklegged_tick"] || 1.0) * 7.5;
    }
  }

  // Normalize scores to probabilities summing to 1.0
  const totalScore = Object.values(rawScores).reduce((sum, val) => sum + val, 0);

  const probabilities: Record<string, number> = {};
  if (totalScore <= 0) {
    const count = Object.keys(VECTOR_DATABASE).length;
    for (const key of Object.keys(VECTOR_DATABASE)) {
      probabilities[key] = 1 / count;
    }
  } else {
    for (const [key, score] of Object.entries(rawScores)) {
      probabilities[key] = Math.round((score / totalScore) * 1000) / 1000;
    }
  }

  // HARD DETERMINISTIC MID-ATLANTIC OVERRIDE RULE
  // Applies to targetoid rashes when no conflicting non-Lyme specimen was identified
  const hasNonLymeTaxonomy =
    bugTaxonomy &&
    !bugTaxonomy.toLowerCase().includes("ixodes") &&
    !bugTaxonomy.toLowerCase().includes("deer tick") &&
    !bugTaxonomy.toLowerCase().includes("blacklegged");

  if (isMidAtlantic && isAnnularTarget && !hasNonLymeTaxonomy) {
    probabilities["blacklegged_tick"] = 0.92;
    probabilities["mosquito"] = 0.03;

    const remainingKeys = Object.keys(probabilities).filter(
      (k) => k !== "blacklegged_tick" && k !== "mosquito",
    );
    const remCount = remainingKeys.length || 1;
    const remShare = 0.05 / remCount;
    for (const key of remainingKeys) {
      probabilities[key] = Math.round(remShare * 1000) / 1000;
    }
  }

  return probabilities;
}
