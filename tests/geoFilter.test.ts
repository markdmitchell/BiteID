import { describe, it, expect } from "vitest";
import { evaluateRegionalLikelihood } from "../src/lib/geoPestFilter";
import { TriageContext, DermatologicalMorphology } from "../src/lib/schema";

describe("geoPestFilter Engine", () => {
  it("penalizes Brown Recluse probability to 0.0 in Washington State (US-WA)", () => {
    const context: TriageContext = {
      usState: "US-WA",
      monthIndex: 6, // July
      incidentLocation: "garage_shed",
      timeElapsed: "under_2h",
      primarySensation: "severe_pain",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const probabilities = evaluateRegionalLikelihood(context);

    expect(probabilities.brown_recluse).toBe(0);
  });

  it("calculates high Tick probability in Virginia (US-VA) in June vs lower in January", () => {
    const juneContext: TriageContext = {
      usState: "US-VA",
      monthIndex: 5, // June
      incidentLocation: "tall_grass_woods",
      timeElapsed: "1_to_2_days",
      primarySensation: "painless",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const janContext: TriageContext = {
      ...juneContext,
      monthIndex: 0, // January
    };

    const juneProbs = evaluateRegionalLikelihood(juneContext);
    const janProbs = evaluateRegionalLikelihood(janContext);

    expect(juneProbs.blacklegged_tick).toBeGreaterThan(0.4);
    expect(juneProbs.blacklegged_tick).toBeGreaterThan(janProbs.blacklegged_tick);
  });

  it("ranks Blacklegged (Deer) Tick as candidate #1 when targetoid bullseye (Erythema Migrans) morphology is present", () => {
    const targetoidContext: TriageContext = {
      usState: "US-NY",
      monthIndex: 6, // July
      incidentLocation: "yard_garden",
      timeElapsed: "1_to_2_days",
      primarySensation: "intense_itch",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const targetoidMorphology: DermatologicalMorphology = {
      pattern: "annular_target",
      centralFeatures: "punctum_bite_mark",
      primaryReaction: "expanding_erythema",
    };

    const probs = evaluateRegionalLikelihood(targetoidContext, targetoidMorphology);

    // Assert Deer Tick takes precedence (>= 0.90) over generic nuisance pests like Mosquito and Flea
    expect(probs.blacklegged_tick).toBeGreaterThanOrEqual(0.9);
    expect(probs.blacklegged_tick).toBeGreaterThan(probs.mosquito * 3);

    // Sorted top candidate key
    const topCandidateKey = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
    expect(topCandidateKey).toBe("blacklegged_tick");
  });

  it("boosts Bed Bug probability significantly when incident location is bed", () => {
    const bedContext: TriageContext = {
      usState: "US-NY",
      monthIndex: 1, // Feb
      incidentLocation: "bed",
      timeElapsed: "under_2h",
      primarySensation: "intense_itch",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const probs = evaluateRegionalLikelihood(bedContext);
    expect(probs.bed_bug).toBeGreaterThan(0.3);
  });

  it("penalizes Lone Star Tick to 0.0 in non-endemic state (US-WA) and scores high in US-VA", () => {
    const vaContext: TriageContext = {
      usState: "US-VA",
      monthIndex: 5, // June
      incidentLocation: "yard_garden",
      timeElapsed: "under_2h",
      primarySensation: "mild_itch",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const waContext: TriageContext = {
      ...vaContext,
      usState: "US-WA",
    };

    const vaProbs = evaluateRegionalLikelihood(vaContext);
    const waProbs = evaluateRegionalLikelihood(waContext);

    expect(waProbs.lone_star_tick).toBe(0);
    expect(vaProbs.lone_star_tick).toBeGreaterThan(0.1);
  });

  it("escalates Lone Star Tick to top rank when Entomologist detects Amblyomma americanum taxonomy", () => {
    const context: TriageContext = {
      usState: "US-NC",
      monthIndex: 6, // July
      incidentLocation: "tall_grass_woods",
      timeElapsed: "under_2h",
      primarySensation: "painless",
      emergencyScreening: {
        difficultyBreathing: false,
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const probs = evaluateRegionalLikelihood(context, undefined, "Amblyomma americanum");
    const topKey = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];

    expect(topKey).toBe("lone_star_tick");
    expect(probs.lone_star_tick).toBeGreaterThan(0.4);
  });
});
