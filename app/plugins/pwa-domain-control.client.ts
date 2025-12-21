export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    const labels = hostname.split('.')
    const baseDomain = labels.length >= 2 ? labels.slice(-2).join('.') : hostname
    const appHost = `app.${baseDomain}`
    const isAppDomain = hostname === appHost || hostname.startsWith('app.')

    // Only keep PWA on app.* subdomain
    // On main domain, unregister any existing service workers
    if (!isAppDomain && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister())
      })
    }
  }
})
