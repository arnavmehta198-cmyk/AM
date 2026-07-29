// Homepage boot — keep this file tiny so first paint isn't waiting on React/Three/GSAP.

function loadHero() {
  import('./hero-runtime.js')
    .then((mod) => mod.initHero())
    .catch((error) => console.warn('Hero runtime failed to load', error))
}

function observeOnce(element, callback, rootMargin = '300px 0px') {
  if (!element) return
  if (!('IntersectionObserver' in window)) {
    callback()
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      callback()
    },
    { rootMargin }
  )
  observer.observe(element)
}

// Defer GSAP until after LCP has a chance to settle.
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadHero, { timeout: 2500 })
} else {
  setTimeout(loadHero, 1200)
}

observeOnce(document.getElementById('profile'), () => {
  import('./mount-profile.jsx')
    .then((mod) => mod.mountProfile(document.getElementById('profile-bg-root')))
    .catch((error) => console.warn('Profile failed to load', error))
})

observeOnce(
  document.getElementById('contact-page2-root'),
  () => {
    import('./mount-contact.jsx')
      .then((mod) => mod.mountContact(document.getElementById('contact-page2-root')))
      .catch((error) => console.warn('Contact failed to load', error))
  },
  '500px 0px'
)
