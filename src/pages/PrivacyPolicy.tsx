import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import '../App.css'

/** Disclosure themes aligned with APP 1.4 — Privacy Act 1988 (Cth). See OAIC guide:
 * https://www.oaic.gov.au/privacy/guidance-and-advice/guide-to-developing-an-app-privacy-policy */

export default function PrivacyPolicy() {
  return (
    <div className="page">
      <header className="header header-with-actions">
        <Link to="/" className="header-brand" aria-label="Belac Media home">
          <BrandLogo variant="header" decorative />
        </Link>
      </header>
      <main id="main-content" className="main static-main">
        <article className="legal-card legal-prose">
          <h1>Privacy Policy</h1>
          <p className="legal-prose-meta">
            <strong>Belac Media</strong> · Perth, Western Australia · Australia
            <br />
            Last updated: 6 May 2026
          </p>

          <h2>1. Purpose and Australian privacy framework</h2>
          <p>
            This Privacy Policy explains how Belac Media (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
            manages personal information when you use <strong>belacmedia.com</strong> (our
            &quot;Site&quot;) and when we communicate or deliver services to you. We prepare this
            policy to reflect the matters organisations are expected to address under{' '}
            <strong>Australian Privacy Principle 1</strong> (open and transparent management of
            personal information) in the <em>Privacy Act 1988</em> (Cth) (&quot;
            <strong>Privacy Act</strong>&quot;) and the Australian Privacy Principles (
            <strong>APPs</strong>). Guidance is published by the Office of the Australian Information
            Commissioner (
            <a
              href="https://www.oaic.gov.au/"
              target="_blank"
              rel="noopener noreferrer"
            >
              OAIC
            </a>
            ).
          </p>
          <p>
            Whether every Privacy Act obligation applies to us can depend on factors such as annual
            turnover and the nature of our activities. Regardless, we aim to handle personal
            information consistently with the APPs as described here. This policy should be read with
            our <Link to="/terms">Terms of Service</Link> and any signed service agreement.
          </p>

          <h2>2. Who we are and how to contact us</h2>
          <p>
            <strong>Entity:</strong> Belac Media (Perth, Western Australia).
            <br />
            <strong>Privacy enquiries:</strong> Privacy Officer —{' '}
            <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>
            <br />
            <strong>Postal address:</strong> we use a residential address for business correspondence and
            do <strong>not</strong> publish it on this public website. If you are or become a client, our
            postal address appears on <strong>quotes, tax invoices,</strong> and similar transaction
            documents we issue to you. Privacy and other enquiries are handled primarily by email at the
            address above.
          </p>

          <h2>3. What is personal information?</h2>
          <p>
            &quot;Personal information&quot; means information or an opinion about an identified individual,
            or an individual who is reasonably identifiable, whether true or not and whether recorded in
            material form or not (as defined in the Privacy Act).
          </p>

          <h2>4. Kinds of personal information we collect and hold</h2>
          <p>Depending on how you deal with us, this may include:</p>
          <ul>
            <li>
              <strong>Identity and contact:</strong> name, email, phone number, company or trading name,
              role/title, billing identifiers you give us.
            </li>
            <li>
              <strong>Engagement records:</strong> enquiry messages, briefs, feedback, meeting notes,
              filenames or links you supply (including URLs to social profiles or asset libraries).
            </li>
            <li>
              <strong>Technical / usage:</strong> IP-derived approximate region or time zone, device and
              browser type, Site pages or interactions, and similar diagnostics where analytics or
              hosting logs are enabled.
            </li>
          </ul>
          <p>
            We generally do <strong>not</strong> seek{' '}
            <strong>sensitive information</strong> (for example health information) as defined in the
            Privacy Act. If you voluntarily send us sensitive information, we will only use or disclose
            it as the Privacy Act permits (typically with consent or where otherwise authorised).
          </p>

          <h2>5. How we collect personal information</h2>
          <p>
            <strong>Directly from you:</strong> when you submit our contact form, email us, message us,
            contract with us, or otherwise voluntarily provide information.
          </p>
          <p>
            <strong>Indirectly:</strong> through our hosting, analytics, security or productivity tools
            (for example server logs or cookie-based analytics), and occasionally where someone refers
            your contact details to us with your knowledge.
          </p>
          <p>
            Where reasonable, you may interact with us without identifying yourself (for example
            browsing general Site pages). If you need a quote or services, we usually require a name
            and valid contact path so we can respond.
          </p>

          <h2>6. How we hold and protect personal information</h2>
          <p>
            Personal information is held electronically using reputable cloud and software providers,
            with access limited to people who need it for their role. We implement reasonable
            administrative and technical safeguards proportionate to the harm that might result from
            misuse, interference, loss, or unauthorised access (consistent with APP 11).
          </p>
          <p>
            Under the <em>Privacy Act</em>, eligible data breaches may need to be assessed and reported
            under the <strong>Notifiable Data Breaches</strong> scheme. If we determine an incident is
            likely to result in serious harm and meets reporting thresholds, we will comply with
            notification obligations and advise affected individuals when required.
          </p>

          <h2>7. Why we collect, hold, use and disclose personal information</h2>
          <p>We handle personal information for purposes including:</p>
          <ul>
            <li>responding to enquiries and onboarding clients;</li>
            <li>performing services, invoicing, and internal administration;</li>
            <li>
              operating, securing and improving our Site and workflows (including troubleshooting and
              analytics);
            </li>
            <li>sending service-related messages;</li>
            <li>complying with law, court orders, or lawful regulatory requests;</li>
            <li>
              protecting our lawful interests (for example fraud prevention, enforcing agreements,
              defending claims).
            </li>
          </ul>

          <h2>8. Portfolio, testimonials and promotional use</h2>
          <p>
            Unless you ask us otherwise (or a confidentiality obligation in your agreement restricts us),
            we may use deliverables or engagement-related materials for{' '}
            <strong>our own marketing and self-promotion</strong>, including on our Site, social
            channels, credentials decks, or case-style summaries. That use may reveal your brand or
            identify your business. Opt out any time by emailing{' '}
            <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a> with specifics.
          </p>

          <h2>9. Disclosure of personal information</h2>
          <p>We may disclose personal information to:</p>
          <ul>
            <li>
              <strong>Service providers</strong> who assist us (hosting, email delivery, CRM,
              scheduling, design/production tooling, invoicing, analytics)—only as needed for them to
              provide those services to us;
            </li>
            <li>
              <strong>Professional advisers</strong> (for example lawyers or accountants) where
              appropriate;
            </li>
            <li>
              <strong>Authorities</strong> where required or authorised by law.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> sell personal information.
          </p>

          <h2>10. Overseas disclosure</h2>
          <p>
            Some subprocessors store or process data outside Australia (commonly the{' '}
            <strong>United States</strong> and other regions where global SaaS providers operate).
            Where we disclose personal information overseas, we take reasonable steps to ensure
            overseas recipients handle it in accordance with the APPs where required (APP 8), including
            through contractual clauses appropriate to the supplier arrangement.
          </p>

          <h2>11. Cookies, Google Analytics and similar technologies</h2>
          <p>
            When you use our Site, we and our analytics providers may use cookies, pixels, SDKs or
            similar technologies to record how the Site is used and to improve performance and
            content.
          </p>
          <p>
            <strong>Google Analytics 4 (GA4):</strong> We use <strong>Google Analytics 4</strong>, a
            web analytics service operated by <strong>Google LLC</strong> (&quot;Google&quot;), when our
            Site is configured with a GA4 measurement ID. GA4 may set or read cookies (or other storage)
            and collect information such as pages and screens viewed, how you arrived at the Site,
            general location derived from IP (you can configure IP-related settings in your GA4 property
            in Google&apos;s admin), device and browser characteristics, and engagement events (for
            example scrolls or outbound clicks if you enable enhanced measurement in GA4). We use these
            statistics in aggregated form to understand traffic and improve the Site.
          </p>
          <p>
            <strong>Google Tag Manager (GTM):</strong> We may instead load{' '}
            <strong>Google Tag Manager</strong> to deploy and manage measurement tags (including GA4).
            In our frontend we normally enable <strong>either</strong> direct GA4 <strong>or</strong>{' '}
            GTM as the primary loader so measurement is not duplicated—your deployment should follow one
            primary path.
          </p>
          <p>
            Scripts are loaded from Google domains such as{' '}
            <code>www.googletagmanager.com</code> and <code>www.google-analytics.com</code>. Data may
            be processed in the United States and elsewhere (see section 10). For how Google handles
            data, see Google&apos;s{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy &amp; Terms
            </a>{' '}
            and{' '}
            <a
              href="https://support.google.com/analytics/answer/6004245"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics &amp; privacy
            </a>
            . You can use browser cookie controls, ad-blocking extensions, or Google&apos;s optional{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              browser add-on for Google Analytics
            </a>{' '}
            (where available for your browser).
          </p>
          <p>
            We may also send <strong>application events</strong> (such as form submissions or errors)
            to GA4 or to the data layer for GTM to map consistent event names for operational insight.
          </p>

          <h2>12. Direct marketing and commercial electronic messages</h2>
          <p>
            If we send you <strong>commercial electronic messages</strong> (for example promotional
            updates), we will do so in line with the <em>Spam Act 2003</em> (Cth), including providing
            a functional unsubscribe or instructions to opt out. Service-related emails about an
            existing engagement are not always &quot;commercial&quot; for Spam Act purposes but you may
            still ask us to minimise non-essential mail.
          </p>

          <h2>13. Automated decision-making</h2>
          <p>
            We do not use automated decision-making systems that produce legal or similarly significant
            effects solely by automated processing of your personal information. If that changes, we
            will update this policy as required by law.
          </p>

          <h2>14. Access and correction</h2>
          <p>
            You may request access to personal information we hold about you, or ask us to correct it,
            by contacting <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>. We will
            respond within a reasonable period. If we refuse a request (only where permitted by law), we
            will explain why and how you may complain.
          </p>

          <h2>15. Complaints</h2>
          <p>
            If you believe we have mishandled personal information or breached the APPs, please write
            to <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a> with sufficient detail.
            We will acknowledge receipt and investigate in line with OAIC guidance on complaint
            handling.
          </p>
          <p>
            If you are not satisfied with our response, you may complain to the OAIC (
            <a
              href="https://www.oaic.gov.au/privacy/privacy-complaints"
              target="_blank"
              rel="noopener noreferrer"
            >
              OAIC privacy complaints
            </a>
            ). The OAIC prefers that you raise the matter with us first unless impracticable.
          </p>

          <h2>16. Western Australian government contracts</h2>
          <p>
            The <em>Privacy and Responsible Information Sharing Act 2024</em> (WA) establishes privacy
            obligations principally for Western Australian public sector organisations and certain
            contracted arrangements. If we provide services to a WA government agency under a contract
            that expressly requires compliance with that Act (or related policies), we handle personal
            information as that contract requires <strong>in addition</strong> to this policy.
          </p>

          <h2>17. Retention</h2>
          <p>
            We retain personal information only as long as reasonably necessary for the purposes above,
            professional record-keeping, or legal/regulatory requirements. When no longer needed we
            take reasonable steps to destroy or de-identify it, subject to archival obligations.
          </p>

          <h2>18. Changes</h2>
          <p>
            We may update this Privacy Policy by posting a revised version on the Site and changing the
            &quot;Last updated&quot; date. Where changes are material and we hold your contact details,
            we may also notify you by email.
          </p>

          <h2>19. Contact</h2>
          <p>
            Privacy Officer: <a href="mailto:hello@belacmedia.com">hello@belacmedia.com</a>
          </p>
        </article>
      </main>
    </div>
  )
}
