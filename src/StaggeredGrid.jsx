import React, { useEffect, useRef } from 'react'
import { animate } from 'motion'

const CELL_SIZE = 46
const MAX_COLUMNS = 22
const MAX_ROWS = 14
const RIPPLE_INTERVAL_MS = 3200
const RIPPLE_SPEED_PX_PER_SEC = 950

function getCenter(element) {
  const { left, top, width, height } = element.getBoundingClientRect()
  return { x: left + width / 2, y: top + height / 2 }
}

// Physical-stagger grid ripple, based on https://motion.dev/examples/js-staggered-grid
// Runs automatically on a repeating interval, picking a new random origin each time,
// instead of the original demo's manual "replay" trigger.
export default function StaggeredGrid() {
  const containerRef = useRef(null)
  const cellsRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function buildGrid() {
      const rect = container.getBoundingClientRect()
      const columns = Math.min(MAX_COLUMNS, Math.max(4, Math.round(rect.width / CELL_SIZE)))
      const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(rect.height / CELL_SIZE)))

      container.innerHTML = ''
      container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
      container.style.gridTemplateRows = `repeat(${rows}, 1fr)`

      const fragment = document.createDocumentFragment()
      const cells = []
      for (let i = 0; i < columns * rows; i += 1) {
        const cell = document.createElement('div')
        cell.className = 'staggered-cell'
        if (prefersReducedMotion) {
          cell.style.opacity = '0.2'
          cell.style.transform = 'scale(0.82)'
        }
        fragment.appendChild(cell)
        cells.push(cell)
      }
      container.appendChild(fragment)
      cellsRef.current = cells
    }

    function triggerRipple() {
      const cells = cellsRef.current
      if (!cells.length) return

      const originIndex = Math.floor(Math.random() * cells.length)
      const originCenter = getCenter(cells[originIndex])

      cells.forEach((cell) => {
        const center = getCenter(cell)
        const dx = center.x - originCenter.x
        const dy = center.y - originCenter.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const delay = distance / RIPPLE_SPEED_PX_PER_SEC

        animate(
          cell,
          { opacity: [0.12, 1, 0.12], scale: [0.82, 1.08, 0.82] },
          { duration: 1.1, delay, ease: 'easeInOut' }
        )
      })
    }

    buildGrid()

    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(buildGrid, 200)
    }
    window.addEventListener('resize', handleResize)

    if (prefersReducedMotion) {
      return () => {
        clearTimeout(resizeTimeout)
        window.removeEventListener('resize', handleResize)
      }
    }

    const kickoff = setTimeout(triggerRipple, 400)
    const interval = setInterval(triggerRipple, RIPPLE_INTERVAL_MS)

    return () => {
      clearTimeout(kickoff)
      clearInterval(interval)
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div className="staggered-grid" ref={containerRef} aria-hidden="true" />
}
