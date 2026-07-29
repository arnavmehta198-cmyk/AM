import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

const ContactPage2 = lazy(() => import('./ContactPage2'))

export function mountContact(container) {
  if (!container || container.dataset.mounted === '1') return
  container.dataset.mounted = '1'

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <Suspense fallback={null}>
        <ContactPage2 />
      </Suspense>
    </React.StrictMode>
  )
}
