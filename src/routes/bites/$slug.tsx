import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/navigation/PageHeader";
import { BITE_GUIDES, guideBySlug } from "@/lib/bite-guides";

export const Route = createFileRoute("/bites/$slug")({
  staticData: { sitemap: false },
  loader: ({ params }) => {
    const guide = guideBySlug(params.slug);
    if (!guide) throw notFound();
    return { slug: guide.slug };
  },
  head: ({ params, loaderData }) => {
    const g = loaderData ? guideBySlug(loaderData.slug) : undefined;
    if (!g) return { meta: [{ title: "Guide not found | BiteID" }, { name: "robots", content: "noindex" }] };
    const title = `${g.title}: pictures, symptoms, what to do | BiteID`;
    const url = `https://biteid.site/bites/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: g.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: g.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">
      Guide not found. <Link to="/bites" className="text-primary underline">See all guides</Link>
    </div>
  ),
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useLoaderData();
  const g = guideBySlug(slug)!;
  const others = BITE_GUIDES.filter((o) => o.slug !== slug).slice(0, 4);
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/bites" className="text-sm text-primary hover:underline">All bite guides</Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{g.question}</h1>
        <p className="mt-4 text-base leading-relaxed">{g.summary}</p>

        <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <img src={g.image} alt={g.imageAlt} className="aspect-[3/2] w-full object-cover" />
          <figcaption className="p-3 text-xs text-muted-foreground">AI-generated visual reference, not a real patient photo.</figcaption>
        </figure>

        <section className="mt-6 rounded-xl border border-primary/30 bg-card p-5">
          <h2 className="font-display text-lg font-bold">Not sure what bit you?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload a photo and answer three quick questions for a free assessment.</p>
          <Button asChild className="mt-3"><Link to="/"><Camera className="size-4" /> Check my bite</Link></Button>
        </section>

        <Section title="What it looks like" items={g.looksLike} />
        <Section title="What to do" items={g.whatToDo} />

        <section className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-destructive">
            <AlertTriangle className="size-5" /> See a doctor if you notice
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {g.seeDoctor.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-3 text-sm font-semibold">Trouble breathing, face or throat swelling: call 911 now.</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-lg font-bold">Other bite guides</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link to="/bites/$slug" params={{ slug: o.slug }} className="text-primary hover:underline">{o.title}</Link>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-10 text-xs text-muted-foreground">Educational information only, not a diagnosis. BiteID is in alpha testing.</p>
      </main>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}
