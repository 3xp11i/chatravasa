// FILE: app/middleware/role-owner.ts
// PURPOSE: Middleware to restrict routes to owner/admin role only.
// TODO:
//   - Check if authenticated user has 'owner' role
//   - Redirect to appropriate page if not an owner
// USAGE: Add `definePageMeta({ middleware: 'role-owner' })` in page

export default defineNuxtRouteMiddleware(async (to, from) => {
  // TODO: Implement role check
  // const { profile, hasRole } = useAuth()
  
  // if (!profile.value) {
  //   return
  // }
  
  // if (!hasRole('owner')) {
  //   console.warn('[role-owner] Access denied - not an owner')
  //   
  //   // Redirect based on actual role
  //   if (profile.value.role === 'resident') {
  //     return navigateTo('/resident')
  //   } else if (profile.value.role === 'cook') {
  //     return navigateTo('/cook')
  //   }
  //   
  //   return navigateTo('/')
  // }
  
  console.log('[role-owner] Checking owner role for:', to.path)
  
  // TODO: Remove placeholder and implement actual role check
})
