import { describe, expect, it } from 'vitest'
import { buildHeadInnerHtml, buildJsonLd, resolveSeoForPathname } from './seoConfig'

describe('resolveSeoForPathname', () => {
  it('returns route-specific indexable metadata for public pages', () => {
    const home = resolveSeoForPathname('/')
    const privacy = resolveSeoForPathname('/privacy')

    expect(home.robots).toBe('index,follow')
    expect(home.title).toMatch(/Belac Media/)
    expect(privacy.robots).toBe('index,follow')
    expect(privacy.title).toBe('Privacy Policy | Belac Media')
  })

  it('returns noindex metadata for app routes', () => {
    const app = resolveSeoForPathname('/app/login')
    expect(app.robots).toBe('noindex,nofollow')
    expect(app.title).toMatch(/Portal|Admin|Client/)
  })
})

describe('buildHeadInnerHtml', () => {
  const origin = 'https://belacmedia.com'

  it('includes canonical and OG tags for a public route', () => {
    const html = buildHeadInnerHtml(origin, '/terms')
    expect(html).toContain('<title>Terms of Service | Belac Media</title>')
    expect(html).toContain('<meta name="robots" content="index,follow" />')
    expect(html).toContain('<link rel="canonical" href="https://belacmedia.com/terms" />')
    expect(html).toContain('<meta property="og:image:width" content="1200" />')
    expect(html).toContain('<meta property="og:image:height" content="630" />')
    expect(html).toContain('<meta property="og:image:type" content="image/jpeg" />')
  })

  it('renders noindex robots tag for app route head', () => {
    const html = buildHeadInnerHtml(origin, '/app/login')
    expect(html).toContain('<meta name="robots" content="noindex,nofollow" />')
    expect(html).toContain('<link rel="canonical" href="https://belacmedia.com/app/login" />')
  })
})

describe('buildJsonLd', () => {
  it('returns Organization, WebSite, and ProfessionalService schemas', () => {
    const schemas = buildJsonLd('https://belacmedia.com')
    const types = schemas.map((s) => (s as { '@type'?: string })['@type'])

    expect(types).toContain('Organization')
    expect(types).toContain('WebSite')
    expect(types).toContain('ProfessionalService')
  })
})
