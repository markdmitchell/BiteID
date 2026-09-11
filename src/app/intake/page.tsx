"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  FileImage,
  Bug,
  Target,
  Navigation,
  Loader2,
} from "lucide-react";
import {
  EmergencySymptoms,
  IncidentLocation,
  TimeElapsed,
  PrimarySensation,
} from "@/lib/schema";
import { EmergencyModal } from "@/components/EmergencyModal";
import { ALL_US_STATES, getStateByCode, reverseGeocodeLocation } from "@/lib/usStates";

const SAMPLE_LESION_DATA_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23fecdd3'/><circle cx='200' cy='150' r='50' fill='%23f43f5e' opacity='0.7'/><circle cx='200' cy='150' r='10' fill='%23881337'/></svg>";

const SAMPLE_CULPRIT_DATA_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23e2e8f0'/><ellipse cx='200' cy='150' rx='25' ry='35' fill='%23451a03'/><line x1='175' y1='130' x2='150' y2='110' stroke='%23451a03' stroke-width='4'/><line x1='225' y1='130' x2='250' y2='110' stroke='%23451a03' stroke-width='4'/><line x1='175' y1='150' x2='145' y2='150' stroke='%23451a03' stroke-width='4'/><line x1='225' y1='150' x2='255' y2='150' stroke='%23451a03' stroke-width='4'/><line x1='175' y1='170' x2='150' y2='190' stroke='%23451a03' stroke-width='4'/><line x1='225' y1='170' x2='250' y2='190' stroke='%23451a03' stroke-width='4'/></svg>";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

async function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.85): Promise<File> {
  if (file.type.includes("svg") || file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      resolve(file);
    };
    img.src = url;
  });
}

export default function IntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Step 1: Images
  const [lesionPreview, setLesionPreview] = useState<string | null>(null);
  const [lesionFile, setLesionFile] = useState<File | null>(null);
  const [culpritPreview, setCulpritPreview] = useState<string | null>(null);
  const [culpritFile, setCulpritFile] = useState<File | null>(null);

  // Step 2: Context
  const [usState, setUsState] = useState<string>("US-VA");
  const [cityInput, setCityInput] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingGeo, setIsDetectingGeo] = useState<boolean>(false);
  const [geoSuccessMessage, setGeoSuccessMessage] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [monthIndex, setMonthIndex] = useState<number>(new Date().getMonth());
  const [incidentLocation, setIncidentLocation] = useState<IncidentLocation>("tall_grass_woods");
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>("under_2h");

  // Step 3: Symptoms & Safety
  const [primarySensation, setPrimarySensation] = useState<PrimarySensation>("intense_itch");
  const [emergencySymptoms, setEmergencySymptoms] = useState<EmergencySymptoms>({
    difficultyBreathing: false,
    facialSwelling: false,
    dizzinessOrConfusion: false,
    spreadingHives: false,
  });

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const hasRedFlags = Object.values(emergencySymptoms).some(Boolean);

  const handleToggleEmergency = (key: keyof EmergencySymptoms) => {
    const updated = { ...emergencySymptoms, [key]: !emergencySymptoms[key] };
    setEmergencySymptoms(updated);
    if (Object.values(updated).some(Boolean)) {
      setShowEmergencyModal(true);
    }
  };

  const handleLesionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLesionFile(file);
      setLesionPreview(URL.createObjectURL(file));
    }
  };

  const handleCulpritUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCulpritFile(file);
      setCulpritPreview(URL.createObjectURL(file));
    }
  };

  const handleUseSampleLesion = () => {
    setLesionPreview(SAMPLE_LESION_DATA_URL);
    const blob = new Blob(["sample-lesion-image"], { type: "image/svg+xml" });
    setLesionFile(new File([blob], "sample_lesion.svg", { type: "image/svg+xml" }));
  };

  const handleUseSampleCulprit = () => {
    setCulpritPreview(SAMPLE_CULPRIT_DATA_URL);
    const blob = new Blob(["sample-culprit-image"], { type: "image/svg+xml" });
    setCulpritFile(new File([blob], "sample_culprit.svg", { type: "image/svg+xml" }));
  };

  const handleGeoLocate = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGeo(true);
    setGeoError(null);
    setGeoSuccessMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoordinates({ lat: latitude, lng: longitude });

          const geoResult = await reverseGeocodeLocation(latitude, longitude);
          setUsState(geoResult.stateCode);
          if (geoResult.city) {
            setCityInput(geoResult.city);
          }

          setGeoSuccessMessage(
            `📍 Location auto-detected: ${geoResult.formattedLocation} (${geoResult.stateCode}) • Coordinates: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
          );
        } catch (err) {
          setGeoError("Location detected via GPS. Please confirm your state.");
        } finally {
          setIsDetectingGeo(false);
        }
      },
      (err) => {
        setIsDetectingGeo(false);
        setGeoError("Unable to access GPS location. Please select your State manually.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (hasRedFlags) {
      setShowEmergencyModal(true);
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      const stateObj = getStateByCode(usState);
      const formattedCityState = cityInput.trim()
        ? `${cityInput.trim()}, ${stateObj?.abbr || usState.replace("US-", "")}`
        : (stateObj?.name || usState);

      const contextObj = {
        usState,
        cityState: formattedCityState,
        coordinates: coordinates || (stateObj ? { lat: stateObj.lat, lng: stateObj.lng } : undefined),
        monthIndex,
        incidentLocation,
        timeElapsed,
        primarySensation,
        emergencyScreening: emergencySymptoms,
      };

      const formData = new FormData();
      formData.append("context", JSON.stringify(contextObj));

      if (lesionFile) {
        const compressedLesion = await compressImage(lesionFile);
        formData.append("lesionImage", compressedLesion);
      }
      if (culpritFile) {
        const compressedCulprit = await compressImage(culpritFile);
        formData.append("culpritImage", compressedCulprit);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API Request Failed (Status ${response.status})`);
      }

      sessionStorage.setItem("biteid_triage_result", JSON.stringify(data));
      sessionStorage.setItem("biteid_triage_context", JSON.stringify(contextObj));

      router.push("/results");
    } catch (err: any) {
      console.error("Failed to analyze bite:", err);
      setApiError(err.message || "An error occurred while submitting your assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        symptoms={emergencySymptoms}
      />

      {apiError && (
        <div className="bento-card bg-red-500/10 border-2 border-red-500 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-md animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-sm text-red-900">Analysis Error</p>
            <p className="text-xs font-semibold leading-relaxed text-red-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Bento Progress Steps Header */}
      <div className="bento-card p-4 sm:p-5">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
              currentStep >= 1 ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100"
            }`}>
              1
            </div>
            <span className="hidden sm:inline text-xs">Photos</span>
          </div>

          <div className={`h-1 flex-1 mx-3 rounded-full ${currentStep >= 2 ? "bg-emerald-600" : "bg-slate-200"}`} />

          <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
              currentStep >= 2 ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100"
            }`}>
              2
            </div>
            <span className="hidden sm:inline text-xs">Context</span>
          </div>

          <div className={`h-1 flex-1 mx-3 rounded-full ${currentStep >= 3 ? "bg-emerald-600" : "bg-slate-200"}`} />

          <div className={`flex items-center gap-2 ${currentStep === 3 ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
              currentStep === 3 ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100"
            }`}>
              3
            </div>
            <span className="hidden sm:inline text-xs">Safety & Symptoms</span>
          </div>
        </div>
      </div>

      {/* STEP 1: PHOTO CAPTURE (Bento Tiles) */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bento-card space-y-6">
            <div>
              <span className="bento-badge bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">Step 1 of 3</span>
              <h2 className="text-xl font-extrabold text-slate-900">Bite Photo Attachments</h2>
              <p className="text-xs text-slate-500 mt-1">Provide skin lesion photos and optional pest images into modular upload cards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CARD A: Lesion Image Bento Tile */}
              <div className="bento-card bg-slate-50/70 border-dashed border-2 border-slate-300 hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center relative">
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                  Required
                </span>

                {lesionPreview ? (
                  <div className="w-full space-y-3">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lesionPreview} alt="Skin lesion preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setLesionPreview(null); setLesionFile(null); }}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Lesion photo attached
                    </p>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Photo of Skin Reaction</p>
                      <p className="text-xs text-slate-500 mt-1">Upload lesion reaction photo</p>
                    </div>
                    <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer shadow-md transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLesionUpload} />
                    </label>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleUseSampleLesion}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        Use Sample Lesion Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD B: Culprit Image Bento Tile */}
              <div className="bento-card bg-slate-50/70 border-dashed border-2 border-slate-300 hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center relative">
                <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> +80% Accuracy Boost
                </span>

                {culpritPreview ? (
                  <div className="w-full space-y-3">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-200 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={culpritPreview} alt="Culprit bug preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setCulpritPreview(null); setCulpritFile(null); }}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Culprit photo attached
                    </p>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                      <Bug className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Photo of Insect / Spider</p>
                      <p className="text-xs text-slate-500 mt-1">Optional captured pest photo</p>
                    </div>
                    <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer shadow-md transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCulpritUpload} />
                    </label>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleUseSampleCulprit}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 underline flex items-center justify-center gap-1 mx-auto"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        Use Sample Tick Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!lesionPreview) handleUseSampleLesion();
                  setCurrentStep(2);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md text-xs"
              >
                <span>Continue to Context</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTEXT (Bento Grid Tiles) */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bento-card space-y-6">
            <div>
              <span className="bento-badge bg-blue-100 text-blue-800 border border-blue-200 mb-2">Step 2 of 3</span>
              <h2 className="text-xl font-extrabold text-slate-900">Geographic & Habitat Context</h2>
              <p className="text-xs text-slate-500 mt-1">Configure endemic regional state boundaries, active seasonal months, and habitat environments.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* State & City Geographic Location Bento Tile */}
              <div className="bento-card bg-slate-50/70 p-4 space-y-3 border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Patient Geographic Location
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports all 50 Contiguous & US States. Specify your city & state or auto-detect via GPS.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeoLocate}
                    disabled={isDetectingGeo}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDetectingGeo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{isDetectingGeo ? "Detecting..." : "Detect My Location"}</span>
                  </button>
                </div>

                {geoSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{geoSuccessMessage}</span>
                  </div>
                )}

                {geoError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-800 font-medium animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{geoError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      City / Town (Optional)
                    </label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="e.g. Richmond, Austin, Seattle, or ZIP"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      State / Region (All 50 US States + DC)
                    </label>
                    <select
                      value={usState}
                      onChange={(e) => {
                        setUsState(e.target.value);
                        setGeoSuccessMessage(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs font-semibold text-slate-800"
                    >
                      {ALL_US_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.name} ({st.abbr})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Month Selector Bento Tile */}
              <div className="bento-card bg-slate-50/70 p-4 space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Incident Month
                </label>
                <select
                  value={monthIndex}
                  onChange={(e) => setMonthIndex(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs font-semibold"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Bento Tiles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incident Environment / Habitat
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "tall_grass_woods", label: "Tall Grass / Woods", icon: "🌲" },
                  { id: "yard_garden", label: "Yard / Garden", icon: "🏡" },
                  { id: "bed", label: "Bed / Bedroom", icon: "🛏️" },
                  { id: "garage_shed", label: "Garage / Shed / Attic", icon: "🛖" },
                  { id: "indoor_other", label: "Indoor Other", icon: "🏢" },
                  { id: "outdoor_other", label: "Outdoor Other", icon: "🏞️" },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setIncidentLocation(loc.id as IncidentLocation)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      incidentLocation === loc.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span className="text-xl">{loc.icon}</span>
                    <span className="text-xs leading-tight">{loc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timing Bento Tiles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" /> Time Elapsed Since Bite
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "under_2h", label: "< 2 hours" },
                  { id: "2_to_12h", label: "2 - 12 hours" },
                  { id: "1_to_2_days", label: "1 - 2 days" },
                  { id: "over_2_days", label: "> 2 days" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTimeElapsed(t.id as TimeElapsed)}
                    className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all ${
                      timeElapsed === t.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md text-xs"
              >
                <span>Continue to Safety Screening</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SYMPTOMS & SAFETY (Bento Layout) */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bento-card space-y-6">
            <div>
              <span className="bento-badge bg-red-100 text-red-800 border border-red-200 mb-2">Step 3 of 3</span>
              <h2 className="text-xl font-extrabold text-slate-900">Symptoms & Mandatory Safety Screening</h2>
              <p className="text-xs text-slate-500 mt-1">Select sensation profile and verify emergency red-flag safety questions.</p>
            </div>

            {/* Primary Sensation Bento Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" /> Primary Sensation Profile
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "intense_itch", label: "Intense Itching", sub: "Mosquito, Flea, Bed bug pattern" },
                  { id: "mild_itch", label: "Mild Itch / Discomfort", sub: "Common skin reaction" },
                  { id: "painless", label: "Painless / Unnoticed", sub: "Classic tick bite feature" },
                  { id: "moderate_pain", label: "Sharp Localized Pain", sub: "Pinch or minor sting" },
                  { id: "severe_pain", label: "Severe Radiating Pain", sub: "Spider venom marker" },
                ].map((sens) => (
                  <button
                    key={sens.id}
                    type="button"
                    onClick={() => setPrimarySensation(sens.id as PrimarySensation)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      primarySensation === sens.id
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{sens.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{sens.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* MANDATORY RED-FLAG SAFETY BENTO TILE */}
            <div className="bento-card bg-red-50/70 border-red-200 space-y-4">
              <div className="flex items-center gap-2 text-red-800 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>Emergency Red-Flag Screening (Check any that apply):</span>
              </div>

              <div className="space-y-3">
                {[
                  { key: "difficultyBreathing", label: "Difficulty breathing, wheezing, or tightness in chest" },
                  { key: "facialSwelling", label: "Swelling of face, lips, tongue, or throat" },
                  { key: "dizzinessOrConfusion", label: "Severe dizziness, feeling faint, or confusion" },
                  { key: "spreadingHives", label: "Spreading hives or rash distant from the bite site" },
                ].map((item) => {
                  const isChecked = emergencySymptoms[item.key as keyof EmergencySymptoms];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-red-100 border-red-400 text-red-950 font-extrabold shadow-xs"
                          : "bg-white border-red-200 hover:bg-red-50/50 text-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEmergency(item.key as keyof EmergencySymptoms)}
                        className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                      <span className="text-xs leading-snug">{item.label}</span>
                    </label>
                  );
                })}
              </div>

              {hasRedFlags && (
                <div className="p-3.5 bg-red-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-md">
                  <span>Emergency symptoms flagged - Triage halted for safety.</span>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(true)}
                    className="underline text-white font-extrabold"
                  >
                    View Emergency Contacts
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`flex items-center gap-2 font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow-lg text-xs ${
                  hasRedFlags
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                }`}
              >
                {isSubmitting ? (
                  <span>Analyzing Data...</span>
                ) : hasRedFlags ? (
                  <span>Emergency Red-Flag Interception</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run BiteID Triage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
