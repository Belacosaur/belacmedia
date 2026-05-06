Frontend SEO Review
Comprehensive audit of the customer-facing routes in `Frontend/` with emphasis on crawlability, indexation, metadata quality, structured data, and technical SEO foundations.

11 / 11
Marketing routes with unique title+description
11+
Structured-data enabled pages
2
Critical technical SEO blockers
6
High-priority improvements
Top Risk
The site is a client-rendered SPA. Most metadata is injected after hydration via `useEffect`, which weakens social sharing previews and can reduce crawl/index reliability for non-rendering bots.
Priority Findings
Priority	Area	Finding	Impact	Recommended Fix
P0	Rendering	SEO tags are runtime-injected in `Seo.tsx` (`useEffect`), not present in initial HTML.	OpenGraph/Twitter parsers and some crawlers miss route-specific metadata.	Move to SSR or static prerender (e.g., Vite SSR/prerender), so each route ships canonical meta in HTML.
P0	Indexation	No `robots.txt` and no `sitemap.xml` found in `Frontend/public`.	Search engines get weaker crawl guidance and slower discovery of deep pages.	Add `public/robots.txt` and generated `sitemap.xml` covering all marketing/location routes.
P1	Social SEO	No OpenGraph/Twitter tags (`og:title`, `og:description`, `og:image`, `twitter:card`).	Poor social previews and lower CTR from shared links.	Extend SEO component to emit OG/Twitter tags with route-specific image/title/description.
P1	Thin/utility pages	`/residential-quote/thank-you` is canonicalized and indexable.	Low-value page may get indexed and dilute site quality signals.	Add `noindex,follow` for thank-you/confirmation pages and avoid indexing funnel endpoints.
P1	Redirects	`public/_redirects` only has SPA fallback; no legacy/variant redirects.	Potential duplicate/legacy URL equity leakage.	Add 301 mappings for known aliases (e.g. `/contact-us` -> `/contact`) at host/CDN level.
P2	Media performance	Large hero images lack explicit width/height and responsive `srcset`/sizes strategy.	Potential CLS/LCP regressions affecting Core Web Vitals and rankings.	Set intrinsic dimensions, responsive images, and compress to modern formats.
P2	Internal linking	`/blog` and `/resources` route to FAQ, but content hubs are absent.	Intent mismatch for long-tail queries and topical authority limits.	Create dedicated content hubs or remove crawlable intent signals until ready.
What Is Already Strong
- Route-level unique titles and descriptions across core marketing pages.

- Canonical tags are set per route for marketing and location pages.

- Structured data present: LocalBusiness, Service, BreadcrumbList, FAQPage.

- Clear single `h1` usage on audited marketing pages.

- Good internal cross-linking between service clusters and location hub.

- `lang="en"` and mobile viewport meta are correctly set.

Recommended 30-Day Action Plan
Window	Actions	Expected SEO Outcome
Week 1	Ship `robots.txt`, XML sitemap, OG/Twitter tags, and `noindex` on thank-you page.	Better crawl guidance, richer sharing snippets, cleaner indexation.
Week 2	Implement prerender/SSR for all public marketing and location routes.	Higher crawl reliability and full metadata visibility in raw HTML.
Week 3	Image optimization pass (dimensions, compression, responsive sources).	Improved CWV potential (LCP/CLS), stronger UX and ranking support.
Week 4	Expand content architecture (service/location supporting content) and add internal hubs.	Improved topical relevance and long-tail keyword capture.
Note: This audit is code-level and architecture-level. For live ranking diagnostics, pair with Search Console, server logs, and a production crawl snapshot.