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
- `VITE_GA_MEASUREMENT_ID`: Optional **Google Analytics 4** measurement ID (`G-XXXXXXXXXX`). Loads `gtag.js`, disables automatic first page_view, and sends SPA `page_view` on route changes via `RouteAnalytics`. Custom events use `trackEvent()` from `src/lib/analytics.ts`. Do **not** set together with `VITE_GTM_ID` unless you deliberately manage duplicates in Google’s UI.
- `VITE_GA_DEBUG`: Optional; set to `true` for GA4 `debug_mode` (GA DebugView).
- `VITE_GTM_ID`: Optional Google Tag Manager container id — use **instead of** `VITE_GA_MEASUREMENT_ID` if GA4 is fired only from inside GTM.

## Analytics (Google Analytics 4)

1. Create a GA4 property and web **measurement ID** (`G-XXXXXXXXXX`).
2. Set `VITE_GA_MEASUREMENT_ID` in Cloudflare Pages (production) and optional `.env` locally.
3. Deploy; confirm realtime hits in GA4. Optional: set `VITE_GA_DEBUG=true` locally and use GA **DebugView**.
4. **SPA behaviour:** `RouteAnalytics` sends `page_view` on every React Router navigation (`pathname` + `search`).
5. **Custom events** already wired:
   - `submit_contact_form`, `submit_contact_form_success`, `submit_contact_form_error` (params include `form_id`)
   - `click_footer_facebook` from the marketing footer

Alternative: set only `VITE_GTM_ID` and configure GA4 + triggers inside GTM (match event names above if you map dataLayer pushes).

**GTM in `index.html`:** This repo embeds the official GTM head + `<noscript>` snippets for container **`GTM-PHMSR469`** in `index.html`. You typically **do not** need `VITE_GTM_ID` unless you inject GTM via env only on certain hosts. Do **not** also set `VITE_GA_MEASUREMENT_ID` unless you intend to run GA4 twice (see dev console warning).

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
  - `VITE_GA_MEASUREMENT_ID=<optional-GA4-G-XXXXXXXXXX>` **or** `VITE_GTM_ID=<optional-gtm-id>` (pick one primary path)
  - `VITE_GOOGLE_CLIENT_ID=<optional-client-id>`
- Cloudflare Pages routing:
  - Add SPA fallback rewrite so all non-file paths resolve to `/index.html`.
- Railway backend environment must include:
  - `FRONTEND_URL=https://<cloudflare-pages-domain or custom domain>`
  - `DATABASE_URL`, `JWT_SECRET`, and any optional auth/payment vars.
