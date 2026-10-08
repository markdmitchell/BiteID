import { streamText } from "ai";
import { createGoogleProvider, createLovableResponsesProvider } from "./ai-gateway.server";
import type { PatientVulnerabilityProfile } from "./triage";

const MODEL = "openai/gpt-6-astra";

export type ProgressionIntake = {
  baselineImage: string;
  baselineDate: string;
  baselineDiameterMm?: number;
  followUpImage: string;
  followUpDate: string;
  followUpDiameterMm?: number;
  suspectedCondition?: string;
  patientProfile?: PatientVulnerabilityProfile;
  reportedSymptoms?: string[];
};

export type ProgressionEvaluation = {
  trajectory:
    | "resolving"
    | "stable"
    | "mild_expansion"
    | "rapid_centrifugal_expansion"
    | "critical_infection";
  trajectoryLabel: string;
  hoursElapsed: number;
  expansionRateMmPerDay: number;
  cellulitisRisk: "low" | "moderate" | "high";
  cellulitisRationale: string;
  hasRedStreaksOrLymphangitis: boolean;
  morphologyEvolution: {
    erythemaChange: string;
    centralFeaturesChange: string;
    edemaChange: string;
  };
  clinicalAction: {
    urgency:
      | "routine_home_care"
      | "watchful_waiting"
      | "urgent_evaluation_24h"
      | "immediate_emergency_care";
    urgencyTitle: string;
    recommendations: string[];
    redFlags: string[];
  };
  disclaimer: string;
};

const CLINICAL_DISCLAIMER =
  "Automated serial visual progression analysis is an observational reference tool and does not constitute a formal medical diagnosis or physical examination. In-person clinical palpation, temperature assessment, and physician evaluation are necessary to definitively rule out cellulitis, necrotizing soft-tissue infections, or systemic envenomation. If spreading redness, red streaks, localized warmth, or fever develop, seek urgent in-person medical attention immediately.";

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

/**
 * Deterministic clinical fallback evaluator when vision API is unavailable or in offline mode.
 */
export function evaluateProgressionRuleBased(intake: ProgressionIntake): ProgressionEvaluation {
  const baselineTime = new Date(intake.baselineDate).getTime();
  const followUpTime = new Date(intake.followUpDate).getTime();
  const msElapsed = Math.max(1000 * 60 * 30, followUpTime - baselineTime);
  const hoursElapsed = Math.max(1, Math.round(msElapsed / (1000 * 60 * 60)));
  const daysElapsed = Math.max(0.1, hoursElapsed / 24);

  const baselineMm = intake.baselineDiameterMm ?? 15;
  const followUpMm = intake.followUpDiameterMm ?? baselineMm;
  const deltaMm = followUpMm - baselineMm;
  const rateMmPerDay = Math.round((deltaMm / daysElapsed) * 10) / 10;

  const symptoms = intake.reportedSymptoms ?? [];
  const hasStreaks = symptoms.includes("red_streaks");
  const hasFever = symptoms.includes("fever");
  const hasWarmth = symptoms.includes("spreading_warmth");
  const hasPus = symptoms.includes("pus_drainage");
  const hasSeverePain = symptoms.includes("increasing_pain");

  if (hasStreaks || (hasFever && deltaMm > 5)) {
    return {
      trajectory: "critical_infection",
      trajectoryLabel: "Suspected Advancing Infection / Lymphangitis",
      hoursElapsed,
      expansionRateMmPerDay: rateMmPerDay,
      cellulitisRisk: "high",
      cellulitisRationale:
        "Reported spreading red streaks and systemic signs suggest potential ascending bacterial lymphangitis or invasive soft tissue infection. Immediate emergency medical evaluation required.",
      hasRedStreaksOrLymphangitis: true,
      morphologyEvolution: {
        erythemaChange:
          "Advancing erythema with reported linear lymphatic extension beyond lesion borders.",
        centralFeaturesChange: hasPus
          ? "Purulent drainage noted at lesion puncture or apex."
          : "Persistent induration with potential central breakdown.",
        edemaChange: "Marked local swelling extending into surrounding tissue planes.",
      },
      clinicalAction: {
        urgency: "immediate_emergency_care",
        urgencyTitle: "Immediate Emergency Department / Urgent Care Evaluation Indicated",
        recommendations: [
          "Seek emergency medical evaluation immediately. Do not delay overnight.",
          "Do not squeeze, pierce, or incise the lesion or drainage areas.",
          "Mark the leading edge of the red margin with a pen and record the current timestamp for the physician.",
          "Keep the limb elevated and at rest while en route to medical care.",
        ],
        redFlags: [
          "Red streaks traveling up limb towards heart",
          "High fever (>100.4°F), rigors, or confusion",
          "Rapidly worsening pain or blistering",
        ],
      },
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  if (deltaMm >= 10 || rateMmPerDay >= 5 || (hasWarmth && deltaMm > 3) || hasPus) {
    return {
      trajectory: "rapid_centrifugal_expansion",
      trajectoryLabel: "Erythematous Margin Expansion (Cellulitis Consideration)",
      hoursElapsed,
      expansionRateMmPerDay: rateMmPerDay,
      cellulitisRisk: "high",
      cellulitisRationale: `Lesion expanded by ~${deltaMm} mm (${rateMmPerDay} mm/day) with ${
        hasWarmth ? "localized warmth" : "increasing inflammation"
      }. Inoculation of Staphylococcus aureus or Group A Streptococcus frequently causes secondary cellulitis in broken epidermal barriers.`,
      hasRedStreaksOrLymphangitis: false,
      morphologyEvolution: {
        erythemaChange:
          "Centrifugal spreading border; erythema expanding beyond initial demarcation.",
        centralFeaturesChange: hasPus
          ? "Developing pustule or focal purulent collection."
          : "Erythematous plaque with advancing peripheral margin.",
        edemaChange: "Elevated regional edema and tissue induration.",
      },
      clinicalAction: {
        urgency: "urgent_evaluation_24h",
        urgencyTitle: "Same-Day In-Person Clinical Assessment Recommended",
        recommendations: [
          "Consult an urgent care physician or primary care provider within 24 hours for evaluation of oral antibiotic coverage.",
          "Outline the outer boundary of erythema with a ballpoint pen to monitor ongoing margin velocity.",
          "Apply clean, cool compresses for symptomatic relief; avoid hot soaks or tight constricting bandages.",
          "Take an updated photograph in 12 hours to document progression for your provider.",
        ],
        redFlags: [
          "Development of red streaks extending toward groin or axilla",
          "Systemic chills, fever, or nausea",
          "Central tissue turning dark dusky purple, blue-gray, or numb",
        ],
      },
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  if (deltaMm < -2) {
    return {
      trajectory: "resolving",
      trajectoryLabel: "Resolving Inflammatory Reaction",
      hoursElapsed,
      expansionRateMmPerDay: rateMmPerDay,
      cellulitisRisk: "low",
      cellulitisRationale: `Erythema and induration contracted by ~${Math.abs(
        deltaMm,
      )} mm over ${hoursElapsed} hours, consistent with typical resolving histaminergic or cell-mediated reaction.`,
      hasRedStreaksOrLymphangitis: false,
      morphologyEvolution: {
        erythemaChange:
          "Fading erythema; transitioning from intense erythematous blush to light pink or post-inflammatory hyperpigmentation.",
        centralFeaturesChange:
          "Central puncture or bite mark drying into a localized benign crust.",
        edemaChange: "Substantial regression of localized swelling and wheal height.",
      },
      clinicalAction: {
        urgency: "routine_home_care",
        urgencyTitle: "Favorable Trajectory: Continue Supportive Home Care",
        recommendations: [
          "Continue gentle cleansing with mild soap and water.",
          "Apply cool compresses or topical hydrocortisone 1% / calamine for residual pruritus.",
          "Avoid scratching or picking crusts to prevent secondary bacterial entry.",
          "Keep observing until skin completely normalizes over the next 3–5 days.",
        ],
        redFlags: [
          "Re-emergence of expanding redness after apparent healing",
          "New onset of localized heat, throbbing pain, or pus",
          "Late annular 'bullseye' rash developing around or distant from the bite site",
        ],
      },
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }

  return {
    trajectory: deltaMm > 0 ? "mild_expansion" : "stable",
    trajectoryLabel:
      deltaMm > 0 ? "Mild Reactivity / Early Stable Phase" : "Stable Lesion (Unchanged)",
    hoursElapsed,
    expansionRateMmPerDay: rateMmPerDay,
    cellulitisRisk: hasSeverePain || hasWarmth ? "moderate" : "low",
    cellulitisRationale:
      "Minimal dimensional fluctuation over this observation interval. Consistent with normal subacute arthropod inflammatory kinetics, but warrants continued surveillance for delayed target expansion or secondary infection.",
    hasRedStreaksOrLymphangitis: false,
    morphologyEvolution: {
      erythemaChange:
        deltaMm > 0
          ? "Slight peripheral halo without marked centrifugal acceleration."
          : "Stable erythema diameter; borders remain relatively demarcated.",
      centralFeaturesChange:
        "Punctum or central papule remains stable without obvious necrosis or fluctuance.",
      edemaChange: "Induration stable without significant spreading warmth.",
    },
    clinicalAction: {
      urgency: hasSeverePain || hasWarmth ? "urgent_evaluation_24h" : "watchful_waiting",
      urgencyTitle:
        hasSeverePain || hasWarmth
          ? "Surveillance with Clinical Vigilance"
          : "Stable: Monitor with Next Photo in 24 Hours",
      recommendations: [
        "Mark the current perimeter with a pen to establish an accurate baseline for the next 24 hours.",
        "Take a follow-up photo in 24 hours under the same lighting conditions.",
        "Avoid applying harsh topical chemicals or squeezing the site.",
        "Seek medical care if pain intensifies or systemic symptoms arise.",
      ],
      redFlags: [
        "Sudden acceleration in diameter (>5 mm in 12 hours)",
        "Spreading central darkness, bullae, or blisters",
        "Systemic malaise, fever, or joint aches",
      ],
    },
    disclaimer: CLINICAL_DISCLAIMER,
  };
}

/**
 * Full multimodal AI progression evaluator.
 * Compares dual images across time and returns structured dermatological delta and cellulitis risk analysis.
 */
export async function evaluateLesionProgression(
  intake: ProgressionIntake,
): Promise<ProgressionEvaluation> {
  const provider = resolveVisionProvider();
  if (!provider) {
    return evaluateProgressionRuleBased(intake);
  }

  const baselineTime = new Date(intake.baselineDate).getTime();
  const followUpTime = new Date(intake.followUpDate).getTime();
  const msElapsed = Math.max(1000 * 60 * 30, followUpTime - baselineTime);
  const hoursElapsed = Math.max(1, Math.round(msElapsed / (1000 * 60 * 60)));
  const daysElapsed = Math.max(0.1, hoursElapsed / 24);

  const baselineMm = intake.baselineDiameterMm ?? 15;
  const followUpMm = intake.followUpDiameterMm ?? baselineMm;
  const deltaMm = followUpMm - baselineMm;
  const rateMmPerDay = Math.round((deltaMm / daysElapsed) * 10) / 10;

  const reportedSymptoms = intake.reportedSymptoms ?? [];
  const hasStreaks = reportedSymptoms.includes("red_streaks");
  const hasFever = reportedSymptoms.includes("fever");

  const instructions = `You are an expert dermatological serial wound and insect bite progression analysis system.
You are comparing two sequential photos of the same patient's skin reaction:
- Photo 1: Baseline image (Date/Time: ${intake.baselineDate}, ~${baselineMm}mm estimated).
- Photo 2: Follow-up image taken ~${hoursElapsed} hours later (~${daysElapsed.toFixed(1)} days later).
Reported symptoms: ${reportedSymptoms.length > 0 ? reportedSymptoms.join(", ") : "None specified"}.
Suspected primary entity: ${intake.suspectedCondition || "Arthropod bite / cutaneous envenomation"}.
Patient Vulnerability Profile: ${intake.patientProfile || "standard_adult"}.

Analyze the visual delta between Photo 1 and Photo 2 methodically:
1. Erythematous margin trajectory: Is the redness expanding centrifugally, stable, or fading/regressing?
2. Secondary bacterial cellulitis evaluation: Are borders becoming diffuse/ill-defined? Is there evident advancing lymphangitis, purulent exudate/head, or marked edema indicating Streptococcus/Staphylococcus invasion?
3. Central features evolution: Is there central crusting (healing), central necrosis/sinking ulcer (Loxoscelism/Brown Recluse), or progressive central clearing (Erythema Migrans bullseye)?
4. Urgency classification: "routine_home_care", "watchful_waiting", "urgent_evaluation_24h", or "immediate_emergency_care".

Return a single JSON object (no markdown fences, no commentary outside JSON):
{
  "trajectory": "resolving" | "stable" | "mild_expansion" | "rapid_centrifugal_expansion" | "critical_infection",
  "trajectoryLabel": string,
  "cellulitisRisk": "low" | "moderate" | "high",
  "cellulitisRationale": string,
  "hasRedStreaksOrLymphangitis": boolean,
  "erythemaChange": string,
  "centralFeaturesChange": string,
  "edemaChange": string,
  "urgency": "routine_home_care" | "watchful_waiting" | "urgent_evaluation_24h" | "immediate_emergency_care",
  "urgencyTitle": string,
  "recommendations": string[],
  "redFlags": string[]
}`;

  const content: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
    {
      type: "text",
      text: `Photo 1 is the baseline lesion. Photo 2 is the follow-up lesion taken ${hoursElapsed} hours later. Compare them carefully.`,
    },
    { type: "image", image: intake.baselineImage },
    { type: "image", image: intake.followUpImage },
  ];

  try {
    let rawText = "";
    if (provider.type === "google") {
      const google = createGoogleProvider(provider.apiKey);
      const result = streamText({
        model: google("gemini-3.6-flash"),
        system: instructions,
        messages: [{ role: "user", content }],
        abortSignal: AbortSignal.timeout(18000),
      });
      for await (const chunk of result.textStream) {
        rawText += chunk;
      }
    } else {
      const lovable = createLovableResponsesProvider(provider.apiKey);
      const result = streamText({
        model: lovable.responses(MODEL),
        system: instructions,
        messages: [{ role: "user", content }],
        abortSignal: AbortSignal.timeout(18000),
      });
      for await (const chunk of result.textStream) {
        rawText += chunk;
      }
    }

    const parsed = parseJsonBlock(rawText);
    if (!parsed) {
      return evaluateProgressionRuleBased(intake);
    }

    const urgencyRaw = String(parsed["urgency"] || "watchful_waiting");
    const urgency = (
      [
        "routine_home_care",
        "watchful_waiting",
        "urgent_evaluation_24h",
        "immediate_emergency_care",
      ].includes(urgencyRaw)
        ? urgencyRaw
        : "watchful_waiting"
    ) as ProgressionEvaluation["clinicalAction"]["urgency"];

    const trajectoryRaw = String(parsed["trajectory"] || "stable");
    const trajectory = (
      [
        "resolving",
        "stable",
        "mild_expansion",
        "rapid_centrifugal_expansion",
        "critical_infection",
      ].includes(trajectoryRaw)
        ? trajectoryRaw
        : "stable"
    ) as ProgressionEvaluation["trajectory"];

    const cellulitisRiskRaw = String(parsed["cellulitisRisk"] || "low");
    const cellulitisRisk = (
      ["low", "moderate", "high"].includes(cellulitisRiskRaw) ? cellulitisRiskRaw : "low"
    ) as ProgressionEvaluation["cellulitisRisk"];

    // Life-safety gate: If red streaks or fever were reported, enforce high risk and urgent/emergency
    const finalUrgency =
      hasStreaks || (hasFever && deltaMm > 5)
        ? "immediate_emergency_care"
        : hasStreaks || cellulitisRisk === "high"
          ? "urgent_evaluation_24h"
          : urgency;

    const finalCellulitisRisk = hasStreaks ? "high" : cellulitisRisk;

    return {
      trajectory: hasStreaks ? "critical_infection" : trajectory,
      trajectoryLabel: String(
        parsed["trajectoryLabel"] ||
          (trajectory === "resolving"
            ? "Resolving Reaction"
            : trajectory === "critical_infection"
              ? "Advancing Infection"
              : "Lesion Surveillance"),
      ),
      hoursElapsed,
      expansionRateMmPerDay: rateMmPerDay,
      cellulitisRisk: finalCellulitisRisk,
      cellulitisRationale: String(
        parsed["cellulitisRationale"] ||
          "Evaluated for signs of secondary bacterial cellulitis and advancing dermal invasion.",
      ),
      hasRedStreaksOrLymphangitis: Boolean(parsed["hasRedStreaksOrLymphangitis"] || hasStreaks),
      morphologyEvolution: {
        erythemaChange: String(
          parsed["erythemaChange"] || "Erythematous perimeter observed between photos.",
        ),
        centralFeaturesChange: String(
          parsed["centralFeaturesChange"] || "Central punctum observed over time.",
        ),
        edemaChange: String(parsed["edemaChange"] || "Induration and local swelling assessed."),
      },
      clinicalAction: {
        urgency: finalUrgency,
        urgencyTitle: String(
          parsed["urgencyTitle"] ||
            (finalUrgency === "immediate_emergency_care"
              ? "Immediate Medical Evaluation Required"
              : finalUrgency === "urgent_evaluation_24h"
                ? "Prompt In-Person Clinical Assessment Recommended"
                : "Continue Supportive Monitoring"),
        ),
        recommendations: Array.isArray(parsed["recommendations"])
          ? (parsed["recommendations"] as string[])
          : [
              "Demarcate the active margin with a pen to monitor future velocity.",
              "Take a follow-up photo in 24 hours.",
              "Consult a physician if symptoms escalate.",
            ],
        redFlags: Array.isArray(parsed["redFlags"])
          ? (parsed["redFlags"] as string[])
          : [
              "Spreading red streaks toward lymph nodes",
              "Systemic fever, rigors, or nausea",
              "Central necrotic darkening or extreme pain",
            ],
      },
      disclaimer: CLINICAL_DISCLAIMER,
    };
  } catch (err) {
    console.error("evaluateLesionProgression failed, invoking clinical fallback:", err);
    return evaluateProgressionRuleBased(intake);
  }
}
