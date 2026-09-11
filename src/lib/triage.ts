export type TriageResult = {
  name: string;
  scientificName?: string;
  description?: string;
  confidence?: number | string;
  probabilityScore?: number;
  matchedFactors?: string[];
  associatedPathogens?: string[];
  delayedRisks?: string[];
  firstAidAdvice?: string[];
  warningSignsToWatch?: string[];
};

export type TriageResponse = {
  results: TriageResult[];
  raw?: unknown;
};

export const ENVIRONMENT_OPTIONS = [
  { value: "yard_garden", label: "Yard / garden" },
  { value: "tall_grass_woods", label: "Woods / tall grass trail" },
  { value: "bed", label: "Bed / indoor mattress" },
  { value: "garage_shed", label: "Garage / shed / woodpile" },
  { value: "indoor_other", label: "Indoors (other)" },
  { value: "outdoor_other", label: "Outdoors (other)" },
];

export const DURATION_OPTIONS = [
  { value: "under_2h", label: "Under 2 hours" },
  { value: "2_to_12h", label: "2 to 12 hours" },
  { value: "1_to_2_days", label: "1 to 2 days" },
  { value: "over_2_days", label: "Over 2 days" },
];

export const EMERGENCY_SYMPTOMS = [
  { id: "breathing", label: "Difficulty breathing or wheezing (anaphylaxis)" },
  { id: "swelling", label: "Swelling of face, lips, tongue or throat" },
  { id: "confusion", label: "Dizziness, confusion or fainting" },
  { id: "hives", label: "Widespread hives or systemic body rash" },
  { id: "expanding", label: "Lesion rapidly expanding or developing central necrosis" },
];

export type TriageSubmission = {
  lesionImage: File;
  bugImage: File | null;
  environment: string;
  duration: string;
  emergencyFlags: string[];
};

export async function submitTriage(input: TriageSubmission): Promise<TriageResponse> {
  const formData = new FormData();
  formData.append("lesion_image", input.lesionImage, input.lesionImage.name);
  if (input.bugImage) {
    formData.append("culprit_image", input.bugImage, input.bugImage.name);
  }

  const contextData = {
    usState: "US-VA",
    incidentLocation: input.environment || "yard_garden",
    timeElapsed: input.duration || "under_2h",
    emergencyScreening: {
      difficultyBreathing: input.emergencyFlags.includes("breathing"),
      facialSwelling: input.emergencyFlags.includes("swelling"),
      dizzinessOrConfusion: input.emergencyFlags.includes("confusion"),
      spreadingHives: input.emergencyFlags.includes("hives"),
    },
  };

  formData.append("context", JSON.stringify(contextData));

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Triage analysis request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const ranked = Array.isArray(data.rankedCandidates) ? data.rankedCandidates : [];

  const results: TriageResult[] = ranked.map((c: any) => ({
    name: c.name || c.pestName,
    scientificName: c.scientificName,
    confidence: c.probabilityScore ?? c.probability ?? 0,
    probabilityScore: c.probabilityScore ?? c.probability ?? 0,
    matchedFactors: c.matchedFactors || [],
    associatedPathogens: c.associatedPathogens || [],
    delayedRisks: c.delayedRisks || [],
    firstAidAdvice: c.firstAidAdvice || [],
    warningSignsToWatch: c.warningSignsToWatch || c.warningSigns || [],
  }));

  return { results, raw: data };
}
