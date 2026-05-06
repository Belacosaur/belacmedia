import { afterEach, describe, expect, it, vi } from 'vitest'

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('pushes event payload to dataLayer when GA/GTM not configured', async () => {
    const { trackEvent } = await import('./analytics')
    const win = window as Window & { dataLayer: unknown[] }
    win.dataLayer = []
    trackEvent('submit_contact_form', { location: 'hero' })
    expect(win.dataLayer).toHaveLength(1)
    expect(win.dataLayer[0]).toMatchObject({
      event: 'submit_contact_form',
      location: 'hero',
    })
  })

  it('uses gtag for custom events when GA4 measurement ID is set', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTXXXXXX')
    const { initAnalytics, trackEvent } = await import('./analytics')

    window.dataLayer = []
    initAnalytics()

    expect(typeof window.gtag).toBe('function')

    trackEvent('submit_contact_form', { location: 'footer' })

    const dl = window.dataLayer as unknown[]
    const eventCmd = dl.find(
      (row) => Array.isArray(row) && row[0] === 'event' && row[1] === 'submit_contact_form',
    ) as unknown[] | undefined

    expect(eventCmd).toBeDefined()
    expect(eventCmd![2]).toMatchObject({ location: 'footer' })
  })
})

describe('trackPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('sends GA4 config page_view when GA4 is enabled', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-PAGEXXXXXX')
    const { initAnalytics, trackPage } = await import('./analytics')

    window.dataLayer = []
    document.title = 'Test title'

    initAnalytics()
    trackPage('/privacy?utm=x')

    const dl = window.dataLayer as unknown[]
    const configCmd = dl.find(
      (row) =>
        Array.isArray(row) &&
        row[0] === 'config' &&
        row[1] === 'G-PAGEXXXXXX' &&
        typeof row[2] === 'object' &&
        row[2] !== null &&
        'page_path' in (row[2] as object),
    ) as unknown[] | undefined

    expect(configCmd).toBeDefined()
    expect(configCmd![2]).toMatchObject({
      page_path: '/privacy?utm=x',
      page_title: 'Test title',
      page_location: `${window.location.origin}/privacy?utm=x`,
    })
  })
})
