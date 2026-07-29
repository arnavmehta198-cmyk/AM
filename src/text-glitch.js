/**
 * TextGlitch - vanilla JS digital-distortion text effect.
 */
export function initTextGlitch(options) {
  const {
    selector,
    text,
    glitchColor1 = '#00fff9',
    glitchColor2 = '#ff00c1',
    glitchIntensity = 50,
    glitchSpeed = 1.2,
    smoothness = 60,
    animationMode = 'continuous',
    glitchStyle = 'rgbSplit',
  } = options

  const element = document.querySelector(selector)
  if (!element || element.classList.contains('text-glitch')) return

  const displayText = text || element.textContent
  const uniqueId = `tg-${Math.random().toString(36).slice(2, 9)}`
  const normalizedIntensity = Math.max(0, Math.min(100, glitchIntensity))
  const maxOffset = 6 + (normalizedIntensity / 100) * 14
  const animDuration = Math.max(0.2, 2.2 - glitchSpeed)

  let easing
  if (smoothness < 30) easing = 'steps(4, jump-end)'
  else if (smoothness > 80) easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  else easing = 'ease-in-out'

  element.textContent = ''
  element.classList.add('text-glitch')

  const base = document.createElement('span')
  base.className = 'text-glitch-base'
  base.textContent = displayText
  base.setAttribute('aria-hidden', 'true')

  const layer1 = document.createElement('span')
  layer1.className = 'text-glitch-layer'
  layer1.textContent = displayText
  layer1.style.color = glitchColor1
  layer1.setAttribute('aria-hidden', 'true')

  const layer2 = document.createElement('span')
  layer2.className = 'text-glitch-layer'
  layer2.textContent = displayText
  layer2.style.color = glitchColor2
  layer2.setAttribute('aria-hidden', 'true')

  const accessible = document.createElement('span')
  accessible.className = 'sr-only'
  accessible.textContent = displayText

  element.appendChild(accessible)
  element.appendChild(base)
  element.appendChild(layer1)
  element.appendChild(layer2)

  const styleId = `style-${uniqueId}`
  let styleTag = document.getElementById(styleId)
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = styleId
    document.head.appendChild(styleTag)
  }

  function generateChaosClip(seed) {
    const bands = 5 + Math.floor(Math.random() * 4)
    const step = 100 / bands
    const points = []
    for (let i = 0; i < bands; i += 1) {
      const y1 = i * step
      const y2 = (i + 1) * step
      const shift = (Math.random() - 0.5) * (normalizedIntensity / 2) + seed * 2
      points.push(`${shift}% ${y1}%`, `${100 + shift}% ${y1}%`, `${100 + shift}% ${y2}%`, `${shift}% ${y2}%`)
    }
    return `polygon(${points.join(', ')})`
  }

  function generateClassicKeyframes() {
    const steps = 10
    let kf = `@keyframes glitchClassic1-${uniqueId} {`
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.random() * maxOffset
      const y = Math.random() * (maxOffset / 2)
      kf += `${(i / steps) * 100}%{transform:translate(${x}px,${y}px);opacity:${0.6 + Math.random() * 0.4};}`
    }
    kf += '}@keyframes glitchClassic2-' + uniqueId + ' {'
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.random() * maxOffset
      const y = Math.random() * (maxOffset / 2)
      kf += `${(i / steps) * 100}%{transform:translate(${x}px,${y}px);opacity:${0.6 + Math.random() * 0.4};}`
    }
    kf += '}'
    return kf
  }

  function generateRGBKeyframes() {
    return `
      @keyframes rgbSplit1-${uniqueId} {
        0%, 100% { transform: translate(${maxOffset * 0.8}px, ${maxOffset * 0.4}px); opacity: 0.85; }
        25% { transform: translate(${maxOffset}px, ${maxOffset * 0.2}px); opacity: 0.7; }
        50% { transform: translate(${maxOffset * 0.5}px, ${maxOffset}px); opacity: 0.9; }
        75% { transform: translate(${maxOffset * 0.6}px, ${maxOffset * 0.6}px); opacity: 0.75; }
      }
      @keyframes rgbSplit2-${uniqueId} {
        0%, 100% { transform: translate(${maxOffset * 0.8}px, ${maxOffset * 0.4}px); opacity: 0.85; }
        25% { transform: translate(${maxOffset}px, ${maxOffset * 0.2}px); opacity: 0.7; }
        50% { transform: translate(${maxOffset * 0.5}px, ${maxOffset}px); opacity: 0.9; }
        75% { transform: translate(${maxOffset * 0.6}px, ${maxOffset * 0.6}px); opacity: 0.75; }
      }
    `
  }

  function generateChaosKeyframes() {
    const steps = 8
    let k1 = `@keyframes chaos1-${uniqueId} {`
    let k2 = `@keyframes chaos2-${uniqueId} {`
    for (let i = 0; i <= steps; i += 1) {
      const skew = Math.random() * (normalizedIntensity / 3)
      const scale = 1 + Math.random() * 0.08
      const x1 = Math.random() * maxOffset * 1.5
      const y1 = Math.random() * (maxOffset / 3)
      const x2 = x1 * 0.7
      const y2 = y1 * 1.2
      k1 += `${(i / steps) * 100}%{transform:translate(${x1}px,${y1}px) skewX(${skew}deg) scale(${scale});opacity:${0.5 + Math.random() * 0.5};}`
      k2 += `${(i / steps) * 100}%{transform:translate(${x2}px,${y2}px) skewX(${skew}deg) scale(${scale});opacity:${0.5 + Math.random() * 0.5};}`
    }
    k1 += '}'
    k2 += '}'
    return k1 + k2
  }

  function updateKeyframes() {
    let keyframes = ''
    if (glitchStyle === 'classic') keyframes = generateClassicKeyframes()
    else if (glitchStyle === 'chaos') keyframes = generateChaosKeyframes()
    else keyframes = generateRGBKeyframes()
    styleTag.textContent = keyframes
  }

  updateKeyframes()

  function getAnimationName(index) {
    if (glitchStyle === 'classic') return `glitchClassic${index}-${uniqueId}`
    if (glitchStyle === 'chaos') return `chaos${index}-${uniqueId}`
    return `rgbSplit${index}-${uniqueId}`
  }

  let chaosInterval = null
  let timingTimeout = null

  const GLITCH_MIN_DELAY = 3000
  const GLITCH_MAX_DELAY = 7000
  const GLITCH_MIN_DURATION = 150
  const GLITCH_MAX_DURATION = 400

  function randomRange(min, max) {
    return Math.random() * (max - min) + min
  }

  function triggerGlitchBurst() {
    const durationMs = randomRange(GLITCH_MIN_DURATION, GLITCH_MAX_DURATION)
    const durationS = durationMs / 1000

    element.classList.add('glitching')
    layer1.style.animation = `${getAnimationName(1)} ${durationS}s ${easing} forwards`
    layer2.style.animation = `${getAnimationName(2)} ${durationS}s ${easing} forwards`

    timingTimeout = setTimeout(() => {
      element.classList.remove('glitching')
      layer1.style.animation = 'none'
      layer2.style.animation = 'none'
      timingTimeout = setTimeout(triggerGlitchBurst, randomRange(GLITCH_MIN_DELAY, GLITCH_MAX_DELAY))
    }, durationMs)
  }

  function startAnimations() {
    timingTimeout = setTimeout(triggerGlitchBurst, 0)

    if (glitchStyle === 'chaos') {
      layer1.style.clipPath = generateChaosClip(-1)
      layer2.style.clipPath = generateChaosClip(1)
      chaosInterval = setInterval(() => {
        layer1.style.clipPath = generateChaosClip(-1)
        layer2.style.clipPath = generateChaosClip(1)
      }, 120)
    }
  }

  function stopAnimations() {
    element.classList.remove('glitching')
    layer1.style.animation = 'none'
    layer2.style.animation = 'none'
    if (chaosInterval) {
      clearInterval(chaosInterval)
      chaosInterval = null
    }
    if (timingTimeout) {
      clearTimeout(timingTimeout)
      timingTimeout = null
    }
  }

  if (animationMode === 'continuous') {
    startAnimations()
  } else {
    element.addEventListener('mouseenter', startAnimations)
    element.addEventListener('mouseleave', stopAnimations)
  }

  // silence unused warning in some builds
  void animDuration
}
