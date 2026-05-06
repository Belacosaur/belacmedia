/* eslint-disable react-refresh/only-export-components -- build-time SSR helper, not a Fast Refresh module */
/**
 * Post-build: inject static HTML for public marketing routes (improves first HTML for crawlers).
 * Run after `vite build`: `vite-node --mode production scripts/prerender.tsx`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import App from '../src/App.tsx'
import RouteAnalytics from '../src/components/RouteAnalytics.tsx'
import SeoHead from '../src/components/SeoHead.tsx'
import { buildHeadInnerHtml } from '../src/seo/seoConfig.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function loadDotEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim())
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotEnv()

const PRERENDER_ROUTES = ['/', '/privacy', '/terms', '/brand'] as const

function PrerenderShell({ location }: { location: string }) {
  return (
    <StaticRouter location={location}>
      <SeoHead />
      <RouteAnalytics />
      <App />
    </StaticRouter>
  )
}

const distDir = path.join(rootDir, 'dist')
const templatePath = path.join(distDir, 'index.html')

if (!fs.existsSync(templatePath)) {
  console.error('[prerender] dist/index.html not found. Run `vite build` first.')
  process.exit(1)
}

const baseTemplate = fs.readFileSync(templatePath, 'utf8')

if (!baseTemplate.includes('<!--seo-placeholder-->')) {
  console.warn('[prerender] Missing <!--seo-placeholder--> in dist/index.html — head injection skipped.')
}

const origin = (process.env.VITE_SITE_ORIGIN || 'https://belacmedia.com').replace(/\/$/, '')
process.env.VITE_SITE_ORIGIN = origin

for (const route of PRERENDER_ROUTES) {
  const headHtml = buildHeadInnerHtml(origin, route)
  const bodyHtml = renderToString(<PrerenderShell location={route} />)
  let html = baseTemplate.replace('<!--seo-placeholder-->', headHtml)
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)

  const outFile =
    route === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.replace(/^\//, ''), 'index.html')

  if (route !== '/') {
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
  }

  fs.writeFileSync(outFile, html)
  console.log('[prerender]', route, '->', path.relative(distDir, outFile))
}
