// BiteID Offline Field Service Worker
const CACHE_NAME = "biteid-field-cache-v1";
const STATIC_ASSETS = ["/", "/favicon.ico", "/icon.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // API or server functions: try network first, do not cache errors
  if (url.pathname.includes("/_serverFn") || url.pathname.startsWith("/api/")) {
    return;
  }

  // Assets (images, fonts, scripts, css): Stale-While-Revalidate or Cache-First
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/i) ||
    url.pathname.includes("/assets/");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          // Revalidate in background
          fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res);
            })
            .catch(() => {});
          return cached;
        }

        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.status === 200) {
            cache.put(request, networkRes.clone());
          }
          return networkRes;
        } catch {
          return cached || new Response("", { status: 503, statusText: "Offline" });
        }
      }),
    );
    return;
  }

  // Navigation requests: Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = (await cache.match("/")) || (await cache.match(request));
        return (
          cached ||
          new Response("Offline. Please reopen BiteID when connection is available.", {
            headers: { "Content-Type": "text/html" },
          })
        );
      }),
    );
    return;
  }
});
