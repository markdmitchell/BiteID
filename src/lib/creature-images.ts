import americanDogTick from "@/assets/creatures/american-dog-tick.jpg";
import bedBug from "@/assets/creatures/bed-bug.jpg";
import blackFly from "@/assets/creatures/black-fly.jpg";
import blackWidow from "@/assets/creatures/black-widow.jpg";
import blackleggedTick from "@/assets/creatures/blacklegged-tick.jpg";
import blisterBeetle from "@/assets/creatures/blister-beetle.jpg";
import brownRecluse from "@/assets/creatures/brown-recluse.jpg";
import chigger from "@/assets/creatures/chigger.jpg";
import fireAnt from "@/assets/creatures/fire-ant.jpg";
import flea from "@/assets/creatures/flea.jpg";
import honeyBee from "@/assets/creatures/honey-bee.jpg";
import horseFly from "@/assets/creatures/horse-fly.jpg";
import kissingBug from "@/assets/creatures/kissing-bug.jpg";
import lice from "@/assets/creatures/lice.jpg";
import loneStarTick from "@/assets/creatures/lone-star-tick.jpg";
import mosquito from "@/assets/creatures/mosquito.jpg";
import noSeeUm from "@/assets/creatures/no-see-um.jpg";
import pitViper from "@/assets/creatures/pit-viper.jpg";
import scorpion from "@/assets/creatures/scorpion.jpg";
import waspYellowJacket from "@/assets/creatures/wasp-yellow-jacket.jpg";
import coralSnake from "@/assets/creatures/coral-snake.jpg";
import giantCentipede from "@/assets/creatures/giant-centipede.jpg";
import aspCaterpillar from "@/assets/creatures/asp-caterpillar.jpg";
import jellyfish from "@/assets/creatures/jellyfish.jpg";
import stingray from "@/assets/creatures/stingray.jpg";
import velvetAnt from "@/assets/creatures/velvet-ant.jpg";
import wheelBug from "@/assets/creatures/wheel-bug.jpg";
import yellowSacSpider from "@/assets/creatures/yellow-sac-spider.jpg";
import scabies from "@/assets/creatures/scabies.jpg";
import brownDogTick from "@/assets/creatures/brown-dog-tick.jpg";
import minutePirateBug from "@/assets/creatures/minute-pirate-bug.jpg";
import softTick from "@/assets/creatures/soft-tick.jpg";

type CreatureReference = {
  src: string;
  alt: string;
};

export const CREATURE_REFERENCES: Record<string, CreatureReference> = {
  mosquito: {
    src: mosquito,
    alt: "AI-generated field-guide reference of a mosquito",
  },
  blacklegged_tick: {
    src: blackleggedTick,
    alt: "AI-generated field-guide reference of a blacklegged deer tick",
  },
  lone_star_tick: {
    src: loneStarTick,
    alt: "AI-generated field-guide reference of a lone star tick",
  },
  dog_tick: {
    src: americanDogTick,
    alt: "AI-generated field-guide reference of an American dog tick",
  },
  bed_bug: {
    src: bedBug,
    alt: "AI-generated field-guide reference of a bed bug",
  },
  flea: {
    src: flea,
    alt: "AI-generated field-guide reference of a flea",
  },
  brown_recluse: {
    src: brownRecluse,
    alt: "AI-generated field-guide reference of a brown recluse spider",
  },
  black_widow: {
    src: blackWidow,
    alt: "AI-generated field-guide reference of a black widow spider",
  },
  fire_ant: {
    src: fireAnt,
    alt: "AI-generated field-guide reference of a red imported fire ant",
  },
  chigger: {
    src: chigger,
    alt: "AI-generated field-guide reference of a chigger mite",
  },
  kissing_bug: {
    src: kissingBug,
    alt: "AI-generated field-guide reference of a kissing bug (Triatoma)",
  },
  honey_bee: {
    src: honeyBee,
    alt: "AI-generated field-guide reference of a honey bee",
  },
  wasp: {
    src: waspYellowJacket,
    alt: "AI-generated field-guide reference of a yellow jacket wasp",
  },
  scorpion: {
    src: scorpion,
    alt: "AI-generated field-guide reference of a bark scorpion",
  },
  horse_fly: {
    src: horseFly,
    alt: "AI-generated field-guide reference of a biting horse fly",
  },
  lice: {
    src: lice,
    alt: "AI-generated field-guide reference of a human louse",
  },
  no_see_um: {
    src: noSeeUm,
    alt: "AI-generated field-guide reference of a biting midge (no-see-um)",
  },
  black_fly: {
    src: blackFly,
    alt: "AI-generated field-guide reference of a black fly (buffalo gnat)",
  },
  blister_beetle: {
    src: blisterBeetle,
    alt: "AI-generated field-guide reference of a striped blister beetle",
  },
  pit_viper: {
    src: pitViper,
    alt: "AI-generated field-guide reference of a venomous pit viper (copperhead)",
  },
  coral_snake: {
    src: coralSnake,
    alt: "AI-generated field-guide reference of an Eastern coral snake (Micrurus fulvius)",
  },
  giant_centipede: {
    src: giantCentipede,
    alt: "AI-generated field-guide reference of a giant desert centipede (Scolopendra heros)",
  },
  asp_caterpillar: {
    src: aspCaterpillar,
    alt: "AI-generated field-guide reference of a puss caterpillar / asp (Megalopyge opercularis)",
  },
  jellyfish: {
    src: jellyfish,
    alt: "AI-generated field-guide reference of an Atlantic jellyfish / Portuguese man o' war (Physalia physalis)",
  },
  stingray: {
    src: stingray,
    alt: "AI-generated field-guide reference of a stingray (Dasyatidae)",
  },
  velvet_ant: {
    src: velvetAnt,
    alt: "AI-generated field-guide reference of a velvet ant / cow killer (Dasymutilla occidentalis)",
  },
  wheel_bug: {
    src: wheelBug,
    alt: "AI-generated field-guide reference of a North American wheel bug (Arilus cristatus)",
  },
  yellow_sac_spider: {
    src: yellowSacSpider,
    alt: "AI-generated field-guide reference of a yellow sac spider (Cheiracanthium inclusum)",
  },
  scabies: {
    src: scabies,
    alt: "AI-generated field-guide reference of a microscopic scabies itch mite (Sarcoptes scabiei)",
  },
  brown_dog_tick: {
    src: brownDogTick,
    alt: "AI-generated field-guide reference of an adult brown dog tick (Rhipicephalus sanguineus)",
  },
  minute_pirate_bug: {
    src: minutePirateBug,
    alt: "AI-generated field-guide reference of an adult minute pirate bug (Orius insidiosus)",
  },
  soft_tick: {
    src: softTick,
    alt: "AI-generated field-guide reference of a soft relapsing fever tick (Ornithodoros hermsi)",
  },
};

export function creatureReferenceOf(id?: string): CreatureReference | undefined {
  return id ? CREATURE_REFERENCES[id] : undefined;
}
