import { describe, expect, test } from "bun:test";
import { createRootRoute, createRoute, createRouter, createMemoryHistory } from "@tanstack/react-router";
import { sitemapStaticPaths, sitemapXML } from "../src/lib/sitemap";

describe("sitemap route discovery", () => {
  test("includes public pages and excludes private subtrees and endpoints", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
    const about = createRoute({ getParentRoute: () => root, path: "about", staticData: { sitemap: true } });
    const endpoint = createRoute({ getParentRoute: () => root, path: "sitemap.xml", staticData: { sitemap: false } });
    const privateLayout = createRoute({ getParentRoute: () => root, path: "account", staticData: { sitemap: "exclude-subtree" } });
    const privateChild = createRoute({ getParentRoute: () => privateLayout, path: "profile", staticData: { sitemap: true } });
    const router = createRouter({
      routeTree: root.addChildren([home, about, endpoint, privateLayout.addChildren([privateChild])]),
      history: createMemoryHistory(),
    });
    expect(sitemapStaticPaths(router)).toEqual(["/", "/about"]);
  });

  test("uses the public domain without invented modification dates", () => {
    const xml = sitemapXML("https://biteid.site", [{ path: "/" }, { path: "/about" }, { path: "/" }]);
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain("<loc>https://biteid.site/</loc>");
    expect(xml).toContain("<loc>https://biteid.site/about</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  test.each(["//outside.example/page", "/about?private=1", "/about#section", "/../secret"])(
    "rejects unsafe path %s", (path) => {
      expect(() => sitemapXML("https://biteid.site", [{ path }])).toThrow("Invalid sitemap path");
    },
  );
});