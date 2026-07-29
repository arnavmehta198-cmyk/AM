import React from 'react'
import { createRoot } from 'react-dom/client'
import StartPage from './StartPage'

const container = document.getElementById('start-page-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <StartPage />
    </React.StrictMode>
  )
}
