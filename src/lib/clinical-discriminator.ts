import { VECTOR_DATABASE, type VectorInfo } from "./geo-pest.server";
import { type TriageResponse, type TriageFormState, type TriageResultItem } from "./triage";

export type ForkOption = {
  vectorId: string;
  vectorName: string;
  title: string;
  clues: string[];
  clinicalSignificance: string;
  boostAmount: number;
};

export type ForkInTheRoad = {
  id: string;
  isAmbiguous: boolean;
  probabilityDelta: number;
  question: string;
  primaryOption: ForkOption;
  secondaryOption: ForkOption;
  neutralOption: {
    label: string;
    description: string;
  };
};

export type DiscriminatorComparison = {
  primarySuspect: {
    id: string;
    name: string;
    scientificName?: string;
    probability: number;
    ruleInRationale: string[];
  };
  secondarySuspect: {
    id: string;
    name: string;
    scientificName?: string;
    probability: number;
    ruleOutRationale: string[];
  };
  keyClinicalDifferentiator: string;
  mimickerRuleOut?: {
    conditionName: string;
    differentiatingSign: string;
  };
  recommendedClinicalConfirmation: string[];
  forkInTheRoad: ForkInTheRoad;
};

type CuratedPairConfig = {
  differentiator: string;
  primaryFavoredReasons: string[];
  secondaryDisadvantagedReasons: string[];
  clinicalConfirmation: string[];
  forkQuestion?: {
    question: string;
    primaryTitle: string;
    primaryClues: string[];
    primarySignificance: string;
    secondaryTitle: string;
    secondaryClues: string[];
    secondarySignificance: string;
  };
};

/**
 * Curated clinical pairwise discriminators and dynamic fork-in-the-road questions
 * grounded in toxicological & dermatological evidence-based guidelines.
 */
const CLINICAL_PAIR_DISCRIMINATORS: Record<string, CuratedPairConfig> = {
  "bed_bug-flea": {
    differentiator:
      "Bed bugs produce linear clusters of 2–3 bites ('breakfast, lunch, dinner') primarily on the upper body and waistline after sleeping, whereas fleas produce scattered bites concentrated around the ankles and lower legs associated with domestic pet contact.",
    primaryFavoredReasons: [
      "Bites arranged in linear tracks or zigzags under clothing seams or exposed upper torso.",
      "Painless initial contact while sleeping; delayed intense pruritic wheals appearing over days.",
      "Recent overnight travel, hotel, dorm, or multi-unit housing exposure.",
    ],
    secondaryDisadvantagedReasons: [
      "Flea bites are almost exclusively concentrated on the lower third of the body (ankles, feet, lower calves).",
      "Flea bites typically correlate with indoor dogs or cats and occur during active daytime hours.",
    ],
    clinicalConfirmation: [
      "Inspect mattress seams, headboard crevice, and baseboards for dark fecal spotting or molted nymph skins.",
      "Check household pets with a fine-toothed flea comb for flea dirt (blood frass) on belly or tail base.",
    ],
    forkQuestion: {
      question: "Where are the bites located, and do you have pet contact or recent hotel/travel history?",
      primaryTitle: "Clustered rows on torso/waist with recent travel or waking in bed",
      primaryClues: [
        "Bites clustered in rows of 2–3 ('breakfast, lunch, dinner') on torso, arms, neck, or waist",
        "Bites were noticed upon waking up in the morning",
        "Recent hotel, hostel, rental, or dorm stay within the past 14 days",
      ],
      primarySignificance: "Favors Bed Bug: nocturnal feeding patterns under bedding and clothing seams.",
      secondaryTitle: "Bites strictly on lower legs/ankles with cat or dog exposure",
      secondaryClues: [
        "Bites located predominantly on feet, ankles, or lower calves",
        "Sudden daytime itching while walking across carpet, rugs, or outdoor turf",
        "Household contains indoor pets, or you visited an animal-friendly environment",
      ],
      secondarySignificance: "Favors Flea: jumping ground-level parasites targeting exposed lower extremities.",
    },
  },

  "blacklegged_tick-brown_recluse": {
    differentiator:
      "Annular centrifugal expansion >5 cm without central dermonecrosis or acute onset pain definitively distinguishes Lyme Erythema Migrans from Loxoscelism.",
    primaryFavoredReasons: [
      "Centrifugally expanding annular erythema (bullseye or uniform plaque) typically painless or mildly pruritic.",
      "Transmission occurs after 24–48 hours of tick attachment in wooded or tall grass environments.",
      "High regional endemicity in Northeast, Mid-Atlantic, and Upper Midwest.",
    ],
    secondaryDisadvantagedReasons: [
      "Brown Recluse bites produce a localized sinking blue-gray necrotic macule surrounded by an ischemic halo, not an expanding bullseye.",
      "Recluse envenomations develop severe aching pain within 2–8 hours; Erythema Migrans is typically painless or minimally tender.",
      "True Loxosceles species are geographically restricted to the South-Central US.",
    ],
    clinicalConfirmation: [
      "Assess for expanding red margin with a ballpoint pen (>5 mm/day).",
      "Serologic two-tiered testing (ELISA + Western blot) is recommended at 4–6 weeks; however, early Erythema Migrans is a clinical diagnosis.",
    ],
    forkQuestion: {
      question: "How has the red area evolved, and does it hurt or feel necrotic?",
      primaryTitle: "Slowly expanding ring (>5 cm) without central tissue breakdown",
      primaryClues: [
        "Red circular ring expands outward day-by-day (>5 mm/day), reaching >5 cm in diameter",
        "Center is flat, non-painful, or mildly warm without skin breakdown or blue discoloration",
        "Exposure occurred in woods, brush, or leaf litter in the Northeast, Mid-Atlantic, or Midwest",
      ],
      primarySignificance: "Favors Lyme Disease (Erythema Migrans): centrifugal spirochetal migration.",
      secondaryTitle: "Sinking, dusky blue-gray center with intense throbbing pain",
      secondaryClues: [
        "Center sinks below skin level with dark blue, purple, or gray dead tissue (eschar)",
        "Severe throbbing or burning pain that escalated 2–8 hours after exposure",
        "Bite occurred in dark indoor storage, attic, closet, or woodpile in the South-Central US",
      ],
      secondarySignificance: "Favors Brown Recluse: cytotoxic sphingomyelinase D dermonecrosis.",
    },
  },

  "blacklegged_tick-mosquito": {
    differentiator:
      "Lyme Erythema Migrans expands centrifugally over days to reach >5 cm with mild or absent itching, whereas mosquito bites form rapid, intensely pruritic urticarial wheals that peak within 12–24 hours and stay under 3 cm.",
    primaryFavoredReasons: [
      "Centrifugal expansion >5 mm/day; lesion persists and enlarges over 3–14 days.",
      "Center may show clear central halo or target bullseye; lesion is minimally itchy or painless.",
      "Occurs after outdoor brush or wooded exposure in tick-endemic states.",
    ],
    secondaryDisadvantagedReasons: [
      "Mosquito bites flare immediately or within hours as acute histaminic hives.",
      "Mosquito lesions peak in 24 hours, stay small (<3 cm), and resolve within 3–5 days.",
    ],
    clinicalConfirmation: [
      "Trace the outer edge with a ballpoint pen; active growth over 48 hours confirms Erythema Migrans.",
      "Lyme disease requires prompt prescription oral doxycycline (or amoxicillin for children/pregnancy).",
    ],
    forkQuestion: {
      question: "How quickly did the redness peak, and is it actively expanding day-by-day?",
      primaryTitle: "Slowly expanding red ring enlarging day-by-day over 3+ days",
      primaryClues: [
        "The red circle is continually growing larger each day (over 5 cm across)",
        "Lesion is relatively flat, not intensely itchy, and has been present for over 48 hours",
        "Possible mild systemic symptoms: low-grade fever, neck stiffness, or joint fatigue",
      ],
      primarySignificance: "Favors Blacklegged Tick (Lyme): classic centrifugal Erythema Migrans.",
      secondaryTitle: "Sudden raised itchy hive that peaked in under 24 hours",
      secondaryClues: [
        "Raised, soft, intensely itchy hive that swelled within hours of being outdoors",
        "Measures under 3 cm (silver dollar size) and is already plateauing or fading",
        "No systemic fever or advancing rings over days",
      ],
      secondarySignificance: "Favors Mosquito: acute salivary histamine reaction.",
    },
  },

  "brown_recluse-mrsa_furuncle": {
    differentiator:
      "Brown recluse lesions characteristically sink centrally with ischemic blanching and necrosis ('red, white, and blue' sign), whereas MRSA abscesses are fluctuant, warm, and produce purulent pus.",
    primaryFavoredReasons: [
      "Central violaceous bleb or sinking dusky eschar surrounded by blanching erythema.",
      "Severe localized tissue ischemia secondary to sphingomyelinase D cytotoxic enzyme activity.",
      "Absence of pointing yellow pustular head or purulent drainage.",
    ],
    secondaryDisadvantagedReasons: [
      "Over 80% of self-diagnosed 'spider bites' evaluated in urgent care are bacterial MRSA or Staph aureus abscesses.",
      "Bacterial abscesses present with a focal fluctuant core and purulence; recluse bites are initially non-purulent.",
    ],
    clinicalConfirmation: [
      "Do NOT incise or squeeze a suspected necrotic spider bite (exacerbates ulceration).",
      "If fluctuance or purulent exudate develops, obtain bacterial wound culture to guide oral antibiotic coverage.",
    ],
    forkQuestion: {
      question: "Does the wound have a soft liquid pus center, or a flat sinking dark purple bruise?",
      primaryTitle: "Flat, sinking blue-purple center without liquid pus or whitehead",
      primaryClues: [
        "Center is dark purple, violaceous, or sinking below the skin surface",
        "No visible liquid pus, whitehead, or yellow discharge",
        "Severe deep aching pain that began hours after the bite occurred",
      ],
      primarySignificance: "Favors Brown Recluse: microvascular ischemic infarction.",
      secondaryTitle: "Warm, swollen red boil with a yellow/white pus core (fluctuant)",
      secondaryClues: [
        "Warm, tender, raised red nodule that feels like a large inflamed pimple or boil",
        "Contains visible yellow or cloudy liquid pus, or has spontaneous purulent drainage",
        "Occurred without seeing any spider (common staph bacterial skin colonization)",
      ],
      secondarySignificance: "Favors MRSA Bacterial Furuncle: requires antibiotic or drainage evaluation.",
    },
  },

  "brown_recluse-wolf_spider": {
    differentiator:
      "Delayed-onset intense pain, central ischemic blanching, and progressive violaceous sinking necrosis ('red, white, and blue') favor Brown Recluse over the benign, non-ulcerating mechanical bite of a Wolf Spider.",
    primaryFavoredReasons: [
      "Classic necrotic tri-color sign: central dusky blue-gray necrosis, intermediate blanched white ischemia, and peripheral erythematous flare.",
      "Delayed severe pain onset (hours after exposure) typical of cytotoxic loxoscelism.",
      "Absence of immediate sharp mechanical trauma.",
    ],
    secondaryDisadvantagedReasons: [
      "Wolf spider bites cause immediate stinging pain with prominent dual punctures and resolve spontaneously without tissue necrosis.",
      "Wolf spiders never cause dermonecrotic ulceration.",
    ],
    clinicalConfirmation: [
      "Do NOT debride or excise the lesion in early stages; provide wound rest, ice, and elevation.",
      "Monitor for systemic loxoscelism (fever, chills, dark urine from intravascular hemolysis).",
    ],
    forkQuestion: {
      question: "Was the pain immediate upon contact, and is there any dead/blue skin?",
      primaryTitle: "Delayed pain (hours later) with sinking blue-gray dying skin",
      primaryClues: [
        "Didn't feel much at first; severe aching pain escalated 2 to 8 hours later",
        "Center is flat or sinking with dark blue, gray, or purple discoloration",
        "Surrounded by a pale white ring and irregular red flare ('red, white, and blue')",
      ],
      primarySignificance: "Favors Brown Recluse: cytotoxic envenomation.",
      secondaryTitle: "Instant sharp bee-sting pinch with dual fang dots and pink swelling",
      secondaryClues: [
        "Felt an immediate sharp pinch or needle poke the second it occurred",
        "Two visible red puncture dots from large spider fangs",
        "Raised pink swelling that is improving within 24 to 48 hours without skin breakdown",
      ],
      secondarySignificance: "Favors Wolf Spider: harmless mechanical bite.",
    },
  },

  "wolf_spider-brown_recluse": {
    differentiator:
      "Wolf spider bites cause instantaneous sharp mechanical pain, visible cheliceral puncture puncta, and localized edema that resolves within 24–48 hours WITHOUT necrotic tissue breakdown or sinking violaceous eschars.",
    primaryFavoredReasons: [
      "Immediate pinprick or bee-sting-like pain upon contact, with two visible puncture marks from large chelicerae.",
      "Localized erythematous wheal and mild edema (1–3 cm) that peaks quickly and subsides within 48 hours.",
      "Venom is strictly non-necrotic and non-cytotoxic to human dermal tissue.",
    ],
    secondaryDisadvantagedReasons: [
      "Brown recluse bites are typically painless or mild initially; pain escalates 2–8 hours later as sphingomyelinase D causes microvascular thrombosis.",
      "Recluse lesions develop central ischemia (blanching halo) followed by a sinking blue-gray violaceous bleb and necrotic ulceration.",
      "Brown recluses are shy synanthropic spiders with a strictly limited geographic range centered in the South-Central US.",
    ],
    clinicalConfirmation: [
      "Outline the erythematous border with a pen; wolf spider erythema regresses within 24–48 hours, while necrotic recluse lesions expand and ulcerate over days.",
      "Check for a sinking center; absence of central cyanosis, induration, or necrosis rules out severe loxoscelism.",
    ],
    forkQuestion: {
      question: "Was the pain immediate upon contact, and is there any dead/blue skin?",
      primaryTitle: "Instant sharp pinch with dual fang dots and pink swelling",
      primaryClues: [
        "Felt an immediate sharp pinch or needle poke the second it occurred",
        "Two visible red puncture dots from large spider fangs",
        "Raised pink swelling that is improving within 24 to 48 hours without skin breakdown",
      ],
      primarySignificance: "Favors Wolf Spider: harmless mechanical bite.",
      secondaryTitle: "Delayed pain (hours later) with sinking blue-gray dying skin",
      secondaryClues: [
        "Didn't feel much at first; severe aching pain escalated 2 to 8 hours later",
        "Center is flat or sinking with dark blue, gray, or purple discoloration",
        "Surrounded by a pale white ring and irregular red flare ('red, white, and blue')",
      ],
      secondarySignificance: "Favors Brown Recluse: cytotoxic envenomation.",
    },
  },

  "brown_recluse-yellow_sac_spider": {
    differentiator:
      "Yellow sac spider bites cause an immediate sharp stinging sensation followed by a small, raised red papule with a tiny central pustule that heals cleanly in 7–10 days, unlike the progressive sinking necrosis of a Brown Recluse.",
    primaryFavoredReasons: [
      "Immediate sharp bee-sting-like pain upon contact indoors near baseboards or drapery.",
      "Small raised red papule with tiny central pustular vesicle (under 1.5 cm).",
      "Heals cleanly within 7–10 days without sinking necrotic ulceration.",
    ],
    secondaryDisadvantagedReasons: [
      "Brown recluse bites cause delayed pain and deep tissue necrosis.",
      "Yellow sac spider venom causes only mild local cytotoxic inflammation.",
    ],
    clinicalConfirmation: [
      "Avoid picking the crust to prevent secondary bacterial infection.",
      "Absence of deep sinking ulceration confirms benign yellow sac spider.",
    ],
    forkQuestion: {
      question: "Did the bite form a tiny superficial blister that heals, or a sinking dark ulcer?",
      primaryTitle: "Immediate stinging with small pimple/blister that heals in days",
      primaryClues: [
        "Sharp stinging pain felt immediately during contact indoors",
        "Small red bump (<1.5 cm) with a tiny clear blister or pimple on top",
        "Crusts over and heals cleanly in 5–10 days without deep tissue dying",
      ],
      primarySignificance: "Favors Yellow Sac Spider: self-limiting mild envenomation.",
      secondaryTitle: "Delayed severe pain with expanding dark purple sinking ulcer",
      secondaryClues: [
        "Severe throbbing pain began hours after contact",
        "Center sinks down with dark purple/blue dead tissue that slowly breaks down into an ulcer",
        "Geographic presence in South-Central US",
      ],
      secondarySignificance: "Favors Brown Recluse: necrotic cytotoxic loxoscelism.",
    },
  },

  "black_widow-scorpion": {
    differentiator:
      "Black widow latrodectism causes systemic abdominal wall rigidity and severe muscle cramping distant from the bite; bark scorpion envenomation causes localized hyperesthesia (tap test positive) and cranial nerve dysautonomia (roving eye movements).",
    primaryFavoredReasons: [
      "Two microscopic puncture marks with surrounding targetoid blanched halo.",
      "Alpha-latrotoxin induces massive acetylcholine and catecholamine release, causing severe systemic cramping and rigid 'board-like' abdomen.",
    ],
    secondaryDisadvantagedReasons: [
      "Bark scorpion stings are single-point sting punctures without fang marks.",
      "Scorpion venom primarily induces cranial nerve motor hyperactivity (opsoclonus, tongue fasciculations, excessive salivation) rather than abdominal latrodectism.",
    ],
    clinicalConfirmation: [
      "Perform a gentle finger tap directly over the puncture: extreme hypersensitivity indicates scorpion over widow.",
      "Evaluate core vital signs for hypertension and monitor for abdominal muscle guarding.",
    ],
    forkQuestion: {
      question: "Are you having whole-body rigid muscle spasms, or extreme tap-sensitivity and facial twitching?",
      primaryTitle: "Severe rigid abdominal cramps and whole-body muscle spasms",
      primaryClues: [
        "Two tiny puncture dots; bite barely hurt at first",
        "1 to 3 hours later: excruciating cramps traveling to abdomen, thighs, or lower back",
        "Abdomen feels hard and tight as a wooden board, with high blood pressure and sweating",
      ],
      primarySignificance: "Favors Black Widow: alpha-latrotoxin neuroexcitation.",
      secondaryTitle: "Extreme pain on light tapping ('tap test') with eye/facial twitching",
      secondaryClues: [
        "Single puncture point; extreme shooting electric pain when tapped with a fingertip",
        "Numbness, tingling, difficulty swallowing, drooling, or roving involuntary eye movements",
        "Occurred in Southwest US desert (Arizona, Nevada, New Mexico, Utah, California)",
      ],
      secondarySignificance: "Favors Bark Scorpion: sodium-channel neurotoxicity.",
    },
  },

  "brown_widow-black_widow": {
    differentiator:
      "Brown widow envenomation typically produces localized burning pain with pathognomonic local diaphoresis (sweating) and goosebumps around the bite, whereas black widow venom delivers high alpha-latrotoxin loads causing severe ascending abdominal wall rigidity.",
    primaryFavoredReasons: [
      "Localized piloerection (goosebumps) and prominent diaphoresis confined to the immediate bite area.",
      "Mild to moderate localized pain without board-like abdominal muscle guarding.",
      "Presence of white geometric abdominal chevron patterns and spiked 'spiny' egg sacs in outdoor web habitats.",
    ],
    secondaryDisadvantagedReasons: [
      "Black widow bites induce massive systemic acetylcholine release causing excruciating muscle cramps traveling to the abdomen, back, and thighs.",
      "Black widow latrodectism often induces marked hypertension, tachycardia, and facial grimacing (facies latrodectismica).",
    ],
    clinicalConfirmation: [
      "Palpate abdomen: a soft, non-tender abdomen rules out severe black widow latrodectism.",
      "Monitor blood pressure and evaluate for localized sweating rings around the puncture site.",
    ],
    forkQuestion: {
      question: "Is there sweating and goosebumps right at the bite, or severe whole-body abdominal cramps?",
      primaryTitle: "Localized sweating and goosebumps directly surrounding the bite",
      primaryClues: [
        "Noticeable sweating beads and goosebumps confined to the skin right around the bite",
        "Pain is localized to the bite area without severe rigid cramps spreading to the stomach",
        "Encountered web under outdoor patio furniture; web may have spiky 'sea-urchin' egg sacs",
      ],
      primarySignificance: "Favors Brown Widow: localized latrodectism without severe systemic toxicity.",
      secondaryTitle: "Excruciating whole-body muscle rigidity and board-like abdominal spasms",
      secondaryClues: [
        "Pain rapidly ascended from the bite into the abdomen, chest, or lower back",
        "Abdominal wall is tight, rigid, and cramping severely with nausea and high blood pressure",
        "Web had smooth round marble-like egg sacs",
      ],
      secondarySignificance: "Favors Black Widow: high-potency systemic alpha-latrotoxin.",
    },
  },

  "fire_ant-chigger": {
    differentiator:
      "Fire ants deliver an immediate fiery electric sting that evolves into sterile cloudy-to-yellow pustules within 24 hours, whereas chiggers deliver a painless bite that causes severe delayed itching and solid red papules along tight clothing bands without pustules.",
    primaryFavoredReasons: [
      "Immediate sharp burning pain upon stepping on or disturbing an outdoor ant mound.",
      "Distinct cloudy or yellow sterile pustules forming on an erythematous base within 12–24 hours.",
      "Multiple stings clustered together from aggressive colonial swarming.",
    ],
    secondaryDisadvantagedReasons: [
      "Chigger bites are painless initially and do NOT form pustules.",
      "Chiggers cause intensely pruritic solid papules confined to sock lines, waistband, and skin folds.",
    ],
    clinicalConfirmation: [
      "Inspect central lesion morphology: sterile pustules confirm Solenopsis fire ant envenomation.",
      "Do not rupture pustules to prevent secondary Staphylococcus colonization.",
    ],
    forkQuestion: {
      question: "Did the bites turn into yellow pustules, and was there an immediate burning sting?",
      primaryTitle: "Immediate fiery burning sting with cloudy yellow pustules within 24h",
      primaryClues: [
        "Felt an immediate fiery stinging pain outdoors; stepped on or near an ant mound",
        "Distinct small yellow or cloudy blister-pustules formed atop the red bumps within 24 hours",
        "Multiple bites clustered tightly together from swarming insects",
      ],
      primarySignificance: "Favors Fire Ant: piperidine alkaloid venom uniquely produces sterile pustules.",
      secondaryTitle: "Delayed extreme itch along waistband/socks with solid red bumps (no pus)",
      secondaryClues: [
        "Did not feel any initial sting; intense itching began 12–24 hours after walking in tall grass",
        "Solid, intensely itchy red bumps lined along sock tops, belt line, or underwear elastic",
        "No cloudy pustules or blisters present",
      ],
      secondarySignificance: "Favors Chigger: microscopic mite digestive saliva causes pruritic papules.",
    },
  },

  "chigger-scabies": {
    differentiator:
      "Chiggers cause acute, intense itching 12–24 hours after outdoor brush exposure concentrated along clothing bands that resolves in 1–2 weeks, whereas scabies causes insidious progressive nocturnal itching with burrows in finger webs and wrist flexures affecting household contacts.",
    primaryFavoredReasons: [
      "Acute onset of extreme pruritus 12–24 hours after walking in tall weeds, briars, or berry patches.",
      "Lesions clustered strictly along tight elastic bands (socks, underwear, beltline).",
      "Self-limiting course; resolving in 10–14 days without spreading to other family members.",
    ],
    secondaryDisadvantagedReasons: [
      "Scabies develops insidiously over weeks and worsens progressively at night.",
      "Scabies produces pathognomonic serpiginous burrows in finger webs, wrists, axillae, and genitalia.",
      "Scabies is highly contagious among household members and sexual partners.",
    ],
    clinicalConfirmation: [
      "Examine finger webs and wrist flexures under dermoscopy for burrow lines and delta-wing mite sign.",
      "Scabies requires prescription 5% permethrin cream or oral ivermectin for the patient and all household contacts.",
    ],
    forkQuestion: {
      question: "When did the itching start, where is it located, and is anyone else in your house itching?",
      primaryTitle: "Sudden extreme itch along waistband/socks after outdoor weeds (resolves in 1–2w)",
      primaryClues: [
        "Itching began abruptly 12–24 hours after walking in tall grass, weeds, woods, or berry patches",
        "Bumps are concentrated around sock bands, waistband, groin, or behind knees",
        "No one else in your home is itching; lesions are slowly improving after 1–2 weeks",
      ],
      primarySignificance: "Favors Chigger: outdoor harvest mite exposure.",
      secondaryTitle: "Gradual severe nocturnal itch in finger webs and wrists affecting household",
      secondaryClues: [
        "Itching started slowly and has gotten progressively worse over weeks, especially at night in bed",
        "Thin zigzag lines or bumps between fingers, on wrists, armpits, or groin",
        "Other family members, roommates, or bed partners have started itching as well",
      ],
      secondarySignificance: "Favors Scabies: contagious microscopic human mite burrowing.",
    },
  },

  "wasp-honey_bee": {
    differentiator:
      "Honey bees possess a barbed lancet stinger that is torn from the bee and visibly left embedded in the victim's skin, whereas wasps and yellowjackets possess smooth stingers that retract, allowing multiple rapid stings without a retained barb.",
    primaryFavoredReasons: [
      "Barbed stinger with pulsating venom sac visibly left embedded in the center of the swelling.",
      "Single isolated sting (honey bees die following envenomation).",
    ],
    secondaryDisadvantagedReasons: [
      "Wasps, hornets, and yellowjackets have smooth stingers that do not detach in human skin.",
      "Wasps frequently sting multiple times in rapid succession when defending a nest or food.",
    ],
    clinicalConfirmation: [
      "Scrape stinger off immediately with a fingernail or credit card edge; do NOT squeeze with tweezers.",
      "Monitor for systemic IgE anaphylaxis (throat tightness, wheezing, hives, lightheadedness).",
    ],
    forkQuestion: {
      question: "Was a black stinger left behind stuck in your skin after the sting?",
      primaryTitle: "A stinger was visibly left embedded in the skin",
      primaryClues: [
        "A black barbed stinger or venom sac was left stuck in the center of the red swelling",
        "Only a single sting occurred (bee died after stinging)",
      ],
      primarySignificance: "Favors Honey Bee: barbed stinger detachment.",
      secondaryTitle: "No stinger was left behind in the skin",
      secondaryClues: [
        "No stinger or venom sac remained in the skin",
        "Insect was capable of stinging multiple times, or encounter occurred near trash, food, or eaves",
      ],
      secondarySignificance: "Favors Wasp / Yellowjacket: smooth retractable ovipositor.",
    },
  },

  "gulf_coast_tick-dog_tick": {
    differentiator:
      "Gulf Coast tick bites frequently develop a pathognomonic 'tache noire' (a dark, crusted black inoculation eschar with an erythematous halo) at the attachment site prior to Rickettsia parkeri spotted fever, whereas American dog tick bites typically present with an erythematous papule without a necrotic eschar.",
    primaryFavoredReasons: [
      "Development of a dark, non-painful black crusted eschar (*tache noire*) at the attachment site 4–10 days post-tick removal.",
      "Endemic along the Gulf Coast and Mid-Atlantic coastal marshes, pine flatwoods, and prairie grass.",
      "Associated with milder spotted fever rickettsiosis (fever, headache, eschar).",
    ],
    secondaryDisadvantagedReasons: [
      "American dog ticks (transmitting Rocky Mountain Spotted Fever) rarely produce an inoculation eschar at the bite site.",
      "RMSF rash begins peripherally on wrists and ankles and spreads centripetally, whereas R. parkeri is heralded by the local eschar.",
    ],
    clinicalConfirmation: [
      "Examine tick attachment site for black crusted eschar; presence confirms R. parkeri rickettsiosis.",
      "Initiate oral doxycycline 100 mg twice daily promptly if systemic fever or maculopapular rash develops.",
    ],
    forkQuestion: {
      question: "Is there a dark black crusted scab (eschar) where the tick was attached?",
      primaryTitle: "Dark, crusted black scab ('tache noire') formed at tick bite site",
      primaryClues: [
        "A distinct dark or black crusted sore formed right where the tick was removed",
        "Tender swollen lymph nodes in groin or armpit near the bite with mild fever",
        "Exposure in coastal grasslands, meadows, or pine flatwoods in Southern/Mid-Atlantic states",
      ],
      primarySignificance: "Favors Gulf Coast Tick (Rickettsia parkeri): pathognomonic tache noire eschar.",
      secondaryTitle: "Standard red bump without a black scab; high fever or wrist/ankle rash",
      secondaryClues: [
        "Tick bite is a standard pink/red bump without a central dry black necrotic scab",
        "Sudden high fever, severe headache, and small pink spots spreading inward from wrists or ankles",
      ],
      secondarySignificance: "Favors American Dog Tick (RMSF vector): systemic petechial rash without eschar.",
    },
  },

  "wood_tick-dog_tick": {
    differentiator:
      "Rocky Mountain wood ticks inhabit high-elevation montane brush and sagebrush (>4,000 ft) in the Intermountain West and can transmit Colorado Tick Fever or produce ascending reversible Tick Paralysis, whereas American dog ticks predominate in lower-elevation eastern grasslands and deciduous forests.",
    primaryFavoredReasons: [
      "Geographic exposure in high-elevation montane conifer forests or sagebrush of the Rocky Mountain states.",
      "Risk of biphasic 'saddleback' fever, chills, and severe retro-orbital headache characteristic of Colorado Tick Fever (CTFV).",
      "Risk of salivary neurotoxin-mediated ascending flaccid paralysis (Tick Paralysis).",
    ],
    secondaryDisadvantagedReasons: [
      "American dog ticks predominate east of the Rocky Mountains in humid open fields and shrubland.",
      "Dog ticks transmit RMSF and Tularemia, but do not transmit Colorado Tick Fever virus.",
    ],
    clinicalConfirmation: [
      "If ataxia or progressive lower-extremity weakness appears, conduct an immediate exhaustive scalp check; removing the attached wood tick rapidly reverses paralysis.",
      "Check complete blood count for leukopenia and thrombocytopenia typical of Colorado Tick Fever.",
    ],
    forkQuestion: {
      question: "Where did the exposure occur, and are there signs of high altitude fever or leg weakness?",
      primaryTitle: "High-altitude Rocky Mountain exposure (>4,000 ft) with fatigue/fever",
      primaryClues: [
        "Tick bite occurred in high-altitude mountain brush, conifer woods, or sagebrush in Western states (CO, WY, MT, ID, UT)",
        "Biphasic fever (fever for 2–3 days, breaks, then spikes again) with severe headache behind the eyes",
        "Any signs of leg weakness or clumsy walking (warning sign of tick paralysis)",
      ],
      primarySignificance: "Favors Rocky Mountain Wood Tick: Colorado Tick Fever or Tick Paralysis risk.",
      secondaryTitle: "Low-to-moderate elevation grasslands or deciduous woods east of the Rockies",
      secondaryClues: [
        "Tick bite occurred in fields, pastures, or deciduous woods east of the Rocky Mountains",
        "No high-altitude montane exposure",
      ],
      secondarySignificance: "Favors American Dog Tick: low-elevation eastern tick vector.",
    },
  },

  "jellyfish-stingray": {
    differentiator:
      "Jellyfish envenomation produces linear whipping whiplash-like flagellate urticarial tracks from nematocysts, whereas stingrays produce a deep jagged puncture/laceration from a caudal spine barb with excruciating localized ischemic pain relieved by hot water.",
    primaryFavoredReasons: [
      "Linear, zigzagging or crisscross erythematous wheals tracing tentacle contact.",
      "Rapid fire of epidermal nematocysts triggered by mechanical shear or freshwater rinse.",
    ],
    secondaryDisadvantagedReasons: [
      "Stingrays cause a deep physical laceration or puncture wound into foot/ankle tissue.",
      "Stingray spine venom requires hot water immersion (110–115°F) for heat-labile protein denaturation; jellyfish require saltwater rinse and vinegar (acetic acid).",
    ],
    clinicalConfirmation: [
      "Inspect wound architecture: linear surface tracking indicates cnidarian tentacle; deep laceration indicates elasmobranch barb.",
      "Never apply freshwater to suspected jellyfish tentacles (triggers remaining nematocyst discharge).",
    ],
    forkQuestion: {
      question: "Are there surface linear whipping tracks, or a deep puncture relieved by hot water?",
      primaryTitle: "Whiplash linear stinging tracks on skin while swimming in ocean",
      primaryClues: [
        "Linear, zigzagging, or whiplash-like red stinging tracks across the skin",
        "Occurred while swimming in open water near surface",
        "Burning relieved by vinegar or warm seawater; worsens if washed with fresh tap water",
      ],
      primarySignificance: "Favors Jellyfish: epidermal nematocyst venom discharge.",
      secondaryTitle: "Deep jagged puncture wound on foot/ankle dramatically relieved by HOT water",
      secondaryClues: [
        "Stepped on something buried in sandy shallow water; deep cut or puncture on foot or ankle",
        "Agonizing throbbing bone-deep pain radiating up the leg",
        "Soaking the foot in very hot water (110–115°F) rapidly and dramatically relieves the pain",
      ],
      secondarySignificance: "Favors Stingray: caudal spine barb with heat-labile venom.",
    },
  },

  "bird_rodent_mite-bed_bug": {
    differentiator:
      "Bird and rodent mites produce widespread pinpoint micro-papules with intense crawling sensations originating from roof/attic nests, whereas bed bugs produce larger distinct wheals in linear groups of 3 with mattress seam evidence.",
    primaryFavoredReasons: [
      "Bites are microscopic pinprick dots (1–2 mm); sensation of crawling bugs across skin.",
      "Exposure linked to bird nests in roof eaves, chimney, window AC unit, or rodent activity.",
      "Standard bed bug mattress inspections show no bugs or dark stains.",
    ],
    secondaryDisadvantagedReasons: [
      "Bed bug bites are larger (5–10 mm) distinct raised hives in classic 3-in-a-row patterns.",
      "Bed bugs leave characteristic dark fecal spotting along mattress piping and box springs.",
    ],
    clinicalConfirmation: [
      "Inspect roofline, chimney, attic, and window AC units for abandoned bird nests.",
      "Do NOT repeatedly use permethrin cream; eradication requires removing the animal host nest.",
    ],
    forkQuestion: {
      question: "Are the bites tiny pinpricks with crawling sensations, or larger distinct 3-in-a-row hives?",
      primaryTitle: "Tiny pinprick dots, persistent crawling sensation, attic/nest nearby",
      primaryClues: [
        "Bites are tiny 1–2 mm pinprick red dots; feel active crawling sensations on skin",
        "Presence of abandoned bird nests in roof eaves, chimney, window AC, or rodent presence",
        "Bed inspection shows zero signs of bed bugs on mattress seams",
      ],
      primarySignificance: "Favors Bird & Rodent Mites: non-burrowing mites migrating from animal nests.",
      secondaryTitle: "Larger distinct hives in 3-in-a-row rows with mattress seam evidence",
      secondaryClues: [
        "Larger raised itchy wheals (5–10 mm), often lined up in groups of 3 ('breakfast, lunch, dinner')",
        "Dark reddish-brown fecal spots or shed skins found along mattress seams or headboard",
        "Recent travel, hotel, hostel, or shared accommodation",
      ],
      secondarySignificance: "Favors Bed Bug: classic synanthropic cimicid infestation.",
    },
  },

  "pacific_coast_tick-blacklegged_tick": {
    differentiator:
      "Pacific Coast ticks inhabit West Coast chaparral and characteristically produce a pathognomonic black crusted necrotic inoculation eschar ('tache noire') from Rickettsia 364D, whereas Blacklegged ticks transmit Lyme disease and produce an expanding, clear-centered bullseye without an eschar.",
    primaryFavoredReasons: [
      "Exposure in coastal chaparral or oak woodland of California, Oregon, or Washington.",
      "Formation of a central dark black crusted necrotic sore (*tache noire*) at attachment site.",
      "Swollen regional lymph nodes and acute fever.",
    ],
    secondaryDisadvantagedReasons: [
      "Blacklegged ticks transmit Lyme disease, producing a non-necrotic expanding annular ring.",
      "Blacklegged tick Erythema Migrans lacks a central black crusty eschar.",
    ],
    clinicalConfirmation: [
      "Examine attachment site for black necrotic crust; indicates Pacific Coast tick fever (Rickettsia 364D).",
      "Treat early with oral doxycycline regardless of age per AAP Red Book guidance.",
    ],
    forkQuestion: {
      question: "Are you on the West Coast with a black crusted scab, or East/Midwest with an expanding ring?",
      primaryTitle: "West Coast chaparral exposure (CA/OR/WA) with black crusted scab",
      primaryClues: [
        "Tick exposure occurred in California, Oregon, or Washington chaparral/scrub",
        "A dark black crusted sore (tache noire) formed at the tick attachment site",
        "Tender swollen lymph nodes near the bite site with moderate fever",
      ],
      primarySignificance: "Favors Pacific Coast Tick (Rickettsia 364D): endemic West Coast tick fever.",
      secondaryTitle: "Expanding clear-centered bullseye ring without a black crust",
      secondaryClues: [
        "Tick exposure in the Northeast, Mid-Atlantic, Upper Midwest, or Pacific Northwest woods",
        "Red circular ring >5 cm expanding outward without a central black necrotic scab",
      ],
      secondarySignificance: "Favors Blacklegged Tick (Lyme): typical non-necrotic Erythema Migrans.",
    },
  },

  "minute_pirate_bug-mosquito": {
    differentiator:
      "Minute pirate bugs deliver an immediate, sharp, needle-like pinch outdoors in bright daylight during late summer/autumn, whereas mosquitoes bite painlessly at dusk or in shade, followed by delayed itchy soft hives.",
    primaryFavoredReasons: [
      "Instantaneous, surprising needle jab felt in bright sunny garden, field, or park.",
      "Tiny (<3 mm) dark insect with white chevron pattern on wings seen flying away.",
      "Produces small, transient raised bump that stops hurting quickly; non-blood feeder.",
    ],
    secondaryDisadvantagedReasons: [
      "Mosquitoes bite painlessly using salivary anesthetics, primarily at dawn, dusk, or humid shade.",
      "Mosquito bites develop into soft, intensely pruritic wheals hours later.",
    ],
    clinicalConfirmation: [
      "Reassurance: Minute pirate bugs are beneficial garden predators and transmit zero human pathogens.",
      "Apply cool compress and mild hydrocortisone cream for comfort.",
    ],
    forkQuestion: {
      question: "Did you feel an immediate sharp needle jab in daytime garden, or a painless bite at dusk?",
      primaryTitle: "Immediate sharp needle jab outdoors in bright daylight/sunshine",
      primaryClues: [
        "Felt an immediate sharp needle jab or pinch while outdoors in sunny late-summer/autumn weather",
        "Saw a tiny dark speck or flying bug (<3 mm) immediately after feeling the pinch",
        "Bump is small and stinging sensation fades quickly without severe delayed itching",
      ],
      primarySignificance: "Favors Minute Pirate Bug: predatory agricultural insect probing for moisture.",
      secondaryTitle: "Didn't feel the bite initially; noticed intensely itchy hive at dusk/shade",
      secondaryClues: [
        "Did not feel any initial pinch or jab; noticed a soft raised itchy hive later",
        "Occurred at dusk, dawn, or in shaded humid areas near trees or standing water",
      ],
      secondarySignificance: "Favors Mosquito: painless blood-feeding followed by delayed histamine flare.",
    },
  },
};

/**
 * Builds a dynamic fallback Fork-in-the-Road question for any arbitrary pair of species
 * by comparing their ecological, anatomical, and sensory profile in VECTOR_DATABASE.
 */
function buildDynamicFork(
  topVector: VectorInfo | undefined,
  runnerUpVector: VectorInfo | undefined,
  topId: string,
  runnerUpId: string,
): ForkInTheRoad["question"] & {
  primaryTitle: string;
  primaryClues: string[];
  primarySignificance: string;
  secondaryTitle: string;
  secondaryClues: string[];
  secondarySignificance: string;
} {
  const topName = topVector?.name || topId.replace(/_/g, " ");
  const runnerUpName = runnerUpVector?.name || runnerUpId.replace(/_/g, " ");

  const topHabitats = Object.entries(topVector?.habitatScores || {})
    .filter(([, score]) => score >= 1.2)
    .map(([h]) => h.replace(/_/g, " "));

  const runnerUpHabitats = Object.entries(runnerUpVector?.habitatScores || {})
    .filter(([, score]) => score >= 1.2)
    .map(([h]) => h.replace(/_/g, " "));

  const topSensations = Object.entries(topVector?.sensationScores || {})
    .filter(([, score]) => score >= 1.2)
    .map(([s]) => s.replace(/_/g, " "));

  const runnerUpSensations = Object.entries(runnerUpVector?.sensationScores || {})
    .filter(([, score]) => score >= 1.2)
    .map(([s]) => s.replace(/_/g, " "));

  return {
    question: `Our model identified close visual overlap between ${topName} and ${runnerUpName}. Which of these exposure patterns best matches your situation?`,
    primaryTitle: `Matches ${topName} habitat & sensation profile`,
    primaryClues: [
      topHabitats.length > 0
        ? `Exposure occurred in ${topHabitats.slice(0, 2).join(" or ")} environment`
        : `Consistent with typical ${topName} outdoor or domestic range`,
      topSensations.length > 0
        ? `Bite felt primarily ${topSensations.slice(0, 2).join(" or ")}`
        : `Lesion presentation matches clinical timeline for ${topName}`,
      topVector?.associatedPathogens?.length
        ? `Clinical context aligns with ${topVector.associatedPathogens[0]}`
        : `Hallmark physical findings favor ${topName}`,
    ],
    primarySignificance: `Favors ${topName}: concordant with regional habitat and sensation kinetics.`,
    secondaryTitle: `Matches ${runnerUpName} habitat & sensation profile`,
    secondaryClues: [
      runnerUpHabitats.length > 0
        ? `Exposure occurred in ${runnerUpHabitats.slice(0, 2).join(" or ")} environment`
        : `Consistent with typical ${runnerUpName} habitat`,
      runnerUpSensations.length > 0
        ? `Bite felt primarily ${runnerUpSensations.slice(0, 2).join(" or ")}`
        : `Presentation aligns with secondary ${runnerUpName} timeline`,
      runnerUpVector?.associatedPathogens?.length
        ? `Clinical context aligns with ${runnerUpVector.associatedPathogens[0]}`
        : `Hallmark physical findings favor ${runnerUpName}`,
    ],
    secondarySignificance: `Favors ${runnerUpName}: shifts probability based on your reported exposure.`,
  };
}

/**
 * Generates an authoritative clinical differential discriminator between top two ranked suspects,
 * including an interactive "Fork in the Road" tie-breaker.
 */
export function generateClinicalDiscriminator(
  topResult: TriageResultItem,
  runnerUpResult?: TriageResultItem | null,
  response?: TriageResponse | null,
  form?: TriageFormState | null,
): DiscriminatorComparison | null {
  if (!topResult || !runnerUpResult) return null;

  const topId = topResult.id || "";
  const runnerUpId = runnerUpResult.id || "";
  const topProb = Math.round(topResult.confidence ?? topResult.probability ?? 0);
  const runnerUpProb = Math.round(runnerUpResult.confidence ?? runnerUpResult.probability ?? 0);
  const delta = Math.abs(topProb - runnerUpProb);

  const topVector: VectorInfo | undefined = VECTOR_DATABASE[topId];
  const runnerUpVector: VectorInfo | undefined = VECTOR_DATABASE[runnerUpId];

  // Check for specialized clinical pairing (bidirectional)
  const pairKey1 = `${topId}-${runnerUpId}`;
  const pairKey2 = `${runnerUpId}-${topId}`;
  const curated = CLINICAL_PAIR_DISCRIMINATORS[pairKey1] || CLINICAL_PAIR_DISCRIMINATORS[pairKey2];
  const isDirectOrder = pairKey1 in CLINICAL_PAIR_DISCRIMINATORS;

  let differentiator = "";
  let ruleInReasons: string[] = [];
  let ruleOutReasons: string[] = [];
  let clinicalConfirmations: string[] = [];

  let forkConfig: {
    question: string;
    primaryTitle: string;
    primaryClues: string[];
    primarySignificance: string;
    secondaryTitle: string;
    secondaryClues: string[];
    secondarySignificance: string;
  };

  if (curated) {
    differentiator = curated.differentiator;
    ruleInReasons = isDirectOrder
      ? curated.primaryFavoredReasons
      : curated.secondaryDisadvantagedReasons;
    ruleOutReasons = isDirectOrder
      ? curated.secondaryDisadvantagedReasons
      : curated.primaryFavoredReasons;
    clinicalConfirmations = curated.clinicalConfirmation;

    if (curated.forkQuestion) {
      forkConfig = isDirectOrder
        ? curated.forkQuestion
        : {
            question: curated.forkQuestion.question,
            primaryTitle: curated.forkQuestion.secondaryTitle,
            primaryClues: curated.forkQuestion.secondaryClues,
            primarySignificance: curated.forkQuestion.secondarySignificance,
            secondaryTitle: curated.forkQuestion.primaryTitle,
            secondaryClues: curated.forkQuestion.primaryClues,
            secondarySignificance: curated.forkQuestion.primarySignificance,
          };
    } else {
      forkConfig = buildDynamicFork(topVector, runnerUpVector, topId, runnerUpId);
    }
  } else {
    // Dynamic clinical fallback generation using vector database traits
    const topName = topResult.name || topId.replace(/_/g, " ");
    const runnerUpName = runnerUpResult.name || runnerUpId.replace(/_/g, " ");
    const findings = response?.dermatologicalFindings;
    const reportedSensation = form?.sensation || "unspecified";

    differentiator = `Clinical morphology (${findings?.pattern ? findings.pattern.replace(/_/g, " ") : "lesion profile"}) and regional concordance favor ${topName} over ${runnerUpName} due to characteristic tissue reaction kinetics.`;

    ruleInReasons = [
      `Morphological alignment with ${topVector?.name || topName} presentation.`,
      topVector?.associatedPathogens?.length
        ? `Documented regional risk for ${topVector.associatedPathogens.slice(0, 2).join(" & ")}.`
        : "Matches seasonal and geographic activity profile for this area.",
      reportedSensation !== "unspecified"
        ? `Reported ${reportedSensation.replace(/_/g, " ")} is consistent with ${topName} venom/salivary exposure.`
        : "Consistent with observed clinical time course.",
    ];

    ruleOutReasons = [
      `Lower concordance for hallmark ${runnerUpName} features in this presentation.`,
      runnerUpVector?.dermatologicalMorphology?.pattern
        ? `Expected pattern for ${runnerUpName} (${runnerUpVector.dermatologicalMorphology.pattern.replace(/_/g, " ")}) was not primary finding.`
        : `Lacks characteristic secondary markers of ${runnerUpName}.`,
      "Down-ranked based on regional prevalence and exposure timeline.",
    ];

    clinicalConfirmations = [
      "Evaluate lesion border velocity by marking the margin with a surgical or ink pen.",
      "Monitor for progressive pain, spreading warmth, or secondary pustule formation.",
      "Review with a licensed clinician for definitive physical palpation and diagnosis.",
    ];

    forkConfig = buildDynamicFork(topVector, runnerUpVector, topId, runnerUpId);
  }

  // Check if non-vector mimicker was screened
  let mimickerRuleOut: DiscriminatorComparison["mimickerRuleOut"] = undefined;
  if (response?.mimickerAlert?.detected) {
    const cond = response.mimickerAlert.condition;
    const condName =
      cond === "tinea_corporis"
        ? "Ringworm (Tinea Corporis)"
        : cond === "bacterial_abscess_mrsa"
          ? "MRSA Bacterial Abscess / Furuncle"
          : cond === "contact_dermatitis"
            ? "Allergic Contact Dermatitis (Poison Ivy/Oak)"
            : "Non-Vector Cutaneous Mimic";

    mimickerRuleOut = {
      conditionName: condName,
      differentiatingSign:
        response.mimickerAlert.explanation ||
        "Non-arthropod skin condition screened; primary vector retained based on clinical presentation.",
    };
  }

  const forkInTheRoad: ForkInTheRoad = {
    id: `${topId}-${runnerUpId}`,
    isAmbiguous: delta <= 22,
    probabilityDelta: delta,
    question: forkConfig.question,
    primaryOption: {
      vectorId: topId,
      vectorName: topResult.name || topId,
      title: forkConfig.primaryTitle,
      clues: forkConfig.primaryClues,
      clinicalSignificance: forkConfig.primarySignificance,
      boostAmount: 18,
    },
    secondaryOption: {
      vectorId: runnerUpId,
      vectorName: runnerUpResult.name || runnerUpId,
      title: forkConfig.secondaryTitle,
      clues: forkConfig.secondaryClues,
      clinicalSignificance: forkConfig.secondarySignificance,
      boostAmount: 18,
    },
    neutralOption: {
      label: "Neither / Unsure",
      description: "Keep original AI baseline model ranking without tie-breaker adjustment",
    },
  };

  return {
    primarySuspect: {
      id: topId,
      name: topResult.name || topId,
      scientificName: topResult.scientificName,
      probability: topProb,
      ruleInRationale: ruleInReasons,
    },
    secondarySuspect: {
      id: runnerUpId,
      name: runnerUpResult.name || runnerUpId,
      scientificName: runnerUpResult.scientificName,
      probability: runnerUpProb,
      ruleOutRationale: ruleOutReasons,
    },
    keyClinicalDifferentiator: differentiator,
    mimickerRuleOut,
    recommendedClinicalConfirmation: clinicalConfirmations,
    forkInTheRoad,
  };
}

/**
 * Dynamically recalibrates the differential ranking based on the user's
 * interactive fork-in-the-road choice.
 */
export function applyForkInTheRoad(
  results: TriageResultItem[],
  choice: "primary" | "secondary" | "neutral",
  primaryId: string,
  secondaryId: string,
  boostAmount = 18,
): TriageResultItem[] {
  if (!results || results.length === 0 || choice === "neutral" || !primaryId || !secondaryId) {
    return results;
  }

  const cloned = results.map((item) => ({ ...item }));
  const primaryIndex = cloned.findIndex((r) => r.id === primaryId);
  const secondaryIndex = cloned.findIndex((r) => r.id === secondaryId);

  if (primaryIndex === -1 || secondaryIndex === -1) return results;

  const currentPrimaryProb = cloned[primaryIndex].confidence ?? cloned[primaryIndex].probability ?? 50;
  const currentSecondaryProb =
    cloned[secondaryIndex].confidence ?? cloned[secondaryIndex].probability ?? 30;

  if (choice === "primary") {
    cloned[primaryIndex].confidence = Math.min(96, Math.max(15, currentPrimaryProb + boostAmount));
    cloned[secondaryIndex].confidence = Math.max(3, currentSecondaryProb - boostAmount);
  } else if (choice === "secondary") {
    cloned[secondaryIndex].confidence = Math.min(96, Math.max(15, currentSecondaryProb + boostAmount));
    cloned[primaryIndex].confidence = Math.max(3, currentPrimaryProb - boostAmount);
  }

  // Normalize all probabilities so total remains exactly 100%
  const total = cloned.reduce(
    (acc, curr) => acc + (curr.confidence ?? curr.probability ?? 0),
    0,
  );

  if (total > 0) {
    const scale = 100 / total;
    cloned.forEach((item) => {
      const current = item.confidence ?? item.probability ?? 0;
      item.confidence = Math.round(current * scale * 10) / 10;
      item.probability = item.confidence;
    });
  }

  // Sort descending so the newly favored suspect takes rank 0
  cloned.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  return cloned;
}
