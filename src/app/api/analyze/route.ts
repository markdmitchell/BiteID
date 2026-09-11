import { NextRequest, NextResponse } from "next/server";
import { TriageContextSchema, AnalysisResult } from "@/lib/schema";
import { analyzeBiteWithGemini } from "@/lib/geminiTriage";
import { DEFAULT_MCNAIR_VA_COORDINATES } from "@/lib/geoPestFilter";

function mapEnvString(env: string | null): string {
  if (!env) return "yard_garden";
  const envLower = env.toLowerCase();
  if (envLower.includes("wood") || envLower.includes("forest") || envLower.includes("trail")) return "tall_grass_woods";
  if (envLower.includes("yard") || envLower.includes("garden")) return "yard_garden";
  if (envLower.includes("bed") || envLower.includes("mattress")) return "bed";
  if (envLower.includes("garage") || envLower.includes("shed") || envLower.includes("woodpile")) return "garage_shed";
  if (envLower.includes("indoor") || envLower.includes("office") || envLower.includes("travel")) return "indoor_other";
  return "outdoor_other";
}

function mapDurString(dur: string | null): string {
  if (!dur) return "under_2h";
  const durLower = dur.toLowerCase();
  if (durLower.includes("24h") || durLower.includes("2h") || durLower.includes("hour")) return "under_2h";
  if (durLower.includes("1-3d") || durLower.includes("1-2d") || durLower.includes("day")) return "1_to_2_days";
  return "over_2_days";
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    console.log("Received formData size:", contentLength || "unknown");

    const contentType = req.headers.get("content-type") || "";

    let rawContext: any = null;
    let lesionBuffer: Buffer | null = null;
    let culpritBuffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data") || contentType.includes("urlencoded")) {
      const formData = await req.formData();
      const contextJson = formData.get("context") as string | null;

      if (contextJson) {
        try {
          rawContext = JSON.parse(contextJson);
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON format in context payload." },
            { status: 400 }
          );
        }
      } else {
        // Parse Lovable form fields (environment, duration, emergency_flags)
        const envStr = formData.get("environment") as string | null;
        const durStr = formData.get("duration") as string | null;
        const flagsStr = formData.get("emergency_flags") as string | null;

        let flags: string[] = [];
        if (flagsStr) {
          try {
            flags = JSON.parse(flagsStr);
          } catch {
            flags = [];
          }
        }

        rawContext = {
          usState: "US-VA",
          incidentLocation: mapEnvString(envStr),
          timeElapsed: mapDurString(durStr),
          primarySensation: "intense_itch",
          emergencyScreening: {
            difficultyBreathing: flags.includes("breathing") || flags.includes("difficultyBreathing"),
            facialSwelling: flags.includes("swelling") || flags.includes("facialSwelling"),
            dizzinessOrConfusion: flags.includes("confusion") || flags.includes("dizzinessOrConfusion"),
            spreadingHives: flags.includes("hives") || flags.includes("expanding") || flags.includes("spreadingHives"),
          },
        };
      }

      // Check all possible file key aliases for lesion and culprit photos
      const lesionFile = (formData.get("skin_lesion_image") ||
        formData.get("lesionImage") ||
        formData.get("lesion_image")) as File | null;
      const culpritFile = (formData.get("bug_image") ||
        formData.get("culpritImage") ||
        formData.get("culprit_image")) as File | null;

      if (lesionFile && lesionFile.size > 0) {
        const arrayBuffer = await lesionFile.arrayBuffer();
        lesionBuffer = Buffer.from(arrayBuffer);
      }

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

      const lesionBase64 = body.skin_lesion_image || body.lesionImageBase64 || body.lesionImage || body.lesion_image;
      const culpritBase64 = body.bug_image || body.culpritImageBase64 || body.culpritImage || body.culprit_image;

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

    // 1. DETERMINISTIC EMERGENCY SHORT-CIRCUIT
    const screening = parsedContext.emergencyScreening;
    if (
      screening &&
      (screening.difficultyBreathing ||
        screening.facialSwelling ||
        screening.dizzinessOrConfusion ||
        screening.spreadingHives)
    ) {
      const emergencyResponse: any = {
        isEmergencyRedirect: true,
        emergencyMessage:
          "Immediate emergency medical evaluation is recommended. Red-flag systemic symptoms (such as breathing difficulty, facial swelling, severe dizziness, or spreading hives) may indicate anaphylaxis or severe systemic toxicity. Call 911 or go to the nearest emergency department immediately.",
        culpritDetectedFromPhoto: false,
        rankedCandidates: [],
        results: [],
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
    const result: any = await analyzeBiteWithGemini(
      lesionBuffer,
      culpritBuffer,
      parsedContext
    );

    // Populate Lovable 'results' array alongside 'rankedCandidates' for 100% frontend compatibility
    const resultsArray = (result.rankedCandidates || []).map((c: any) => ({
      name: c.name || c.pestName,
      scientificName: c.scientificName,
      description: `Match probability ${(c.probabilityScore ?? c.probability ?? 0) * 100}%. Matched factors: ${(c.matchedFactors || []).slice(0, 2).join(", ") || "Endemic geographic prior"}`,
      confidence: c.probabilityScore ?? c.probability ?? 0,
      matchedFactors: c.matchedFactors || [],
      associatedPathogens: c.associatedPathogens || [],
      delayedRisks: c.delayedRisks || [],
      firstAidAdvice: c.firstAidAdvice || [],
      warningSignsToWatch: c.warningSignsToWatch || c.warningSigns || [],
    }));

    const responsePayload = {
      ...result,
      results: resultsArray,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bite triage request" },
      { status: 500 }
    );
  }
}
