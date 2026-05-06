import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  absoluteUrl,
  buildJsonLd,
  getSiteOrigin,
  OG_IMAGE_META,
  resolveSeoForPathname,
} from '../seo/seoConfig.ts'

function qsMetaName(name: string) {
  return `meta[name="${name}"]`
}

function qsMetaProperty(property: string) {
  return `meta[property="${property}"]`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? qsMetaName(key) : qsMetaProperty(key)
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"][data-seo="1"]`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertAlternateHrefLang(lang: string, href: string) {
  const selector = `link[rel="alternate"][hreflang="${lang}"][data-seo="1"]`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', lang)
    el.setAttribute('data-seo', '1')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function replaceJsonLd(payloads: object[]) {
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove())
  payloads.forEach((obj, i) => {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.setAttribute('data-seo-jsonld', String(i))
    s.textContent = JSON.stringify(obj)
    document.head.appendChild(s)
  })
}

/** Updates document head from route + centralized SEO config (client-side SPA). */
export default function SeoHead() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname || '/'
    const seo = resolveSeoForPathname(pathname)
    const origin = getSiteOrigin()
    const canonical = absoluteUrl(origin, seo.path)
    const ogImage = absoluteUrl(origin, seo.ogImage ?? OG_IMAGE_META.urlPath)

    document.title = seo.title

    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'robots', seo.robots)

    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:title', seo.ogTitle ?? seo.title)
    upsertMeta('property', 'og:description', seo.ogDescription ?? seo.description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:site_name', 'Belac Media')
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:width', String(OG_IMAGE_META.width))
    upsertMeta('property', 'og:image:height', String(OG_IMAGE_META.height))
    upsertMeta('property', 'og:image:type', OG_IMAGE_META.type)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.ogTitle ?? seo.title)
    upsertMeta('name', 'twitter:description', seo.ogDescription ?? seo.description)
    upsertMeta('name', 'twitter:image', ogImage)
    upsertMeta('name', 'twitter:site', '@belacmedia')

    upsertAlternateHrefLang('en-AU', canonical)
    upsertAlternateHrefLang('x-default', canonical)

    replaceJsonLd(buildJsonLd(origin))
  }, [location.pathname])

  return null
}
