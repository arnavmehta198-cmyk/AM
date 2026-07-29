import React, { useEffect, useState } from 'react'

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

export default function Marquee({ text, repeat = 3, duration = 20, className = '' }) {
  const reducedMotion = useReducedMotion()

  const group = Array.from({ length: repeat }, (_, i) => (
    <span className="marquee-item" key={i}>
      {text}
    </span>
  ))

  return (
    <div className={`marquee ${className}`.trim()} role="marquee" aria-label={text}>
      <div
        className={`marquee-track${reducedMotion ? ' marquee-track--static' : ''}`}
        style={reducedMotion ? undefined : { animationDuration: `${duration}s` }}
      >
        <div className="marquee-group">{group}</div>
        <div className="marquee-group" aria-hidden="true">
          {group}
        </div>
      </div>
    </div>
  )
}
