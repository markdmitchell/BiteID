import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MessageSquare,
  PhoneCall,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/navigation/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Feedback | BiteID" },
      {
        name: "description",
        content:
          "Submit feedback, report a clinical inaccuracy, or contact the BiteID team for research and partnerships.",
      },
      { property: "og:title", content: "Contact & Feedback | BiteID" },
      { property: "og:description", content: "Submit feedback, report a clinical inaccuracy, or contact the BiteID team for research and partnerships." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    category: "clinical_feedback",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formState.email || !formState.message) return;
    setSubmitted(true);
  }

  function handleReset() {
    setFormState({
      name: "",
      email: "",
      category: "clinical_feedback",
      message: "",
    });
    setSubmitted(false);
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader activePage="contact" />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="space-y-2 border-b border-border pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Mail className="size-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Contact & Clinical Feedback
          </h1>
          <p className="text-xs text-muted-foreground">
            Have a suggestion, bug report, or clinical correction for our research team? We welcome
            your input.
          </p>
        </div>

        {/* Urgent Medical Callout */}
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-xs leading-relaxed text-destructive space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="size-4 shrink-0" />
            <span>Do NOT Use This Form for Active Medical Emergencies</span>
          </div>
          <p className="text-muted-foreground">
            This contact inbox is not monitored in real time and cannot provide personal medical
            triage. If you or someone with you requires acute medical evaluation, call 911 or Poison
            Control (1-800-222-1222) immediately.
          </p>
        </div>

        {/* Form or Submitted Confirmation */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </span>
              <h3 className="font-display text-2xl font-bold">Feedback Received</h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
                Thank you for contributing to BiteID's development. Our research and engineering
                team reviews all clinical suggestions, taxonomic feedback, and bug reports.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button onClick={handleReset} variant="outline" size="sm" className="text-xs">
                  Send Another Message
                </Button>
                <Link to="/">
                  <Button size="sm" className="text-xs">
                    Return to Triage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Your Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Dr. Alex Morgan or Taylor S."
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background py-2 pr-3 pl-9 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background py-2 pr-3 pl-9 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Inquiry Category</label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <option value="clinical_feedback">Clinical / Dermatological Suggestion</option>
                  <option value="bug_report">Software / PWA Bug Report</option>
                  <option value="species_addition">Vector / Species Inclusion Request</option>
                  <option value="academic_partner">Research / Institutional Collaboration</option>
                  <option value="general">General Inquiries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Message / Details <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Share details, clinical citations, bug reproduction steps, or thoughts..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-ring resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-muted-foreground">
                  Your email is strictly used to reply to your inquiry.
                </p>
                <Button type="submit" className="gap-1.5 text-xs font-semibold">
                  <Send className="size-3.5" />
                  <span>Submit Feedback</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
