import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { BITE_GUIDES } from "@/lib/bite-guides";
import { sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://biteid.site";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        for (const g of BITE_GUIDES) entries.push({ path: `/bites/${g.slug}` });
        if (entries.length === 0) {
          return new Response("No public pages are included in the sitemap", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});