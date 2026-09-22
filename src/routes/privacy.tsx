import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Database,
  EyeOff,
  FileLock2,
  HardDrive,
  Lock,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BiteID" },
      {
        name: "description",
        content:
          "Read BiteID's strict privacy policy: zero permanent image retention, local-device storage only, and zero third-party commercial trackers.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader activePage="privacy" />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Data Protection & Ethics</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground">
            Effective Date: September 22, 2026 • Version 1.0 (Alpha)
          </p>
        </div>

        {/* Core Commitments Callout */}
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-xs leading-relaxed space-y-3">
          <h3 className="font-display text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            Our Core Privacy Commitments (Plain English)
          </h3>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              • <strong>No Permanent Photo Storage:</strong> Lesion and captured insect photos are
              processed transiently in server memory during triage and are <em>never</em> stored in
              a database, cloud bucket, or persistent media library.
            </li>
            <li>
              • <strong>Zero Third-Party Ad Trackers:</strong> We do not sell data, use tracking
              pixels, or share information with data brokers or advertising networks.
            </li>
            <li>
              • <strong>Offline Data Stays on Your Device:</strong> Intakes stashed in Backcountry
              Field Mode reside exclusively in your browser's private{" "}
              <code className="text-foreground font-mono">localStorage</code> and never leave your
              phone until you choose to submit them.
            </li>
          </ul>
        </div>

        <div className="mt-10 space-y-8 text-xs leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              1. Information We Process
            </h2>
            <p>
              When you use the BiteID web application, you may voluntarily submit the following
              inputs during a triage session:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>
                <strong>Images:</strong> Photographic uploads of skin lesions or captured
                insects/spiders.
              </li>
              <li>
                <strong>Contextual Inputs:</strong> Selected environment (e.g., woods, garden,
                home), state/geography, duration of symptom, and reported physical sensations (e.g.,
                burning, severe itch).
              </li>
              <li>
                <strong>Emergency Checklists:</strong> Binary checkboxes indicating presence or
                absence of acute allergic or envenomation symptoms.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              2. How Your Photos & Data Are Handled
            </h2>
            <p>
              Photos uploaded through the wizard are converted to ephemeral base64 representations
              in your browser, transmitted via secure TLS encryption directly to our server-side
              API, inspected via automated multimodal vision models for morphological
              classification, and immediately discarded from memory upon completion of the inference
              response.
            </p>
            <p>
              We do not maintain user accounts, user profiles, or historical intake databases. If
              you refresh or navigate away from the application, session data is cleared from
              memory.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              3. Offline Local Storage & Backcountry Queues
            </h2>
            <p>
              In backcountry zero-service scenarios, BiteID enables local intake stashing. When you
              complete an intake while disconnected from the internet, your browser saves the record
              into local storage on your physical device. You retain full control over this data:
              you can review, submit, or permanently delete queued records at any time using the
              &quot;Stashed Intakes&quot; tab within the Backcountry Field Kit.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              4. Cookies, Analytics & Tracking
            </h2>
            <p>
              BiteID utilizes standard browser storage technologies solely to preserve offline
              service worker assets, theme preferences, and local intake queues. We do not employ
              third-party surveillance cookies, fingerprinting libraries, or cross-site tracking
              technologies.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              5. HIPAA & Healthcare Privacy Context
            </h2>
            <p>
              BiteID is a public informational technology demonstration. Because BiteID is not a
              covered healthcare provider, health plan, or healthcare clearinghouse, submissions are
              not governed by the Health Insurance Portability and Accountability Act (HIPAA).
              Nevertheless, our architecture follows strict privacy-by-design principles: minimal
              collection, zero persistent storage of health records, and no identity-linking.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              6. Data Security & Technical Safeguards
            </h2>
            <p>
              All network communications are secured using modern HTTPS/TLS encryption. Server
              functions operate in isolated runtime sandboxes with zero disk-based persistence for
              uploaded media.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              7. Contact Us About Privacy
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding data privacy or technical
              security within BiteID, please reach out via our{" "}
              <Link to="/contact" className="text-primary font-semibold underline">
                Contact Page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
