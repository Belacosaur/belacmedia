import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitContactLead } from '../api'
import { trackEvent } from '../lib/analytics'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) {
      setState('error')
      setError('Please enter your name.')
      return
    }
    if (!emailPattern.test(email.trim())) {
      setState('error')
      setError('Please enter a valid email.')
      return
    }
    if (message.trim().length < 20) {
      setState('error')
      setError('Please share at least 20 characters about your project.')
      return
    }

    setState('submitting')
    trackEvent('submit_contact_form')
    try {
      await submitContactLead({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || null,
        message: message.trim(),
        website: website.trim() || null,
      })
      setState('success')
      setName('')
      setEmail('')
      setCompany('')
      setMessage('')
      setWebsite('')
      trackEvent('submit_contact_form_success')
    } catch (submitError) {
      setState('error')
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit your request.')
      trackEvent('submit_contact_form_error')
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <label className="field">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        Work email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="field">
        Company (optional)
        <input value={company} onChange={(e) => setCompany(e.target.value)} />
      </label>
      <label className="field">
        Project goals
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>

      {/* Honeypot: should stay empty for real users */}
      <label className="hp-field" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>

      <button type="submit" className="cta" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending...' : 'Send request'}
      </button>

      {state === 'success' ? (
        <p className="success-text" role="status">
          Thanks, your request has been received. We will reply shortly.
        </p>
      ) : null}
      {state === 'error' && error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
