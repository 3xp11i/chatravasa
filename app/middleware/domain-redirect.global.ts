export default defineNuxtRouteMiddleware((to) => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    const isAppDomain = hostname.startsWith('app.')
    const isMainDomain = !isAppDomain

    // Routes that should only exist on app subdomain
    const appOnlyRoutes = ['/login', '/dashboard', '/resident', '/edit-profile']
    const isAppRoute = appOnlyRoutes.some(route => to.path.startsWith(route))

    // If on main domain and trying to access an app route, redirect to the app subdomain for the current base domain
    if (isMainDomain && isAppRoute) {
      const labels = hostname.split('.')
      // Default to hostname; for common cases (example.com, www.example.com), use last two labels as base domain
      const baseDomain = labels.length >= 2 ? labels.slice(-2).join('.') : hostname
      const appHost = `app.${baseDomain}`
      const path = (to as any).fullPath ?? to.path
      const appUrl = `${protocol}//${appHost}${port ? `:${port}` : ''}${path}`
      window.location.href = appUrl
      return
    }
  }
})
