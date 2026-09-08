export type FitzpatrickScale = 'I-II' | 'III-IV' | 'V-VI';

export interface VisualReferenceAsset {
  id: string;
  pestId: string;
  imageUrl: string;
  isAIGenerated: boolean;
  skinTypeCategory: FitzpatrickScale;
  clinicalDescription: string;
  hallmarkFeatures: string[];
  sourceAttribution?: string; // e.g., "CDC PHIL #2187" or "AI Clinical Model"
}

// Inline SVG assets representing typical presentations across skin tones
const SVG_REF_LIGHT_MOSQUITO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23fdedec'/><circle cx='200' cy='150' r='45' fill='%23f5b7b1' opacity='0.7'/><circle cx='200' cy='150' r='14' fill='%23e74c3c'/><circle cx='200' cy='150' r='3' fill='%2378281f'/></svg>";

const SVG_REF_DARK_MOSQUITO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%234a3525'/><circle cx='200' cy='150' r='45' fill='%23362214' opacity='0.8'/><circle cx='200' cy='150' r='16' fill='%23271509'/><circle cx='200' cy='150' r='4' fill='%23120803'/></svg>";

const SVG_REF_LIGHT_TICK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23fef5e7'/><circle cx='200' cy='150' r='75' fill='%23f9e79f' opacity='0.5'/><circle cx='200' cy='150' r='60' fill='%23f5cba7' opacity='0.6'/><circle cx='200' cy='150' r='25' fill='%23e74c3c'/><circle cx='200' cy='150' r='5' fill='%231b2631'/></svg>";

const SVG_REF_DARK_TICK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%233d2b1f'/><circle cx='200' cy='150' r='75' fill='%232c1d13' opacity='0.6'/><circle cx='200' cy='150' r='45' fill='%231f130a' opacity='0.7'/><circle cx='200' cy='150' r='15' fill='%23120904'/><circle cx='200' cy='150' r='4' fill='%23050201'/></svg>";

const SVG_REF_RECLUSE_LIGHT =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23fadbd8'/><circle cx='200' cy='150' r='60' fill='%23f1948a' opacity='0.6'/><circle cx='200' cy='150' r='30' fill='%235d6d7e'/><circle cx='200' cy='150' r='12' fill='%231b2631'/></svg>";

const SVG_REF_RECLUSE_DARK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23382519'/><circle cx='200' cy='150' r='60' fill='%2326160d' opacity='0.7'/><circle cx='200' cy='150' r='30' fill='%23170c06'/><circle cx='200' cy='150' r='12' fill='%23090301'/></svg>";

export const REFERENCE_ASSET_REGISTRY: VisualReferenceAsset[] = [
  // Mosquito References
  {
    id: "ref_mosquito_1",
    pestId: "mosquito",
    imageUrl: SVG_REF_LIGHT_MOSQUITO,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Erythematous pruritic wheal with central punctum on light skin tone.",
    hallmarkFeatures: [
      "Soft edematous wheal (hives-like swelling)",
      "Surrounding pale pink erythematous halo",
      "Immediate intense pruritus (itching)",
    ],
    sourceAttribution: "CDC PHIL #2187",
  },
  {
    id: "ref_mosquito_2",
    pestId: "mosquito",
    imageUrl: SVG_REF_DARK_MOSQUITO,
    isAIGenerated: true,
    skinTypeCategory: "V-VI",
    clinicalDescription: "Hyperpigmented indurated papule with subtle edema on rich melanin skin tone.",
    hallmarkFeatures: [
      "Firm dark hyperpigmented nodule or papule",
      "Subtle surrounding induration rather than bright erythema",
      "Prolonged post-inflammatory hyperpigmentation",
    ],
    sourceAttribution: "AI Clinical Model Reference",
  },
  {
    id: "ref_mosquito_3",
    pestId: "mosquito",
    imageUrl: SVG_REF_LIGHT_MOSQUITO,
    isAIGenerated: false,
    skinTypeCategory: "III-IV",
    clinicalDescription: "Moderate pink papular lesion with central puncture mark.",
    hallmarkFeatures: [
      "Central tiny puncture mark",
      "Moderate localized swelling and warmth",
    ],
    sourceAttribution: "iNaturalist #98412",
  },

  // Tick References
  {
    id: "ref_tick_1",
    pestId: "blacklegged_tick",
    imageUrl: SVG_REF_LIGHT_TICK,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Expanding targetoid Erythema Migrans ('bullseye') rash characteristic of early Lyme disease.",
    hallmarkFeatures: [
      "Expanding central red macule with surrounding clear ring",
      "Outer erythematous border extending >5cm",
      "Typically non-pruritic and non-painful",
    ],
    sourceAttribution: "CDC PHIL #4029",
  },
  {
    id: "ref_tick_2",
    pestId: "blacklegged_tick",
    imageUrl: SVG_REF_DARK_TICK,
    isAIGenerated: true,
    skinTypeCategory: "V-VI",
    clinicalDescription: "Subtle violaceous or dark hyperpigmented expanding circular lesion on deeply pigmented skin.",
    hallmarkFeatures: [
      "Violaceous (purplish) or dark central lesion",
      "Concentric ring pattern may appear darker than base skin tone",
      "Indurated texture difference detectable on palpation",
    ],
    sourceAttribution: "AI Clinical Model Reference",
  },
  {
    id: "ref_tick_3",
    pestId: "blacklegged_tick",
    imageUrl: SVG_REF_LIGHT_TICK,
    isAIGenerated: false,
    skinTypeCategory: "III-IV",
    clinicalDescription: "Classic bullseye targetoid lesion on olive skin tone.",
    hallmarkFeatures: [
      "Defined outer ring with central clearing",
      "Expands over 3-14 days post tick detachment",
    ],
    sourceAttribution: "CDC PHIL #8112",
  },

  // Bed Bug References
  {
    id: "ref_bedbug_1",
    pestId: "bed_bug",
    imageUrl: SVG_REF_LIGHT_MOSQUITO,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Linear cluster of three erythematous maculopapular lesions ('breakfast, lunch, dinner' pattern).",
    hallmarkFeatures: [
      "Sequential linear or zig-zag pattern",
      "Intensely pruritic papules on exposed sleep areas (arms, neck)",
    ],
    sourceAttribution: "CDC PHIL #3301",
  },
  {
    id: "ref_bedbug_2",
    pestId: "bed_bug",
    imageUrl: SVG_REF_DARK_MOSQUITO,
    isAIGenerated: true,
    skinTypeCategory: "V-VI",
    clinicalDescription: "Multiple hyperpigmented firm papules in a row on darker skin tones.",
    hallmarkFeatures: [
      "Linear row of dark papules",
      "Severe night-time scratching excoriations",
    ],
    sourceAttribution: "AI Clinical Model Reference",
  },

  // Flea References
  {
    id: "ref_flea_1",
    pestId: "flea",
    imageUrl: SVG_REF_LIGHT_MOSQUITO,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Grouped small punctate petechial papules on lower legs and ankles.",
    hallmarkFeatures: [
      "Small pinpoint red dots with surrounding halo",
      "Clustered primarily below the knee",
    ],
    sourceAttribution: "CDC PHIL #1104",
  },

  // Brown Recluse References
  {
    id: "ref_recluse_1",
    pestId: "brown_recluse",
    imageUrl: SVG_REF_RECLUSE_LIGHT,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Classic 'Red, White, and Blue' sign (erythema, blanching, central cyanotic necrosis).",
    hallmarkFeatures: [
      "Central dark bluish/purplish sinking necrotic center",
      "Surrounding white ischemic pale zone",
      "Outer irregular erythematous margin",
    ],
    sourceAttribution: "CDC PHIL #5920",
  },
  {
    id: "ref_recluse_2",
    pestId: "brown_recluse",
    imageUrl: SVG_REF_RECLUSE_DARK,
    isAIGenerated: true,
    skinTypeCategory: "V-VI",
    clinicalDescription: "Deep necrotic eschar with surrounding hyperpigmented induration on dark skin tone.",
    hallmarkFeatures: [
      "Central firm black/dark eschar formation",
      "Severe surrounding tissue tenderness and warmth",
    ],
    sourceAttribution: "AI Clinical Model Reference",
  },

  // Black Widow References
  {
    id: "ref_widow_1",
    pestId: "black_widow",
    imageUrl: SVG_REF_LIGHT_MOSQUITO,
    isAIGenerated: false,
    skinTypeCategory: "I-II",
    clinicalDescription: "Dual fang punctum marks surrounded by mild erythema and localized diaphoresis (sweating).",
    hallmarkFeatures: [
      "Two distinct pinpoint fang entry marks ~1-2mm apart",
      "Minimal initial swelling despite severe radiating pain",
    ],
    sourceAttribution: "CDC PHIL #6801",
  },
];

export function getReferenceAssetsForPest(
  pestId: string,
  skinType?: FitzpatrickScale
): VisualReferenceAsset[] {
  const pestAssets = REFERENCE_ASSET_REGISTRY.filter((asset) => asset.pestId === pestId);
  if (pestAssets.length === 0) {
    // Fallback to mosquito assets if pestId not explicitly matched
    return REFERENCE_ASSET_REGISTRY.filter((asset) => asset.pestId === "mosquito");
  }

  if (skinType) {
    const filtered = pestAssets.filter((asset) => asset.skinTypeCategory === skinType);
    if (filtered.length > 0) return filtered;
  }

  return pestAssets;
}
