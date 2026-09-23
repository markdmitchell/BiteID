import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, ShieldAlert, Stethoscope, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import biteIdIcon from "@/assets/biteid-icon.png";

type PageHeaderProps = {
  activePage?: "about" | "privacy" | "terms" | "contact";
  onOpenSnakebite?: () => void;
  onOpenFieldKit?: () => void;
};

export function PageHeader({ activePage }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80 sm:size-9"
            aria-label="Return to triage intake"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <Link to="/" className="flex items-center gap-2.5">
            <img src={biteIdIcon} alt="BiteID" className="size-8 shrink-0 object-contain" />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                BiteID
              </span>
              <span className="rounded-md bg-caution/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-caution-foreground">
                Alpha
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Triage Intake
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${
              activePage === "about" ? "text-primary font-semibold" : "hover:text-foreground"
            }`}
          >
            About
          </Link>
          <Link
            to="/privacy"
            className={`transition-colors ${
              activePage === "privacy" ? "text-primary font-semibold" : "hover:text-foreground"
            }`}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className={`transition-colors ${
              activePage === "terms" ? "text-primary font-semibold" : "hover:text-foreground"
            }`}
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className={`transition-colors ${
              activePage === "contact" ? "text-primary font-semibold" : "hover:text-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold">
              <Stethoscope className="size-3.5" />
              <span>Start Intake</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
