/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production site origin for canonical URLs, OG tags, and JSON-LD (no trailing slash), e.g. https://belacmedia.com */
  readonly VITE_SITE_ORIGIN?: string
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GTM_ID?: string
  /** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). Prefer this OR VITE_GTM_ID, not both. */
  readonly VITE_GA_MEASUREMENT_ID?: string
  /** When true, sends GA4 debug_mode (use with GA DebugView). */
  readonly VITE_GA_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
