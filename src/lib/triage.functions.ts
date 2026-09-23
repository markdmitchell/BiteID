import { createServerFn } from "@tanstack/react-start";
import type { PatientVulnerabilityProfile } from "./triage";

export type AnalyseIntakeInput = {
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

function validate(input: unknown): AnalyseIntakeInput {
  const data = input as Partial<AnalyseIntakeInput> | undefined;
  if (!data || typeof data.lesionImage !== "string" || !data.lesionImage.startsWith("data:")) {
    throw new Error("A lesion image is required");
  }
  return {
    lesionImage: data.lesionImage,
    bugImage:
      typeof data.bugImage === "string" && data.bugImage.startsWith("data:") ? data.bugImage : null,
    environment: typeof data.environment === "string" ? data.environment : "unsure",
    duration: typeof data.duration === "string" ? data.duration : "",
    usState: typeof data.usState === "string" && data.usState ? data.usState : "US-VA",
    bodyLocation: typeof data.bodyLocation === "string" ? data.bodyLocation : "any_unspecified",
    sensation: typeof data.sensation === "string" ? data.sensation : "unsure",
    patientProfile: data.patientProfile ?? "standard_adult",
    monthIndex:
      typeof data.monthIndex === "number" && data.monthIndex >= 0 && data.monthIndex <= 11
        ? data.monthIndex
        : new Date().getMonth(),
    symptoms: Array.isArray(data.symptoms)
      ? data.symptoms.filter((s): s is string => typeof s === "string")
      : [],
    batOrAnimalExposure: Boolean(data.batOrAnimalExposure),
    secondaryInfectionSymptoms: Array.isArray(data.secondaryInfectionSymptoms)
      ? data.secondaryInfectionSymptoms.filter((s): s is string => typeof s === "string")
      : [],
    recentTravel: data.recentTravel ?? "none",
  };
}

export const analyseIntakeFn = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const { analyseIntake, unavailableResponse } = await import("./triage-engine.server");
    try {
      return await analyseIntake(data);
    } catch (error) {
      console.error("BiteID analysis failed", error);
      return unavailableResponse();
    }
  });
