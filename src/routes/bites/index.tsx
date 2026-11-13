import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/navigation/PageHeader";
import { BITE_GUIDES } from "@/lib/bite-guides";

const TITLE = "Bug Bite Identification Guide: Ticks, Spiders, Bed Bugs | BiteID";
const DESC =
  "Picture guide to common bug bites and rashes: bullseye tick rash, deer tick, bed bug, flea, spider, chigger, and mosquito bites, with what to do and when to see a doctor.";

export const Route = createFileRoute("/bites/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://biteid.site/bites" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://biteid.site/bites" }],
  }),
  component: BitesIndex,
});

function BitesIndex() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          What bit me? A picture guide to common bites
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Compare your bite with reference pictures, learn what to do, and know when to get care.
          Not sure? Upload a photo for a free assessment.
        </p>
        <Button asChild className="mt-5">
          <Link to="/">
            <Camera className="size-4" /> Check my bite
          </Link>
        </Button>
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BITE_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                to="/bites/$slug"
                params={{ slug: g.slug }}
                className="group block h-full overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                <img src={g.image} alt={g.imageAlt} loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <div className="p-4">
                  <h2 className="font-display text-lg font-bold">{g.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{g.question}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Read guide <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
