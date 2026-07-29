import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import StaggeredGrid from './StaggeredGrid'

// Contact section (and its Three.js cube) load only when needed so the
// hero/about can paint without waiting on the heavy 3D bundle.
const ContactPage2 = lazy(() => import('./ContactPage2'))

const profileBgContainer = document.getElementById('profile-bg-root')
if (profileBgContainer) {
  const root = createRoot(profileBgContainer)
  root.render(
    <React.StrictMode>
      <StaggeredGrid />
    </React.StrictMode>
  )
}

const contactPage2Container = document.getElementById('contact-page2-root')
if (contactPage2Container) {
  const root = createRoot(contactPage2Container)

  const mountContact = () => {
    root.render(
      <React.StrictMode>
        <Suspense fallback={null}>
          <ContactPage2 />
        </Suspense>
      </React.StrictMode>
    )
  }

  // Defer mounting until the contact root is near the viewport (or idle).
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        mountContact()
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(contactPage2Container)
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(mountContact, { timeout: 2000 })
  } else {
    setTimeout(mountContact, 1)
  }
}
