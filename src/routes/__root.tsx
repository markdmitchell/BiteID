import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Compass, WifiOff, X } from "lucide-react";
import { useOfflineStatus } from "../lib/offline-manager";
import { OfflineFieldKitModal } from "../components/triage/OfflineFieldKitModal";
import { SiteFooter } from "../components/navigation/SiteFooter";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BiteID - Identify Bites, Stings, and Skin Reactions" },
      {
        name: "description",
        content:
          "BiteID is an alpha prototype for testing only: guided intake for bites, stings and skin reactions with ranked assessments.",
      },
      { property: "og:title", content: "BiteID - Identify Bites, Stings, and Skin Reactions" },
      {
        property: "og:description",
        content:
          "BiteID is an alpha prototype for testing only: guided intake for bites, stings and skin reactions with ranked assessments.",
      },
      { name: "theme-color", content: "#0D241A" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Figtree:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [fieldKitOpen, setFieldKitOpen] = useState(false);
  const { isOffline, connectionRestored, dismissRestored } = useOfflineStatus();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker failed or unsupported in dev
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Offline Backcountry Banner */}
      {isOffline && (
        <aside
          aria-label="Offline Field Mode"
          className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-600/30 bg-amber-500/15 px-4 py-2.5 text-xs text-amber-950 dark:text-amber-200 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="size-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>
              <strong>Offline Field Mode:</strong> Cellular / Wi-Fi disconnected. Backcountry Vector
              Atlas & Snakebite protocols are active.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFieldKitOpen(true)}
            className="ml-2 flex items-center gap-1 rounded-lg bg-amber-600/20 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-100 hover:bg-amber-600/30 transition-colors"
          >
            <Compass className="size-3.5" />
            Open Field Kit
          </button>
        </aside>
      )}

      {/* Connection Restored Notification */}
      {connectionRestored && !isOffline && (
        <aside
          aria-label="Connection Restored"
          className="sticky top-0 z-50 flex items-center justify-between border-b border-emerald-600/30 bg-emerald-500/15 px-4 py-2.5 text-xs text-emerald-950 dark:text-emerald-200 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Signal Restored:</strong> Online connectivity re-established. Full AI photo
              analysis is available.
            </span>
          </div>
          <button
            type="button"
            onClick={dismissRestored}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </aside>
      )}

      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />

      <SiteFooter />

      <OfflineFieldKitModal
        open={fieldKitOpen}
        onOpenChange={setFieldKitOpen}
        isOffline={isOffline}
      />
    </QueryClientProvider>
  );
}
