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
  associatedPathogens: string[];
  delayedRisks: string[];
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
    associatedPathogens: ["West Nile Virus", "Dengue Virus", "Eastern Equine Encephalitis"],
    delayedRisks: ["Secondary bacterial skin infection"],
    firstAidAdvice: ["Wash with soap and water.", "Apply ice pack or 1% hydrocortisone cream."],
    warningSigns: ["High fever, severe headache, or body aches."],
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
    name: "Lone Star Tick",
    scientificName: "Amblyomma americanum",
    endemicStates: [
      "US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
      "US-KY", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-OH",
      "US-IN", "US-IL", "US-MO", "US-AR", "US-LA", "US-TX", "US-OK", "US-KS"
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
    name: "American Dog Tick",
    scientificName: "Dermacentor variabilis",
    endemicStates: [
      "US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN",
      "US-KY", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-OH",
      "US-IN", "US-IL", "US-MO", "US-AR", "US-LA", "US-TX", "US-OK", "US-KS",
      "US-CA", "US-AZ"
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
    baseWeight: 0.25,
    associatedPathogens: ["Sphingomyelinase D venom"],
    delayedRisks: ["Loxoscelism (Dermonecrosis)"],
    firstAidAdvice: ["Clean wound with soap and water.", "Apply cold compress."],
    warningSigns: ["Central sunken violaceous macule surrounded by pale halo."],
  },
  black_widow: {
    id: "black_widow",
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
    name: "Fire Ant",
    scientificName: "Solenopsis invicta",
    endemicStates: [
      "US-TX", "US-FL", "US-GA", "US-AL", "US-MS", "US-LA", "US-SC", "US-NC",
      "US-TN", "US-AR", "US-OK", "US-VA", "US-CA"
    ],
    nonEndemicStates: ["US-ME", "US-NH", "US-VT", "US-MA", "US-NY", "US-WI", "US-MN", "US-AK", "US-HI"],
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
    name: "Kissing Bug (Triatomine)",
    scientificName: "Triatoma spp.",
    endemicStates: [
      "US-TX", "US-AZ", "US-NM", "US-CA", "US-FL", "US-GA", "US-AL", "US-LA"
    ],
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
    firstAidAdvice: ["Scrape stinger off immediately with fingernail or card. Wash with soap and water."],
    warningSigns: ["Barbed stinger in skin, difficulty breathing, or facial swelling."],
  },
  wasp: {
    id: "wasp",
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
};

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
  bugTaxonomy?: string | null
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

    // Entomologist bug taxonomy override if bug photo detected tick
    if (bugTaxonomy) {
      const lower = bugTaxonomy.toLowerCase();
      if (lower.includes("ixodes") && key === "blacklegged_tick") {
        score *= 10.0;
      }
      if ((lower.includes("amblyomma") || lower.includes("lone star")) && key === "lone_star_tick") {
        score *= 10.0;
      }
      if ((lower.includes("dermacentor") || lower.includes("dog tick")) && key === "dog_tick") {
        score *= 10.0;
      }
      if ((lower.includes("solenopsis") || lower.includes("fire ant")) && key === "fire_ant") {
        score *= 10.0;
      }
      if ((lower.includes("apis") || lower.includes("honey bee") || lower.includes("bee")) && key === "honey_bee") {
        score *= 10.0;
      }
      if ((lower.includes("vespula") || lower.includes("wasp") || lower.includes("yellow jacket")) && key === "wasp") {
        score *= 10.0;
      }
      if ((lower.includes("centruroides") || lower.includes("scorpion")) && key === "scorpion") {
        score *= 10.0;
      }
      if ((lower.includes("tabanidae") || lower.includes("horse fly") || lower.includes("deer fly")) && key === "horse_fly") {
        score *= 10.0;
      }
      if ((lower.includes("pediculus") || lower.includes("lice")) && key === "lice") {
        score *= 10.0;
      }
    }

    // 5. Morphological Overrides & Multipliers
    if (morphObj) {
      if (morphObj.pattern === "linear_grouped") {
        if (key === "bed_bug") score *= 10.0;
        if (key === "flea") score *= 4.0;
        if (key === "chigger") score *= 4.0;
        if (key === "lice") score *= 5.0;
      }
      if (morphObj.pattern === "solitary_wheal" && morphObj.centralFeatures === "punctum_bite_mark") {
        if (key === "mosquito") score *= 4.0;
        if (key === "fire_ant" && (sensation === "severe_pain" || sensation === "intense_itch")) score *= 9.0;
        if (key === "honey_bee" && (sensation === "severe_pain" || sensation === "moderate_pain")) score *= 9.0;
        if (key === "wasp" && (sensation === "severe_pain" || sensation === "moderate_pain")) score *= 9.0;
        if (key === "scorpion" && sensation === "severe_pain") score *= 9.0;
        if (key === "horse_fly" && (sensation === "severe_pain" || sensation === "moderate_pain")) score *= 9.0;
      }
      if (morphObj.pattern === "scattered_papules" || morphObj.primaryReaction === "excoriated_papule") {
        if (key === "lice") score *= 8.0;
        if (key === "flea") score *= 5.0;
        if (key === "chigger") score *= 5.0;
        if (key === "bed_bug") score *= 0.3;
      }
      if (
        morphObj.centralFeatures === "necrotic_ulcer" ||
        morphObj.primaryReaction === "ischemic_purpura" ||
        morphObj.pattern === "indurated_plaque"
      ) {
        if (key === "brown_recluse") score *= 8.0;
      }
    }

    rawScores[key] = score;
  }

  // Targetoid Rash Prior Alignment
  if (isAnnularTarget) {
    if (["US-NY", "US-CT", "US-MA", "US-RI", "US-NH", "US-VT", "US-ME", "US-WI", "US-MN", "US-PA", "US-NJ", "US-VA"].includes(state)) {
      rawScores["blacklegged_tick"] = (rawScores["blacklegged_tick"] || 1.0) * 100.0;
    } else if (["US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN", "US-KY", "US-AR", "US-LA", "US-TX", "US-OK", "US-MO"].includes(state)) {
      rawScores["lone_star_tick"] = (rawScores["lone_star_tick"] || 1.0) * 8.0;
      rawScores["blacklegged_tick"] = (rawScores["blacklegged_tick"] || 1.0) * 7.5;
    }
  }

  // Normalize scores to probabilities summing to 1.0
  const totalScore = Object.values(rawScores).reduce((sum, val) => sum + val, 0);

  let probabilities: Record<string, number> = {};
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
  if (isMidAtlantic && isAnnularTarget) {
    probabilities["blacklegged_tick"] = 0.92;
    probabilities["mosquito"] = 0.03;

    const remainingKeys = Object.keys(probabilities).filter(
      (k) => k !== "blacklegged_tick" && k !== "mosquito"
    );
    const remCount = remainingKeys.length || 1;
    const remShare = 0.05 / remCount;
    for (const key of remainingKeys) {
      probabilities[key] = Math.round(remShare * 1000) / 1000;
    }
  }

  return probabilities;
}
