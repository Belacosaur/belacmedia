Frontend SEO Review
Scope: `Frontend/` technical + on-page SEO review for indexability, metadata, structured data, internal linking, and crawl controls.

Audit date: 2026-05-06

61 / 100
Overall SEO readiness
3
Critical issues
5
High-priority issues
6
Low-priority improvements
Top blocker
The site is a React SPA with a single static `index.html` metadata set. Non-home routes (`/privacy`, `/terms`, `/brand`, `/app/*`) currently share the same title/description/canonical, which weakens relevance and can create canonical conflicts.
Priority Findings
Severity	Finding	Why it matters	Recommendation
Critical	Single canonical is hardcoded to homepage	Every route can signal homepage as canonical, reducing route-level index quality.	Set per-route canonical tags (or prerender each marketing/legal route with its own head).
Critical	Single global title/description/OG/Twitter metadata	All pages compete with same snippet; weak topical relevance and lower CTR.	Implement route-specific metadata for /, /privacy, /terms, /brand and noindex routes.
Critical	No explicit noindex strategy for auth/app routes	Portal/login/reset pages can be indexed as thin/utility content.	Apply noindex,nofollow to /app/* and disallow crawling of private utility paths.
High	CSR-only rendering for primary marketing pages	Bots can render JS, but prerendered HTML is more reliable and faster for discovery.	Add SSR/prerender for public routes (at minimum static prerender of 4 public pages).
High	Structured data limited to Organization only	Missed eligibility for richer brand/site understanding.	Add WebSite + potential Service schema; add sameAs social profiles.
High	Sitemap lacks lastmod and excludes some discoverable public intent pages	Lower crawl scheduling precision; incomplete URL inventory for bots.	Generate sitemap from route config with lastmod and canonical parity.
High	Robots allows all paths while app utility routes are linkable	Crawl budget can be spent on low-value pages.	Disallow selected utility/auth paths and pair with noindex meta.
Medium	Hero image served as eager 615 KB PNG	Can hurt LCP and initial load on mobile.	Convert to WebP/AVIF, responsive srcset, and keep critical dimensions explicit.
Medium	Brand/logo assets are relatively heavy PNGs	Increased transfer and potentially slower render paths.	Use modern formats for web rendering while keeping PNG downloads where needed.
Medium	No explicit social image dimensions/type metadata	Unpredictable social card rendering on some platforms.	Add og:image:width, og:image:height, and og:image:type.
What is already good
Evidence checked
`Frontend/index.html` includes one static canonical and one static metadata set.

`Frontend/src/main.tsx` + `Frontend/src/App.tsx` confirm BrowserRouter SPA behavior.

`Frontend/public/robots.txt` currently allows all paths.

`Frontend/public/sitemap.xml` includes only a small fixed URL list.

`Frontend/src/pages/MarketingHome.tsx` links to `/app`, making utility routes discoverable.

30-60-90 minute implementation plan
Window	Focus	Actions
First 30 min	Indexation control	Add route-level noindex for /app/*, tighten robots rules for utility routes, keep canonical self-referential per public route.
Next 60 min	Metadata architecture	Create route metadata map (title, description, canonical, OG/Twitter) and apply on navigation changes.
Next 90 min	Performance + structured data	Compress hero/logo web assets, add image metadata fields, expand JSON-LD with WebSite/Service entities.
Expected lift after fixes
With per-route metadata + noindex controls + prerendered public routes, this frontend should move from baseline discoverability to a solid technical SEO foundation suitable for growth content and link acquisition.