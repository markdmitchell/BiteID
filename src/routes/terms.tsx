import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileCheck2,
  PhoneCall,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/navigation/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — BiteID" },
      {
        name: "description",
        content:
          "Review BiteID's Terms of Service: non-diagnostic alpha prototype agreement, emergency redirection, and limitation of liability.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader activePage="terms" />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Scale className="size-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-xs text-muted-foreground">
            Effective Date: September 22, 2026 • Version 1.0 (Alpha Prototype)
          </p>
        </div>

        {/* Mandatory Emergency Warning Box */}
        <div className="mt-8 rounded-2xl border-2 border-destructive/30 bg-destructive/10 p-5 text-xs leading-relaxed space-y-3">
          <div className="flex items-center gap-2 font-bold text-destructive text-sm">
            <ShieldAlert className="size-4 shrink-0" />
            <span>NOT AN EMERGENCY SERVICE OR CLINICAL DIAGNOSIS</span>
          </div>
          <p className="text-destructive/90">
            BiteID is an early-stage software research prototype. It does not provide medical
            advice, diagnosis, or treatment plans. If you are experiencing difficulty breathing,
            facial swelling, confusion, chest tightness, severe pain, or suspect you were bitten by
            a venomous snake,
            <strong>
              {" "}
              stop using this application and call 911 or visit the nearest emergency room
              immediately.
            </strong>
          </p>
        </div>

        <div className="mt-10 space-y-8 text-xs leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using BiteID (the &quot;Service&quot;), you acknowledge
              that you have read, understood, and agree to be bound by these Terms of Service. If
              you do not agree with any portion of these terms, you must discontinue using the
              application immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              2. Nature of the Service (Alpha Prototype)
            </h2>
            <p>
              BiteID is made available exclusively as an experimental technology demonstration for
              informational and educational purposes. You understand and agree that:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                Ranked probability assessments, differential visual readings, and algorithmic
                outputs are experimental estimations and may contain inaccuracies or false
                negatives.
              </li>
              <li>
                The Service is not intended to be used as a primary diagnostic tool, clinical triage
                system, or prescription guide.
              </li>
              <li>
                No doctor-patient, clinician-patient, or confidential therapeutic relationship is
                created by your use of the Service.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              3. User Responsibilities & Emergency Care
            </h2>
            <p>
              You represent and warrant that you will exercise sound personal judgment when managing
              any physical injury or bite. You agree that:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                You will not rely on BiteID to make critical medical, surgical, or pharmaceutical
                decisions.
              </li>
              <li>
                You will consult with a licensed healthcare provider regarding any changing,
                infected, or painful skin lesion.
              </li>
              <li>
                You will immediately contact local emergency services (e.g. 911 in the U.S.) or
                Poison Control (1-800-222-1222) if systemic distress occurs.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              4. Disclaimer of Warranties
            </h2>
            <p className="uppercase text-[11px] leading-normal tracking-wide">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS
              WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
              TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, MEDICAL ACCURACY,
              OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ACCURATE, OR ERROR-FREE.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              5. Limitation of Liability
            </h2>
            <p className="uppercase text-[11px] leading-normal tracking-wide">
              TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, NEITHER BITEID, ITS AUTHORS,
              CONTRIBUTORS, NOR AFFILIATES SHALL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING DAMAGES FOR PERSONAL INJURY,
              WRONGFUL DEATH, HEALTH COMPLICATIONS, LOSS OF DATA, OR MEDICAL EXPENSES) ARISING FROM
              OR RELATING TO YOUR USE OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              6. Permitted & Acceptable Use
            </h2>
            <p>
              You agree to use BiteID solely for lawful personal informational purposes. You agree
              not to:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>
                Reverse engineer, scrape, or systematically extract proprietary image databases.
              </li>
              <li>
                Attempt to disrupt, overwhelm, or inject malicious payloads into the server runtime.
              </li>
              <li>
                Misrepresent BiteID assessments as certified medical certificates or formal clinical
                diagnoses.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="font-display text-base font-bold text-foreground">
              7. Updates & Inquiries
            </h2>
            <p>
              We reserve the right to revise or discontinue any portion of these terms or the
              Service at any time. Questions regarding these Terms may be submitted through our{" "}
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
