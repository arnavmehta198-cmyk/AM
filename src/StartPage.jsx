import React, { useEffect, useState } from 'react'
import { submitContactForm } from './api'

function useReducedMotionPref() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (event) => setReduced(event.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function useRevealOnMount(reducedMotion) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true)
      return undefined
    }
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion])
  return revealed
}

function WordReveal({ text, reducedMotion, baseDelay = 150, step = 80 }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, index) => (
        <span className="word-mask" key={`${word}-${index}`}>
          <span
            className="word-inner"
            style={{
              transitionDelay: reducedMotion ? '0ms' : `${baseDelay + index * step}ms`,
            }}
          >
            {word}
            {index < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </>
  )
}

// Shared multi-step form shell — every step uses the exact same heading
// reveal, field-card layout, and bottom-right submit button so the format
// stays constant across the whole flow.
function FormStep({ heading, fields, values, onFieldChange, onSubmit, submitLabel, reducedMotion, submitting, error }) {
  const revealed = useRevealOnMount(reducedMotion)
  const revealClass = `${revealed ? ' is-revealed' : ''}${reducedMotion ? ' no-motion' : ''}`

  return (
    <form className="start-main" onSubmit={onSubmit}>
      <h1 className={`start-heading${revealClass}`}>
        <WordReveal text={heading} reducedMotion={reducedMotion} />
      </h1>

      <div className={`start-fields${revealClass}`}>
        {fields.map((field, index) => (
          <div
            key={field.name}
            className={`start-field-card${field.type === 'textarea' ? ' start-field-card--textarea' : ''}`}
            style={{
              transitionDelay: reducedMotion ? '0ms' : `${650 + index * 130}ms`,
              flexBasis: field.compact ? '110px' : field.type === 'textarea' ? '100%' : undefined,
              flexGrow: field.compact ? 0 : undefined,
            }}
          >
            <label htmlFor={field.id}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={(event) => onFieldChange(field.name, event.target.value)}
                rows={5}
                required
              />
            ) : (
              <input
                id={field.id}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={(event) => onFieldChange(field.name, event.target.value)}
                required
              />
            )}
          </div>
        ))}
      </div>

      {error && <div className="start-error">{error}</div>}

      <button type="submit" className={`start-submit${revealClass}`} disabled={submitting}>
        <span>{submitting ? 'Please wait…' : submitLabel}</span>
        <span className="start-submit-arrow" aria-hidden="true">→</span>
      </button>
    </form>
  )
}

function DoneStep({ firstName, reducedMotion }) {
  const revealed = useRevealOnMount(reducedMotion)
  const revealClass = `${revealed ? ' is-revealed' : ''}${reducedMotion ? ' no-motion' : ''}`

  return (
    <div className="start-main">
      <h1 className={`start-heading${revealClass}`}>
        <WordReveal
          text={`Thanks${firstName ? `, ${firstName}` : ''} — we'll be in touch soon.`}
          reducedMotion={reducedMotion}
        />
      </h1>

      <a href="/" className={`start-submit${revealClass}`}>
        <span>Back to homepage</span>
        <span className="start-submit-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  )
}

const NAME_FIELDS = [
  { name: 'firstName', id: 'start-first-name', label: 'First name', type: 'text', autoComplete: 'given-name', placeholder: 'Jane' },
  { name: 'lastName', id: 'start-last-name', label: 'Last name', type: 'text', autoComplete: 'family-name', placeholder: 'Doe' },
]

const CONTACT_FIELDS = [
  { name: 'email', id: 'start-email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'jane@doe.com' },
  { name: 'countryCode', id: 'start-country-code', label: 'Country code', type: 'tel', autoComplete: 'tel-country-code', placeholder: '+1', compact: true },
  { name: 'phone', id: 'start-phone', label: 'Phone number', type: 'tel', autoComplete: 'tel-national', placeholder: '123 456 789' },
]

const MESSAGE_FIELDS = [
  {
    name: 'message',
    id: 'start-message',
    label: 'What happened?',
    type: 'textarea',
    placeholder: "Tell us a bit about your project, idea, or what's on your mind — timeline, budget, or anything else that's helpful to know.",
  },
]

export default function StartPage() {
  const reducedMotion = useReducedMotionPref()
  const [step, setStep] = useState('name')
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '',
    phone: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleNameSubmit = (event) => {
    event.preventDefault()
    setStep('contact')
  }

  const handleContactSubmit = (event) => {
    event.preventDefault()
    setStep('message')
  }

  const handleMessageSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitContactForm(values)
      setStep('done')
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="start-page">
      <a href="/" className="start-logo" aria-label="Arnav Mehta — Home">
        AM
      </a>

      {step === 'name' && (
        <FormStep
          key="name"
          heading="Before we start, can I please get your name"
          fields={NAME_FIELDS}
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={handleNameSubmit}
          submitLabel="Continue"
          reducedMotion={reducedMotion}
        />
      )}

      {step === 'contact' && (
        <FormStep
          key="contact"
          heading={`Great${values.firstName ? `, ${values.firstName}` : ''} — how can we reach you?`}
          fields={CONTACT_FIELDS}
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={handleContactSubmit}
          submitLabel="Continue"
          reducedMotion={reducedMotion}
        />
      )}

      {step === 'message' && (
        <FormStep
          key="message"
          heading="Almost there — what happened?"
          fields={MESSAGE_FIELDS}
          values={values}
          onFieldChange={handleFieldChange}
          onSubmit={handleMessageSubmit}
          submitLabel="Finish"
          reducedMotion={reducedMotion}
          submitting={submitting}
          error={submitError}
        />
      )}

      {step === 'done' && <DoneStep key="done" firstName={values.firstName} reducedMotion={reducedMotion} />}
    </div>
  )
}
