import React, { useCallback, useEffect, useRef, useState } from 'react'
import Marquee from './Marquee'
import ErrorBoundary from './ErrorBoundary'
import MarqueeCube from './MarqueeCube'

const CARD_BASE_TILT = { rx: 14, ry: -22, rz: 2 }
const CARD_FLAT_TILT = { rx: 0, ry: 0, rz: 0 }
const CARD_MAX_PARALLAX = 9

function usePhoneLayout() {
  const [isPhone, setIsPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const update = () => setIsPhone(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isPhone
}

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

function useInView(threshold = 0.4) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

function WordReveal({ text, reducedMotion, baseDelay = 0, step = 70 }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span className="word-mask" key={`${word}-${index}`}>
          <span
            className="word-inner"
            style={{
              transitionDelay: reducedMotion ? '0ms' : `${baseDelay + index * step}ms`,
            }}
          >
            {word}
            {index < text.split(' ').length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </>
  )
}

function TalkToUsButton() {
  const [ctaRef, inView] = useInView(0.5)
  const reducedMotion = useReducedMotionPref()
  const revealed = reducedMotion || inView

  return (
    <div className="contact2-cta">
      <a
        ref={ctaRef}
        href="/start"
        className={`talk-cta${revealed ? ' is-revealed' : ''}${reducedMotion ? ' no-motion' : ''}`}
      >
        <span className="talk-cta-label">
          <WordReveal text="Talk to us" reducedMotion={reducedMotion} />
        </span>
        <span className="talk-cta-arrow" aria-hidden="true">→</span>
      </a>
    </div>
  )
}

function BusinessCard() {
  const tiltRef = useRef(null)
  const isPhone = usePhoneLayout()
  const baseTilt = isPhone ? CARD_FLAT_TILT : CARD_BASE_TILT
  const [tilt, setTilt] = useState(baseTilt)
  const [tracking, setTracking] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const reducedMotion = useReducedMotionPref()

  useEffect(() => {
    setTilt(baseTilt)
    setTracking(false)
  }, [baseTilt])

  const handleMouseMove = useCallback(
    (event) => {
      if (isPhone || reducedMotion || !tiltRef.current) return
      const rect = tiltRef.current.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      const ry = CARD_BASE_TILT.ry + (px - 0.5) * CARD_MAX_PARALLAX * 2
      const rx = CARD_BASE_TILT.rx - (py - 0.5) * CARD_MAX_PARALLAX * 2
      setTilt({ rx, ry, rz: CARD_BASE_TILT.rz })
    },
    [isPhone, reducedMotion]
  )

  const handleMouseEnter = useCallback(() => {
    if (isPhone || reducedMotion) return
    setTracking(true)
  }, [isPhone, reducedMotion])

  const handleMouseLeave = useCallback(() => {
    setTracking(false)
    setTilt(baseTilt)
  }, [baseTilt])

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev)
  }, [])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleFlip()
      }
    },
    [handleFlip]
  )

  return (
    <div className="bizcard-section">
      <div className="bizcard-stage">
        <div
          ref={tiltRef}
          className={`bizcard-tilt${tracking ? ' is-tracking' : ''}`}
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(${tilt.rz}deg)`,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`bizcard-flip${flipped ? ' is-flipped' : ''}${
              reducedMotion ? ' bizcard-flip--no-motion' : ''
            }`}
            onClick={handleFlip}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label="Business card. Tap to flip between email and phone."
          >
            <div className="bizcard-face bizcard-face--front">
              <svg className="bizcard-bg-icon bizcard-bg-icon--globe" viewBox="0 0 140 140" aria-hidden="true">
                <circle cx="70" cy="70" r="54" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="70" cy="70" rx="54" ry="22" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <ellipse cx="70" cy="70" rx="22" ry="54" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <line x1="16" y1="70" x2="124" y2="70" stroke="currentColor" strokeWidth="1.6" />
              </svg>

              <div className="bizcard-grid" aria-hidden="true" />
              <span className="bizcard-corner bizcard-corner--tl" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--tr" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--bl" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--br" aria-hidden="true">+</span>

              <div className="bizcard-top-row">
                <div className="bizcard-logo">AM</div>
                <div className="bizcard-tags">
                  <span className="bizcard-tag">AI WEBSITES</span>
                  <span className="bizcard-tag">INDIA</span>
                </div>
              </div>

              <div className="bizcard-hero">
                <span className="bizcard-eyebrow">01 — REACH ME DIRECT</span>
                <span className="bizcard-value">arnavmehta198@gmail.com</span>
              </div>

              <div className="bizcard-footer">
                <div className="bizcard-footer-item">
                  <span className="bizcard-footer-label">02 — STUDIO</span>
                  <span className="bizcard-footer-value">Full-stack AI build</span>
                </div>
                <div className="bizcard-footer-item">
                  <span className="bizcard-footer-label">03 — MARKET</span>
                  <span className="bizcard-footer-value">India, nationwide</span>
                </div>
                <div className="bizcard-footer-item">
                  <span className="bizcard-footer-label">04 — TURNAROUND</span>
                  <span className="bizcard-footer-value">Live in days</span>
                </div>
              </div>
            </div>

            <div className="bizcard-face bizcard-face--back">
              <svg className="bizcard-bg-icon bizcard-bg-icon--monitor" viewBox="0 0 140 140" aria-hidden="true">
                <rect x="20" y="14" width="100" height="72" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <polyline
                  points="42,50 62,68 100,32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="70" y1="86" x2="70" y2="102" stroke="currentColor" strokeWidth="2" />
                <line x1="46" y1="102" x2="94" y2="102" stroke="currentColor" strokeWidth="2" />
              </svg>

              <div className="bizcard-grid" aria-hidden="true" />
              <span className="bizcard-corner bizcard-corner--tl" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--tr" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--bl" aria-hidden="true">+</span>
              <span className="bizcard-corner bizcard-corner--br" aria-hidden="true">+</span>

              <div className="bizcard-top-row">
                <div className="bizcard-logo">AM</div>
                <div className="bizcard-tags">
                  <span className="bizcard-tag">AI WEBSITES</span>
                  <span className="bizcard-tag">INDIA</span>
                </div>
              </div>

              <div className="bizcard-hero">
                <span className="bizcard-eyebrow">01 — DIRECT LINE</span>
                <span className="bizcard-value">+1 925 204 7300</span>
              </div>

              <div className="bizcard-footer">
                <div className="bizcard-footer-item">
                  <span className="bizcard-footer-label">02 — AVAILABILITY</span>
                  <span className="bizcard-footer-value">Calls, WhatsApp, texts welcome</span>
                </div>
                <div className="bizcard-footer-item">
                  <span className="bizcard-footer-label">03 — HOURS</span>
                  <span className="bizcard-footer-value">IST, 9:00–20:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="bizcard-hint">Click to flip</p>
    </div>
  )
}

export default function ContactPage2() {
  return (
    <section className="contact2" id="contact2">
      <div className="contact2-marquee-band">
        <Marquee text="Stay in touch — Start your project — Say Hello" repeat={3} duration={44} />
        <div className="contact2-cube-layer" aria-hidden="true">
          <ErrorBoundary fallback={null}>
            <MarqueeCube />
          </ErrorBoundary>
        </div>
      </div>

      <BusinessCard />
      <TalkToUsButton />
    </section>
  )
}
