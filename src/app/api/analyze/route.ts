import { NextRequest, NextResponse } from "next/server";
import { TriageContextSchema, AnalysisResult } from "@/lib/schema";
import { analyzeBiteWithGemini } from "@/lib/geminiTriage";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let rawContext: any;
    let lesionBuffer: Buffer = Buffer.from("");
    let culpritBuffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data") || contentType.includes("urlencoded")) {
      const formData = await req.formData();
      const contextJson = formData.get("context") as string;
      if (!contextJson) {
        return NextResponse.json(
          { error: "Missing triage context payload" },
          { status: 400 }
        );
      }
      rawContext = JSON.parse(contextJson);

      const lesionFile = formData.get("lesionImage") as File | null;
      const culpritFile = formData.get("culpritImage") as File | null;

      if (lesionFile && lesionFile.size > 0) {
        const arrayBuffer = await lesionFile.arrayBuffer();
        lesionBuffer = Buffer.from(arrayBuffer);
      }

      if (culpritFile && culpritFile.size > 0) {
        const arrayBuffer = await culpritFile.arrayBuffer();
        culpritBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      // JSON body format support
      const body = await req.json();
      rawContext = body.context || body;

      if (body.lesionImageBase64) {
        lesionBuffer = Buffer.from(body.lesionImageBase64, "base64");
      }
      if (body.culpritImageBase64) {
        culpritBuffer = Buffer.from(body.culpritImageBase64, "base64");
      }
    }

    const parsedContext = TriageContextSchema.parse(rawContext);

    // 1. DETERMINISTIC EMERGENCY SHORT-CIRCUIT
    const screening = parsedContext.emergencyScreening;
    if (
      screening.difficultyBreathing ||
      screening.facialSwelling ||
      screening.dizzinessOrConfusion ||
      screening.spreadingHives
    ) {
      const emergencyResponse: AnalysisResult = {
        isEmergencyRedirect: true,
        emergencyMessage:
          "Immediate emergency medical evaluation is recommended. Red-flag systemic symptoms (such as breathing difficulty, facial swelling, severe dizziness, or spreading hives) may indicate anaphylaxis or severe systemic toxicity. Call 911 or go to the nearest emergency department immediately.",
        culpritDetectedFromPhoto: false,
        rankedCandidates: [],
        summary:
          "EMERGENCY INTERCEPTION: Systemic red-flag symptoms present requiring urgent emergency care.",
        disclaimer:
          "BiteID safety protocol intercepted an emergency symptom profile. Seek emergency medical attention immediately.",
      };

      return NextResponse.json(emergencyResponse, { status: 200 });
    }

    // 2. EXECUTE TRIAGE PIPELINE
    const result = await analyzeBiteWithGemini(
      lesionBuffer,
      culpritBuffer,
      parsedContext
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bite triage request" },
      { status: 500 }
    );
  }
}
