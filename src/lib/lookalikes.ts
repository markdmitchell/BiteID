import tineaCorporisImg from "@/assets/lookalikes/tinea-corporis.jpg";
import mrsaFuruncleImg from "@/assets/lookalikes/mrsa-furuncle.jpg";
import poisonIvyImg from "@/assets/lookalikes/poison-ivy.jpg";

export type LookalikeDifferentiatingFeature = {
  feature: string;
  lookalikeSign: string;
  biteSign: string;
};

export type LookalikeItem = {
  id: "tinea_corporis" | "mrsa_furuncle" | "poison_ivy";
  name: string;
  scientificOrMedicalTerm: string;
  category: "Fungal Infection" | "Bacterial Infection" | "Allergic Contact Dermatitis";
  mimickedVectors: string[];
  image: string;
  imageAlt: string;
  summary: string;
  whyConsidered: string;
  differentiatingFeatures: LookalikeDifferentiatingFeature[];
  clinicalEvaluationTips: string[];
};

export const LOOKALIKE_DATABASE: Record<string, LookalikeItem> = {
  tinea_corporis: {
    id: "tinea_corporis",
    name: "Ringworm (Tinea Corporis)",
    scientificOrMedicalTerm: "Dermatophytosis (Trichophyton / Microsporum)",
    category: "Fungal Infection",
    mimickedVectors: ["Erythema Migrans (Tick / Lyme Disease)", "Spider Bite"],
    image: tineaCorporisImg,
    imageAlt:
      "Clinical reference of tinea corporis ringworm annular scaly lesion with central clearing",
    summary:
      "A superficial fungal infection presenting as a round, expanding annular plaque with a raised, finely scaly active border and central clearing. Highly prone to misdiagnosis as Lyme Erythema Migrans.",
    whyConsidered:
      "Annular, ring-shaped configuration with central clearing closely mirrors the Erythema Migrans 'bullseye' pattern.",
    differentiatingFeatures: [
      {
        feature: "Surface Scale & Texture",
        lookalikeSign:
          "Prominent fine surface scale, flakiness, or micro-papules along the active leading edge.",
        biteSign:
          "Smooth, non-scaly macular erythema; lesion lies completely flat within the dermis.",
      },
      {
        feature: "Expansion Velocity",
        lookalikeSign: "Slow, gradual expansion over weeks or months. Often mildly itchy.",
        biteSign:
          "Rapid expansion over 24 to 72 hours (often expanding > 1 cm per day during acute Lyme).",
      },
      {
        feature: "Systemic Symptoms",
        lookalikeSign: "Strictly cutaneous. No fever, chills, fatigue, arthralgia, or headache.",
        biteSign:
          "Frequently accompanied by flu-like constitutional symptoms (fever, neck stiffness, joint aches).",
      },
    ],
    clinicalEvaluationTips: [
      "Potassium Hydroxide (KOH) preparation of edge scrapings to visualize fungal branching hyphae.",
      "Wood's lamp examination (may fluoresce in select fungal species).",
      "Do NOT administer topical corticosteroids alone without ruling out tinea (prevents tinea incognito).",
    ],
  },

  mrsa_furuncle: {
    id: "mrsa_furuncle",
    name: "MRSA / Bacterial Furuncle (Boil)",
    scientificOrMedicalTerm: "Staphylococcal Follicular Abscess",
    category: "Bacterial Infection",
    mimickedVectors: ["Brown Recluse Bite", "Spider Bite", "Tick Bite"],
    image: mrsaFuruncleImg,
    imageAlt:
      "Clinical reference of a bacterial furuncle with erythematous swelling and central purulent head",
    summary:
      "A deep bacterial hair follicle infection (frequently community-acquired MRSA). Clinically accounts for up to 60% of false-positive self-reported 'spider bites' seen in emergency medicine.",
    whyConsidered:
      "Presents as a tender, painful red nodule with a necrotic or purulent center, frequently mistaken for envenomation.",
    differentiatingFeatures: [
      {
        feature: "Purulence / Pus Formation",
        lookalikeSign: "Central fluctuance with creamy yellow or white purulent core (pus head).",
        biteSign:
          "Pus is virtually never present in early spider bites; genuine brown recluse bites cause ischemic sinking necrosis without pus.",
      },
      {
        feature: "Bite Puncture Marks",
        lookalikeSign:
          "Single central follicle without dual puncta. Surrounding area is indurated and warm.",
        biteSign:
          "Spider bites occasionally feature dual fang puncta separated by 1–2 mm (if visible).",
      },
      {
        feature: "Furuncle Multiplicity",
        lookalikeSign:
          "Often occurs in areas of friction or shaving, with possible history of similar recurrent boils.",
        biteSign:
          "Spiders bite defensively once when trapped against skin; recurrent clustered 'spider bites' are almost always bacterial.",
      },
    ],
    clinicalEvaluationTips: [
      "Incision and drainage (I&D) for fluctuant collections, with bacterial wound culture and susceptibility testing.",
      "Avoid attributing necrotic or purulent lesions to spider bites unless an arachnid specimen was physically recovered.",
      "Empiric antimicrobial coverage for MRSA (e.g., trimethoprim-sulfamethoxazole or doxycycline) if cellulitis is spreading.",
    ],
  },

  poison_ivy: {
    id: "poison_ivy",
    name: "Allergic Contact Dermatitis (Poison Ivy / Oak)",
    scientificOrMedicalTerm: "Rhus Dermatitis (Urushiol Hypersensitivity)",
    category: "Allergic Contact Dermatitis",
    mimickedVectors: ["Bed Bug 'Breakfast-Lunch-Dinner' Bites", "Flea Bites", "Chigger Bites"],
    image: poisonIvyImg,
    imageAlt:
      "Clinical reference of poison ivy allergic contact dermatitis showing linear grouped vesicles",
    summary:
      "A type IV cell-mediated hypersensitivity reaction following contact with plant urushiol oil. The classic linear grouping of intensely pruritic vesicles is often confused with clustered insect bites.",
    whyConsidered:
      "Grouped, raised, intensely itchy papules or vesicles mimic multiple feeding bites from fleas or bed bugs.",
    differentiatingFeatures: [
      {
        feature: "Linear 'Streaked' Distribution",
        lookalikeSign:
          "Distinct linear configuration corresponding to where a plant leaf or resin brushed across the skin.",
        biteSign:
          "May be grouped or sequential, but lacking continuous linear resin streaks with vesicular coalescing.",
      },
      {
        feature: "Blistering & Fluid",
        lookalikeSign:
          "Marked tense serous micro-vesicles or large bullae that weep clear yellowish serum.",
        biteSign:
          "Typically solid urticarial papules with a tiny central hemorrhagic punctum or crust.",
      },
      {
        feature: "Onset & Exposure History",
        lookalikeSign:
          "Develops 24 to 72 hours after hiking, yard work, gardening, or touching outdoor equipment.",
        biteSign:
          "Immediate or overnight itching following sleeping indoors or direct exposure to grassy tick/chigger turf.",
      },
    ],
    clinicalEvaluationTips: [
      "Thorough wash of clothing and gear to remove persistent urushiol resin.",
      "Topical high-potency corticosteroids for limited localized involvement (avoid face/intertriginous areas).",
      "Oral prednisone taper (14–21 days) if widespread (> 25% BSA) to prevent rebound inflammation.",
    ],
  },
};

export function getLookalikeDifferentials(
  topResultId?: string,
  isErythemaMigrans = false,
): LookalikeItem[] {
  const items = Object.values(LOOKALIKE_DATABASE);

  return items.sort((a, b) => {
    // If Erythema Migrans is suspect, prioritize Tinea Corporis first
    if (isErythemaMigrans) {
      if (a.id === "tinea_corporis") return -1;
      if (b.id === "tinea_corporis") return 1;
    }
    // If spider bite is suspect, prioritize MRSA first
    if (topResultId === "brown_recluse" || topResultId === "black_widow") {
      if (a.id === "mrsa_furuncle") return -1;
      if (b.id === "mrsa_furuncle") return 1;
    }
    // If bed bug or flea is suspect, prioritize Poison Ivy first
    if (topResultId === "bed_bug" || topResultId === "flea") {
      if (a.id === "poison_ivy") return -1;
      if (b.id === "poison_ivy") return 1;
    }
    return 0;
  });
}
