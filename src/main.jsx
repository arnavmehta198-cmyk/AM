import React from 'react'
import { createRoot } from 'react-dom/client'
import StaggeredGrid from './StaggeredGrid'
import ContactPage2 from './ContactPage2'

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
  root.render(
    <React.StrictMode>
      <ContactPage2 />
    </React.StrictMode>
  )
}
