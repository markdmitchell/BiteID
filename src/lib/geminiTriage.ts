import { GoogleGenAI } from "@google/genai";
import {
  TriageContext,
  AnalysisResult,
  DermatologicalMorphology,
  VisionAnalysis,
  VisionAnalysisSchema,
  EntomologistNodeSchema,
  DermatologistNodeSchema,
} from "./schema";
import { VECTOR_DATABASE, evaluateRegionalLikelihood } from "./geoPestFilter";

export async function analyzeBiteWithGemini(
  lesionImageBuffer: Buffer,
  culpritImageBuffer: Buffer | null,
  context: TriageContext
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    if (
      process.env.NODE_ENV === "test" ||
      process.env.VITEST === "true" ||
      process.env.E2E_TEST === "true"
    ) {
      console.warn("GEMINI_API_KEY is not set in test environment. Operating in deterministic synthesis mode.");
      return generateMockTriageResult(context, !!culpritImageBuffer);
    }
    throw new Error("Missing Gemini API Key. Please configure GEMINI_API_KEY in your environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Execute Node A (The Entomologist) and Node B (The Dermatologist) in parallel
    const [nodeA, nodeB] = await Promise.all([
      runEntomologistNode(ai, culpritImageBuffer),
      runDermatologistNode(ai, lesionImageBuffer),
    ]);

    // Node C (The Synthesizer)
    return synthesizeTriageResult(nodeA, nodeB, context);
  } catch (error: any) {
    console.error("Gemini vision pipeline error:", error);
    throw new Error(`Gemini Vision Analysis Failed: ${error.message || error}`);
  }
}

/**
 * Node A: The Entomologist
 * Specialized vision call to identify insect/spider taxonomy if culprit photo is present.
 */
async function runEntomologistNode(
  ai: GoogleGenAI,
  culpritBuffer: Buffer | null
): Promise<{ bugPhotoProvided: boolean; identifiedBugTaxonomy: string | null }> {
  if (!culpritBuffer || culpritBuffer.length === 0) {
    return { bugPhotoProvided: false, identifiedBugTaxonomy: null };
  }

  try {
    const prompt = `You are Node A (The Entomologist), a world-class entomologist.
Analyze the provided bug photo. Determine the scientific taxonomy of the specimen (e.g. Amblyomma americanum, Ixodes scapularis, Cimex lectularius, Culicidae, Loxosceles reclusa).
Pay close attention to key morphological identification hallmarks:
- Amblyomma americanum (Lone Star Tick): Adult females feature a distinct single central white or silver spot on the scutum (shield). Adult males feature inverted white horseshoe or white festoon markings along the posterior edge of the scutum.
- Ixodes scapularis (Blacklegged/Deer Tick): Dark brownish-black scutum without white spots or festoon markings, oval teardrop abdomen.
If no clear insect/spider is identified, set identifiedBugTaxonomy to null.

Output MUST be valid JSON strictly adhering to:
{
  "bugPhotoProvided": true,
  "identifiedBugTaxonomy": "Scientific taxonomy name or null"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: culpritBuffer.toString("base64"),
          },
        },
      ] as any,
      config: { temperature: 0.1 },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error(`Entomologist Node A returned non-JSON response: ${text}`);
    }

    const rawParsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const validation = EntomologistNodeSchema.safeParse(rawParsed);

    if (!validation.success) {
      throw new Error(`Entomologist Node A output failed Zod schema validation: ${validation.error.message}`);
    }

    return validation.data;
  } catch (err: any) {
    console.error("Entomologist Node A execution failed:", err);
    throw new Error(`Entomologist vision node failed: ${err.message || err}`);
  }
}

/**
 * Node B: The Dermatologist
 * Specialized vision call to classify skin lesion morphology.
 */
async function runDermatologistNode(
  ai: GoogleGenAI,
  lesionBuffer: Buffer
): Promise<{
  lesionMorphology: "annular_target" | "edematous_wheal" | "linear_cluster" | "necrotic_macule" | "other";
}> {
  try {
    const prompt = `You are Node B (The Dermatologist), a board-certified dermatologist specializing in arthropod bite reactions.
Analyze the provided skin reaction photo and classify its primary visual morphology.
You MUST select exactly one lesionMorphology enum value from:
- "annular_target": Expanding circular rash with central clearing (>5cm) characteristic of Erythema Migrans (tick bite).
- "edematous_wheal": Small localized hives or acute histamine papule (<2cm) (mosquito/fly).
- "linear_cluster": Sequential linear bite pattern ('breakfast, lunch, dinner') (bed bug/flea).
- "necrotic_macule": Violaceous plaque with central ulceration or necrosis (brown recluse).
- "other": Non-specific rash or other skin presentation.

Output MUST be valid JSON strictly adhering to:
{
  "lesionMorphology": "annular_target" | "edematous_wheal" | "linear_cluster" | "necrotic_macule" | "other"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: lesionBuffer.toString("base64"),
          },
        },
      ] as any,
      config: { temperature: 0.1 },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error(`Dermatologist Node B returned non-JSON response: ${text}`);
    }

    const rawParsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const validation = DermatologistNodeSchema.safeParse(rawParsed);

    if (!validation.success) {
      throw new Error(`Dermatologist Node B output failed Zod schema validation: ${validation.error.message}`);
    }

    return validation.data;
  } catch (err: any) {
    console.error("Dermatologist Node B execution failed:", err);
    throw new Error(`Dermatologist vision node failed: ${err.message || err}`);
  }
}

/**
 * Node C: The Synthesizer
 * Combines Node A entomology and Node B dermatology with deterministic geo-seasonal decision engine.
 */
function synthesizeTriageResult(
  nodeA: { bugPhotoProvided: boolean; identifiedBugTaxonomy: string | null },
  nodeB: { lesionMorphology: "annular_target" | "edematous_wheal" | "linear_cluster" | "necrotic_macule" | "other" },
  context: TriageContext,
  overrideMorphology?: DermatologicalMorphology
): AnalysisResult {
  const probs = evaluateRegionalLikelihood(
    context,
    overrideMorphology || nodeB.lesionMorphology,
    nodeA.identifiedBugTaxonomy
  );
  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);

  // Map lesionMorphology to DermatologicalMorphology for legacy compatibility
  let pattern: DermatologicalMorphology["pattern"] = "solitary_wheal";
  let centralFeatures: DermatologicalMorphology["centralFeatures"] = "punctum_bite_mark";
  let primaryReaction: DermatologicalMorphology["primaryReaction"] = "urticarial_hive";

  if (overrideMorphology) {
    pattern = overrideMorphology.pattern;
    centralFeatures = overrideMorphology.centralFeatures;
    primaryReaction = overrideMorphology.primaryReaction;
  } else if (nodeB.lesionMorphology === "annular_target") {
    pattern = "annular_target";
    centralFeatures = "punctum_bite_mark";
    primaryReaction = "expanding_erythema";
  } else if (nodeB.lesionMorphology === "linear_cluster") {
    pattern = "linear_grouped";
    centralFeatures = "clear_halo";
    primaryReaction = "urticarial_hive";
  } else if (nodeB.lesionMorphology === "necrotic_macule") {
    pattern = "indurated_plaque";
    centralFeatures = "necrotic_ulcer";
    primaryReaction = "ischemic_purpura";
  }

  const morphology: DermatologicalMorphology = { pattern, centralFeatures, primaryReaction };

  const rankedCandidates = sorted.slice(0, 3).map(([key, prob], index) => {
    const vector = VECTOR_DATABASE[key];
    const confidence = prob > 0.4 ? "high" : prob > 0.2 ? "medium" : "low";

    const matchedFactors: string[] = [];

    if ((nodeB.lesionMorphology === "annular_target" || pattern === "annular_target") && key === "blacklegged_tick") {
      matchedFactors.push("Classic Erythema Migrans (annular targetoid rash) indicative of Blacklegged Tick exposure");
    }

    if (key === "lone_star_tick" && nodeA.identifiedBugTaxonomy && (nodeA.identifiedBugTaxonomy.toLowerCase().includes("amblyomma") || nodeA.identifiedBugTaxonomy.toLowerCase().includes("lone star"))) {
      matchedFactors.push("Entomologist confirmed Amblyomma americanum (Lone Star Tick) morphology with Alpha-gal syndrome risk");
    }

    if (nodeA.identifiedBugTaxonomy && index === 0) {
      matchedFactors.push(`Pest taxonomy identified as ${nodeA.identifiedBugTaxonomy} by Node A (Entomologist)`);
    }

    if (context.incidentLocation && vector.habitatScores[context.incidentLocation] >= 0.7) {
      matchedFactors.push(`High correlation with incident location (${context.incidentLocation.replace(/_/g, " ")})`);
    }

    if (vector.endemicStates === "ALL" || vector.endemicStates.includes(context.usState)) {
      matchedFactors.push(`Known endemic species in region (${context.usState})`);
    }

    if (vector.sensationScores[context.primarySensation] >= 0.7) {
      matchedFactors.push(`Sensation profile (${context.primarySensation.replace(/_/g, " ")}) matches vector pattern`);
    }

    return {
      pestName: vector.name,
      name: vector.name,
      scientificName: vector.scientificName,
      confidence: confidence as "high" | "medium" | "low",
      probabilityScore: prob,
      probability: prob,
      matchedFactors,
      associatedPathogens: vector.associatedPathogens || [],
      delayedRisks: vector.delayedRisks || [],
      firstAidAdvice: vector.firstAidAdvice,
      warningSignsToWatch: vector.warningSigns,
      warningSigns: vector.warningSigns,
    };
  });

  const topMatch = rankedCandidates[0];

  const rawVisionAnalysis = {
    bugPhotoProvided: nodeA.bugPhotoProvided,
    identifiedBugTaxonomy: nodeA.identifiedBugTaxonomy,
    lesionMorphology: nodeB.lesionMorphology,
    primarySuspectedCause: topMatch.name,
  };

  const visionValidation = VisionAnalysisSchema.safeParse(rawVisionAnalysis);
  if (!visionValidation.success) {
    throw new Error(`VisionAnalysisSchema failed Zod validation: ${visionValidation.error.message}`);
  }

  const visionAnalysis: VisionAnalysis = visionValidation.data;

  return {
    isEmergencyRedirect: false,
    culpritDetectedFromPhoto: nodeA.bugPhotoProvided,
    morphology,
    visionAnalysis,
    rankedCandidates,
    summary:
      nodeB.lesionMorphology === "annular_target" || pattern === "annular_target"
        ? `Analysis indicates ${topMatch.name} (${topMatch.scientificName}) as the primary culprit due to targetoid Erythema Migrans morphology, combined with regional endemic data for ${context.usState}. Immediate medical evaluation for potential Lyme disease prophylaxis is recommended.`
        : nodeA.bugPhotoProvided
        ? `Analysis indicates ${topMatch.name} (${topMatch.scientificName}) as the primary culprit based on pest identification (${nodeA.identifiedBugTaxonomy || "Pest photo attached"}) combined with geo-seasonal data for ${context.usState}.`
        : `Based on your geographic region (${context.usState}), incident location (${context.incidentLocation.replace(/_/g, " ")}), and sensation, ${topMatch.name} (${topMatch.scientificName}) is the most likely source of the skin lesion.`,
    disclaimer:
      "BiteID is an educational triage assistant and does not replace professional medical diagnosis. If you develop systemic symptoms or signs of infection, consult a healthcare provider immediately.",
  };
}

/**
 * Intelligent Mock Generator fallback when GEMINI_API_KEY is not set or API fails.
 */
export function generateMockTriageResult(
  context: TriageContext,
  hasCulpritPhoto: boolean,
  overrideMorphology?: DermatologicalMorphology
): AnalysisResult {
  const effectiveMorphology = overrideMorphology || context.morphology;
  const morphology: DermatologicalMorphology = effectiveMorphology || {
    pattern: "solitary_wheal",
    centralFeatures: "punctum_bite_mark",
    primaryReaction: "urticarial_hive",
  };

  let lesionMorphology: VisionAnalysis["lesionMorphology"] =
    context.lesionMorphology || "other";

  if (effectiveMorphology) {
    if (effectiveMorphology.pattern === "annular_target" || effectiveMorphology.primaryReaction === "expanding_erythema") {
      lesionMorphology = "annular_target";
    } else if (effectiveMorphology.pattern === "linear_grouped") {
      lesionMorphology = "linear_cluster";
    } else if (effectiveMorphology.pattern === "indurated_plaque" || effectiveMorphology.centralFeatures === "necrotic_ulcer") {
      lesionMorphology = "necrotic_macule";
    }
  }

  const nodeA = {
    bugPhotoProvided: hasCulpritPhoto,
    identifiedBugTaxonomy: hasCulpritPhoto ? (lesionMorphology === "annular_target" ? "Ixodes scapularis" : "Culicidae") : null,
  };

  const nodeB = { lesionMorphology };

  return synthesizeTriageResult(nodeA, nodeB, context, effectiveMorphology);
}
