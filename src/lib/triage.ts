import { analyseIntakeFn } from "./triage.functions";
import { saveOfflineIntake } from "./offline-manager";

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

export type PatientVulnerabilityProfile =
  "standard_adult" | "infant_toddler" | "child" | "pregnant_nursing" | "geriatric_immune";

export type VulnerablePopulationGuidance = {
  pediatric?: {
    cautions: string[];
    atypicalPresentation?: string;
    weightBasedAdvice?: string;
    blackBoxWarning?: string;
    erCriteria?: string[];
  };
  pregnancy?: {
    cautions: string[];
    safeAlternatives?: string;
    contraindications?: string[];
    fetalRisks?: string;
    blackBoxWarning?: string;
  };
  geriatric?: {
    cautions: string[];
    atypicalPresentation?: string;
    beersCriteriaWarning?: string;
    sepsisWarningSigns?: string[];
  };
};

export type TriageFormState = {
  lesionImage: File | null;
  bugImage: File | null;
  environment: string;
  duration: string;
  usState: string;
  bodyLocation: string;
  sensation: string;
  patientProfile: PatientVulnerabilityProfile;
  symptoms: string[];
  noneOfThese: boolean;
  batOrAnimalExposure: boolean;
  secondaryInfectionSymptoms: string[];
  recentTravel: "none" | "us_southwest" | "tropical_intl";
};

export const initialFormState: TriageFormState = {
  lesionImage: null,
  bugImage: null,
  environment: "",
  duration: "",
  usState: "",
  bodyLocation: "any_unspecified",
  sensation: "unsure",
  patientProfile: "standard_adult",
  symptoms: [],
  noneOfThese: false,
  batOrAnimalExposure: false,
  secondaryInfectionSymptoms: [],
  recentTravel: "none",
};

export type TriageAction =
  | { type: "setLesion"; file: File | null }
  | { type: "setBug"; file: File | null }
  | { type: "setEnvironment"; value: string }
  | { type: "setDuration"; value: string }
  | { type: "setUsState"; value: string }
  | { type: "setBodyLocation"; value: string }
  | { type: "setSensation"; value: string }
  | { type: "setPatientProfile"; value: PatientVulnerabilityProfile }
  | { type: "toggleSymptom"; value: string }
  | { type: "setNoneOfThese"; value: boolean }
  | { type: "setBatExposure"; value: boolean }
  | { type: "toggleSecondaryInfectionSymptom"; value: string }
  | { type: "setRecentTravel"; value: "none" | "us_southwest" | "tropical_intl" }
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
    case "setPatientProfile":
      return { ...state, patientProfile: action.value };
    case "setBatExposure":
      return { ...state, batOrAnimalExposure: action.value };
    case "setRecentTravel":
      return { ...state, recentTravel: action.value };
    case "toggleSecondaryInfectionSymptom": {
      const has = state.secondaryInfectionSymptoms.includes(action.value);
      const secondaryInfectionSymptoms = has
        ? state.secondaryInfectionSymptoms.filter((s) => s !== action.value)
        : [...state.secondaryInfectionSymptoms, action.value];
      return { ...state, secondaryInfectionSymptoms };
    }
    case "toggleSymptom": {
      const has = state.symptoms.includes(action.value);
      const symptoms = has
        ? state.symptoms.filter((s) => s !== action.value)
        : [...state.symptoms, action.value];
      return { ...state, symptoms, noneOfThese: symptoms.length > 0 ? false : state.noneOfThese };
    }
    case "setNoneOfThese":
      return {
        ...state,
        noneOfThese: action.value,
        symptoms: action.value ? [] : state.symptoms,
        batOrAnimalExposure: action.value ? false : state.batOrAnimalExposure,
        secondaryInfectionSymptoms: action.value ? [] : state.secondaryInfectionSymptoms,
      };
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
  urgency?: "critical" | "urgent" | "non_urgent" | string;
  severity?: string;
  matchedFactors?: string[];
  associatedPathogens?: string[];
  delayedRisks?: string[];
  firstAidAdvice?: string[];
  warningSignsToWatch?: string[];
  vulnerableGuidance?: VulnerablePopulationGuidance;
};

export type DermatologicalFindings = {
  pattern: string;
  primaryLesion: string;
  centralFeatures: string;
  primaryReaction: string;
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

export type TriageResponse = {
  results?: TriageResultItem[];
  predictions?: TriageResultItem[];
  guidance?: string;
  advice?: string;
  disclaimer?: string;
  hasErythemaMigrans?: boolean;
  dermatologicalFindings?: DermatologicalFindings;
  mimickerAlert?: MimickerAlert | null;
  isOfflineQueued?: boolean;
  isRejectedImage?: boolean;
  rejectionReason?: string;
  hasRabiesAlert?: boolean;
  hasCellulitisAlert?: boolean;
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

import { compressImageFile } from "./image-compressor";

function fileToDataUrl(file: File): Promise<string> {
  return compressImageFile(file);
}

/** Sends the intake to the in-app analysis step. Never throws. */
export async function submitTriage(state: TriageFormState): Promise<TriageResponse> {
  try {
    if (!state.lesionImage) return FALLBACK_RESPONSE;
    const lesionImage = await compressImageFile(state.lesionImage);
    const bugImage = state.bugImage ? await compressImageFile(state.bugImage) : null;
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      saveOfflineIntake({
        lesionPreviewUrl: lesionImage,
        bugPreviewUrl: bugImage ?? undefined,
        environment: state.environment,
        duration: state.duration,
        usState: state.usState,
        bodyLocation: state.bodyLocation,
        sensation: state.sensation,
        symptoms: state.symptoms,
      });

      return {
        results: [],
        isOfflineQueued: true,
        guidance:
          "You are currently in offline backcountry mode with zero cellular or Wi-Fi connectivity. Your intake, answers, and lesion photos have been securely preserved on your device.\n\nImmediate Field Action: Open the Backcountry Field Kit below for species-specific first aid, venomous snake/scorpion emergency protocols, and CDC tick extraction techniques. When your device reconnects to cell service, BiteID will notify you to submit for full AI analysis.",
        disclaimer: "BiteID Offline Field Kit — Backcountry emergency guidance.",
      };
    }

    const result = await analyseIntakeFn({
      data: {
        lesionImage,
        bugImage,
        environment: state.environment,
        duration: state.duration,
        usState: state.usState,
        bodyLocation: state.bodyLocation,
        sensation: state.sensation,
        patientProfile: state.patientProfile,
        monthIndex: new Date().getMonth(),
        symptoms: state.symptoms,
        batOrAnimalExposure: state.batOrAnimalExposure,
        secondaryInfectionSymptoms: state.secondaryInfectionSymptoms,
        recentTravel: state.recentTravel,
      },
    });
    return (result as unknown as TriageResponse) ?? FALLBACK_RESPONSE;
  } catch {
    // If the network call failed (e.g. signal dropped out mid-request), auto-stash and route to offline field kit
    try {
      if (state.lesionImage) {
        const lesionImage = await fileToDataUrl(state.lesionImage).catch(() => undefined);
        const bugImage = state.bugImage
          ? await fileToDataUrl(state.bugImage).catch(() => undefined)
          : undefined;
        saveOfflineIntake({
          lesionPreviewUrl: lesionImage,
          bugPreviewUrl: bugImage,
          environment: state.environment,
          duration: state.duration,
          usState: state.usState,
          bodyLocation: state.bodyLocation,
          sensation: state.sensation,
          symptoms: state.symptoms,
        });
        return {
          results: [],
          isOfflineQueued: true,
          guidance:
            "Cellular connectivity dropped during submission. Your intake, photos, and answers have been safely preserved in your device's backcountry queue.\n\nUse the Backcountry Field Kit below for immediate emergency first-aid protocols, envenomation guidelines, and species identification.",
          disclaimer: "BiteID Offline Field Kit — Backcountry emergency guidance.",
        };
      }
    } catch {
      // Ignore
    }
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

export const RASH_JOURNAL_STORAGE_KEY = "biteid_rash_journal_record_v2";

/** 1-click full privacy sanitization: wipes all local stored health data, journals, and cached photos */
export function clearAllBiteIdLocalData(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("biteid_") || key.includes("rash") || key.includes("intake"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error("Failed to clear local health data", err);
  }
}

/** Auto-retention purge: cleans up any journal entries or stashed data older than maxDays */
export function purgeExpiredHealthData(maxDays = 30): {
  purgedJournals: number;
  purgedOffline: number;
} {
  if (typeof window === "undefined") return { purgedJournals: 0, purgedOffline: 0 };
  let purgedJournals = 0;
  let purgedOffline = 0;
  const cutoffTime = Date.now() - maxDays * 24 * 60 * 60 * 1000;

  try {
    // 1. Check rash tracker entries (both current v2 journal record and legacy entry keys)
    const trackerRaw =
      localStorage.getItem(RASH_JOURNAL_STORAGE_KEY) ||
      localStorage.getItem("biteid_rash_entries_v2");
    if (trackerRaw) {
      const parsed = JSON.parse(trackerRaw) as Array<{ date?: string; timestamp?: string }>;
      const valid = parsed.filter((item) => {
        const timeStr = item.date || item.timestamp;
        if (!timeStr) return false;
        const itemTime = new Date(timeStr).getTime();
        return !isNaN(itemTime) && itemTime >= cutoffTime;
      });
      purgedJournals = parsed.length - valid.length;
      if (purgedJournals > 0) {
        localStorage.setItem(RASH_JOURNAL_STORAGE_KEY, JSON.stringify(valid));
        localStorage.removeItem("biteid_rash_entries_v2");
      }
    }

    // 2. Check offline queue
    const queueRaw = localStorage.getItem("biteid_offline_intake_queue");
    if (queueRaw) {
      const parsed = JSON.parse(queueRaw) as Array<{ timestamp?: string; date?: string }>;
      const valid = parsed.filter((item) => {
        const timeStr = item.timestamp || item.date;
        if (!timeStr) return false;
        const itemTime = new Date(timeStr).getTime();
        return !isNaN(itemTime) && itemTime >= cutoffTime;
      });
      purgedOffline = parsed.length - valid.length;
      if (purgedOffline > 0) {
        localStorage.setItem("biteid_offline_intake_queue", JSON.stringify(valid));
      }
    }
  } catch {
    // Ignore retention check errors
  }

  return { purgedJournals, purgedOffline };
}
