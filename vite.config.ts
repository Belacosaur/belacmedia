import fs from 'node:fs'
import path from 'node:path'
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

function resolveSitemapLastmod(env: Record<string, string>): string {
  const explicit = env.VITE_SITEMAP_LASTMOD?.trim()
  if (explicit && /^\d{4}-\d{2}-\d{2}$/.test(explicit)) return explicit

  const sourceEpoch = env.SOURCE_DATE_EPOCH?.trim()
  if (sourceEpoch && /^\d+$/.test(sourceEpoch)) {
    const millis = Number(sourceEpoch) * 1000
    if (Number.isFinite(millis)) {
      return new Date(millis).toISOString().slice(0, 10)
    }
  }

  return new Date().toISOString().slice(0, 10)
}

/** Emit crawlers/sitemap.xml + robots.txt into dist using VITE_SITE_ORIGIN (overrides public/ copy). */
function seoFilesPlugin(mode: string): Plugin {
  return {
    name: 'seo-files',
    closeBundle() {
      const env = loadEnv(mode, process.cwd(), '')
      const origin = (env.VITE_SITE_ORIGIN || 'https://belacmedia.com').replace(/\/$/, '')
      const distDir = path.resolve(process.cwd(), 'dist')
      const lastmod = resolveSitemapLastmod(env)
      const paths = ['/', '/privacy', '/terms', '/brand']
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      for (const p of paths) {
        const loc = p === '/' ? `${origin}/` : `${origin}${p}`
        xml += '  <url>\n'
        xml += `    <loc>${loc}</loc>\n`
        xml += `    <lastmod>${lastmod}</lastmod>\n`
        xml += '    <changefreq>weekly</changefreq>\n'
        xml += '  </url>\n'
      }
      xml += '</urlset>\n'
      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
      fs.mkdirSync(distDir, { recursive: true })
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots)
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml)
    },
  }
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
    plugins: [
      react(),
      seoFilesPlugin(mode),
      ...(gaId ? [ga4DirectSnippetPlugin(gaId, gaDebug)] : []),
    ],
    server: {
      proxy: {
        '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
        '/webhooks': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      },
    },
  }
})
