import blackleggedTick from "@/assets/creatures/blacklegged-tick.jpg";
import loneStarTick from "@/assets/creatures/lone-star-tick.jpg";
import bedBug from "@/assets/creatures/bed-bug.jpg";
import flea from "@/assets/creatures/flea.jpg";
import mosquito from "@/assets/creatures/mosquito.jpg";
import brownRecluse from "@/assets/creatures/brown-recluse.jpg";
import blackWidow from "@/assets/creatures/black-widow.jpg";
import chigger from "@/assets/creatures/chigger.jpg";
import emRash from "@/assets/bite-patterns/erythema-migrans-iii-iv.jpg";
import bedBugBites from "@/assets/bite-patterns/bed-bug-iii-iv.jpg";

export interface BiteGuide {
  slug: string;
  title: string;
  question: string;
  summary: string;
  image: string;
  imageAlt: string;
  looksLike: string[];
  whatToDo: string[];
  seeDoctor: string[];
}

export const BITE_GUIDES: BiteGuide[] = [
  {
    slug: "bullseye-rash",
    title: "Bullseye rash after a tick bite",
    question: "Is a bullseye rash a sign of Lyme disease?",
    summary:
      "An expanding red rash, sometimes with a clear center, that appears 3 to 30 days after a tick bite is called erythema migrans. It is the most common early sign of Lyme disease.",
    image: emRash,
    imageAlt: "AI-generated reference of an expanding ring-shaped rash on medium skin",
    looksLike: [
      "Round or oval red patch that grows over days, often wider than 5 cm (2 inches)",
      "May have a clearer center, but many rashes are evenly red",
      "Usually warm, rarely itchy or painful",
      "Harder to see on darker skin, where it may look bruise-colored",
    ],
    whatToDo: [
      "Photograph the rash next to a ruler each day",
      "Note the date of the bite and where you were",
      "Contact a clinician: early antibiotics work well",
    ],
    seeDoctor: ["Any expanding rash after a tick bite", "Fever, chills, joint pain, or facial drooping"],
  },
  {
    slug: "deer-tick-bite",
    title: "Deer tick (blacklegged tick) bite",
    question: "What does a deer tick bite look like?",
    summary:
      "Blacklegged ticks are small, with a dark shield and an orange-red body in adult females. They spread Lyme disease in the Northeast, Mid-Atlantic, and upper Midwest.",
    image: blackleggedTick,
    imageAlt: "AI-generated field guide image of a blacklegged tick",
    looksLike: [
      "A small red bump at the bite, similar to a mosquito bite, is normal",
      "Nymphs are the size of a poppy seed and easy to miss",
      "The tick may still be attached",
    ],
    whatToDo: [
      "Remove with fine tweezers close to the skin, pulling straight up",
      "Clean the area with soap or alcohol",
      "Do not use heat, nail polish, or petroleum jelly",
      "Watch the site for 30 days",
    ],
    seeDoctor: ["A rash that keeps growing", "Fever or flu-like illness within a month"],
  },
  {
    slug: "lone-star-tick-bite",
    title: "Lone star tick bite",
    question: "Is a lone star tick bite dangerous?",
    summary:
      "Adult female lone star ticks have a single white spot on the back. Common in the South and East, they can cause ehrlichiosis and are linked to alpha-gal syndrome, a red meat allergy.",
    image: loneStarTick,
    imageAlt: "AI-generated field guide image of a lone star tick",
    looksLike: ["Red, itchy bump at the bite", "Sometimes a round rash similar to a Lyme rash"],
    whatToDo: ["Remove the tick promptly with tweezers", "Clean the bite and note the date"],
    seeDoctor: [
      "Fever, headache, or fatigue within two weeks",
      "Hives or stomach upset hours after eating red meat",
    ],
  },
  {
    slug: "bed-bug-bites",
    title: "Bed bug bites",
    question: "How do I know if I have bed bug bites?",
    summary:
      "Bed bug bites often appear as small itchy welts in lines or clusters on skin exposed during sleep. They are uncomfortable but are not known to spread disease.",
    image: bedBugBites,
    imageAlt: "AI-generated reference of clustered bite marks on medium skin",
    looksLike: [
      "Small red or dark bumps in a line or zigzag of three or more",
      "Usually on arms, neck, face, or legs",
      "New bites appear overnight",
    ],
    whatToDo: [
      "Wash bites with soap and water; avoid scratching",
      "Check mattress seams for small dark spots and bugs",
      "Wash bedding on hot and dry on high heat",
    ],
    seeDoctor: ["Signs of infection: spreading warmth, pus, fever", "Blistering or severe allergic reaction"],
  },
  {
    slug: "flea-bites",
    title: "Flea bites",
    question: "What do flea bites look like on humans?",
    summary:
      "Flea bites are small, very itchy red bumps, usually around the ankles and lower legs, often with a red halo. Pets are the usual source.",
    image: flea,
    imageAlt: "AI-generated field guide image of a flea",
    looksLike: ["Tiny red bumps in groups around ankles", "Intense itching", "Small red halo around each bite"],
    whatToDo: ["Wash and use a cold compress", "Treat pets and vacuum carpets and bedding"],
    seeDoctor: ["Signs of infection from scratching", "Fever after many bites"],
  },
  {
    slug: "mosquito-bites",
    title: "Mosquito bites",
    question: "When is a mosquito bite something to worry about?",
    summary:
      "Most mosquito bites are puffy, itchy bumps that fade in a few days. Rarely, mosquitoes spread illnesses such as West Nile virus.",
    image: mosquito,
    imageAlt: "AI-generated field guide image of a mosquito",
    looksLike: ["Puffy pale or red bump within minutes", "Itching for one to three days", "Children may swell more"],
    whatToDo: ["Wash, apply a cold pack, and avoid scratching", "Use repellent outdoors"],
    seeDoctor: ["Fever, severe headache, or stiff neck days later", "Large blistering reactions"],
  },
  {
    slug: "brown-recluse-bite",
    title: "Brown recluse spider bite",
    question: "What does a brown recluse bite look like?",
    summary:
      "Brown recluse spiders live mainly in the south-central US. Most bites heal on their own, but some form a painful sore that needs medical care. Many suspected spider bites are actually skin infections.",
    image: brownRecluse,
    imageAlt: "AI-generated field guide image of a brown recluse spider",
    looksLike: [
      "Little pain at first, then a red, painful area within hours",
      "A pale or purple center with a red ring",
      "Some bites form a blister or open sore over days",
    ],
    whatToDo: ["Wash, apply cold, and raise the limb", "Save the spider if safely possible"],
    seeDoctor: ["A darkening or growing sore", "Fever, rash, or dark urine", "Any bite in a young child"],
  },
  {
    slug: "black-widow-bite",
    title: "Black widow spider bite",
    question: "What happens after a black widow bite?",
    summary:
      "Female black widows are shiny black with a red hourglass underneath. The bite may feel like a pinprick, followed by muscle pain and cramping that can spread.",
    image: blackWidow,
    imageAlt: "AI-generated field guide image of a black widow spider",
    looksLike: ["Two tiny fang marks and mild redness", "Muscle cramps in belly, back, or chest within an hour"],
    whatToDo: ["Wash, apply cold, and stay calm", "Call Poison Control at 1-800-222-1222"],
    seeDoctor: ["Spreading muscle pain or cramping", "Sweating, nausea, or high blood pressure", "Any bite in a child or older adult"],
  },
  {
    slug: "chigger-bites",
    title: "Chigger bites",
    question: "Why do I have itchy red bumps after hiking?",
    summary:
      "Chiggers are tiny mite larvae in grass and brush. Their bites cause intensely itchy red bumps, often where clothing is tight: waistbands, sock lines, and behind the knees.",
    image: chigger,
    imageAlt: "AI-generated field guide image of a chigger",
    looksLike: ["Clusters of red bumps or blisters", "Itching that peaks one to two days later"],
    whatToDo: ["Shower with soap soon after being outdoors", "Wash clothes in hot water", "Use anti-itch cream"],
    seeDoctor: ["Signs of infection", "Itching that disrupts sleep for days"],
  },
];

export function guideBySlug(slug: string) {
  return BITE_GUIDES.find((g) => g.slug === slug);
}
