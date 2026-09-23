import tineaCorporisImg from "@/assets/lookalikes/tinea-corporis.jpg";
import mrsaFuruncleImg from "@/assets/lookalikes/mrsa-furuncle.jpg";
import poisonIvyImg from "@/assets/lookalikes/poison-ivy.jpg";
import shinglesImg from "@/assets/lookalikes/shingles-herpes-zoster.jpg";
import cellulitisImg from "@/assets/lookalikes/cellulitis-erysipelas.jpg";
import phytophotodermatitisImg from "@/assets/lookalikes/phytophotodermatitis.jpg";
import swimmersItchImg from "@/assets/lookalikes/swimmers-itch.jpg";
import tacheNoireImg from "@/assets/lookalikes/tick-bite-tache-noire.jpg";

export type LookalikeDifferentiatingFeature = {
  feature: string;
  lookalikeSign: string;
  biteSign: string;
};

export type LookalikeItem = {
  id:
    | "tinea_corporis"
    | "mrsa_furuncle"
    | "poison_ivy"
    | "herpes_zoster"
    | "cellulitis_erysipelas"
    | "phytophotodermatitis"
    | "cercarial_dermatitis"
    | "tache_noire";
  name: string;
  scientificOrMedicalTerm: string;
  category:
    | "Fungal Infection"
    | "Bacterial Infection"
    | "Allergic Contact Dermatitis"
    | "Viral Infection"
    | "Phototoxic Reaction"
    | "Waterborne Parasitic Dermatitis"
    | "Rickettsial Vector Lesion";
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

  herpes_zoster: {
    id: "herpes_zoster",
    name: "Shingles (Herpes Zoster)",
    scientificOrMedicalTerm: "Varicella Zoster Virus Reactivation",
    category: "Viral Infection",
    mimickedVectors: ["Spider Bite", "Brown Recluse", "Asp Caterpillar Sting", "Centipede Bite"],
    image: shinglesImg,
    imageAlt:
      "Clinical reference of herpes zoster shingles grouped vesicles along a unilateral dermatome",
    summary:
      "Reactivation of latent varicella-zoster virus causing painful, grouped, clustered vesicles on an erythematous base strictly distributed along a single unilateral thoracic, lumbar, or cranial dermatome.",
    whyConsidered:
      "Severe sudden localized burning pain accompanied by clustered red blisters is frequently mistaken by patients for a spider bite or stinging caterpillar encounter.",
    differentiatingFeatures: [
      {
        feature: "Dermatomal Distribution",
        lookalikeSign:
          "Strictly unilateral; respects the anatomical midline without crossing to the opposite side of the body.",
        biteSign:
          "Random localized lesion wherever the insect made contact; completely independent of neural dermatomes.",
      },
      {
        feature: "Prodromal Neuropathic Pain",
        lookalikeSign:
          "Intense burning, tingling, allodynia, or lancinating nerve pain precedes skin rash by 2–5 days.",
        biteSign:
          "Pain commences abruptly at the moment of puncture or develops acutely within 2–6 hours.",
      },
      {
        feature: "Vesicular Morphology",
        lookalikeSign:
          "Crops of clear, umbilicated vesicles on an erythematous base that coalesce and form crusts over 7–10 days.",
        biteSign:
          "Central puncture, urticarial wheal, or focal necrotic sinking ulcer without widespread dermatomal crops.",
      },
    ],
    clinicalEvaluationTips: [
      "Polymerase chain reaction (PCR) or direct fluorescent antibody (DFA) testing of vesicle fluid for VZV DNA.",
      "Initiate oral antiviral therapy (valacyclovir 1 g TID or famciclovir) within 72 hours of onset to reduce post-herpetic neuralgia.",
      "Immediate urgent ophthalmology consultation if Hutchinson's sign is present (vesicles on the nasal tip involving cranial nerve V1).",
    ],
  },

  cellulitis_erysipelas: {
    id: "cellulitis_erysipelas",
    name: "Acute Cellulitis / Erysipelas",
    scientificOrMedicalTerm: "Spreading Pyogenic Dermal Infection",
    category: "Bacterial Infection",
    mimickedVectors: [
      "Secondary Bite Infection",
      "Spider Bite",
      "Hornet / Bee Large Local Reaction",
    ],
    image: cellulitisImg,
    imageAlt:
      "Clinical reference of acute cellulitis showing spreading erythematous, warm, edematous plaque",
    summary:
      "An acute, spreading pyogenic bacterial infection of the lower dermis and subcutaneous tissues, most commonly caused by Streptococcus pyogenes or Staphylococcus aureus.",
    whyConsidered:
      "Rapidly spreading warm, painful red skin erythema is frequently misattributed by patients to an unnoticed insect or spider bite.",
    differentiatingFeatures: [
      {
        feature: "Margin & Puncture Mark",
        lookalikeSign:
          "Ill-defined spreading border (or sharply raised in erysipelas) without central fang punctures or necrotic core.",
        biteSign:
          "Focal central puncture mark or indurated necrotic core with a circumscribed inflammatory perimeter.",
      },
      {
        feature: "Systemic Toxicity & Fevers",
        lookalikeSign:
          "High fever, chills, tachycardia, ascending lymphangitic streaking, and regional lymphadenopathy.",
        biteSign:
          "Uncomplicated arthropod bites rarely induce high fevers unless venom-specific systemic toxicity or secondary sepsis develops.",
      },
      {
        feature: "Predisposing Risk Factors",
        lookalikeSign:
          "Frequently arises on extremities with chronic venous insufficiency, lymphedema, or interdigital athlete's foot.",
        biteSign:
          "Occurs spontaneously on healthy skin following an outdoor exposure or direct insect interaction.",
      },
    ],
    clinicalEvaluationTips: [
      "Demarcate the advancing erythematous border with a skin marker to objectively track expansion over 12–24 hours.",
      "Inspect interdigital toe webs for maceration (tinea pedis) which frequently serves as the bacterial entry portal.",
      "Prescribe systemic antibiotics targeting beta-hemolytic Streptococcus and MSSA (e.g., cephalexin or cefazolin); add MRSA coverage if purulent.",
    ],
  },

  phytophotodermatitis: {
    id: "phytophotodermatitis",
    name: "Phytophotodermatitis ('Margarita Burn')",
    scientificOrMedicalTerm: "Furocoumarin Phototoxic Dermatitis",
    category: "Phototoxic Reaction",
    mimickedVectors: ["Blister Beetle Dermatitis", "Asp Caterpillar Sting", "Poison Ivy / Oak"],
    image: phytophotodermatitisImg,
    imageAlt:
      "Clinical reference of phytophotodermatitis showing linear drip marks, vesicles, and dense hyperpigmentation",
    summary:
      "A non-immunologic phototoxic skin reaction caused by skin contact with plant furocoumarins (in limes, celery, wild parsnips, giant hogweed, or figs) followed by exposure to solar ultraviolet A (UVA) light.",
    whyConsidered:
      "Bizarre linear streaks of blistering, erythema, and burning mimic caustic insect toxins (blister beetles) or venomous caterpillar spines.",
    differentiatingFeatures: [
      {
        feature: "Streak & Drip Configuration",
        lookalikeSign:
          "Distinct linear streaks, drip marks, handprints, or splatters corresponding to liquid juice dripping across skin.",
        biteSign:
          "Focal, discrete punctate or clustered lesions corresponding to insect feeding or sting sites.",
      },
      {
        feature: "Post-Inflammatory Hyperpigmentation",
        lookalikeSign:
          "Leaves pronounced dark brown or grayish-brown pigmentation that characteristically persists for months.",
        biteSign:
          "Typically resolves with minimal or transient pigment changes once acute inflammation clears.",
      },
      {
        feature: "Sunlight & Plant Exposure",
        lookalikeSign:
          "History of handling citrus (squeezing limes outdoors) or trimming outdoor weeds prior to intense sun exposure.",
        biteSign:
          "Occurs independent of solar UV exposure; directly linked to physical insect contact.",
      },
    ],
    clinicalEvaluationTips: [
      "Elicit detailed outdoor activity history: bartending, poolside citrus squeezing, garden weeding, or hiking through wild parsnip.",
      "Provide symptomatic care with cold compresses, barrier ointments, and mid-potency topical steroids during the early bullous stage.",
      "Strict photoprotection (broad-spectrum SPF 50+ mineral sunscreen) to mitigate long-term hyperpigmentation.",
    ],
  },

  cercarial_dermatitis: {
    id: "cercarial_dermatitis",
    name: "Swimmer's Itch (Cercarial Dermatitis)",
    scientificOrMedicalTerm: "Schistosome Cercarial Hypersensitivity",
    category: "Waterborne Parasitic Dermatitis",
    mimickedVectors: ["Chigger Bites", "No-See-Um Bites", "Flea Bites", "Mosquito Bites"],
    image: swimmersItchImg,
    imageAlt:
      "Clinical reference of swimmer's itch showing numerous intensely pruritic erythematous papules on exposed limbs",
    summary:
      "An acute allergic inflammatory skin eruption caused by penetration of microscopic cercariae (parasitic flatworm larvae from freshwater snails) into human skin while wading or swimming in lakes and ponds.",
    whyConsidered:
      "Dozens of intensely pruritic red papules and wheals across the legs and feet closely mimic heavy chigger or biting midge infestations.",
    differentiatingFeatures: [
      {
        feature: "Anatomical Distribution & Sparing",
        lookalikeSign:
          "Confined strictly to skin exposed to water; sharply spares skin that was covered by tight swimwear.",
        biteSign:
          "Chiggers characteristically concentrate tightly under tight clothing bands (waistbands, sock rims, undergarments).",
      },
      {
        feature: "Water Immersion Trigger",
        lookalikeSign:
          "Prickling tingling sensation begins within minutes as water dries; progresses to itchy red papules within 12 hours.",
        biteSign:
          "Occurs after walking through dry tall grass, brush, or forest leaf litter; no freshwater exposure.",
      },
      {
        feature: "Larval Life Cycle in Humans",
        lookalikeSign:
          "Non-transmissible; parasites die immediately within the epidermis, resolving spontaneously over 7–10 days.",
        biteSign:
          "Chiggers and ticks attach to the skin surface to feed, requiring mechanical removal or leaving prolonged stylostomes.",
      },
    ],
    clinicalEvaluationTips: [
      "Inquire about recent freshwater lake, pond, or marsh recreational swimming or wading.",
      "Prescribe topical calamine lotion, colloidal oatmeal baths, and oral second-generation antihistamines for pruritus.",
      "Advise thorough towel drying or showering immediately after leaving natural bodies of water.",
    ],
  },

  tache_noire: {
    id: "tache_noire",
    name: "Tick Bite Eschar ('Tache Noire')",
    scientificOrMedicalTerm: "Rickettsial Inoculation Eschar",
    category: "Rickettsial Vector Lesion",
    mimickedVectors: ["Brown Recluse Spider Bite", "Infected Spider Bite", "Cutaneous Anthrax"],
    image: tacheNoireImg,
    imageAlt:
      "Clinical reference of tache noire tick bite eschar with central black necrotic crust and erythematous halo",
    summary:
      "A diagnostic clinical lesion consisting of a painless, depressed black necrotic crust surrounded by an inflammatory erythematous halo, marking the inoculation site of tick-borne spotted fever group rickettsiae (e.g., Rickettsia parkeri, Mediterranean spotted fever).",
    whyConsidered:
      "A depressed black necrotic scab is almost universally feared and misidentified by patients as a necrotic Brown Recluse bite.",
    differentiatingFeatures: [
      {
        feature: "Indolence vs Acute Pain",
        lookalikeSign:
          "Painless or minimally tender despite ominous black necrotic appearance; often found incidentally on body check.",
        biteSign:
          "Brown Recluse loxoscelism causes severe progressive ischemic burning pain and intense local hyperesthesia.",
      },
      {
        feature: "Regional Lymphadenopathy",
        lookalikeSign:
          "Prominent, tender regional lymph node enlargement is present in over 80% of patients with rickettsial eschars.",
        biteSign:
          "Regional lymphadenopathy is uncommon in uncomplicated localized brown recluse envenomation.",
      },
      {
        feature: "Constitutional Symptoms",
        lookalikeSign:
          "Heralds systemic spotted fever symptoms: high spiking fever, severe retro-orbital headache, myalgias, and subsequent rash.",
        biteSign:
          "Brown recluse bites typically remain localized without systemic fever or widespread maculopapular rash.",
      },
    ],
    clinicalEvaluationTips: [
      "Perform a full-body skin exam, inspecting scalp, groin, and axillae for occult inoculation eschars.",
      "Do NOT withhold empiric oral Doxycycline (100 mg BID) pending lab results if spotted fever rickettsiosis is suspected.",
      "Obtain paired acute and convalescent serology or lesion swab PCR to confirm the rickettsial species.",
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
    // 1. If Erythema Migrans is suspect, prioritize Tinea Corporis first, then Tache Noire
    if (isErythemaMigrans) {
      if (a.id === "tinea_corporis") return -1;
      if (b.id === "tinea_corporis") return 1;
      if (a.id === "tache_noire") return -1;
      if (b.id === "tache_noire") return 1;
    }

    // 2. Brown Recluse or necrotic presentation: MRSA Furuncle, Tache Noire, Cellulitis, Shingles
    if (topResultId === "brown_recluse") {
      const order = ["mrsa_furuncle", "tache_noire", "cellulitis_erysipelas", "herpes_zoster"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    // 3. Black Widow or neurotoxic / systemic: Shingles, Cellulitis, MRSA
    if (topResultId === "black_widow") {
      const order = ["herpes_zoster", "cellulitis_erysipelas", "mrsa_furuncle"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    // 4. Caterpillars or Centipedes: Shingles, Phytophotodermatitis, Cellulitis
    if (topResultId === "asp_caterpillar" || topResultId === "giant_centipede") {
      const order = ["herpes_zoster", "phytophotodermatitis", "cellulitis_erysipelas"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    // 5. Water / grass vectors (chigger, no-see-um, flea): Swimmer's Itch, Poison Ivy
    if (topResultId === "chigger" || topResultId === "flea" || topResultId === "no_see_um") {
      const order = ["cercarial_dermatitis", "poison_ivy", "tinea_corporis"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    // 6. Bed bug: Poison Ivy first, then Swimmer's Itch
    if (topResultId === "bed_bug") {
      const order = ["poison_ivy", "cercarial_dermatitis", "mrsa_furuncle"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    // 7. Stinging Hymenoptera (wasp, bee, fire ant) or infections: Cellulitis, MRSA, Shingles
    if (
      topResultId === "hornet_wasp" ||
      topResultId === "honeybee" ||
      topResultId === "fire_ant" ||
      topResultId === "velvet_ant"
    ) {
      const order = ["cellulitis_erysipelas", "mrsa_furuncle", "herpes_zoster"];
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    return 0;
  });
}
