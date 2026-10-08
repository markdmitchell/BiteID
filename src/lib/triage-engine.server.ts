import { streamText } from "ai";
import { createGoogleProvider, createLovableResponsesProvider } from "./ai-gateway.server";
import {
  MID_ATLANTIC_STATES,
  VECTOR_DATABASE,
  evaluateRegionalLikelihood,
  type DermatologicalMorphology,
} from "./geo-pest.server";
import { stateLabel } from "./us-states";

const MODEL = "openai/gpt-6-astra";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

import type { PatientVulnerabilityProfile, VulnerablePopulationGuidance } from "./triage";

/** Intake as sent by the client. Images are data URLs. */
export type EngineIntake = {
  lesionImage: string;
  bugImage?: string | null;
  environment: string;
  duration: string;
  usState: string;
  bodyLocation?: string | null;
  sensation?: string | null;
  patientProfile?: PatientVulnerabilityProfile;
  monthIndex: number;
  symptoms: string[];
  batOrAnimalExposure?: boolean;
  secondaryInfectionSymptoms?: string[];
  recentTravel?: "none" | "us_southwest" | "tropical_intl";
};

export type EngineResultItem = {
  id?: string | undefined;
  name: string;
  scientificName?: string | undefined;
  description?: string | undefined;
  confidence: number;
  urgency?: "critical" | "urgent" | "non_urgent" | undefined;
  matchedFactors?: string[] | undefined;
  associatedPathogens?: string[] | undefined;
  delayedRisks?: string[] | undefined;
  firstAidAdvice?: string[] | undefined;
  warningSignsToWatch?: string[] | undefined;
  vulnerableGuidance?: VulnerablePopulationGuidance | undefined;
};

export type DermatologicalFindings = {
  pattern: DermatologicalMorphology["pattern"];
  primaryLesion: string;
  centralFeatures: DermatologicalMorphology["centralFeatures"];
  primaryReaction: DermatologicalMorphology["primaryReaction"];
  estimatedDiameter: "under_1cm" | "1_to_5cm" | "over_5cm" | "diffuse";
  fitzpatrickTone: "type_i_ii" | "type_iii_iv" | "type_v_vi" | "indeterminate";
  lesionDescription: string;
};

export type MimickerAlert = {
  detected: boolean;
  condition: "tinea_corporis" | "bacterial_abscess_mrsa" | "contact_dermatitis" | "none";
  confidence: "low" | "moderate" | "high";
  explanation: string;
};

export type EngineResponse = {
  results: EngineResultItem[];
  guidance: string;
  disclaimer: string;
  isEmergencyRedirect?: boolean;
  culpritDetectedFromPhoto?: boolean;
  lesionReading?: string;
  hasErythemaMigrans?: boolean;
  dermatologicalFindings?: DermatologicalFindings;
  mimickerAlert?: MimickerAlert | null;
  isRejectedImage?: boolean;
  rejectionReason?: string;
  hasRabiesAlert?: boolean;
  hasCellulitisAlert?: boolean;
};

const DISCLAIMER =
  "Alpha version: for testing only. BiteID is not a medical service and does not provide a diagnosis. Always consult a clinician.";

/** Intake environment values -> engine habitat keys. */
const LOCATION_MAP: Record<string, string> = {
  woods: "tall_grass_woods",
  bed: "bed",
  yard: "yard_garden",
  water: "outdoor_other",
  travel: "outdoor_other",
  unsure: "outdoor_other",
};

/** Emergency short-circuit, mirroring the engine's safety gate. */
export function emergencyResponse(): EngineResponse {
  return {
    results: [],
    isEmergencyRedirect: true,
    guidance:
      "You reported a potential emergency symptom, so this intake was not analysed.\n\nCall emergency services or go to the nearest emergency department now. Do not wait for an assessment from this tool.",
    disclaimer: DISCLAIMER,
  };
}

export function rabiesEmergencyResponse(): EngineResponse {
  return {
    results: [],
    isEmergencyRedirect: true,
    hasRabiesAlert: true,
    guidance:
      "CRITICAL: POTENTIAL BAT OR MAMMALIAN RABIES EXPOSURE REPORTED.\n\nBat teeth are microscopic and can leave virtually painless, barely perceptible punctures that mimic insect bites. Waking up in a room, cabin, or tent where a bat was present constitutes a high-priority rabies exposure.\n\nSeek immediate emergency medical evaluation or contact your local health department for Rabies Post-Exposure Prophylaxis (PEP). Once clinical rabies symptoms appear, the virus is nearly 100% fatal; however, PEP administered promptly is 100% effective at preventing the disease.",
    disclaimer:
      "EMERGENCY CLINICAL NOTICE: Immediate medical evaluation required for mammalian exposure.",
  };
}

export function rejectedImageResponse(reason: string): EngineResponse {
  return {
    results: [],
    isRejectedImage: true,
    rejectionReason: reason,
    guidance:
      "The uploaded photo could not be safely assessed because it does not appear to show clear human skin or an identifiable arthropod.\n\nTo prevent medical misinformation and AI visual hallucinations, BiteID only evaluates authentic skin reactions. Please retake the photo in bright, even lighting using our guided camera reticle.",
    disclaimer: DISCLAIMER,
  };
}

export function unavailableResponse(): EngineResponse {
  return {
    results: [],
    guidance:
      "The assessment could not be completed for this intake. Please try again in a moment, and speak with a clinician if anything about the area is worsening.",
    disclaimer: DISCLAIMER,
  };
}

type VisionReading = {
  isSkinLesionOrArthropod: boolean;
  imageQuality: "acceptable" | "too_blurry" | "too_dark" | "non_dermatological";
  rejectionReason: string | null;
  bugTaxonomy: string | null;
  bugCommonName: string | null;
  fitzpatrickTone: "type_i_ii" | "type_iii_iv" | "type_v_vi" | "indeterminate";
  pattern: DermatologicalMorphology["pattern"];
  primaryLesion: string;
  centralFeatures: DermatologicalMorphology["centralFeatures"];
  primaryReaction: DermatologicalMorphology["primaryReaction"];
  primarySensation: string;
  estimatedDiameter: "under_1cm" | "1_to_5cm" | "over_5cm" | "diffuse";
  mimickerSuspicion: {
    condition: "tinea_corporis" | "bacterial_abscess_mrsa" | "contact_dermatitis" | "none";
    confidence: "low" | "moderate" | "high";
    explanation: string;
  };
  lesionDescription: string;
};

type VisionProvider = { type: "google"; apiKey: string } | { type: "lovable"; apiKey: string };

function resolveVisionProvider(): VisionProvider | null {
  const geminiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
  if (geminiKey) {
    return { type: "google", apiKey: geminiKey };
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    return { type: "lovable", apiKey: lovableKey };
  }
  return null;
}

const PATTERNS = [
  "solitary_wheal",
  "annular_target",
  "linear_grouped",
  "scattered_papules",
  "indurated_plaque",
  "vesiculobullous_cluster",
];
const PRIMARY_LESIONS = [
  "urticarial_wheal",
  "papule",
  "vesicle_bulla",
  "sterile_pustule",
  "plaque",
  "eschar_necrosis",
  "macule",
];
const CENTRAL = [
  "punctum_bite_mark",
  "twin_punctures",
  "vesicle_pustule",
  "clear_halo",
  "necrotic_ulcer",
  "none",
];
const REACTIONS = [
  "urticarial_hive",
  "expanding_erythema",
  "excoriated_papule",
  "ischemic_purpura",
  "vesiculobullous",
];
const SENSATIONS = ["intense_itch", "mild_itch", "painless", "moderate_pain", "severe_pain"];
const DIAMETERS = ["under_1cm", "1_to_5cm", "over_5cm", "diffuse"];
const FITZPATRICK_TONES = ["type_i_ii", "type_iii_iv", "type_v_vi", "indeterminate"];
const MIMICKER_CONDITIONS = [
  "tinea_corporis",
  "bacterial_abscess_mrsa",
  "contact_dermatitis",
  "none",
];
const MIMICKER_CONFIDENCES = ["low", "moderate", "high"];

function pick<T extends string>(value: unknown, allowed: readonly string[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value) ? (value as T) : fallback;
}

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Vision pass: entomology (bug photo) + dermatology (lesion morphology & mimicker screening). */
async function readPhotos(
  intake: EngineIntake,
  provider: VisionProvider,
): Promise<VisionReading | null> {
  const instructions = `You are an expert dermatological and entomological visual analysis node in an arthropod bite triage pipeline.
Methodically evaluate the images:

- Part 0 (Authenticity & Quality Gate):
  Determine whether the primary image actually shows human skin with an identifiable lesion/bite/rash, OR a captured insect/arthropod specimen.
  * If the image is non-dermatological (household object, clothing without skin, animal/pet, vehicle, food, document, room), set "isSkinLesionOrArthropod": false, "imageQuality": "non_dermatological", and provide "rejectionReason".
  * If the image is too blurry, out-of-focus, or motion-smeared to see lesion morphology, set "isSkinLesionOrArthropod": false, "imageQuality": "too_blurry", and provide "rejectionReason".
  * If the image is pitch black or bleached by glare, set "isSkinLesionOrArthropod": false, "imageQuality": "too_dark", and provide "rejectionReason".
  * If the image shows acceptable human skin or arthropod specimen, set "isSkinLesionOrArthropod": true, "imageQuality": "acceptable", and "rejectionReason": null.

- Part 1 (entomology): If ANY image contains a captured arthropod, insect, spider, tick, mite, or bug, identify it as precisely as possible (genus/species if visible, plus common name). Set "bugTaxonomy" and "bugCommonName". If no arthropod is shown in any image, set both to null.

- Part 2 (dermatology & tone calibration):
  If ANY image shows a skin lesion, bite, sting, or rash, describe ONLY observable clinical morphology without diagnosing a disease.
  * Tone calibration: Identify approximate Fitzpatrick phototype (type_i_ii, type_iii_iv, type_v_vi). Account for the fact that erythema on deeply pigmented skin appears violaceous, dusky plum, or post-inflammatory hyperpigmentation rather than bright pink.
  * Primary lesion & configuration: Categorize pattern, primary lesion type, central characteristics, and reaction type.
  * Estimated diameter: Categorize diameter based on visual perspective (under_1cm, 1_to_5cm, over_5cm, or diffuse).

- Part 3 (differential mimicker screening):
  Non-arthropod conditions frequently mimic bites. Inspect for hallmark signs:
  * "tinea_corporis" (ringworm): active raised erythematous scaly border with central clearing.
  * "bacterial_abscess_mrsa": fluctuant, indurated tender furuncle/boil with central purulence or yellow cap.
  * "contact_dermatitis": linear or streaked pruritic vesicles/bullae typical of poison ivy/oak or allergen contact.
  If observable morphological features strongly suggest one of these over an arthropod bite, set mimickerCondition and provide a concise rationale. Otherwise set mimickerCondition to "none".

Return a single JSON object, no prose, no markdown fences:
{
  "isSkinLesionOrArthropod": boolean,
  "imageQuality": "acceptable" | "too_blurry" | "too_dark" | "non_dermatological",
  "rejectionReason": string | null,
  "bugTaxonomy": string|null,
  "bugCommonName": string|null,
  "fitzpatrickTone": one of ${FITZPATRICK_TONES.join(" | ")},
  "pattern": one of ${PATTERNS.join(" | ")},
  "primaryLesion": one of ${PRIMARY_LESIONS.join(" | ")},
  "centralFeatures": one of ${CENTRAL.join(" | ")},
  "primaryReaction": one of ${REACTIONS.join(" | ")},
  "primarySensation": one of ${SENSATIONS.join(" | ")},
  "estimatedDiameter": one of ${DIAMETERS.join(" | ")},
  "mimickerCondition": one of ${MIMICKER_CONDITIONS.join(" | ")},
  "mimickerConfidence": one of ${MIMICKER_CONFIDENCES.join(" | ")},
  "mimickerExplanation": string,
  "lesionDescription": string
}`;

  const content: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
    {
      type: "text",
      text: `User images follow.${intake.bugImage ? " Two images provided (skin lesion and/or specimen)." : " One image provided."} Reported environment: ${intake.environment}. Time since onset: ${intake.duration}.`,
    },
    { type: "image", image: intake.lesionImage },
  ];
  if (intake.bugImage) content.push({ type: "image", image: intake.bugImage });

  let result;
  if (provider.type === "google") {
    const google = createGoogleProvider(provider.apiKey);
    result = streamText({
      model: google("gemini-3.6-flash"),
      system: instructions,
      messages: [{ role: "user", content }],
      abortSignal: AbortSignal.timeout(18000),
    });
  } else {
    const lovable = createLovableResponsesProvider(provider.apiKey);
    result = streamText({
      model: lovable.responses(MODEL),
      system: instructions,
      messages: [{ role: "user", content }],
      abortSignal: AbortSignal.timeout(18000),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
  }

  const text = await result.text;
  const parsed = parseJsonBlock(text);
  if (!parsed) return null;

  return {
    isSkinLesionOrArthropod: parsed["isSkinLesionOrArthropod"] !== false,
    imageQuality: pick(
      parsed["imageQuality"],
      ["acceptable", "too_blurry", "too_dark", "non_dermatological"],
      "acceptable",
    ),
    rejectionReason:
      typeof parsed["rejectionReason"] === "string" ? parsed["rejectionReason"] : null,
    bugTaxonomy: typeof parsed["bugTaxonomy"] === "string" ? parsed["bugTaxonomy"] : null,
    bugCommonName: typeof parsed["bugCommonName"] === "string" ? parsed["bugCommonName"] : null,
    fitzpatrickTone: pick(parsed["fitzpatrickTone"], FITZPATRICK_TONES, "indeterminate"),
    pattern: pick(parsed["pattern"], PATTERNS, "solitary_wheal"),
    primaryLesion: pick(parsed["primaryLesion"], PRIMARY_LESIONS, "urticarial_wheal"),
    centralFeatures: pick(parsed["centralFeatures"], CENTRAL, "punctum_bite_mark"),
    primaryReaction: pick(parsed["primaryReaction"], REACTIONS, "urticarial_hive"),
    primarySensation: pick(parsed["primarySensation"], SENSATIONS, "intense_itch"),
    estimatedDiameter: pick(parsed["estimatedDiameter"], DIAMETERS, "under_1cm"),
    mimickerSuspicion: {
      condition: pick(parsed["mimickerCondition"], MIMICKER_CONDITIONS, "none"),
      confidence: pick(parsed["mimickerConfidence"], MIMICKER_CONFIDENCES, "low"),
      explanation:
        typeof parsed["mimickerExplanation"] === "string" ? parsed["mimickerExplanation"] : "",
    },
    lesionDescription:
      typeof parsed["lesionDescription"] === "string" ? parsed["lesionDescription"] : "",
  };
}

export async function analyseIntake(intake: EngineIntake): Promise<EngineResponse> {
  if (intake.symptoms.length > 0) return emergencyResponse();
  if (intake.batOrAnimalExposure) return rabiesEmergencyResponse();

  const provider = resolveVisionProvider();
  let reading: VisionReading | null = null;
  if (provider) {
    try {
      reading = await readPhotos(intake, provider);
    } catch (error) {
      console.error("BiteID vision analysis failed", error);
    }
  }

  // P0 Non-Skin & Unusable Photo Rejection Gate:
  // Never hallucinate arthropod ranks or probabilities on household objects, blurry images, or pets
  if (reading && (!reading.isSkinLesionOrArthropod || reading.imageQuality !== "acceptable")) {
    return rejectedImageResponse(
      reading.rejectionReason ||
        (reading.imageQuality === "too_blurry"
          ? "The photo is too blurry or out of focus to identify skin borders or lesion morphology."
          : reading.imageQuality === "too_dark"
            ? "The photo lighting is too dim or obscured by direct flash glare."
            : "The uploaded photo does not appear to contain human skin or an identifiable arthropod."),
    );
  }

  const effectiveReading: VisionReading = reading ?? {
    isSkinLesionOrArthropod: true,
    imageQuality: "acceptable",
    rejectionReason: null,
    bugTaxonomy: null,
    bugCommonName: null,
    fitzpatrickTone: "indeterminate",
    pattern: "solitary_wheal",
    primaryLesion: "urticarial_wheal",
    centralFeatures: "punctum_bite_mark",
    primaryReaction: "urticarial_hive",
    primarySensation: "mild_itch",
    estimatedDiameter: "under_1cm",
    mimickerSuspicion: {
      condition: "none",
      confidence: "low",
      explanation: "",
    },
    lesionDescription: provider
      ? "Visual analysis was inconclusive; assessment derived from regional epidemiological prevalence, seasonal activity, and habitat context."
      : "Visual AI key not configured; assessment derived from regional epidemiological prevalence, seasonal activity, and habitat context.",
  };

  const morphology: DermatologicalMorphology = {
    pattern: effectiveReading.pattern,
    primaryLesion: effectiveReading.primaryLesion as DermatologicalMorphology["primaryLesion"],
    centralFeatures: effectiveReading.centralFeatures,
    primaryReaction: effectiveReading.primaryReaction,
    estimatedDiameter: effectiveReading.estimatedDiameter,
    fitzpatrickTone: effectiveReading.fitzpatrickTone,
  };

  const context = {
    usState: intake.usState || "US-VA",
    monthIndex: intake.monthIndex,
    incidentLocation: LOCATION_MAP[intake.environment] ?? "outdoor_other",
    primarySensation: effectiveReading.primarySensation,
    bodyLocation: intake.bodyLocation ?? "any_unspecified",
    sensation: intake.sensation ?? "unsure",
  };

  const probabilities = evaluateRegionalLikelihood(
    context,
    morphology,
    effectiveReading.bugTaxonomy,
  );

  const ranked = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .filter(([, p]) => p > 0);

  const monthName = MONTHS[intake.monthIndex] ?? "this month";
  const place = stateLabel(context.usState);

  const results: EngineResultItem[] = ranked.map(([key, probability]) => {
    const vector = VECTOR_DATABASE[key];
    const matchedFactors: string[] = [];
    if (vector) {
      const endemic =
        vector.endemicStates === "ALL" ||
        (Array.isArray(vector.endemicStates) && vector.endemicStates.includes(context.usState));
      matchedFactors.push(endemic ? `Present in ${place}` : `Uncommon but possible in ${place}`);
      const seasonal = vector.seasonalMultiplier[intake.monthIndex] ?? 0.5;
      matchedFactors.push(
        seasonal >= 0.7
          ? `Peak activity in ${monthName}`
          : seasonal >= 0.3
            ? `Moderate activity in ${monthName}`
            : `Low activity in ${monthName}`,
      );
      if (reading) {
        matchedFactors.push(
          `Lesion pattern read as ${effectiveReading.pattern.replace(/_/g, " ")}`,
        );
      } else {
        matchedFactors.push("Ranked by regional epidemiological baseline and habitat");
      }
      if (effectiveReading.bugTaxonomy) {
        matchedFactors.push(
          `Photographed arthropod read as ${effectiveReading.bugCommonName ?? effectiveReading.bugTaxonomy}`,
        );
      }
      if (intake.bodyLocation && intake.bodyLocation !== "any_unspecified") {
        const locScore = vector.bodyLocationScores?.[intake.bodyLocation] ?? 1.0;
        if (locScore >= 1.4) {
          const locName = intake.bodyLocation.replace(/_/g, " ");
          matchedFactors.push(
            `Anatomical site (${locName}) typical for ${vector.name.toLowerCase()}`,
          );
        }
      }
      if (intake.sensation && intake.sensation !== "unsure") {
        const sensScore = vector.sensationScores[intake.sensation] ?? 1.0;
        if (sensScore >= 0.9) {
          const sensName = intake.sensation.replace(/_/g, " ");
          matchedFactors.push(
            `Reported sensation (${sensName}) aligns with ${vector.name.toLowerCase()}`,
          );
        }
      }
    }

    let urgency: "critical" | "urgent" | "non_urgent" = vector?.urgency ?? "non_urgent";
    if (intake.patientProfile && intake.patientProfile !== "standard_adult") {
      if (
        key === "scorpion" ||
        key === "black_widow" ||
        key === "pit_viper" ||
        key === "coral_snake"
      ) {
        urgency = "critical";
      } else if (
        (intake.patientProfile === "infant_toddler" || intake.patientProfile === "child") &&
        (key === "dog_tick" ||
          key === "brown_dog_tick" ||
          key === "brown_recluse" ||
          key === "soft_tick")
      ) {
        urgency = "critical";
      } else if (
        intake.patientProfile === "pregnant_nursing" &&
        (key === "blacklegged_tick" || key === "soft_tick" || key === "kissing_bug")
      ) {
        urgency = "urgent";
      }
    }

    return {
      id: vector?.id,
      name: vector?.name ?? key,
      scientificName: vector?.scientificName,
      description: vector ? reading?.lesionDescription : undefined,
      confidence: Math.round(probability * 1000) / 10,
      urgency,
      matchedFactors,
      associatedPathogens: vector?.associatedPathogens,
      delayedRisks: vector?.delayedRisks,
      firstAidAdvice: vector?.firstAidAdvice,
      warningSignsToWatch: vector?.warningSigns,
      vulnerableGuidance: vector?.vulnerableGuidance,
    };
  });

  const top = ranked[0] ? VECTOR_DATABASE[ranked[0][0]] : undefined;

  const isErythemaMigrans =
    effectiveReading.pattern === "annular_target" ||
    (top?.id === "blacklegged_tick" && effectiveReading.primaryReaction === "expanding_erythema") ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(effectiveReading.lesionDescription);

  const hasCellulitisAlert =
    Boolean(intake.secondaryInfectionSymptoms?.includes("red_streaks")) ||
    Boolean(intake.secondaryInfectionSymptoms?.includes("spreading_warmth")) ||
    Boolean(intake.secondaryInfectionSymptoms?.includes("pus_drainage"));

  const guidanceLines: string[] = [];
  if (hasCellulitisAlert) {
    guidanceLines.push(
      "URGENT CLINICAL WARNING: Signs of Secondary Bacterial Infection (Cellulitis / Lymphangitis) Reported.\nSpreading red streaks, progressive hot induration, or purulent exudate indicate a secondary bacterial superinfection (e.g. Streptococcus pyogenes or Staphylococcus aureus) introduced by fingernail scratching. Seek medical evaluation promptly for prescription antibiotic therapy.",
    );
  }

  if (intake.recentTravel === "us_southwest") {
    guidanceLines.push(
      "Recent Travel Notice: Travel to the US Southwest / Sonoran desert within 14 days increases baseline suspicion for desert envenomations (such as Bark Scorpions or Brown Recluse spiders) regardless of your current location.",
    );
  } else if (intake.recentTravel === "tropical_intl") {
    guidanceLines.push(
      "Recent Travel Notice: International or tropical travel within 14 days warrants clinical screening for travel-associated vector pathogens (such as Dengue, Chikungunya, Zika, or Sandfly cutaneous leishmaniasis).",
    );
  }

  if (top) {
    guidanceLines.push(top.firstAidAdvice.join(" "));
    guidanceLines.push(`Watch for: ${top.warningSigns.join(" ")}`);
  }
  if (isErythemaMigrans) {
    guidanceLines.push(
      "Erythema Migrans (an expanding annular or bullseye rash) is a characteristic early sign of Lyme disease. Prompt clinical evaluation and antibiotic treatment by a healthcare provider are advised.",
    );
  } else if (
    MID_ATLANTIC_STATES.includes(context.usState) &&
    effectiveReading.pattern === "annular_target"
  ) {
    guidanceLines.push(
      "An expanding ring-shaped rash in this region is treated as time-sensitive. Have a clinician review it promptly.",
    );
  }

  // Patient Profile Tailored Guidance
  if (intake.patientProfile === "infant_toddler") {
    guidanceLines.push(
      "Pediatric Safety Alert (< 2 years): High venom-to-body-mass ratio. If envenomation is suspected or systemic signs occur (opsoclonus, excessive drooling, rigid abdomen, vomiting), call 911 immediately. Never use aspirin; dose all fever/allergy medications strictly by weight with an oral calibrated syringe.",
    );
  } else if (intake.patientProfile === "child") {
    guidanceLines.push(
      "Pediatric Alert (Child 2–12 years): STRICTLY AVOID Aspirin, baby aspirin, or bismuth subsalicylate (Pepto-Bismol) due to fatal Reye's syndrome risk. For severe allergic reactions, EpiPen Jr (0.15 mg) is indicated for children 7.5–30 kg.",
    );
  } else if (intake.patientProfile === "pregnant_nursing") {
    guidanceLines.push(
      "Pregnancy Safety Alert: Doxycycline and oral Ivermectin are contraindicated due to fetal toxicity. First-line safe alternatives (e.g. Amoxicillin 500mg TID for Lyme or Permethrin 5% for scabies) should be utilized under physician supervision.",
    );
  } else if (intake.patientProfile === "geriatric_immune") {
    guidanceLines.push(
      "Older Adult & High-Risk Alert: Beers Criteria warns against Diphenhydramine (Benadryl) due to acute confusion, urinary retention, and fall risks; 2nd-generation Cetirizine or Loratadine is preferred. Watch for atypical faint rashes or sudden mental status decline.",
    );
  }

  const mimickerAlert: MimickerAlert | null =
    effectiveReading.mimickerSuspicion.condition !== "none" &&
    effectiveReading.mimickerSuspicion.confidence !== "low"
      ? {
          detected: true,
          condition: effectiveReading.mimickerSuspicion.condition,
          confidence: effectiveReading.mimickerSuspicion.confidence,
          explanation: effectiveReading.mimickerSuspicion.explanation,
        }
      : null;

  const dermatologicalFindings: DermatologicalFindings = {
    pattern: effectiveReading.pattern,
    primaryLesion: effectiveReading.primaryLesion,
    centralFeatures: effectiveReading.centralFeatures,
    primaryReaction: effectiveReading.primaryReaction,
    estimatedDiameter: effectiveReading.estimatedDiameter,
    fitzpatrickTone: effectiveReading.fitzpatrickTone,
    lesionDescription: effectiveReading.lesionDescription,
  };

  return {
    results,
    guidance: guidanceLines.filter(Boolean).join("\n\n"),
    disclaimer: DISCLAIMER,
    culpritDetectedFromPhoto: Boolean(reading?.bugTaxonomy),
    lesionReading: effectiveReading.lesionDescription,
    hasErythemaMigrans: isErythemaMigrans,
    hasCellulitisAlert,
    dermatologicalFindings,
    mimickerAlert,
  };
}
