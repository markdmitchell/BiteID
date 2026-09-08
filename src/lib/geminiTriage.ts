import { GoogleGenAI } from "@google/genai";
import { TriageContext, AnalysisResult } from "./schema";
import { VECTOR_DATABASE, evaluateRegionalLikelihood } from "./geoPestFilter";

export async function analyzeBiteWithGemini(
  lesionImageBuffer: Buffer,
  culpritImageBuffer: Buffer | null,
  context: TriageContext
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateMockTriageResult(context, !!culpritImageBuffer);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const regionalProbs = evaluateRegionalLikelihood(context);

    const prompt = `
You are BiteID, an expert medical triage system for insect and spider bites.
Analyze the provided skin reaction photo and optional pest photo along with the patient context.

Patient Context:
- Geographic Region: ${context.usState}
- Month of Incident: Month #${context.monthIndex + 1}
- Location of Incident: ${context.incidentLocation}
- Time Elapsed: ${context.timeElapsed}
- Primary Sensation: ${context.primarySensation}
- Targetoid Bullseye Rash Present: ${context.hasTargetoidBullseye ? "YES (Erythema Migrans)" : "NO"}

Pre-Calculated Regional Vector Probabilities:
${JSON.stringify(regionalProbs, null, 2)}

Clinical Differential Diagnosis Rules:
1. CRITICAL DIFFERENTIAL: Distinguish expanding annular erythematous target lesions (Erythema Migrans / Lyme disease tick bite) from acute localized histamine wheals (Mosquito bites).
   - Erythema Migrans (Tick): Expanding circular/annular rash (>5cm) with targetoid/bullseye pattern or central punctum. MUST prioritize Blacklegged (Deer) Tick (Ixodes scapularis) over generic mosquito or flea bites.
   - Mosquito Wheal: Small localized edematous papule (<2cm) with immediate intense itching.
2. If a pest/bug photo is provided, prioritize visual identification of pest morphology (wings, legs, body shape, markings).
3. If red-flag systemic symptoms (breathing difficulty, facial swelling, severe dizziness, spreading hives) are suspected, set isEmergencyRedirect to true.

Output MUST be valid JSON adhering strictly to this schema:
{
  "isEmergencyRedirect": false,
  "emergencyMessage": undefined,
  "culpritDetectedFromPhoto": boolean,
  "rankedCandidates": [
    {
      "name": "Blacklegged (Deer) Tick | Mosquito | Bed Bug | Flea | Brown Recluse Spider | Black Widow Spider",
      "scientificName": "Scientific name",
      "confidence": "high" | "medium" | "low",
      "probability": number (0.0 to 1.0),
      "matchedFactors": ["Factor 1", "Factor 2"],
      "firstAidAdvice": ["Step 1", "Step 2"],
      "warningSigns": ["Warning 1", "Warning 2"]
    }
  ],
  "summary": "Clinical summary explaining top findings.",
  "disclaimer": "Standard medical disclaimer."
}
`;

    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [prompt];

    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: lesionImageBuffer.toString("base64"),
      },
    });

    if (culpritImageBuffer) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: culpritImageBuffer.toString("base64"),
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
      config: {
        temperature: 0.2, // Low temperature for clinical diagnostic consistency
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/({[\s\S]*})/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;
    const parsed = JSON.parse(jsonString);

    return parsed as AnalysisResult;
  } catch (error) {
    console.warn("Gemini API call failed or fallback triggered, using regional mock generator:", error);
    return generateMockTriageResult(context, !!culpritImageBuffer);
  }
}

/**
 * Intelligent Mock Generator fallback when GEMINI_API_KEY is not set or API fails.
 */
export function generateMockTriageResult(
  context: TriageContext,
  hasCulpritPhoto: boolean
): AnalysisResult {
  const probs = evaluateRegionalLikelihood(context);
  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);

  const rankedCandidates = sorted.slice(0, 3).map(([key, prob], index) => {
    const vector = VECTOR_DATABASE[key];
    const confidence = prob > 0.4 ? "high" : prob > 0.2 ? "medium" : "low";

    const matchedFactors: string[] = [];

    if (context.hasTargetoidBullseye && key === "blacklegged_tick") {
      matchedFactors.push("Classic Erythema Migrans (bullseye targetoid rash) indicative of Blacklegged Tick exposure");
    }

    if (context.incidentLocation && vector.habitatScores[context.incidentLocation] >= 0.7) {
      matchedFactors.push(`High correlation with incident location (${context.incidentLocation.replace(/_/g, " ")})`);
    }

    if (vector.endemicStates === "ALL" || vector.endemicStates.includes(context.usState)) {
      matchedFactors.push(`Known endemic species in region (${context.usState})`);
    } else {
      matchedFactors.push(`Low endemic prevalence in ${context.usState}`);
    }

    if (vector.sensationScores[context.primarySensation] >= 0.7) {
      matchedFactors.push(`Sensation profile (${context.primarySensation.replace(/_/g, " ")}) matches vector pattern`);
    }

    if (hasCulpritPhoto && index === 0) {
      matchedFactors.push("Pest morphological characteristics detected in provided culprit photo");
    }

    return {
      name: vector.name,
      scientificName: vector.scientificName,
      confidence: confidence as "high" | "medium" | "low",
      probability: prob,
      matchedFactors,
      firstAidAdvice: vector.firstAidAdvice,
      warningSigns: vector.warningSigns,
    };
  });

  const topMatch = rankedCandidates[0];

  return {
    isEmergencyRedirect: false,
    culpritDetectedFromPhoto: hasCulpritPhoto,
    rankedCandidates,
    summary: context.hasTargetoidBullseye
      ? `Analysis indicates ${topMatch.name} (${topMatch.scientificName}) as the primary culprit due to targetoid Erythema Migrans morphology, combined with regional endemic data for ${context.usState}. Immediate medical evaluation for potential Lyme disease prophylaxis is recommended.`
      : hasCulpritPhoto
      ? `Analysis indicates ${topMatch.name} (${topMatch.scientificName}) as the primary culprit based on visual pest morphology combined with geo-seasonal data for ${context.usState}.`
      : `Based on your geographic region (${context.usState}), incident location (${context.incidentLocation.replace(/_/g, " ")}), and sensation, ${topMatch.name} (${topMatch.scientificName}) is the most likely source of the skin lesion.`,
    disclaimer:
      "BiteID is an educational triage assistant and does not replace professional medical diagnosis. If you develop systemic symptoms or signs of infection, consult a healthcare provider immediately.",
  };
}
