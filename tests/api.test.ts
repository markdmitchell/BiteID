import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/analyze/route";
import { NextRequest } from "next/server";

describe("API /api/analyze route handler", () => {
  it("short-circuits immediately when emergency red-flag symptom is true (0 external API calls)", async () => {
    const context = {
      usState: "US-VA",
      monthIndex: 5,
      incidentLocation: "yard_garden",
      timeElapsed: "under_2h",
      primarySensation: "intense_itch",
      emergencyScreening: {
        difficultyBreathing: true, // RED FLAG!
        facialSwelling: false,
        dizzinessOrConfusion: false,
        spreadingHives: false,
      },
    };

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isEmergencyRedirect).toBe(true);
    expect(json.emergencyMessage).toContain("Immediate emergency medical evaluation");
    expect(json.rankedCandidates).toEqual([]);
  });

  it("processes non-emergency context and returns candidate ranking via mock fallback", async () => {
    const context = {
      usState: "US-VA",
      monthIndex: 5,
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

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context,
        lesionImageBase64: "ZmFrZS1pbWFnZS1ieXRlcw==",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.isEmergencyRedirect).toBe(false);
    expect(json.rankedCandidates.length).toBeGreaterThan(0);
    expect(json.rankedCandidates[0].name).toContain("Tick");
  });
});
