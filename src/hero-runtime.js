import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function initHeroCarousel() {
  const items = gsap.utils.toArray('.hero-item')
  const list = document.getElementById('carousel')
  const highlightBox = document.getElementById('highlightBox')
  const totalItems = items.length

  if (!items.length || !list || !highlightBox) return

  let itemHeight = 0
  let gap = 0
  let step = 0
  let listHeight = 0
  let highlightThreshold = 1

  const setters = items.map((item) => ({
    filter: gsap.quickSetter(item, 'filter'),
    transform: gsap.quickSetter(item, 'transform'),
    opacity: gsap.quickSetter(item, 'opacity'),
    color: gsap.quickSetter(item, 'color'),
  }))
  const setListY = gsap.quickSetter(list, 'y', 'px')

  function recalculateMetrics() {
    const listStyle = getComputedStyle(list)
    gap = parseFloat(listStyle.gap) || 0
    itemHeight = items[0]?.offsetHeight || 0
    step = itemHeight + gap
    listHeight = list.offsetHeight

    const boxHeight = highlightBox.offsetHeight
    highlightThreshold = (boxHeight / 2 + itemHeight / 2) / Math.max(step, 1)
  }

  function updateItems(progress) {
    const activeIndexFloat = progress * (totalItems - 1)
    const listCenter = listHeight / 2
    const activeTop = activeIndexFloat * step
    const offset = listCenter - (activeTop + itemHeight / 2)
    setListY(offset)

    items.forEach((item, i) => {
      const distance = Math.abs(activeIndexFloat - i)
      const influence = Math.max(0, 1 - Math.min(distance / highlightThreshold, 1))

      // Keep inactive copy AA-contrast-safe (#b3b3b3 → #ffffff)
      const blur = 3 * (1 - influence)
      const scale = 0.94 + influence * 0.06
      const opacity = 0.72 + influence * 0.28
      const colorVal = Math.round(179 + influence * 76)

      setters[i].filter(blur < 0.15 ? 'none' : `blur(${blur}px)`)
      setters[i].transform(`scale(${scale})`)
      setters[i].opacity(opacity)
      setters[i].color(`rgb(${colorVal}, ${colorVal}, ${colorVal})`)

      item.classList.toggle('active', influence > 0.7)
      item.classList.toggle('inactive', influence <= 0.7)
    })
  }

  function init() {
    recalculateMetrics()
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onUpdate: (self) => updateItems(self.progress),
    })
    updateItems(0)
  }

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      recalculateMetrics()
      ScrollTrigger.refresh()
      updateItems(ScrollTrigger.getAll()[0]?.progress || 0)
    }, 150)
  })

  init()
}

function initHeroCanvas() {
  const heroCanvas = document.getElementById('heroCanvas')
  if (!heroCanvas) return

  const heroSticky = heroCanvas.parentElement
  if (!heroSticky) return

  // Skip continuous canvas work on small/touch devices — CSS dots are enough.
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isCoarse || prefersReducedMotion) {
    heroCanvas.style.display = 'none'
    return
  }

  const ctx = heroCanvas.getContext('2d', { alpha: true })
  const dotSpacing = 42
  const interactRadius = 48
  let dots = []
  let mouse = { x: -1000, y: -1000 }
  let canvasRect = { width: 0, height: 0 }
  let rafId = 0
  let running = false

  function setupDots() {
    const rect = heroSticky.getBoundingClientRect()
    canvasRect = { width: rect.width, height: rect.height }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    heroCanvas.width = Math.floor(rect.width * dpr)
    heroCanvas.height = Math.floor(rect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    dots = []
    for (let x = 0; x < rect.width; x += dotSpacing) {
      for (let y = 0; y < rect.height; y += dotSpacing) {
        dots.push({ x, y })
      }
    }
    drawStatic()
  }

  function drawStatic() {
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height)
    ctx.fillStyle = 'rgba(220, 220, 220, 0.35)'
    for (const dot of dots) {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height)
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(220, 220, 220, 0.35)'

    for (const dot of dots) {
      const dx = dot.x - mouse.x
      const dy = dot.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < interactRadius) continue
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const dot of dots) {
      const dx = dot.x - mouse.x
      const dy = dot.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= interactRadius) continue
      const t = 1 - dist / interactRadius
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 1.5 + t * 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(220, 220, 220, ${0.35 + t * 0.65})`
      ctx.shadowBlur = t * 18
      ctx.shadowColor = 'rgba(220, 220, 220, 0.8)'
      ctx.fill()
    }

    ctx.shadowBlur = 0
    if (running) rafId = requestAnimationFrame(drawFrame)
  }

  function startLoop() {
    if (running) return
    running = true
    rafId = requestAnimationFrame(drawFrame)
  }

  function stopLoop() {
    running = false
    cancelAnimationFrame(rafId)
    drawStatic()
  }

  heroSticky.addEventListener(
    'mousemove',
    (e) => {
      const rect = heroSticky.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      startLoop()
    },
    { passive: true }
  )

  heroSticky.addEventListener('mouseleave', () => {
    mouse.x = -1000
    mouse.y = -1000
    stopLoop()
  })

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(setupDots, 150)
  })

  setupDots()
}

export function initHero() {
  initHeroCarousel()
  // Canvas is non-critical — wait for idle so it can't compete with LCP.
  const startCanvas = () => initHeroCanvas()
  if ('requestIdleCallback' in window) {
    requestIdleCallback(startCanvas, { timeout: 1800 })
  } else {
    setTimeout(startCanvas, 400)
  }
}
