# Belac Media Frontend

## Local development

- Install dependencies: `npm ci`
- Start dev server: `npm run dev`
- Default frontend URL: `http://localhost:5173`
- API proxy target in development: `http://127.0.0.1:4000`

## Environment variables

Create `.env` from `.env.example`:

- `VITE_API_URL`: Backend API base URL (Railway backend URL in production).
- `VITE_GOOGLE_CLIENT_ID`: Optional Google sign-in client id.
- `VITE_GA_MEASUREMENT_ID`: **Recommended.** Google Analytics 4 **Measurement ID** (`G-XXXXXXXXXX`). At **build** and **dev**, Vite injects Google’s official **`gtag.js` snippet into `index.html`** (`vite.config.ts`). `send_page_view` is off; SPA `page_view` is sent from `RouteAnalytics` via `trackPage()`. Custom events use `trackEvent()` in `src/lib/analytics.ts`.
- `VITE_GA_DEBUG`: Optional; set to `true` for GA4 `debug_mode` (GA DebugView)—applied in the injected snippet when rebuilding/restarting dev.
- `VITE_GTM_ID`: Optional — use **instead of** `VITE_GA_MEASUREMENT_ID` only if you load measurement **only** through Tag Manager (snippet not injected).

## Analytics (direct GA4)

1. GA4 → **Admin** → **Data streams** → copy **Measurement ID** (`G-…`).
2. Set `VITE_GA_MEASUREMENT_ID` in `.env` locally and in **Cloudflare Pages** env for production. Restart dev / redeploy so `index.html` gets the snippet.
3. **SPA:** `RouteAnalytics` fires `page_view` on each route change (`pathname` + `search`).
4. **Events:** `submit_contact_form` (+ `_success` / `_error`), `click_footer_facebook` (see `ContactForm` / marketing footer).

**Tag Manager:** If you prefer GTM only, **omit** `VITE_GA_MEASUREMENT_ID`, set `VITE_GTM_ID`, add GTM’s snippets to `index.html` yourself (or we can re-add), and configure GA4 inside GTM.

## Quality gates

- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`

CI in `.github/workflows/frontend-ci.yml` enforces all three before merge.

## Cloudflare + Railway deployment contract

- Frontend host: Cloudflare Pages.
- Backend/API host: Railway.
- Cloudflare Pages build settings:
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Root directory: `Frontend`
- Cloudflare Pages environment variables:
  - `VITE_API_URL=https://<railway-backend-domain>`
  - `VITE_GA_MEASUREMENT_ID=G-xxxxxxxxxx` (**recommended** direct GA4; snippet injected at build)
  - `VITE_GOOGLE_CLIENT_ID=<optional-client-id>`
- Cloudflare Pages routing:
  - Add SPA fallback rewrite so all non-file paths resolve to `/index.html`.
- Railway backend environment must include:
  - `FRONTEND_URL=https://<cloudflare-pages-domain or custom domain>`
  - `DATABASE_URL`, `JWT_SECRET`, and any optional auth/payment vars.
