declare global {
  interface Window {
    /** Shared queue used by both GA4 gtag and Google Tag Manager */
    dataLayer?: unknown[]
    /** Google Analytics 4 / gtag.js command function (defined when GA4 is enabled) */
    gtag?: (...args: unknown[]) => void
  }
}

type AnalyticsMode = 'none' | 'ga4' | 'gtm'

let mode: AnalyticsMode = 'none'
let gaMeasurementId: string | null = null

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

/**
 * Initialise analytics once at app startup.
 *
 * - If `VITE_GA_MEASUREMENT_ID` is set (GA4, format `G-XXXXXXXXXX`), loads `gtag.js` and sends SPA
 *   page views via {@link trackPage}. Custom events use {@link trackEvent}.
 * - Else if `VITE_GTM_ID` is set, loads Google Tag Manager only (configure GA4 inside GTM).
 * - Do not set both for duplicate measurement; prefer GA4 env **or** GTM, not both.
 *
 * Optional: `VITE_GA_DEBUG=true` enables GA4 `debug_mode` (verbose logging to DebugView).
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
  const gtmId = import.meta.env.VITE_GTM_ID?.trim()
  const gaDebug = import.meta.env.VITE_GA_DEBUG === 'true'
  const gtmSnippetOnPage =
    [...document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')].length > 0

  if (import.meta.env.DEV && gaId && gtmSnippetOnPage) {
    console.warn(
      '[analytics] VITE_GA_MEASUREMENT_ID is set but GTM is also embedded in index.html; you may double-count. Use one primary path.',
    )
  }

  if (import.meta.env.DEV && gaId && gtmId) {
    // Avoid accidental double-counting in GA when both loaders are configured.
    // Prefer GA4-only env *or* GTM-only (with GA4 tag inside GTM).
    console.warn(
      '[analytics] VITE_GA_MEASUREMENT_ID and VITE_GTM_ID are both set; loading GA4 only. Remove one.',
    )
  }

  if (gaId) {
    mode = 'ga4'
    gaMeasurementId = gaId

    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
    document.head.appendChild(script)

    window.gtag('js', new Date())
    window.gtag('config', gaId, {
      send_page_view: false,
      ...(gaDebug ? { debug_mode: true } : {}),
    })
    return
  }

  if (gtmId) {
    mode = 'gtm'
    window.dataLayer = window.dataLayer || []
    const gtmAlreadyLoaded = [...document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')].some(
      (el) => el.getAttribute('src')?.includes(gtmId) ?? false,
    )
    if (!gtmAlreadyLoaded) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
      script.setAttribute('data-gtm-id', gtmId)
      document.head.appendChild(script)
      window.dataLayer.push({
        'gtm.start': Date.now(),
        event: 'gtm.js',
        gtm_id: gtmId,
      })
    }
    return
  }

  // GTM snippet in index.html (no VITE_GTM_ID): tag SPA measurement mode for clarity.
  if (!gaId && gtmSnippetOnPage) {
    mode = 'gtm'
    window.dataLayer = window.dataLayer || []
  }
}

/**
 * SPA navigation: send a page_view with path (include query string when relevant).
 * GA4: `gtag('config', measurementId, { page_path, page_location, page_title })`.
 * GTM / fallback: `dataLayer` push compatible with common GA4 GTM tags.
 */
export function trackPage(path: string): void {
  if (typeof window === 'undefined') return

  const page_title = typeof document !== 'undefined' ? document.title : undefined
  const page_location =
    typeof window !== 'undefined' ? `${window.location.origin}${path}` : undefined

  if (mode === 'ga4' && gaMeasurementId && window.gtag) {
    window.gtag('config', gaMeasurementId, {
      page_path: path,
      page_title,
      page_location,
    })
    return
  }

  pushDataLayer({
    event: 'page_view',
    page_path: path,
    page_title,
    page_location,
  })
}

/** Custom event (GA4 recommended: lowercase_snake_case names). */
export function trackEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  if (mode === 'ga4' && window.gtag) {
    window.gtag('event', event, params)
    return
  }

  pushDataLayer({
    event,
    ...params,
  })
}
