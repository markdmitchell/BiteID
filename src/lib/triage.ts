export type EnvironmentOption = {
  value: string;
  label: string;
};

export const ENVIRONMENT_OPTIONS: EnvironmentOption[] = [
  { value: "woods", label: "Woods or tall grass" },
  { value: "bed", label: "Bed or indoors" },
  { value: "yard", label: "Yard or garden" },
  { value: "water", label: "Beach, lake or water" },
  { value: "travel", label: "Travel abroad" },
  { value: "unsure", label: "Not sure" },
];

export const DURATION_OPTIONS: EnvironmentOption[] = [
  { value: "under-24h", label: "Under 24 hours" },
  { value: "1-3d", label: "1 to 3 days" },
  { value: "4-7d", label: "4 to 7 days" },
  { value: "1-2w", label: "1 to 2 weeks" },
  { value: "over-2w", label: "More than 2 weeks" },
];

export const EMERGENCY_SYMPTOMS: EnvironmentOption[] = [
  { value: "breathing", label: "Trouble breathing or throat tightness" },
  { value: "swelling", label: "Swelling of the face, lips or tongue" },
  { value: "streaks", label: "Spreading red streaks with fever or chills" },
  { value: "confusion", label: "Confusion, fainting or severe dizziness" },
  { value: "expanding", label: "Rapidly expanding, intensely painful area" },
  { value: "neck", label: "Stiff neck with a severe headache" },
];

export type TriageFormState = {
  lesionImage: File | null;
  bugImage: File | null;
  environment: string;
  duration: string;
  symptoms: string[];
  noneOfThese: boolean;
};

export const initialFormState: TriageFormState = {
  lesionImage: null,
  bugImage: null,
  environment: "",
  duration: "",
  symptoms: [],
  noneOfThese: false,
};

export type TriageAction =
  | { type: "setLesion"; file: File | null }
  | { type: "setBug"; file: File | null }
  | { type: "setEnvironment"; value: string }
  | { type: "setDuration"; value: string }
  | { type: "toggleSymptom"; value: string }
  | { type: "setNoneOfThese"; value: boolean }
  | { type: "reset" };

export function triageReducer(state: TriageFormState, action: TriageAction): TriageFormState {
  switch (action.type) {
    case "setLesion":
      return { ...state, lesionImage: action.file };
    case "setBug":
      return { ...state, bugImage: action.file };
    case "setEnvironment":
      return { ...state, environment: action.value };
    case "setDuration":
      return { ...state, duration: action.value };
    case "toggleSymptom": {
      const has = state.symptoms.includes(action.value);
      const symptoms = has
        ? state.symptoms.filter((s) => s !== action.value)
        : [...state.symptoms, action.value];
      return { ...state, symptoms, noneOfThese: symptoms.length > 0 ? false : state.noneOfThese };
    }
    case "setNoneOfThese":
      return { ...state, noneOfThese: action.value, symptoms: action.value ? [] : state.symptoms };
    case "reset":
      return initialFormState;
    default:
      return state;
  }
}

/** Ranked result item as returned by the backend. Rendered as-is. */
export type TriageResultItem = {
  name?: string;
  condition?: string;
  label?: string;
  probability?: number;
  confidence?: number;
  score?: number;
  description?: string;
  summary?: string;
  urgency?: string;
  severity?: string;
};

export type TriageResponse = {
  results?: TriageResultItem[];
  predictions?: TriageResultItem[];
  guidance?: string;
  advice?: string;
  disclaimer?: string;
  [key: string]: unknown;
};

const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;

/**
 * Neutral placeholder shown when the service cannot be reached. Contains no
 * findings, scoring or interpretation — only generic safety guidance.
 */
export const FALLBACK_RESPONSE: TriageResponse = {
  results: [],
  guidance:
    "We could not reach the assessment service, so there is nothing ranked to show for this intake yet.\n\nKeep the area clean, watch for spreading redness, swelling or fever, and speak with a clinician if anything worsens.",
  disclaimer:
    "Alpha version — for testing only. BiteID is not a medical service and does not provide a diagnosis.",
};

export function buildTriageFormData(state: TriageFormState): FormData {
  const fd = new FormData();
  if (state.lesionImage) fd.append("skin_lesion_image", state.lesionImage, state.lesionImage.name);
  if (state.bugImage) fd.append("bug_image", state.bugImage, state.bugImage.name);
  fd.append("environment", state.environment);
  fd.append("duration", state.duration);
  fd.append("emergency_symptoms", JSON.stringify(state.symptoms));
  fd.append("has_emergency_symptoms", String(state.symptoms.length > 0));
  return fd;
}

export async function submitTriage(state: TriageFormState): Promise<TriageResponse> {
  if (!API_URL) return FALLBACK_RESPONSE;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: buildTriageFormData(state),
    });
    if (!response.ok) return FALLBACK_RESPONSE;
    return (await response.json()) as TriageResponse;
  } catch {
    return FALLBACK_RESPONSE;
  }
}

export function normalizeResults(data: TriageResponse): TriageResultItem[] {
  const raw = data.results ?? data.predictions ?? [];
  return [...raw].sort((a, b) => confidenceOf(b) - confidenceOf(a));
}

export function confidenceOf(item: TriageResultItem): number {
  const value = item.probability ?? item.confidence ?? item.score ?? 0;
  return value <= 1 ? value * 100 : value;
}

export function nameOf(item: TriageResultItem): string {
  return item.name ?? item.condition ?? item.label ?? "Unnamed finding";
}
