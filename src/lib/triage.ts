import { analyseIntakeFn } from "./triage.functions";

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

export const BODY_LOCATION_OPTIONS: EnvironmentOption[] = [
  { value: "any_unspecified", label: "Multiple areas / Not sure" },
  { value: "lower_leg_ankle", label: "Ankles or lower legs" },
  { value: "waist_groin_axilla", label: "Waistband, groin, or armpits" },
  { value: "arms_hands", label: "Arms or hands" },
  { value: "face_head", label: "Face, scalp, or neck" },
  { value: "trunk_chest_back", label: "Chest, back, or torso" },
  { value: "feet", label: "Feet or toes" },
];

export const SENSATION_OPTIONS: EnvironmentOption[] = [
  { value: "unsure", label: "Not sure / Changes" },
  { value: "intense_itch", label: "Intensely itchy" },
  { value: "mild_itch", label: "Mildly itchy" },
  { value: "moderate_pain", label: "Painful or stinging" },
  { value: "severe_pain", label: "Severe sharp or burning pain" },
  { value: "painless", label: "Painless (didn't feel it / doesn't hurt)" },
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
  usState: string;
  bodyLocation: string;
  sensation: string;
  symptoms: string[];
  noneOfThese: boolean;
};

export const initialFormState: TriageFormState = {
  lesionImage: null,
  bugImage: null,
  environment: "",
  duration: "",
  usState: "",
  bodyLocation: "any_unspecified",
  sensation: "unsure",
  symptoms: [],
  noneOfThese: false,
};

export type TriageAction =
  | { type: "setLesion"; file: File | null }
  | { type: "setBug"; file: File | null }
  | { type: "setEnvironment"; value: string }
  | { type: "setDuration"; value: string }
  | { type: "setUsState"; value: string }
  | { type: "setBodyLocation"; value: string }
  | { type: "setSensation"; value: string }
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
    case "setUsState":
      return { ...state, usState: action.value };
    case "setBodyLocation":
      return { ...state, bodyLocation: action.value };
    case "setSensation":
      return { ...state, sensation: action.value };
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

/** Ranked result item as returned by the analysis step. Rendered as-is. */
export type TriageResultItem = {
  id?: string;
  name?: string;
  condition?: string;
  label?: string;
  scientificName?: string;
  probability?: number;
  confidence?: number;
  score?: number;
  description?: string;
  summary?: string;
  urgency?: string;
  severity?: string;
  matchedFactors?: string[];
  associatedPathogens?: string[];
  delayedRisks?: string[];
  firstAidAdvice?: string[];
  warningSignsToWatch?: string[];
};

export type TriageResponse = {
  results?: TriageResultItem[];
  predictions?: TriageResultItem[];
  guidance?: string;
  advice?: string;
  disclaimer?: string;
  hasErythemaMigrans?: boolean;
  [key: string]: unknown;
};

/**
 * Neutral placeholder shown when the analysis cannot be completed. Contains no
 * findings, scoring or interpretation — only generic safety guidance.
 */
export const FALLBACK_RESPONSE: TriageResponse = {
  results: [],
  guidance:
    "The assessment could not be completed for this intake. Please try again in a moment, and speak with a clinician if anything about the area is worsening.",
  disclaimer:
    "Alpha version — for testing only. BiteID is not a medical service and does not provide a diagnosis.",
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Sends the intake to the in-app analysis step. Never throws. */
export async function submitTriage(state: TriageFormState): Promise<TriageResponse> {
  try {
    if (!state.lesionImage) return FALLBACK_RESPONSE;
    const lesionImage = await fileToDataUrl(state.lesionImage);
    const bugImage = state.bugImage ? await fileToDataUrl(state.bugImage) : null;
    const result = await analyseIntakeFn({
      data: {
        lesionImage,
        bugImage,
        environment: state.environment,
        duration: state.duration,
        usState: state.usState,
        bodyLocation: state.bodyLocation,
        sensation: state.sensation,
        monthIndex: new Date().getMonth(),
        symptoms: state.symptoms,
      },
    });
    return result as TriageResponse;
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
