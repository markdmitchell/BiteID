import { NextRequest, NextResponse } from "next/server";
import { TriageContextSchema, AnalysisResult } from "@/lib/schema";
import { analyzeBiteWithGemini } from "@/lib/geminiTriage";
import { DEFAULT_MCNAIR_VA_COORDINATES } from "@/lib/geoPestFilter";

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    console.log("Received formData size:", contentLength || "unknown");

    const contentType = req.headers.get("content-type") || "";

    let rawContext: any;
    let lesionBuffer: Buffer | null = null;
    let culpritBuffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data") || contentType.includes("urlencoded")) {
      const formData = await req.formData();
      const contextJson = formData.get("context") as string | null;
      if (!contextJson) {
        return NextResponse.json(
          { error: "Missing triage context payload." },
          { status: 400 }
        );
      }
      try {
        rawContext = JSON.parse(contextJson);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format in context payload." },
          { status: 400 }
        );
      }

      const lesionFile = formData.get("lesionImage") as File | null;
      const culpritFile = formData.get("culpritImage") as File | null;

      if (!lesionFile || lesionFile.size === 0) {
        return NextResponse.json(
          { error: "Lesion image is required." },
          { status: 400 }
        );
      }

      const arrayBuffer = await lesionFile.arrayBuffer();
      lesionBuffer = Buffer.from(arrayBuffer);

      if (culpritFile && culpritFile.size > 0) {
        const culpritArrayBuffer = await culpritFile.arrayBuffer();
        culpritBuffer = Buffer.from(culpritArrayBuffer);
      }
    } else {
      // JSON body format support
      const body = await req.json();
      if (!body) {
        return NextResponse.json(
          { error: "Request body is required." },
          { status: 400 }
        );
      }

      rawContext = body.context || body;

      const lesionBase64 = body.lesionImageBase64 || body.lesionImage;
      const culpritBase64 = body.culpritImageBase64 || body.culpritImage;

      if (lesionBase64) {
        lesionBuffer = Buffer.from(lesionBase64, "base64");
      }
      if (culpritBase64) {
        culpritBuffer = Buffer.from(culpritBase64, "base64");
      }
    }

    if (!rawContext || typeof rawContext !== "object") {
      return NextResponse.json(
        { error: "Missing triage context payload." },
        { status: 400 }
      );
    }

    if (!rawContext.coordinates) {
      rawContext.coordinates = DEFAULT_MCNAIR_VA_COORDINATES;
    }

    const parsedContext = TriageContextSchema.parse(rawContext);

    // 1. DETERMINISTIC EMERGENCY SHORT-CIRCUIT (Before image enforcement)
    const screening = parsedContext.emergencyScreening;
    if (
      screening &&
      (screening.difficultyBreathing ||
        screening.facialSwelling ||
        screening.dizzinessOrConfusion ||
        screening.spreadingHives)
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

    // 2. ENFORCE LESION IMAGE PRESENCE FOR NON-EMERGENCY ANALYSIS
    if (!lesionBuffer || lesionBuffer.length === 0) {
      return NextResponse.json(
        { error: "Lesion image is required." },
        { status: 400 }
      );
    }

    // 3. LOG IMAGE BYTE LENGTHS BEFORE INFERENCE
    console.log("[BiteID API] Lesion Image bytes:", lesionBuffer.length);
    console.log("[BiteID API] Culprit Image bytes:", culpritBuffer ? culpritBuffer.length : 0);

    // 4. EXECUTE TRIAGE PIPELINE
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
