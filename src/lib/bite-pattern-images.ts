import generalIii from "@/assets/fitz-1-2.jpg";
import generalIiiIv from "@/assets/fitz-3-4.jpg";
import generalVvi from "@/assets/fitz-5-6.jpg";
import bedBugIii from "@/assets/bite-patterns/bed-bug-i-ii.jpg";
import bedBugIiiIv from "@/assets/bite-patterns/bed-bug-iii-iv.jpg";
import bedBugVvi from "@/assets/bite-patterns/bed-bug-v-vi.jpg";
import blackWidowIii from "@/assets/bite-patterns/black-widow-i-ii.jpg";
import blackWidowIiiIv from "@/assets/bite-patterns/black-widow-iii-iv.jpg";
import blackWidowVvi from "@/assets/bite-patterns/black-widow-v-vi.jpg";
import blackleggedTickIii from "@/assets/bite-patterns/blacklegged-tick-i-ii.jpg";
import blackleggedTickIiiIv from "@/assets/bite-patterns/blacklegged-tick-iii-iv.jpg";
import blackleggedTickVvi from "@/assets/bite-patterns/blacklegged-tick-v-vi.jpg";
import brownRecluseIii from "@/assets/bite-patterns/brown-recluse-i-ii.jpg";
import brownRecluseIiiIv from "@/assets/bite-patterns/brown-recluse-iii-iv.jpg";
import brownRecluseVvi from "@/assets/bite-patterns/brown-recluse-v-vi.jpg";
import dogTickIii from "@/assets/bite-patterns/dog-tick-i-ii.jpg";
import dogTickIiiIv from "@/assets/bite-patterns/dog-tick-iii-iv.jpg";
import dogTickVvi from "@/assets/bite-patterns/dog-tick-v-vi.jpg";
import fleaIii from "@/assets/bite-patterns/flea-i-ii.jpg";
import fleaIiiIv from "@/assets/bite-patterns/flea-iii-iv.jpg";
import fleaVvi from "@/assets/bite-patterns/flea-v-vi.jpg";
import honeyBeeIii from "@/assets/bite-patterns/honey-bee-i-ii.jpg";
import honeyBeeIiiIv from "@/assets/bite-patterns/honey-bee-iii-iv.jpg";
import honeyBeeVvi from "@/assets/bite-patterns/honey-bee-v-vi.jpg";
import loneStarTickIii from "@/assets/bite-patterns/lone-star-tick-i-ii.jpg";
import loneStarTickIiiIv from "@/assets/bite-patterns/lone-star-tick-iii-iv.jpg";
import loneStarTickVvi from "@/assets/bite-patterns/lone-star-tick-v-vi.jpg";
import mosquitoIii from "@/assets/bite-patterns/mosquito-i-ii.jpg";
import mosquitoIiiIv from "@/assets/bite-patterns/mosquito-iii-iv.jpg";
import mosquitoVvi from "@/assets/bite-patterns/mosquito-v-vi.jpg";
import waspIii from "@/assets/bite-patterns/wasp-i-ii.jpg";
import waspIiiIv from "@/assets/bite-patterns/wasp-iii-iv.jpg";
import waspVvi from "@/assets/bite-patterns/wasp-v-vi.jpg";
import erythemaMigransIii from "@/assets/bite-patterns/erythema-migrans-i-ii.jpg";
import erythemaMigransIiiIv from "@/assets/bite-patterns/erythema-migrans-iii-iv.jpg";
import erythemaMigransVvi from "@/assets/bite-patterns/erythema-migrans-v-vi.jpg";

export type BitePatternSet = {
  label: string;
  pattern: string;
  images: { "i-ii": string; "iii-iv": string; "v-vi": string };
};

export const GENERAL_BITE_PATTERN: BitePatternSet = {
  label: "Common skin reaction",
  pattern: "a general mild bite-like reaction",
  images: { "i-ii": generalIii, "iii-iv": generalIiiIv, "v-vi": generalVvi },
};

const BITE_PATTERNS: Record<string, BitePatternSet> = {
  mosquito: {
    label: "Mosquito",
    pattern: "a few separate raised wheals",
    images: { "i-ii": mosquitoIii, "iii-iv": mosquitoIiiIv, "v-vi": mosquitoVvi },
  },
  blacklegged_tick: {
    label: "Blacklegged tick",
    pattern: "a single localized bump with a central punctum",
    images: {
      "i-ii": blackleggedTickIii,
      "iii-iv": blackleggedTickIiiIv,
      "v-vi": blackleggedTickVvi,
    },
  },
  lone_star_tick: {
    label: "Lone star tick",
    pattern: "a single localized bump with a central punctum",
    images: { "i-ii": loneStarTickIii, "iii-iv": loneStarTickIiiIv, "v-vi": loneStarTickVvi },
  },
  dog_tick: {
    label: "American dog tick",
    pattern: "a single localized bump with a central punctum",
    images: { "i-ii": dogTickIii, "iii-iv": dogTickIiiIv, "v-vi": dogTickVvi },
  },
  bed_bug: {
    label: "Bed bug",
    pattern: "multiple small bumps in a grouped or linear pattern",
    images: { "i-ii": bedBugIii, "iii-iv": bedBugIiiIv, "v-vi": bedBugVvi },
  },
  flea: {
    label: "Flea",
    pattern: "several small clustered bumps around the lower leg",
    images: { "i-ii": fleaIii, "iii-iv": fleaIiiIv, "v-vi": fleaVvi },
  },
  brown_recluse: {
    label: "Brown recluse",
    pattern: "a mild localized nonspecific bump",
    images: { "i-ii": brownRecluseIii, "iii-iv": brownRecluseIiiIv, "v-vi": brownRecluseVvi },
  },
  black_widow: {
    label: "Black widow",
    pattern: "a mild localized nonspecific bump",
    images: { "i-ii": blackWidowIii, "iii-iv": blackWidowIiiIv, "v-vi": blackWidowVvi },
  },
  honey_bee: {
    label: "Honey bee",
    pattern: "a single raised wheal with localized swelling",
    images: { "i-ii": honeyBeeIii, "iii-iv": honeyBeeIiiIv, "v-vi": honeyBeeVvi },
  },
  wasp: {
    label: "Wasp or yellow jacket",
    pattern: "a single raised wheal with localized swelling",
    images: { "i-ii": waspIii, "iii-iv": waspIiiIv, "v-vi": waspVvi },
  },
  erythema_migrans: {
    label: "Erythema Migrans (Lyme Disease Rash)",
    pattern: "an expanding circular or bullseye targetoid rash",
    images: {
      "i-ii": erythemaMigransIii,
      "iii-iv": erythemaMigransIiiIv,
      "v-vi": erythemaMigransVvi,
    },
  },
};

export function bitePatternOf(id?: string, isErythemaMigrans?: boolean): BitePatternSet {
  if (isErythemaMigrans || id === "erythema_migrans") {
    return BITE_PATTERNS["erythema_migrans"];
  }
  return (id && BITE_PATTERNS[id]) || GENERAL_BITE_PATTERN;
}
