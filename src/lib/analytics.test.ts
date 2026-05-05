import { describe, expect, it } from 'vitest'
import { trackEvent } from './analytics'

describe('trackEvent', () => {
  it('pushes event payload to dataLayer', () => {
    const win = window as Window & { dataLayer: Record<string, unknown>[] }
    win.dataLayer = []
    trackEvent('submit_contact_form', { location: 'hero' })
    expect(win.dataLayer).toHaveLength(1)
    expect(win.dataLayer[0]).toMatchObject({
      event: 'submit_contact_form',
      location: 'hero',
    })
  })
})
