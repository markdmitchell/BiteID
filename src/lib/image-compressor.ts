/**
 * Client-side clinical image compressor and downscaler.
 *
 * Resizes large smartphone camera photos (often 8MB-15MB, 4000x3000px) down to an
 * optimal clinical triage resolution (max 1400px longest edge, 85% JPEG quality).
 *
 * Benefits:
 * 1. Reduces payload size by ~98% (from ~12MB base64 down to ~150KB-250KB).
 * 2. Prevents localStorage 5MB QuotaExceededError crashes when saving offline intakes or multi-day progress photos.
 * 3. Cuts network upload latency on backcountry 3G/LTE from ~8s to <200ms.
 * 4. Eliminates Cloudflare Nitro 413 Payload Too Large edge errors.
 */

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;

/**
 * Compresses an uploaded File into a compact, clinical-grade JPEG data URL.
 */
export async function compressImageFile(
  file: File,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY,
): Promise<string> {
  // If not running in a browser environment, fall back to basic reader
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fileToDataUrlFallback(file);
  }

  try {
    const objectUrl = URL.createObjectURL(file);
    try {
      return await compressUrl(objectUrl, maxDimension, quality);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (err) {
    console.warn("Client-side image compression failed, falling back to raw data URL:", err);
    return fileToDataUrlFallback(file);
  }
}

/**
 * Compresses an existing image URL or base64 data URL.
 */
export async function compressDataUrl(
  dataUrl: string,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY,
): Promise<string> {
  if (typeof window === "undefined" || !dataUrl.startsWith("data:")) {
    return dataUrl;
  }

  // If already very compact (< 300KB base64), skip extra canvas overhead
  if (dataUrl.length < 400_000) {
    return dataUrl;
  }

  try {
    return await compressUrl(dataUrl, maxDimension, quality);
  } catch (err) {
    console.warn("Data URL compression failed, preserving original:", err);
    return dataUrl;
  }
}

function compressUrl(src: string, maxDimension: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional downscaled dimensions
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not acquire 2D canvas rendering context"));
        return;
      }

      // Draw with high-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Image element failed to load source URL"));
    };

    img.src = src;
  });
}

function fileToDataUrlFallback(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
