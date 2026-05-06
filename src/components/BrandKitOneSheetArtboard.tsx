import { forwardRef } from 'react'
import type { CSSProperties } from 'react'
import { BRAND_KIT_COLORS, BRAND_KIT_CSS_SNIPPET, BRAND_KIT_LOGOS } from '../brand-kit-data'
import '../brand-kit-onesheet-artboard.css'

/**
 * Fixed-width (1200px) print-oriented layout for on-page preview and PNG export.
 * Tokens duplicated on the root so capture stays consistent even if parent scope changes.
 */
const ARTSHEET_VARS: CSSProperties = {
  '--bp-midnight': '#121414',
  '--bp-midnight-soft': '#1a1c1c',
  '--bp-gold': '#c5a059',
  '--bp-gold-dim': '#9a7d46',
  '--bp-surface': '#fcf8f8',
  '--bp-surface-low': '#f6f3f2',
  '--bp-on-surface': '#1c1b1b',
  '--bp-on-surface-variant': '#434747',
  '--bp-hero-ink': '#f4f0ef',
  '--bp-hero-ink-muted': 'rgba(244, 240, 239, 0.68)',
  '--font-serif': "'Noto Serif', Georgia, 'Times New Roman', serif",
  '--font-sans-marketing': "'Space Grotesk', system-ui, sans-serif",
} as CSSProperties

export const BrandKitOneSheetArtboard = forwardRef<HTMLDivElement>(function BrandKitOneSheetArtboard(
  _props,
  ref,
) {
  return (
    <div
      ref={ref}
      className="brand-kit-onesheet-artboard"
      style={ARTSHEET_VARS}
    >
      <header className="bko-header">
        <div className="bko-header__grid" aria-hidden />
        <div className="bko-header__inner">
          <div className="bko-header__copy">
            <p className="bko-eyebrow">Belac Media</p>
            <h1 className="bko-title">Brand kit</h1>
            <p className="bko-tagline">
              Premium digital studio helping businesses simplify social media and stay consistent.
            </p>
            <p className="bko-locale">— Perth, WA</p>
          </div>
          <div className="bko-header__mark">
            <img src="/logosymbol.png" alt="" width={200} height={200} decoding="async" />
          </div>
        </div>
      </header>

      <section className="bko-section bko-section--surface">
        <h2 className="bko-h2">Logo family</h2>
        <p className="bko-lede">Transparent PNGs — preserve aspect ratio.</p>
        <div className="bko-logo-grid">
          {BRAND_KIT_LOGOS.map((logo) => (
            <div key={logo.id} className="bko-logo-card">
              <div className="bko-logo-card__preview">
                <img
                  src={logo.path}
                  alt=""
                  className={logo.tall ? 'bko-logo-card__img bko-logo-card__img--tall' : 'bko-logo-card__img'}
                  decoding="async"
                />
              </div>
              <div className="bko-logo-card__body">
                <h3 className="bko-h3">{logo.title}</h3>
                <p className="bko-meta">{logo.usage}</p>
                <p className="bko-path">{logo.path}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bko-section bko-section--low">
        <h2 className="bko-h2">Colour palette</h2>
        <p className="bko-lede">CSS variable names and hex values.</p>
        <div className="bko-swatches">
          {BRAND_KIT_COLORS.map((c) => (
            <div key={c.token} className="bko-swatch">
              <div className="bko-swatch__chip" style={{ background: c.hex }} />
              <div className="bko-swatch__label">
                <strong>{c.token}</strong>
                <span className="bko-swatch__hex">{c.hex}</span>
                <span className="bko-swatch__note">{c.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bko-section bko-section--surface">
        <h2 className="bko-h2">Typography</h2>
        <p className="bko-lede">
          <strong>Noto Serif</strong> for display · <strong>Space Grotesk</strong> for UI and body (Google
          Fonts).
        </p>
        <div className="bko-type-row">
          <div className="bko-type-panel">
            <p className="bko-type-label">Serif display</p>
            <p className="bko-type-glyph bko-type-glyph--serif">Aa Bb Cc 123</p>
            <p className="bko-type-display">Belac Media</p>
            <p className="bko-type-sub">Social without the scramble</p>
            <p className="bko-type-sample bko-type-sample--serif">
              Outcome-oriented copy for Australian teams who want the feed under control.
            </p>
          </div>
          <div className="bko-type-panel">
            <p className="bko-type-label">Sans UI</p>
            <p className="bko-type-glyph bko-type-glyph--sans">Aa Bb Cc 123</p>
            <p className="bko-type-body">
              Planable-first workflows, Meta Business setup, and brand kits so approvals stay clear.
            </p>
            <p className="bko-type-caps">Premium digital studio · Perth, WA</p>
          </div>
        </div>
      </section>

      <section className="bko-section bko-section--low">
        <h2 className="bko-h2">Voice &amp; positioning</h2>
        <p className="bko-lede">Direct Australian English — operational relief, not viral promises.</p>
        <div className="bko-voice-row">
          <div className="bko-voice-col">
            <h3 className="bko-voice-h3">Sound like</h3>
            <ul className="bko-voice-ul">
              <li>Direct Australian English</li>
              <li>Workflows: Planable, Meta Business, approvals</li>
              <li>Consistency, brand alignment, honest scoping</li>
            </ul>
          </div>
          <div className="bko-voice-col">
            <h3 className="bko-voice-h3">Avoid</h3>
            <ul className="bko-voice-ul">
              <li>Promising viral reach or guaranteed spikes</li>
              <li>Growth-hack clichés</li>
              <li>Generic “boost engagement” without substance</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bko-section bko-section--surface">
        <h2 className="bko-h2">CSS reference</h2>
        <p className="bko-lede">Drop-in variables for pages that must match belacmedia.com.</p>
        <pre className="bko-pre">
          <code>{BRAND_KIT_CSS_SNIPPET}</code>
        </pre>
      </section>

      <section className="bko-section bko-section--low">
        <h2 className="bko-h2">Static files</h2>
        <p className="bko-lede">Version-controlled references.</p>
        <ul className="bko-files">
          <li>tokens.json</li>
          <li>belac-media-brand-kit.md</li>
          <li>README.md</li>
        </ul>
        <p className="bko-files-note">Served under /brand/ on the live site.</p>
      </section>

      <footer className="bko-footer">
        <img
          src="/symbolhorizontallogo.png"
          alt=""
          className="bko-footer__logo"
          width={280}
          height={48}
          decoding="async"
        />
        <div className="bko-footer__meta">
          <span>belacmedia.com</span>
          <span className="bko-footer__dot">·</span>
          <span>Perth, Western Australia</span>
        </div>
      </footer>
    </div>
  )
})
