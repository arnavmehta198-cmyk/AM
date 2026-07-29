import React from 'react'
import { createRoot } from 'react-dom/client'
import StaggeredGrid from './StaggeredGrid'
import { initTextGlitch } from './text-glitch'

export function mountProfile(container) {
  if (!container || container.dataset.mounted === '1') return
  container.dataset.mounted = '1'

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <StaggeredGrid />
    </React.StrictMode>
  )

  initTextGlitch({
    selector: '#glitchText',
    text: 'Arnav Mehta',
    glitchColor1: '#00fff9',
    glitchColor2: '#ff00c1',
    glitchIntensity: 90,
    glitchSpeed: 3.0,
    smoothness: 10,
    animationMode: 'continuous',
    glitchStyle: 'rgbSplit',
  })
}
