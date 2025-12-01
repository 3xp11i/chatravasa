// FILE: app/middleware/auth.global.ts
// PURPOSE: Global middleware to check authentication status on all routes.
// TODO:
//   - Check if user is authenticated via useAuth
//   - Redirect to login if not authenticated (except public routes)
//   - Initialize auth state on first load

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/login/google']

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check for public routes
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // TODO: Implement actual auth check
  // const { isAuthenticated, isLoading, initialize } = useAuth()
  
  // Wait for auth to initialize on first load
  // if (isLoading.value) {
  //   await initialize()
  // }
  
  // Redirect to login if not authenticated
  // if (!isAuthenticated.value) {
  //   return navigateTo('/login')
  // }
  
  console.log('[auth.global] Checking auth for route:', to.path)
  
  // TODO: Remove this placeholder and implement actual auth check
  // For now, allow all routes during development
})
