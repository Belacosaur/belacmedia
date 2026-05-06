import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../App.css'

export default function Terms() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
      </header>
      <main id="main-content" className="main static-main">
        <article className="legal-card legal-prose">
          <h1>Terms of Service</h1>
          <p className="legal-prose-meta">
            <strong>Belac Media</strong>
            <br />
            Last updated: 6 May 2026
          </p>

          <p>
            These Terms of Service (&quot;Terms&quot;) apply to your use of this website and to any
            services Belac Media (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) agrees to provide
            you. Specific engagements are also governed by a signed proposal, statement of work, or
            service agreement (&quot;Service Agreement&quot;). If anything in these Terms conflicts
            with your Service Agreement, the Service Agreement prevails for that engagement.
          </p>

          <h2>1. Accepting these terms</h2>
          <p>
            By using our website, requesting a quote, or entering into a Service Agreement, you agree
            to these Terms. If you do not agree, do not use our site or engage our services.
          </p>

          <h2>2. Australian Consumer Law</h2>
          <p>
            Nothing in these Terms restricts, excludes, or modifies any right or remedy you may have
            under the <em>Competition and Consumer Act 2010</em> (Cth), Schedule 2 (
            <strong>Australian Consumer Law</strong> or <strong>ACL</strong>), or other laws that cannot
            lawfully be limited. If you are a &quot;consumer&quot; under the ACL, certain statutory{' '}
            <strong>consumer guarantees</strong> apply to services we supply in trade or commerce.
            Those guarantees exist independently of these Terms.
          </p>
          <p>
            Where we supply services under a <strong>standard form consumer</strong> or{' '}
            <strong>small business contract</strong> (as those expressions are defined in the ACL),
            unfair contract terms may be void under Part 2-3 of the ACL. Only a court or tribunal can
            decide whether a term is unfair. Information for consumers and small businesses is
            published by the{' '}
            <a href="https://www.accc.gov.au/consumers" target="_blank" rel="noopener noreferrer">
              ACCC
            </a>
            .
          </p>
          <p>
            Subject to the ACL and any other non-excludable laws, our liability is limited as set out
            in section 11 below.
          </p>

          <h2>3. What we provide</h2>
          <p>
            We offer creative and operational support related to your digital presence—for example
            brand-aligned visuals, social content workflows, scheduling tooling guidance (such as
            platforms like Planable or Meta Business Suite where relevant), and related consultancy.
            The exact scope, deliverables, milestones, and fees are set out in your Service Agreement.
          </p>

          <h2>4. No promise of &quot;viral&quot; results or guaranteed growth</h2>
          <p>
            Our role is to help you <strong>progress your digital presence</strong> with{' '}
            <strong>consistency in posting</strong> and <strong>alignment in branding</strong>—not to
            promise spikes in reach, impressions, followers, engagement, leads, or revenue.
          </p>
          <ul>
            <li>
              We do <strong>not</strong> guarantee that content will go viral, trend, or achieve any
              particular level of visibility on social platforms or elsewhere.
            </li>
            <li>
              We do <strong>not</strong> promise a &quot;boost&quot; in social metrics. Algorithms,
              competition, seasonality, ad spend, platform rules, and audience behaviour are outside
              our control.
            </li>
            <li>
              Exceptional reach or viral-style performance may occur, but if it does it is{' '}
              <strong>incidental</strong> and <strong>not</strong> something we commit to delivering.
            </li>
          </ul>
          <p>
            Past examples or case references (if any) are illustrative only and do not guarantee
            similar outcomes for you.
          </p>

          <h2>5. Your responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate information, timely feedback, and approved assets when requested.</li>
            <li>
              Maintain your own accounts on third-party platforms (for example Meta or scheduling
              tools) and comply with those platforms&apos; terms and policies.
            </li>
            <li>
              Ensure you have the rights to any materials you supply (logos, photos, music, etc.).
            </li>
          </ul>

          <h2>6. Intellectual property</h2>
          <p>
            Unless your Service Agreement says otherwise: we retain rights to our processes,
            templates, and pre-existing materials; client-specific deliverables and transfers of
            ownership or licence are as specified in the Service Agreement.
          </p>

          <h2>7. Fees and payment</h2>
          <p>
            Fees, invoicing, deposits, expenses, and late payment terms are set out in your Service
            Agreement. Failure to pay amounts due may result in suspension or termination of work as
            described there.
          </p>

          <h2>8. Third-party platforms and tools</h2>
          <p>
            We may use or recommend third-party products (hosting, scheduling,{' '}
            <strong>analytics</strong> such as Google Analytics 4 or Google Tag Manager on our public
            Site as described in our <Link to="/privacy">Privacy Policy</Link>, advertising interfaces,
            etc.). Those services are provided by their respective vendors; your use is subject to their
            terms. We are not responsible for outages, policy changes, or actions those platforms take
            regarding your content or accounts.
          </p>

          <h2>9. Confidentiality</h2>
          <p>
            Each party will treat non-public business information shared for the engagement as
            confidential, except where disclosure is required by law or already public. Further
            confidentiality obligations may appear in your Service Agreement.
          </p>

          <h2>10. Privacy</h2>
          <p>
            Our handling of personal information is described in our{' '}
            <Link to="/privacy">Privacy Policy</Link>, prepared with reference to the{' '}
            <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles.
          </p>

          <h2>11. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by applicable law (including the ACL), we are not liable
            for indirect or consequential loss, lost profits, or lost opportunities—including any
            claim tied to social metrics or virality.
          </p>
          <p>
            Where liability cannot be excluded or capped under the ACL or other non-excludable laws,
            our liability is governed by those laws. Otherwise, our aggregate liability arising out
            of or relating to an engagement is limited to the fees you paid us for that engagement in
            the twelve (12) months before the claim, unless your Service Agreement sets a different
            cap.
          </p>

          <h2>12. Termination</h2>
          <p>
            Either party may terminate an engagement as set out in the Service Agreement. Provisions
            that reasonably should survive (including intellectual property, confidentiality, and
            limitation of liability) continue after termination.
          </p>

          <h2>13. Electronic communications</h2>
          <p>
            You consent to us communicating with you electronically (including email and messaging
            tools we use in delivering services). You are responsible for supplying accurate contact
            details and for virus-filtering or technical barriers at your end that might block our
            messages.
          </p>

          <h2>14. Disputes</h2>
          <p>
            The parties will attempt to resolve disputes in good faith through direct discussion. If
            you are a consumer and believe we have breached the ACL, you may contact{' '}
            <a href="https://www.accc.gov.au/consumers" target="_blank" rel="noopener noreferrer">
              ACCC
            </a>{' '}
            or{' '}
            <a
              href="https://www.consumerprotection.wa.gov.au/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consumer Protection Western Australia
            </a>{' '}
            for information about your options. Nothing in this section prevents you from exercising
            any non-waivable statutory right.
          </p>

          <h2>15. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time by posting a revised version on this page.
            The &quot;Last updated&quot; date will change accordingly. Continued use of the site or new
            engagements after updates constitutes acceptance of the revised Terms, except where your
            signed Service Agreement expressly overrides them or non-excludable law applies.
          </p>

          <h2>16. Governing law</h2>
          <p>
            These Terms are governed by the laws of Western Australia, Australia. Courts in Western
            Australia have non-exclusive jurisdiction, subject to any mandatory protections that
            apply where you are located.
          </p>

          <h2>17. Contact</h2>
          <p>
            Questions about these Terms or your engagement:{' '}
            <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>.
          </p>
        </article>
      </main>
    </div>
  )
}
