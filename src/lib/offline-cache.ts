import { CREATURE_REFERENCES } from "./creature-images";

export const OFFLINE_CACHE_NAME = "biteid-field-cache-v2";

export const CORE_STATIC_ASSETS = ["/", "/favicon.ico", "/icon.png", "/manifest.json"];

export type CacheStatus = {
  isSupported: boolean;
  isReady: boolean;
  cachedCount: number;
  totalCount: number;
  lastWarmed?: string | undefined;
};

/**
 * Silently warms the offline cache during browser idle time.
 * Designed so users who lose signal on a backcountry trail already have
 * all 32 vector images and critical offline resources without needing
 * to remember to click "Download Pack" in advance.
 */
export function startSilentCacheWarming(): void {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  // Use requestIdleCallback if available, falling back to setTimeout
  const scheduleIdle =
    (
      window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 2000));

  scheduleIdle(async () => {
    try {
      // Check if recently warmed in the last 24 hours
      const lastWarmed = localStorage.getItem("biteid_cache_last_warmed_v2");
      const oneDay = 24 * 60 * 60 * 1000;
      if (lastWarmed && Date.now() - Number(lastWarmed) < oneDay) {
        return;
      }

      const cache = await caches.open(OFFLINE_CACHE_NAME);

      // Collect URLs to pre-cache
      const urlsToCache: string[] = [...CORE_STATIC_ASSETS];
      for (const ref of Object.values(CREATURE_REFERENCES)) {
        if (ref?.src && !urlsToCache.includes(ref.src)) {
          urlsToCache.push(ref.src);
        }
      }

      // Fetch in small background batches of 3 with slight delay to avoid saturating network
      const batchSize = 3;
      for (let i = 0; i < urlsToCache.length; i += batchSize) {
        const batch = urlsToCache.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (url) => {
            try {
              const matched = await cache.match(url);
              if (!matched) {
                const res = await fetch(url, { cache: "force-cache" });
                if (res.ok) {
                  await cache.put(url, res);
                }
              }
            } catch {
              // Silently tolerate individual image fetch failures in background
            }
          }),
        );
        // Small 80ms breathing room for UI responsiveness
        await new Promise((r) => setTimeout(r, 80));
      }

      localStorage.setItem("biteid_cache_last_warmed_v2", Date.now().toString());
    } catch {
      // Fail silently in background
    }
  });
}

/**
 * Checks how many specimen images and core assets are currently in the cache.
 */
export async function checkOfflineCacheStatus(): Promise<CacheStatus> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return {
      isSupported: false,
      isReady: false,
      cachedCount: 0,
      totalCount: 0,
    };
  }

  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const keys = await cache.keys();
    const specimenUrls = Object.values(CREATURE_REFERENCES).map((r) => r.src);
    const totalCount = specimenUrls.length + CORE_STATIC_ASSETS.length;

    let cachedCount = 0;
    for (const url of [...CORE_STATIC_ASSETS, ...specimenUrls]) {
      const match = await cache.match(url);
      if (match) cachedCount++;
    }

    const lastWarmed = localStorage.getItem("biteid_cache_last_warmed_v2");
    return {
      isSupported: true,
      isReady: cachedCount >= 20, // At least most vectors cached
      cachedCount,
      totalCount,
      lastWarmed: lastWarmed ? new Date(Number(lastWarmed)).toLocaleDateString() : undefined,
    };
  } catch {
    return {
      isSupported: true,
      isReady: false,
      cachedCount: 0,
      totalCount: 36,
    };
  }
}

/**
 * Explicitly forces a pre-cache pass with a progress callback.
 */
export async function forceRefreshCache(
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void,
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const urls: string[] = [...CORE_STATIC_ASSETS];
  for (const ref of Object.values(CREATURE_REFERENCES)) {
    if (ref?.src && !urls.includes(ref.src)) {
      urls.push(ref.src);
    }
  }

  let loaded = 0;
  const total = urls.length;

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "reload" });
      if (res.ok) {
        await cache.put(url, res);
      }
    } catch {
      // Continue
    }
    loaded++;
    onProgress?.({
      loaded,
      total,
      percent: Math.round((loaded / total) * 100),
    });
  }

  localStorage.setItem("biteid_cache_last_warmed_v2", Date.now().toString());
}
