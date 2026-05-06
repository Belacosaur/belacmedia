import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { BrandKitOneSheetArtboard } from '../components/BrandKitOneSheetArtboard'
import {
  BRAND_KIT_COLORS,
  BRAND_KIT_CSS_SNIPPET,
  BRAND_KIT_LOGOS,
  BRAND_KIT_ONESHEET_FILENAME,
} from '../brand-kit-data'
import { exportBrandKitOneSheetPng } from '../brand-kit-onesheet-export'
import '../App.css'
import '../marketing-design.css'
import '../brand-kit.css'

export default function BrandKit() {
  const onesheetRef = useRef<HTMLDivElement>(null)
  const [downloadBusy, setDownloadBusy] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownloadOneSheet = useCallback(async () => {
    const el = onesheetRef.current
    if (!el) return
    setDownloadError(null)
    setDownloadBusy(true)
    try {
      await exportBrandKitOneSheetPng(el)
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Could not generate PNG. Try again.')
    } finally {
      setDownloadBusy(false)
    }
  }, [])

  return (
    <div className="page page--marketing-split brand-kit-root">
      <a href="#main-content" className="brand-kit-skip">
        Skip to brand kit content
      </a>

      <header className="brand-kit-hero" aria-labelledby="brand-kit-title">
        <div className="brand-kit-hero__grid" />
        <div className="brand-kit-hero__inner">
          <div className="brand-kit-hero__copy">
            <p className="brand-kit-hero__label">Belac Media</p>
            <h1 id="brand-kit-title">Brand kit</h1>
            <p className="brand-kit-hero__lead">
              Premium digital studio — helping teams simplify social, approvals, and brand
              consistency without the vanity-metrics pitch.
            </p>
            <p className="brand-kit-hero__locale">— Perth, WA</p>
            <div className="brand-kit-hero__actions">
              <Link to="/" className="brand-kit-hero__back">
                ← Back to site
              </Link>
              <button
                type="button"
                className="brand-kit-hero__dl"
                onClick={handleDownloadOneSheet}
                disabled={downloadBusy}
              >
                {downloadBusy ? 'Preparing…' : 'Download one-sheet PNG'}
              </button>
              <a className="brand-kit-hero__dl brand-kit-hero__dl--ghost" href="/brand/tokens.json" download>
                tokens.json
              </a>
            </div>
          </div>
          <div className="brand-kit-hero__mark" aria-hidden>
            <img src="/logosymbol.png" alt="" className="brand-kit-hero__mark-img" />
          </div>
        </div>
      </header>

      <main id="main-content" className="brand-kit-main">
        <div className="brand-kit-main__inner">
          <section className="brand-kit-section brand-kit-section--onesheet" aria-labelledby="onesheet-heading">
            <div className="brand-kit-section__head">
              <h2 id="onesheet-heading">Official one-sheet</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Single-page PNG for partners — built from the same tokens as this page (not shown here
              to avoid duplicating the sections below).
            </p>
            <div
              className="brand-kit-onesheet"
              role="group"
              aria-label="Download Belac Media brand kit one-sheet PNG"
            >
              <div className="brand-kit-onesheet__capture-root" aria-hidden>
                <BrandKitOneSheetArtboard ref={onesheetRef} />
              </div>
              <div className="brand-kit-onesheet__cap">
                {downloadError ? (
                  <p className="brand-kit-onesheet__err" role="alert">
                    {downloadError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="brand-kit-onesheet__dl"
                  onClick={handleDownloadOneSheet}
                  disabled={downloadBusy}
                >
                  {downloadBusy ? 'Preparing…' : 'Download PNG'}
                </button>
                <span className="brand-kit-onesheet__file">{BRAND_KIT_ONESHEET_FILENAME}</span>
              </div>
            </div>
          </section>

          <section
            className="brand-kit-section brand-kit-section--band"
            aria-labelledby="logos-heading"
          >
            <div className="brand-kit-section__head">
              <h2 id="logos-heading">Logo family</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Transparent PNGs. Preserve aspect ratio; no decorative plates on midnight backgrounds.
            </p>
            <div className="brand-kit-grid brand-kit-grid--logos">
              {BRAND_KIT_LOGOS.map((logo) => (
                <article key={logo.id} className="brand-kit-card brand-kit-card--logo">
                  <div
                    className={`brand-kit-card__preview brand-kit-card__preview--${logo.preview}${
                      logo.tall ? ' brand-kit-card__preview--hero' : ''
                    }`}
                  >
                    <img src={logo.path} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="brand-kit-card__body">
                    <h3>{logo.title}</h3>
                    <p>{logo.usage}</p>
                    <div className="brand-kit-card__meta">{logo.path}</div>
                    <a className="brand-kit-card__link" href={logo.path} download>
                      Download PNG
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="brand-kit-section" aria-labelledby="colour-heading">
            <div className="brand-kit-section__head">
              <h2 id="colour-heading">Colour palette</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Tokens live on <code className="brand-kit-inline-code">.page--marketing-split</code> in
              CSS — mirror these hex values in Figma or print.
            </p>
            <div className="brand-kit-swatches">
              {BRAND_KIT_COLORS.map((c) => (
                <div key={c.token} className="brand-kit-swatch">
                  <div className="brand-kit-swatch__chip" style={{ background: c.hex }} />
                  <div className="brand-kit-swatch__label">
                    <strong>{c.token}</strong>
                    <span className="brand-kit-swatch__hex">{c.hex}</span>
                    <span className="brand-kit-swatch__note">{c.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="brand-kit-section brand-kit-section--band"
            aria-labelledby="type-heading"
          >
            <div className="brand-kit-section__head">
              <h2 id="type-heading">Typography</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              <strong>Noto Serif</strong> for display and editorial headlines.{' '}
              <strong>Space Grotesk</strong> for UI, body, and labels — via Google Fonts on the live
              site.
            </p>
            <div className="brand-kit-type-grid">
              <div className="brand-kit-type-panel">
                <p className="brand-kit-type-panel__label">Serif display · Noto Serif</p>
                <p className="brand-kit-type-panel__glyph serif">Aa Bb Cc 123</p>
                <p className="brand-kit-type-panel__display">Belac Media</p>
                <p className="brand-kit-type-panel__subdisplay">Social without the scramble</p>
                <p className="brand-kit-type-panel__sample serif">
                  Outcome-oriented copy for Australian teams who want the feed under control, not
                  louder for its own sake.
                </p>
              </div>
              <div className="brand-kit-type-panel">
                <p className="brand-kit-type-panel__label">Sans UI · Space Grotesk</p>
                <p className="brand-kit-type-panel__glyph sans">Aa Bb Cc 123</p>
                <p className="brand-kit-type-panel__body sans">
                  Planable-first workflows, Meta Business setup, and brand kits so approvals stay
                  clear and every channel still reads as one brand.
                </p>
                <p className="brand-kit-type-panel__caps">Premium digital studio · Perth, WA</p>
              </div>
            </div>
          </section>

          <section className="brand-kit-section" aria-labelledby="voice-heading">
            <div className="brand-kit-section__head">
              <h2 id="voice-heading">Voice &amp; positioning</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              <strong>Modern Australian Premium</strong> — calm, specific, operational. Lead with
              relief and systems, not viral promises.
            </p>
            <div className="brand-kit-voice brand-kit-voice--elevated">
              <div className="brand-kit-voice__col">
                <h3>Sound like</h3>
                <ul>
                  <li>Direct Australian English</li>
                  <li>Workflows: Planable, Meta Business, approvals</li>
                  <li>Consistency, brand alignment, honest scoping</li>
                </ul>
              </div>
              <div className="brand-kit-voice__col">
                <h3>Avoid</h3>
                <ul>
                  <li>Promising viral reach or guaranteed spikes</li>
                  <li>Growth-hack clichés</li>
                  <li>Generic “boost engagement” without substance</li>
                </ul>
              </div>
            </div>
          </section>

          <section
            className="brand-kit-section brand-kit-section--band"
            aria-labelledby="css-heading"
          >
            <div className="brand-kit-section__head">
              <h2 id="css-heading">CSS reference</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Drop-in variables for landing pages or email HTML that must match belacmedia.com.
            </p>
            <pre className="brand-kit-pre">
              <code>{BRAND_KIT_CSS_SNIPPET}</code>
            </pre>
          </section>

          <section className="brand-kit-section" aria-labelledby="files-heading">
            <div className="brand-kit-section__head">
              <h2 id="files-heading">Static files</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Version-controlled under <code className="brand-kit-inline-code">/brand/</code>.
            </p>
            <div className="brand-kit-files brand-kit-files--pills">
              <a href="/brand/tokens.json">tokens.json</a>
              <a href="/brand/belac-media-brand-kit.md">belac-media-brand-kit.md</a>
              <a href="/brand/README.md">README.md</a>
            </div>
          </section>

          <section
            className="brand-kit-section brand-kit-section--band"
            aria-labelledby="live-heading"
          >
            <div className="brand-kit-section__head">
              <h2 id="live-heading">Live header mark</h2>
              <span className="brand-kit-section__rule" aria-hidden />
            </div>
            <p className="brand-kit-section__lede">
              Production <code className="brand-kit-inline-code">BrandLogo</code> — responsive
              symbol → letter → horizontal.
            </p>
            <div className="brand-kit-live-preview">
              <BrandLogo variant="header" decorative />
            </div>
          </section>
        </div>
      </main>

      <footer className="brand-kit-footer">
        <div className="brand-kit-footer__inner">
          <img
            src="/symbolhorizontallogo.png"
            alt="Belac Media"
            className="brand-kit-footer__logo"
          />
          <div className="brand-kit-footer__meta">
            <span>belacmedia.com</span>
            <span className="brand-kit-footer__dot" aria-hidden>
              ·
            </span>
            <span>Perth, Western Australia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
