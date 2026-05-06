/** Single source of truth for public SEO; app routes under `/app` are noindex. */

export type RobotsDirective = 'index,follow' | 'noindex,nofollow'

export type PageSeo = {
  title: string
  description: string
  robots: RobotsDirective
  /** Path under site origin, e.g. /privacy */
  path: string
  ogTitle?: string
  ogDescription?: string
  /** Absolute URL or path starting with / */
  ogImage?: string
}

const SITE_FALLBACK = 'https://belacmedia.com'

function siteOriginFromProcessEnv(): string {
  try {
    const proc = (
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> }
      }
    ).process
    const raw = proc?.env?.VITE_SITE_ORIGIN
    if (typeof raw === 'string' && raw.trim()) return raw.trim().replace(/\/$/, '')
  } catch {
    /* ignore */
  }
  return ''
}

export function getSiteOrigin(): string {
  const fromProcess = siteOriginFromProcessEnv()
  if (fromProcess) return fromProcess

  const raw = import.meta.env.VITE_SITE_ORIGIN?.trim()
  if (raw) return raw.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return SITE_FALLBACK
}

/** Escape for use in HTML attribute values. */
function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

/** Static `<head>` fragment for prerender (no document APIs). */
export function buildHeadInnerHtml(siteOrigin: string, pathname: string): string {
  const seo = resolveSeoForPathname(pathname)
  const canonical = absoluteUrl(siteOrigin, seo.path)
  const ogImage = absoluteUrl(siteOrigin, seo.ogImage ?? OG_IMAGE_META.urlPath)
  const jsonLd = buildJsonLd(siteOrigin)

  const tags: string[] = [
    `<title>${escapeHtmlAttr(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtmlAttr(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtmlAttr(seo.robots)}" />`,
    `<link rel="canonical" href="${escapeHtmlAttr(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtmlAttr(seo.ogTitle ?? seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(seo.ogDescription ?? seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtmlAttr(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtmlAttr(ogImage)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_META.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_META.height}" />`,
    `<meta property="og:image:type" content="${escapeHtmlAttr(OG_IMAGE_META.type)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtmlAttr(seo.ogTitle ?? seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtmlAttr(seo.ogDescription ?? seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtmlAttr(ogImage)}" />`,
  ]

  jsonLd.forEach((obj, i) => {
    const safeJson = JSON.stringify(obj).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json" data-seo-jsonld="${i}">${safeJson}</script>`)
  })

  return `${tags.join('\n')}\n`
}

/** Shared default OG/Twitter image (site logo); dimensions must match OG_IMAGE_META. */
export const DEFAULT_OG_IMAGE_PATH = '/symbolhorizontallogo.png'

/** Measured from public asset for og:image meta (PNG). */
export const OG_IMAGE_META = {
  urlPath: DEFAULT_OG_IMAGE_PATH,
  width: 1657,
  height: 462,
  type: 'image/png' as const,
}

export const SOCIAL_PROFILES = ['https://www.facebook.com/profile.php?id=61588945905996'] as const

const PUBLIC_ROUTES: Record<string, PageSeo> = {
  '/': {
    path: '/',
    title: 'Belac Media | Premium digital studio · Perth',
    description:
      'Belac Media helps teams take the pressure out of social media—Planable workflows, brand kits, and creative—with sites, portals, and full-stack delivery when you need operations to feel lighter, not louder.',
    robots: 'index,follow',
    ogTitle: 'Belac Media',
    ogDescription:
      'Social media relief for busy teams—clear approvals, repeatable creative, and the digital systems behind it when you need less noise and more runway.',
    ogImage: DEFAULT_OG_IMAGE_PATH,
  },
  '/privacy': {
    path: '/privacy',
    title: 'Privacy Policy | Belac Media',
    description:
      'How Belac Media handles personal information on belacmedia.com and in client engagements, aligned with the Australian Privacy Principles.',
    robots: 'index,follow',
    ogTitle: 'Privacy Policy | Belac Media',
    ogDescription:
      'Privacy Policy for Belac Media (Perth, WA): collection, use, cookies, analytics, overseas disclosure, and your rights under Australian privacy law.',
    ogImage: DEFAULT_OG_IMAGE_PATH,
  },
  '/terms': {
    path: '/terms',
    title: 'Terms of Service | Belac Media',
    description:
      'Terms of Service for Belac Media websites and creative services, including Australian Consumer Law, scope, IP, fees, and liability.',
    robots: 'index,follow',
    ogTitle: 'Terms of Service | Belac Media',
    ogDescription:
      'Terms governing use of belacmedia.com and Belac Media services, governed by the laws of Western Australia.',
    ogImage: DEFAULT_OG_IMAGE_PATH,
  },
  '/brand': {
    path: '/brand',
    title: 'Brand kit | Belac Media',
    description:
      'Official Belac Media brand kit: logos, colour tokens, typography, voice, and downloadable assets for partners.',
    robots: 'index,follow',
    ogTitle: 'Brand kit | Belac Media',
    ogDescription:
      'Logos, palette, typography, and voice guidelines for Belac Media—Perth-based premium digital studio.',
    ogImage: DEFAULT_OG_IMAGE_PATH,
  },
}

function appFallbackTitle(pathname: string): string {
  if (pathname.startsWith('/app/admin')) return 'Admin | Belac Media'
  if (pathname.startsWith('/app/client')) return 'Client portal | Belac Media'
  return 'Portal | Belac Media'
}

function appFallbackDescription(): string {
  return 'Sign in to the Belac Media client or admin portal.'
}

/** Resolve SEO for a pathname (no hash). App routes share noindex metadata. */
export function resolveSeoForPathname(pathname: string): PageSeo {
  const path = pathname.split('?')[0] || '/'
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
  const pub = PUBLIC_ROUTES[normalized]
  if (pub) return pub

  if (normalized.startsWith('/app')) {
    return {
      path: normalized,
      title: appFallbackTitle(normalized),
      description: appFallbackDescription(),
      robots: 'noindex,nofollow',
      ogTitle: appFallbackTitle(normalized),
      ogDescription: appFallbackDescription(),
      ogImage: DEFAULT_OG_IMAGE_PATH,
    }
  }

  return PUBLIC_ROUTES['/']
}

export function absoluteUrl(siteOrigin: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${siteOrigin}${path}`
}

export function buildJsonLd(siteOrigin: string): object[] {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Belac Media',
    url: `${siteOrigin}/`,
    logo: absoluteUrl(siteOrigin, DEFAULT_OG_IMAGE_PATH),
    sameAs: [...SOCIAL_PROFILES],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'hello@belacmedia.com',
      },
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Belac Media',
    url: `${siteOrigin}/`,
    publisher: { '@type': 'Organization', name: 'Belac Media' },
  }

  return [org, website]
}

export const INDEXABLE_SITEMAP_PATHS = ['/', '/privacy', '/terms', '/brand'] as const
