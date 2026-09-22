import { Link } from "@tanstack/react-router";
import { Compass, HeartPulse, PhoneCall, ShieldAlert, Stethoscope, Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-12">
        {/* Top Emergency Action Band */}
        <div className="mb-10 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <HeartPulse className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-destructive">
                  Emergency Medical Guidance
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  If you or someone else has severe breathing difficulty, throat or facial swelling,
                  confusion, or a suspected venomous snakebite, seek emergency care immediately.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="tel:911"
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-bold text-destructive-foreground shadow-xs hover:bg-destructive/90 transition-colors"
              >
                <PhoneCall className="size-3.5" />
                <span>Call 911</span>
              </a>
              <a
                href="tel:18002221222"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <PhoneCall className="size-3.5 text-primary" />
                <span>Poison Control: 1-800-222-1222</span>
              </a>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand & Mission Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Stethoscope className="size-4" />
              </span>
              <span className="font-display text-base font-bold tracking-tight">BiteID</span>
              <span className="rounded-full bg-caution/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-caution-foreground">
                Alpha
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Intelligent outdoor triage for bites, stings, and skin reactions with tone-calibrated
              reference imagery and zero-connectivity backcountry survival protocols.
            </p>
          </div>

          {/* Clinical Features */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold tracking-wider uppercase text-foreground">
              Clinical Tools
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>Photo & Intake Wizard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Zap className="size-3 text-primary" />
                  <span>I Know What Bit Me</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert className="size-3 text-destructive" />
                  <span>Snakebite SOS Mode</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Compass className="size-3 text-primary" />
                  <span>Backcountry Field Kit</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Reference */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold tracking-wider uppercase text-foreground">
              Reference
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  20-Species Vector Atlas
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  Fitzpatrick Phototype Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  Folklore Myth-Busting
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  Wilderness PWA Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold tracking-wider uppercase text-foreground">
              About & Legal
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About BiteID
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-12 border-t border-border pt-6 text-[11px] leading-relaxed text-muted-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} BiteID. Research prototype for alpha testing only.
            </p>
            <div className="flex flex-wrap gap-4 text-[11px]">
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/80">
            <strong>Medical Disclaimer:</strong> BiteID is an educational technology demonstration
            and is not a medical device, diagnostic system, or clinical healthcare provider. Content
            and assessments are for informational purposes only. Never delay seeking medical advice,
            disregard medical recommendations, or discontinue treatment because of information
            presented on this application.
          </p>
        </div>
      </div>
    </footer>
  );
}
