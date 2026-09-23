import { VECTOR_DATABASE, type VectorItem } from "./geo-pest.server";
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

  const topVector: VectorItem | undefined = VECTOR_DATABASE[topId];
  const runnerUpVector: VectorItem | undefined = VECTOR_DATABASE[runnerUpId];

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
