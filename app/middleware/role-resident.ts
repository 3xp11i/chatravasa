// FILE: app/middleware/role-resident.ts
// PURPOSE: Middleware to restrict routes to resident role only.
// TODO:
//   - Check if authenticated user has 'resident' role
//   - Redirect to appropriate page if not a resident
// USAGE: Add `definePageMeta({ middleware: 'role-resident' })` in page

export default defineNuxtRouteMiddleware(async (to, from) => {
  // TODO: Implement role check
  // const { profile, hasRole } = useAuth()
  
  // if (!profile.value) {
  //   // Not logged in, global auth middleware should handle this
  //   return
  // }
  
  // if (!hasRole('resident')) {
  //   // User doesn't have resident role
  //   console.warn('[role-resident] Access denied - not a resident')
  //   
  //   // Redirect based on actual role
  //   if (profile.value.role === 'cook') {
  //     return navigateTo('/cook')
  //   } else if (profile.value.role === 'owner') {
  //     return navigateTo('/owner')
  //   }
  //   
  //   return navigateTo('/')
  // }
  
  console.log('[role-resident] Checking resident role for:', to.path)
  
  // TODO: Remove placeholder and implement actual role check
})
