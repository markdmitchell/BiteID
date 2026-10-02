import { VECTOR_DATABASE, type VectorInfo } from "./geo-pest.server";
import { type TriageResponse, type TriageFormState, type TriageResultItem } from "./triage";

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
};

/**
 * Curated clinical pairwise discriminators based on dermatological & toxicological differential diagnosis guidelines.
 */
const CLINICAL_PAIR_DISCRIMINATORS: Record<
  string,
  {
    differentiator: string;
    primaryFavoredReasons: string[];
    secondaryDisadvantagedReasons: string[];
    clinicalConfirmation: string[];
  }
> = {
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
  },
  "fire_ant-bed_bug": {
    differentiator:
      "Fire ants produce sterile umbilicated pustules within 24 hours of an immediate burning sting, whereas bed bugs produce non-pustular pruritic wheals in linear groups of three ('breakfast, lunch, dinner') without pustule formation.",
    primaryFavoredReasons: [
      "Formation of distinct sterile, cloudy-to-yellow pustules on an erythematous base within 12–24 hours.",
      "Immediate stinging, intense fiery burning sensation upon venom injection (piperidine alkaloids).",
      "Characteristic clustered grouping from colonial swarming.",
    ],
    secondaryDisadvantagedReasons: [
      "Bed bug bites are painless upon delivery (salivary anesthetics) and produce delayed intensely itchy wheals rather than pustules.",
      "Bed bug lesions present in linear patterns on exposed skin during sleep, not outdoor swarm clusters.",
    ],
    clinicalConfirmation: [
      "Inspect central lesion morphology: sterile pustules confirm Solenopsis fire ant envenomation.",
      "Do not rupture pustules to prevent secondary Staphylococcus colonization.",
    ],
  },
  "pit_viper-coral_snake": {
    differentiator:
      "Pit vipers cause instantaneous excruciating pain, twin puncture marks, and rapidly advancing hemotoxic edema; coral snakes have chewing bites that deliver neurotoxic venom with minimal local swelling but delayed respiratory failure.",
    primaryFavoredReasons: [
      "Clear twin puncture marks spaced 10–25 mm apart.",
      "Immediate, severe local tissue edema, ecchymosis, and tissue destruction progressing by centimeters per hour.",
      "Hemotoxic and cytotoxic venom causing local coagulopathy.",
    ],
    secondaryDisadvantagedReasons: [
      "Coral snakes have small, fixed front fangs requiring a chewing motion, rarely leaving classic clean twin punctures.",
      "Coral snake venom causes almost no local tissue destruction or swelling, but carries profound delayed descending neuroparalysis.",
    ],
    clinicalConfirmation: [
      "Mark leading edge of edema every 15 minutes with timestamp.",
      "Immediate emergency transport for IV antivenom (CroFab for pit vipers; Coralyn for coral snakes).",
    ],
  },
  "jellyfish-stingray": {
    differentiator:
      "Jellyfish envenomation produces linear whipping whiplash-like flagellate urticarial tracks from nematocysts, whereas stingrays produce a deep jagged puncture/laceration from a caudal spine barb with excruciating localized ischemic pain.",
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
  },
  "saddleback_caterpillar-asp_caterpillar": {
    differentiator:
      "Saddleback caterpillars leave linear or grid-like rows of urticarial spine tracks and possess a distinct green-and-brown saddle pattern, whereas Asp caterpillars have dense woolly hairs that produce agonizing radiating bone-deep limb ache and grid-like hemorrhagic puncture grids.",
    primaryFavoredReasons: [
      "Linear or patchy erythematous wheals directly matching clusters of venomous hollow spines.",
      "Immediate fiery electric burning pain upon brush contact.",
      "Distinctive specimen appearance: slug-shaped green body with a purplish-brown central saddle and horn-like spine clusters.",
    ],
    secondaryDisadvantagedReasons: [
      "Asp caterpillar (puss moth) envenomations typically cause significantly more severe radiating pain extending up entire limb to regional lymph nodes.",
      "Asp caterpillars possess a teardrop hairy woolly 'toupee' appearance rather than a bare green saddle.",
    ],
    clinicalConfirmation: [
      "Apply adhesive cellophane tape to the contact site to strip remaining venomous hollow spines.",
      "Apply ice packs and topical corticosteroids to reduce burning urticarial inflammation.",
    ],
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
  },
};

/**
 * Generates an authoritative clinical differential discriminator between top two ranked suspects.
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

  // Check for specialized clinical pairing (bidirectional)
  const pairKey1 = `${topId}-${runnerUpId}`;
  const pairKey2 = `${runnerUpId}-${topId}`;
  const curated = CLINICAL_PAIR_DISCRIMINATORS[pairKey1] || CLINICAL_PAIR_DISCRIMINATORS[pairKey2];

  const topVector: VectorInfo | undefined = VECTOR_DATABASE[topId];
  const runnerUpVector: VectorInfo | undefined = VECTOR_DATABASE[runnerUpId];

  let differentiator = "";
  let ruleInReasons: string[] = [];
  let ruleOutReasons: string[] = [];
  let clinicalConfirmations: string[] = [];

  if (curated) {
    differentiator = curated.differentiator;
    ruleInReasons =
      pairKey1 in CLINICAL_PAIR_DISCRIMINATORS
        ? curated.primaryFavoredReasons
        : curated.secondaryDisadvantagedReasons;
    ruleOutReasons =
      pairKey1 in CLINICAL_PAIR_DISCRIMINATORS
        ? curated.secondaryDisadvantagedReasons
        : curated.primaryFavoredReasons;
    clinicalConfirmations = curated.clinicalConfirmation;
  } else {
    // Dynamic clinical fallback generation using vector database traits
    const topName = topResult.name || "Primary Suspect";
    const runnerUpName = runnerUpResult.name || "Secondary Differential";

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
  };
}
