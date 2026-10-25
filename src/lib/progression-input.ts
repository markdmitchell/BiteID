import { z } from "zod";

const imageDataUrl = z.string().max(21_000_000).regex(
  /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/,
  "A supported image is required",
);
const timestamp = z.string().datetime({ offset: true });
const diameter = z.number().finite().min(0).max(1000).optional();

// Validate on the server before any progression calculation or model request.
export const progressionInputSchema = z.object({
  baselineImage: imageDataUrl,
  baselineDate: timestamp,
  baselineDiameterMm: diameter,
  followUpImage: imageDataUrl,
  followUpDate: timestamp,
  followUpDiameterMm: diameter,
  suspectedCondition: z.string().trim().max(200).optional(),
  patientProfile: z.enum([
    "standard_adult", "infant_toddler", "child", "pregnant_nursing", "geriatric_immune",
  ]).default("standard_adult"),
  reportedSymptoms: z.array(z.enum([
    "increasing_pain", "spreading_warmth", "red_streaks", "fever", "pus_drainage",
  ])).max(5).default([]),
}).refine(
  (data) => Date.parse(data.followUpDate) >= Date.parse(data.baselineDate),
  { message: "The follow-up photo must not precede the baseline photo", path: ["followUpDate"] },
);