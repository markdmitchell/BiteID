import { z } from "zod";

export const EmergencySymptomSchema = z.object({
  difficultyBreathing: z.boolean().default(false),
  facialSwelling: z.boolean().default(false),
  dizzinessOrConfusion: z.boolean().default(false),
  spreadingHives: z.boolean().default(false),
});

export type EmergencySymptoms = z.infer<typeof EmergencySymptomSchema>;

export const IncidentLocationEnum = z.enum([
  "bed",
  "tall_grass_woods",
  "yard_garden",
  "garage_shed",
  "indoor_other",
  "outdoor_other",
]);
export type IncidentLocation = z.infer<typeof IncidentLocationEnum>;

export const TimeElapsedEnum = z.enum([
  "under_2h",
  "2_to_12h",
  "1_to_2_days",
  "over_2_days",
]);
export type TimeElapsed = z.infer<typeof TimeElapsedEnum>;

export const PrimarySensationEnum = z.enum([
  "severe_pain",
  "moderate_pain",
  "intense_itch",
  "mild_itch",
  "painless",
]);
export type PrimarySensation = z.infer<typeof PrimarySensationEnum>;

export const TriageContextSchema = z.object({
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  usState: z.string().default("US-VA"),
  monthIndex: z.number().min(0).max(11).default(new Date().getMonth()),
  incidentLocation: IncidentLocationEnum.default("yard_garden"),
  timeElapsed: TimeElapsedEnum.default("under_2h"),
  primarySensation: PrimarySensationEnum.default("intense_itch"),
  hasTargetoidBullseye: z.boolean().default(false), // Visual hallmark flag for Erythema Migrans
  emergencyScreening: EmergencySymptomSchema,
});

export type TriageContext = z.infer<typeof TriageContextSchema>;

export const CandidateResultSchema = z.object({
  name: z.string(),
  scientificName: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  probability: z.number().min(0).max(1),
  matchedFactors: z.array(z.string()),
  firstAidAdvice: z.array(z.string()),
  warningSigns: z.array(z.string()),
});

export type CandidateResult = z.infer<typeof CandidateResultSchema>;

export const AnalysisResultSchema = z.object({
  isEmergencyRedirect: z.boolean(),
  emergencyMessage: z.string().optional(),
  culpritDetectedFromPhoto: z.boolean(),
  rankedCandidates: z.array(CandidateResultSchema),
  summary: z.string(),
  disclaimer: z.string(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
