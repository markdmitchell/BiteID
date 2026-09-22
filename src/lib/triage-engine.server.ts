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

/** Intake as sent by the client. Images are data URLs. */
export type EngineIntake = {
  lesionImage: string;
  bugImage?: string | null;
  environment: string;
  duration: string;
  usState: string;
  monthIndex: number;
  symptoms: string[];
};

export type EngineResultItem = {
  id?: string | undefined;
  name: string;
  scientificName?: string | undefined;
  description?: string | undefined;
  confidence: number;
  matchedFactors?: string[] | undefined;
  associatedPathogens?: string[] | undefined;
  delayedRisks?: string[] | undefined;
  firstAidAdvice?: string[] | undefined;
  warningSignsToWatch?: string[] | undefined;
};

export type EngineResponse = {
  results: EngineResultItem[];
  guidance: string;
  disclaimer: string;
  isEmergencyRedirect?: boolean;
  culpritDetectedFromPhoto?: boolean;
  lesionReading?: string;
  hasErythemaMigrans?: boolean;
};

const DISCLAIMER =
  "Alpha version — for testing only. BiteID is not a medical service and does not provide a diagnosis. Always consult a clinician.";

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

export function unavailableResponse(): EngineResponse {
  return {
    results: [],
    guidance:
      "The assessment could not be completed for this intake. Please try again in a moment, and speak with a clinician if anything about the area is worsening.",
    disclaimer: DISCLAIMER,
  };
}

type VisionReading = {
  bugTaxonomy: string | null;
  bugCommonName: string | null;
  pattern: DermatologicalMorphology["pattern"];
  centralFeatures: DermatologicalMorphology["centralFeatures"];
  primaryReaction: DermatologicalMorphology["primaryReaction"];
  primarySensation: string;
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
];
const CENTRAL = ["punctum_bite_mark", "clear_halo", "vesicle_blister", "necrotic_ulcer", "none"];
const REACTIONS = [
  "urticarial_hive",
  "expanding_erythema",
  "excoriated_papule",
  "ischemic_purpura",
];
const SENSATIONS = ["intense_itch", "mild_itch", "painless", "moderate_pain", "severe_pain"];

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

/** Vision pass: entomology (bug photo) + dermatology (lesion morphology). */
async function readPhotos(
  intake: EngineIntake,
  provider: VisionProvider,
): Promise<VisionReading | null> {
  const instructions = `You are a two-part visual analysis node in an arthropod bite triage pipeline.
- Part 1 (entomology): If ANY image contains a captured arthropod, insect, spider, tick, mite, or bug, identify it as precisely as possible (genus/species if visible, plus common name). Set "bugTaxonomy" and "bugCommonName". If no arthropod is shown in any image, set both to null.
- Part 2 (dermatology): If ANY image shows a skin lesion, bite, sting, or cutaneous reaction, describe ONLY the observable morphology. Do not diagnose a disease and do not name a treatment.

Return a single JSON object, no prose, no markdown fences:
{
  "bugTaxonomy": string|null,          // scientific name if an arthropod is provided in any image, else null
  "bugCommonName": string|null,        // common name if identified, else null
  "pattern": one of ${PATTERNS.join(" | ")},
  "centralFeatures": one of ${CENTRAL.join(" | ")},
  "primaryReaction": one of ${REACTIONS.join(" | ")},
  "primarySensation": one of ${SENSATIONS.join(" | ")},   // most likely sensation given the morphology
  "lesionDescription": string          // 1-2 sentences, purely descriptive
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
    });
  } else {
    const lovable = createLovableResponsesProvider(provider.apiKey);
    result = streamText({
      model: lovable.responses(MODEL),
      system: instructions,
      messages: [{ role: "user", content }],
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
    bugTaxonomy: typeof parsed["bugTaxonomy"] === "string" ? parsed["bugTaxonomy"] : null,
    bugCommonName: typeof parsed["bugCommonName"] === "string" ? parsed["bugCommonName"] : null,
    pattern: pick(parsed["pattern"], PATTERNS, "solitary_wheal"),
    centralFeatures: pick(parsed["centralFeatures"], CENTRAL, "punctum_bite_mark"),
    primaryReaction: pick(parsed["primaryReaction"], REACTIONS, "urticarial_hive"),
    primarySensation: pick(parsed["primarySensation"], SENSATIONS, "intense_itch"),
    lesionDescription:
      typeof parsed["lesionDescription"] === "string" ? parsed["lesionDescription"] : "",
  };
}

export async function analyseIntake(intake: EngineIntake): Promise<EngineResponse> {
  if (intake.symptoms.length > 0) return emergencyResponse();

  const provider = resolveVisionProvider();
  let reading: VisionReading | null = null;
  if (provider) {
    try {
      reading = await readPhotos(intake, provider);
    } catch (error) {
      console.error("BiteID vision analysis failed", error);
    }
  }

  const effectiveReading: VisionReading = reading ?? {
    bugTaxonomy: null,
    bugCommonName: null,
    pattern: "solitary_wheal",
    centralFeatures: "punctum_bite_mark",
    primaryReaction: "urticarial_hive",
    primarySensation: "mild_itch",
    lesionDescription: provider
      ? "Visual analysis was inconclusive; assessment derived from regional epidemiological prevalence, seasonal activity, and habitat context."
      : "Visual AI key not configured; assessment derived from regional epidemiological prevalence, seasonal activity, and habitat context.",
  };

  const morphology: DermatologicalMorphology = {
    pattern: effectiveReading.pattern,
    centralFeatures: effectiveReading.centralFeatures,
    primaryReaction: effectiveReading.primaryReaction,
  };

  const context = {
    usState: intake.usState || "US-VA",
    monthIndex: intake.monthIndex,
    incidentLocation: LOCATION_MAP[intake.environment] ?? "outdoor_other",
    primarySensation: effectiveReading.primarySensation,
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
    }

    return {
      id: vector?.id,
      name: vector?.name ?? key,
      scientificName: vector?.scientificName,
      description: vector ? reading?.lesionDescription : undefined,
      confidence: Math.round(probability * 1000) / 10,
      matchedFactors,
      associatedPathogens: vector?.associatedPathogens,
      delayedRisks: vector?.delayedRisks,
      firstAidAdvice: vector?.firstAidAdvice,
      warningSignsToWatch: vector?.warningSigns,
    };
  });

  const top = ranked[0] ? VECTOR_DATABASE[ranked[0][0]] : undefined;

  const isErythemaMigrans =
    effectiveReading.pattern === "annular_target" ||
    (top?.id === "blacklegged_tick" &&
      (effectiveReading.pattern === "annular_target" ||
        effectiveReading.primaryReaction === "expanding_erythema")) ||
    /erythema migrans|bull'?s?[- ]?eye|annular target/i.test(effectiveReading.lesionDescription);

  const guidanceLines: string[] = [];
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
      "An expanding ring-shaped rash in this region is treated as time-sensitive — have a clinician review it promptly.",
    );
  }

  return {
    results,
    guidance: guidanceLines.filter(Boolean).join("\n\n"),
    disclaimer: DISCLAIMER,
    culpritDetectedFromPhoto: Boolean(reading?.bugTaxonomy),
    lesionReading: effectiveReading.lesionDescription,
    hasErythemaMigrans: isErythemaMigrans,
  };
}
