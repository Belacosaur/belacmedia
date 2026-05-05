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
- `VITE_GTM_ID`: Optional Google Tag Manager container id.

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
  - `VITE_GTM_ID=<optional-gtm-id>`
  - `VITE_GOOGLE_CLIENT_ID=<optional-client-id>`
- Cloudflare Pages routing:
  - Add SPA fallback rewrite so all non-file paths resolve to `/index.html`.
- Railway backend environment must include:
  - `FRONTEND_URL=https://<cloudflare-pages-domain or custom domain>`
  - `DATABASE_URL`, `JWT_SECRET`, and any optional auth/payment vars.
