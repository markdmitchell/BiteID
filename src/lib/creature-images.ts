import americanDogTick from "@/assets/creatures/american-dog-tick.jpg";
import bedBug from "@/assets/creatures/bed-bug.jpg";
import blackWidow from "@/assets/creatures/black-widow.jpg";
import blackleggedTick from "@/assets/creatures/blacklegged-tick.jpg";
import brownRecluse from "@/assets/creatures/brown-recluse.jpg";
import flea from "@/assets/creatures/flea.jpg";
import honeyBee from "@/assets/creatures/honey-bee.jpg";
import loneStarTick from "@/assets/creatures/lone-star-tick.jpg";
import mosquito from "@/assets/creatures/mosquito.jpg";
import waspYellowJacket from "@/assets/creatures/wasp-yellow-jacket.jpg";

type CreatureReference = {
  src: string;
  alt: string;
};

const CREATURE_REFERENCES: Record<string, CreatureReference> = {
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
  honey_bee: {
    src: honeyBee,
    alt: "AI-generated field-guide reference of a honey bee",
  },
  wasp: {
    src: waspYellowJacket,
    alt: "AI-generated field-guide reference of a yellow jacket wasp",
  },
};

export function creatureReferenceOf(id?: string): CreatureReference | undefined {
  return id ? CREATURE_REFERENCES[id] : undefined;
}
