import { describe, it, expect } from "vitest";
import {
  REFERENCE_ASSET_REGISTRY,
  getReferenceAssetsForPest,
  FitzpatrickScale,
} from "../src/lib/referenceData";

describe("Reference Data Registry & Fitzpatrick Filter Engine", () => {
  it("contains visual reference assets spanning all 6 key biting vectors", () => {
    const pestIds = new Set(REFERENCE_ASSET_REGISTRY.map((asset) => asset.pestId));
    expect(pestIds.has("mosquito")).toBe(true);
    expect(pestIds.has("blacklegged_tick")).toBe(true);
    expect(pestIds.has("bed_bug")).toBe(true);
    expect(pestIds.has("flea")).toBe(true);
    expect(pestIds.has("brown_recluse")).toBe(true);
    expect(pestIds.has("black_widow")).toBe(true);
  });

  it("retrieves reference assets filtered by pestId and Fitzpatrick skin tone category", () => {
    const mosquitoLight = getReferenceAssetsForPest("mosquito", "I-II");
    expect(mosquitoLight.length).toBeGreaterThan(0);
    expect(mosquitoLight[0].skinTypeCategory).toBe("I-II");

    const tickDark = getReferenceAssetsForPest("blacklegged_tick", "V-VI");
    expect(tickDark.length).toBeGreaterThan(0);
    expect(tickDark[0].skinTypeCategory).toBe("V-VI");
  });

  it("includes mandatory clinical source attributions (CDC PHIL or AI Clinical Model)", () => {
    for (const asset of REFERENCE_ASSET_REGISTRY) {
      expect(asset.sourceAttribution).toBeDefined();
      expect(asset.hallmarkFeatures.length).toBeGreaterThan(0);
      expect(asset.clinicalDescription.length).toBeGreaterThan(0);
    }
  });
});
