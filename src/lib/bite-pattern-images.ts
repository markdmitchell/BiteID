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
import fireAntIii from "@/assets/bite-patterns/fire-ant-i-ii.jpg";
import fireAntIiiIv from "@/assets/bite-patterns/fire-ant-iii-iv.jpg";
import fireAntVvi from "@/assets/bite-patterns/fire-ant-v-vi.jpg";
import chiggerIii from "@/assets/bite-patterns/chigger-i-ii.jpg";
import chiggerIiiIv from "@/assets/bite-patterns/chigger-iii-iv.jpg";
import chiggerVvi from "@/assets/bite-patterns/chigger-v-vi.jpg";
import kissingBugIii from "@/assets/bite-patterns/kissing-bug-i-ii.jpg";
import kissingBugIiiIv from "@/assets/bite-patterns/kissing-bug-iii-iv.jpg";
import kissingBugVvi from "@/assets/bite-patterns/kissing-bug-v-vi.jpg";
import scorpionIii from "@/assets/bite-patterns/scorpion-i-ii.jpg";
import scorpionIiiIv from "@/assets/bite-patterns/scorpion-iii-iv.jpg";
import scorpionVvi from "@/assets/bite-patterns/scorpion-v-vi.jpg";
import horseFlyIii from "@/assets/bite-patterns/horse-fly-i-ii.jpg";
import horseFlyIiiIv from "@/assets/bite-patterns/horse-fly-iii-iv.jpg";
import horseFlyVvi from "@/assets/bite-patterns/horse-fly-v-vi.jpg";
import liceIii from "@/assets/bite-patterns/lice-i-ii.jpg";
import liceIiiIv from "@/assets/bite-patterns/lice-iii-iv.jpg";
import liceVvi from "@/assets/bite-patterns/lice-v-vi.jpg";
import noSeeUmIii from "@/assets/bite-patterns/no-see-um-i-ii.jpg";
import noSeeUmIiiIv from "@/assets/bite-patterns/no-see-um-iii-iv.jpg";
import noSeeUmVvi from "@/assets/bite-patterns/no-see-um-v-vi.jpg";
import blackFlyIii from "@/assets/bite-patterns/black-fly-i-ii.jpg";
import blackFlyIiiIv from "@/assets/bite-patterns/black-fly-iii-iv.jpg";
import blackFlyVvi from "@/assets/bite-patterns/black-fly-v-vi.jpg";
import blisterBeetleIii from "@/assets/bite-patterns/blister-beetle-i-ii.jpg";
import blisterBeetleIiiIv from "@/assets/bite-patterns/blister-beetle-iii-iv.jpg";
import blisterBeetleVvi from "@/assets/bite-patterns/blister-beetle-v-vi.jpg";
import pitViperIii from "@/assets/bite-patterns/pit-viper-i-ii.jpg";
import pitViperIiiIv from "@/assets/bite-patterns/pit-viper-iii-iv.jpg";
import pitViperVvi from "@/assets/bite-patterns/pit-viper-v-vi.jpg";

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
  fire_ant: {
    label: "Fire ant",
    pattern: "multiple intensely itchy, pustular welts with an erythematous base",
    images: { "i-ii": fireAntIii, "iii-iv": fireAntIiiIv, "v-vi": fireAntVvi },
  },
  chigger: {
    label: "Chigger (Harvest mite)",
    pattern: "clustered, intensely pruritic erythematous papules along clothing seams",
    images: { "i-ii": chiggerIii, "iii-iv": chiggerIiiIv, "v-vi": chiggerVvi },
  },
  kissing_bug: {
    label: "Kissing bug (Triatomine)",
    pattern: "painless large erythematous wheals, often facial with periorbital swelling",
    images: { "i-ii": kissingBugIii, "iii-iv": kissingBugIiiIv, "v-vi": kissingBugVvi },
  },
  scorpion: {
    label: "Scorpion",
    pattern: "localized immediate sharp pain with minimal puncture mark or mild swelling",
    images: { "i-ii": scorpionIii, "iii-iv": scorpionIiiIv, "v-vi": scorpionVvi },
  },
  horse_fly: {
    label: "Horse fly or deer fly",
    pattern: "painful sharp laceration welt with central puncture and surrounding edema",
    images: { "i-ii": horseFlyIii, "iii-iv": horseFlyIiiIv, "v-vi": horseFlyVvi },
  },
  lice: {
    label: "Lice (Pediculosis)",
    pattern: "tiny pruritic punctate erythematous papules and excoriations",
    images: { "i-ii": liceIii, "iii-iv": liceIiiIv, "v-vi": liceVvi },
  },
  no_see_um: {
    label: "No-see-um (Biting midge)",
    pattern: "dense cluster of sharply stinging, tiny punctate erythematous welts",
    images: { "i-ii": noSeeUmIii, "iii-iv": noSeeUmIiiIv, "v-vi": noSeeUmVvi },
  },
  black_fly: {
    label: "Black fly (Buffalo gnat)",
    pattern: "painful edematous wheal with a central puncture mark",
    images: { "i-ii": blackFlyIii, "iii-iv": blackFlyIiiIv, "v-vi": blackFlyVvi },
  },
  blister_beetle: {
    label: "Blister beetle (Cantharidin)",
    pattern: "delayed-onset linear or localized tense, fluid-filled epidermal blisters",
    images: { "i-ii": blisterBeetleIii, "iii-iv": blisterBeetleIiiIv, "v-vi": blisterBeetleVvi },
  },
  pit_viper: {
    label: "Pit viper (Copperhead / Rattlesnake)",
    pattern: "two distinct deep puncture fang marks with progressive edema and ecchymosis",
    images: { "i-ii": pitViperIii, "iii-iv": pitViperIiiIv, "v-vi": pitViperVvi },
  },
};

export function bitePatternOf(id?: string, isErythemaMigrans?: boolean): BitePatternSet {
  if (isErythemaMigrans || id === "erythema_migrans") {
    return BITE_PATTERNS["erythema_migrans"] ?? GENERAL_BITE_PATTERN;
  }
  return (id && BITE_PATTERNS[id]) || GENERAL_BITE_PATTERN;
}
