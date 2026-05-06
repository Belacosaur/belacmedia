import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Official GA4 gtag snippet in `<head>` when `VITE_GA_MEASUREMENT_ID` is set (direct install). */
function ga4DirectSnippetPlugin(gaId: string, debugMode: boolean): Plugin {
  const configPayload = JSON.stringify({
    send_page_view: false,
    ...(debugMode ? { debug_mode: true } : {}),
  })
  const idJson = JSON.stringify(gaId)
  const snippet = `    <!-- Google tag (gtag.js) — direct GA4; Measurement ID from VITE_GA_MEASUREMENT_ID at build -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${idJson}, ${configPayload});
    </script>`

  return {
    name: 'ga4-direct-snippet',
    transformIndexHtml(html) {
      return html.replace('    <meta charset="UTF-8" />', `${snippet}\n    <meta charset="UTF-8" />`)
    },
  }
}

function validateMeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gaRaw = env.VITE_GA_MEASUREMENT_ID?.trim() ?? ''
  const gaId = validateMeasurementId(gaRaw) ? gaRaw : ''
  if (gaRaw && !gaId) {
    console.warn(
      '[vite] VITE_GA_MEASUREMENT_ID is invalid (expected G-XXXXXXXXXX). GA snippet will not be injected.',
    )
  }
  const gaDebug = env.VITE_GA_DEBUG === 'true'

  return {
    plugins: [react(), ...(gaId ? [ga4DirectSnippetPlugin(gaId, gaDebug)] : [])],
    server: {
      proxy: {
        '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
        '/webhooks': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      },
    },
  }
})
