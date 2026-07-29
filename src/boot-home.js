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

let contactMountPromise = null

function mountContactSection() {
  const container = document.getElementById('contact-page2-root')
  if (!container || contactMountPromise) return contactMountPromise

  contactMountPromise = import('./mount-contact.jsx')
    .then((mod) => {
      mod.mountContact(container)
      // After React mounts, the real #contact2 exists — honor deep links.
      if (window.location.hash === '#contact2') {
        requestAnimationFrame(() => {
          document.getElementById('contact2')?.scrollIntoView({ behavior: 'smooth' })
        })
      }
    })
    .catch((error) => {
      contactMountPromise = null
      console.warn('Contact failed to load', error)
    })

  return contactMountPromise
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

// Mount contact when the stub/root nears the viewport, when the user clicks
// Contact in the nav, or when the page loads already on #contact2.
const contactRoot = document.getElementById('contact-page2-root')
observeOnce(contactRoot, mountContactSection, '600px 0px')

// Also start loading contact as the profile comes into view so the cube is
 // ready by the time the user reaches the marquee.
observeOnce(document.getElementById('profile'), mountContactSection, '200px 0px')

function maybeMountFromHash() {
  const hash = window.location.hash
  if (hash === '#contact2' || hash === '#contact-page2-root') {
    mountContactSection()
  }
}

maybeMountFromHash()
window.addEventListener('hashchange', maybeMountFromHash)

document.querySelectorAll('a[href="#contact2"], a[href="#contact-page2-root"]').forEach((link) => {
  link.addEventListener('click', () => {
    mountContactSection()
  })
})
