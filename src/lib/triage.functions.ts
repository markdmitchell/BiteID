import { createServerFn } from "@tanstack/react-start";

export type AnalyseIntakeInput = {
  lesionImage: string;
  bugImage?: string | null;
  environment: string;
  duration: string;
  usState: string;
  monthIndex: number;
  symptoms: string[];
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
    monthIndex:
      typeof data.monthIndex === "number" && data.monthIndex >= 0 && data.monthIndex <= 11
        ? data.monthIndex
        : new Date().getMonth(),
    symptoms: Array.isArray(data.symptoms)
      ? data.symptoms.filter((s): s is string => typeof s === "string")
      : [],
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
