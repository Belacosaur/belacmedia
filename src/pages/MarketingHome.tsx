import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FaFacebookSquare } from 'react-icons/fa'
import BrandLogo from '../components/BrandLogo'
import ContactForm from '../components/ContactForm'
import HeroProductVisual from '../components/marketing/HeroProductVisual'
import { trackEvent } from '../lib/analytics'
import '../App.css'
import '../marketing-design.css'

const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#onboarding', label: 'Roadmap' },
  { href: '#work', label: 'Work' },
  { href: '#process', label: 'Process' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

const ONBOARDING_STEPS = [
  {
    step: '01',
    title: 'Planable & Meta Business',
    desc: 'We get you set up on Planable and Meta Business Suite so scheduling, assets, and permissions live in one professional workflow.',
  },
  {
    step: '02',
    title: 'Full brand kit',
    desc: 'Logos (refined or net-new), typography, colour, and styling rules you can hand to any designer or channel and still look like one brand.',
  },
  {
    step: '03',
    title: 'Promotional designs for social',
    desc: 'Campaign-ready visuals sized and structured for the platforms you actually use—without a last-minute scramble every launch.',
  },
  {
    step: '04',
    title: 'Content, editing & approvals',
    desc: 'Drafting, editing, and posting with clear approvals through Planable so owners stay in control without living in the comments thread.',
  },
] as const

const sectionReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

export default function MarketingHome() {
  const [menuOpen, setMenuOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="page page--marketing-split">
      <div className="marketing-hero-zone">
        <div className="marketing-hero-bg" aria-hidden />

        <header className="header header--marketing header--on-hero">
        <Link
          to="/"
          className="header-brand"
          aria-label="Belac Media home"
          onClick={() => setMenuOpen(false)}
        >
          <BrandLogo variant="header" decorative />
        </Link>

        <nav className="bp-nav-desktop" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} className="bp-nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <Link
            to="/app"
            className="portal-entry portal-entry--quiet"
            onClick={() => trackEvent('click_cta_client_portal', { location: 'header' })}
          >
            Portal
          </Link>
          <a
            className="cta cta--nav"
            href="#contact"
            onClick={() => trackEvent('click_cta_book_call', { location: 'header' })}
          >
            Book a strategy call
          </a>
          <button
            type="button"
            className="bp-nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="bp-nav-toggle__bar" />
            <span className="bp-nav-toggle__bar" />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`bp-nav-mobile ${menuOpen ? 'bp-nav-mobile--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              className="bp-nav-mobile__link"
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/app"
            className="bp-nav-mobile__link"
            onClick={() => {
              setMenuOpen(false)
              trackEvent('click_cta_client_portal', { location: 'mobile_menu' })
            }}
          >
            Client portal
          </Link>
          <a
            className="cta"
            href="#contact"
            onClick={() => {
              setMenuOpen(false)
              trackEvent('click_cta_book_call', { location: 'mobile_menu' })
            }}
          >
            Book a strategy call
          </a>
        </nav>
      </div>

        <section className="bp-hero-split" aria-labelledby="hero-heading">
          <div className="bp-hero-copy">
            <BrandLogo variant="hero" decorative className="bp-hero-brand" />
            <p className="bp-kicker">Premium digital studio</p>
            <h1 id="hero-heading">
              Social media that <em>lifts the load</em>—not the vanity metrics.
            </h1>
            <p className="bp-hero-sub">
              We are not here to sell a guaranteed spike in reach. We are here to take the pressure
              out of feeds and approvals: Planable-first workflows, Meta Business setup, brand kits,
              and channel-ready creative—plus sites, portals, and engineering when you need the whole
              stack. Built for Australian owners who are tired of social eating the week.
            </p>
            <div className="marketing-hero__actions">
              <a
                className="cta"
                href="#contact"
                onClick={() => trackEvent('click_cta_book_call', { location: 'hero' })}
              >
                Book a strategy call
              </a>
              <a
                className="cta cta--ghost"
                href="#work"
                onClick={() => trackEvent('click_cta_view_work', { location: 'hero' })}
              >
                View our work
              </a>
            </div>
          </div>
          <HeroProductVisual />
        </section>
      </div>

      <main id="main-content" className="main marketing-main marketing-light">
        <div className="marketing-layout">
          {/* SECTION 2 — Social proof */}
          <motion.section
            className="marketing-block"
            aria-labelledby="proof-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="proof-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Operations</span>
              Calm weeks, not vanity charts
            </h2>
            <p className="marketing-section-deck bp-proof-deck">
              We care about the load coming off your desk: approvals cleared, cadence kept, fewer
              owner-hours lost to DMs and last-minute art. The grid below uses placeholder examples so
              the layout is ready—swap in client-approved operational wins when you have sign-off.
            </p>
            <div className="bp-stat-bento">
              {[
                { value: '1 hub', label: 'Planable + Meta Business in one workflow (example)' },
                { value: '30+', label: 'Websites & systems deployed (placeholder example)' },
                { value: 'Weekly', label: 'Posting rhythm held without weekend fire drills (example)' },
                { value: 'Live', label: 'Dashboards, invoices, portal (in production today)' },
              ].map((s) => (
                <motion.article
                  key={s.label}
                  className="bp-stat-card"
                  whileHover={reduce ? undefined : { y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <p className="bp-stat-card__value">{s.value}</p>
                  <p className="bp-stat-card__label">{s.label}</p>
                </motion.article>
              ))}
            </div>
            <p className="bp-proof-footnote">
              We do not trade in rented reach curves—when we publish numbers, they are tied to
              process, time returned, or delivery clients are willing to stand behind.
            </p>
          </motion.section>

          {/* SECTION 3 — Services */}
          <motion.section
            id="services"
            className="marketing-block"
            aria-labelledby="services-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="services-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Services</span>
              Less drag across every lane
            </h2>
            <p className="marketing-section-deck">
              Each lane is built to shrink tabs, surprises, and all-nighters before launch—hover the
              cards for how we think about handoffs and ownership.
            </p>
            <div className="bp-service-grid">
              {[
                {
                  title: 'Social media management',
                  preview: 'Planable · Meta Business · approvals',
                  body: 'Channel strategy, production cadence, and a calm approval loop—so social stays a system, not a second job for owners.',
                },
                {
                  title: 'Graphic design',
                  preview: 'Identity · motion · campaign art direction',
                  body: 'One coherent kit from feed to print to out-of-home—so every touchpoint looks like the same brand without you policing pixels.',
                },
                {
                  title: 'Promotional material',
                  preview: 'Ads · launches · event branding',
                  body: 'Launch packs and seasonal refreshes you can drop into the calendar—ready when the date hits, not reinvented from scratch each time.',
                },
                {
                  title: 'Full-stack development',
                  preview: 'Dashboards · portals · APIs',
                  body: 'Custom tools, admin panels, and integrations that strip admin busywork out of your team—same polish as the creative, fewer spreadsheets.',
                },
              ].map((svc) => (
                <motion.article
                  key={svc.title}
                  className="bp-service-card"
                  whileHover={reduce ? undefined : { y: -5 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                >
                  <div className="bp-service-card__preview">{svc.preview}</div>
                  <h3>{svc.title}</h3>
                  <p>{svc.body}</p>
                  <div className="bp-service-card__shine" aria-hidden />
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Onboarding roadmap (social + Planable) */}
          <motion.section
            id="onboarding"
            className="marketing-block"
            aria-labelledby="onboarding-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="onboarding-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Onboarding</span>
              Your roadmap with us
            </h2>
            <p className="marketing-section-deck">
              Social stopped being optional—it became a second job for owners. We are here to{' '}
              <strong>alleviate that pressure</strong>: clear tools, repeatable creative, and a posting
              rhythm you can trust without living inside every platform. Exposure may follow; relief is
              the product.
            </p>
            <ol className="bp-process">
              {ONBOARDING_STEPS.map((row) => (
                <li key={row.step} className="bp-process__item">
                  <span className="bp-process__step">{row.step}</span>
                  <div>
                    <h3>{row.title}</h3>
                    <p>{row.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="bp-onboarding-footnote">
              Prefer not to take the full retainer? We also take <strong>contract work</strong> and
              can <strong>tailor any package</strong>—from a brand kit refresh to campaign bursts—so
              you only buy what you need.
            </p>
          </motion.section>

          {/* SECTION 4 — Work */}
          <motion.section
            id="work"
            className="marketing-block"
            aria-labelledby="work-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="work-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Work</span>
              Featured engagements
            </h2>
            <p className="marketing-section-deck">
              Case studies follow challenge → build → how the week felt after → gallery. Swap in real
              screenshots and owner-approved notes on workload when you are ready.
            </p>
            <div className="work-grid">
              <article className="work-card">
                <div className="work-card-visual" aria-hidden />
                <div className="work-card-body">
                  <p className="work-type">Brand &amp; social</p>
                  <h3>Campaign system for a consumer launch</h3>
                  <p>
                    Identity touchpoints, reusable templates, and channel-ready assets so teams ship
                    without bottlenecks.
                  </p>
                  <p className="work-outcome">Outcome · One calendar, fewer approval loops.</p>
                </div>
              </article>
              <article className="work-card">
                <div className="work-card-visual" aria-hidden />
                <div className="work-card-body">
                  <p className="work-type">Web &amp; product</p>
                  <h3>Marketing site with a clear conversion path</h3>
                  <p>
                    UX structure, responsive build, and performance-minded implementation matched to
                    how you close leads.
                  </p>
                  <p className="work-outcome">Outcome · Less back-and-forth, clearer next steps.</p>
                </div>
              </article>
              <article className="work-card">
                <div className="work-card-visual" aria-hidden />
                <div className="work-card-body">
                  <p className="work-type">Systems</p>
                  <h3>Portal, billing, and schedules</h3>
                  <p>
                    Commercial infrastructure as polished as the creative: invoices, retainers, and
                    client-facing tools.
                  </p>
                  <p className="work-outcome">Outcome · Admin off spreadsheets, onto rails.</p>
                </div>
              </article>
            </div>
          </motion.section>

          {/* SECTION 5 — Process */}
          <motion.section
            id="process"
            className="marketing-block"
            aria-labelledby="process-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="process-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Process</span>
              Clarity from day one
            </h2>
            <ol className="bp-process">
              {[
                {
                  step: '01',
                  title: 'Discovery & boundaries',
                  desc: 'Goals, audience, constraints, and who approves what—so social work has edges, not endless scope.',
                },
                {
                  step: '02',
                  title: 'Brand & content planning',
                  desc: 'Narrative, channels, and a production roadmap your team can follow without you in every thread.',
                },
                {
                  step: '03',
                  title: 'Design & development',
                  desc: 'High-craft creative plus engineered delivery when the brief needs more than posts alone.',
                },
                {
                  step: '04',
                  title: 'Launch & steady rhythm',
                  desc: 'Ship on schedule, hand off runbooks, and keep Planable queues healthy—quiet weeks beat noisy dashboards.',
                },
              ].map((p) => (
                <li key={p.step} className="bp-process__item">
                  <span className="bp-process__step">{p.step}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* SECTION 6 — Testimonials */}
          <motion.section
            className="marketing-block"
            aria-labelledby="testimonials-heading"
            {...sectionReveal}
            transition={transition}
          >
            <h2 id="testimonials-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">Clients</span>
              Testimonials
            </h2>
            <div className="bp-testimonial">
              <p className="bp-testimonial__quote">
                We collect video and written testimonials after engagements and can provide references
                on request—no fabricated quotes on our site.
              </p>
              <p className="bp-testimonial__meta">Belac Media · integrity over filler</p>
            </div>
          </motion.section>

          {/* SECTION 7 — About + Contact */}
          <section id="about" className="marketing-block bp-about" aria-labelledby="about-heading">
            <h2 id="about-heading" className="marketing-section-title">
              <span className="marketing-section-title__label">About</span>
              Relief-first digital infrastructure
            </h2>
            <p className="bp-about__text">
              Most shops stop at campaigns or pixels. Belac Media operates as an{' '}
              <strong>operations-first partner</strong>—branding, content, automation, and full-stack
              systems in one relationship. We will not tell you we can &quot;definitely&quot; get you more
              exposure; we will help you carry the operational weight of social so owners get time and
              headspace back. Your clients should feel they are entering a{' '}
              <strong>premium digital ecosystem</strong>, not ordering one-off deliverables.
            </p>
          </section>

          <section id="contact" className="marketing-block marketing-block--contact">
            <div className="bp-finale">
              <h2 className="bp-finale__headline">
                Get social off your back—without empty reach promises.
              </h2>
              <a
                className="cta"
                href="#contact-form"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Start your project
              </a>
            </div>

            <div className="contact-split">
              <div className="contact-intro">
                <h3 className="marketing-section-title marketing-section-title--left">
                  <span className="marketing-section-title__label">Contact</span>
                  Tell us what is draining you
                </h3>
                <p className="contact-lead">
                  Tell us what you are launching—or what you want off your plate. We respond with a
                  clear plan, not a generic pitch deck. Full service, contract slices, or a tailored
                  mix: say what you need and we will scope it honestly.
                </p>
                <p className="contact-meta">
                  <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>
                </p>
              </div>
              <div className="contact-card" id="contact-form">
                <ContactForm />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer footer--marketing-light">
        <div className="footer-marketing-inner">
          <div className="footer-marketing-top">
            <Link to="/" className="footer-marketing-logo-link" aria-label="Belac Media home">
              <BrandLogo variant="footer" decorative />
            </Link>
            <a
              href="https://www.facebook.com/profile.php?id=61588945905996"
              className="footer-marketing-social"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Belac Media on Facebook"
              onClick={() => trackEvent('click_footer_facebook', { location: 'marketing_footer' })}
            >
              <FaFacebookSquare className="footer-marketing-social-icon" aria-hidden />
            </a>
          </div>
          <div className="footer-marketing-rule" aria-hidden />
          <div className="footer-marketing-bottom">
            <p className="footer-marketing-copy">
              © {new Date().getFullYear()} Belac Media · Perth, WA
            </p>
            <nav className="footer-marketing-legal" aria-label="Legal">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
