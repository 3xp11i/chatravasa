export default defineNuxtRouteMiddleware(async (to) => {
  const { isAdmin, userProfile, authUser, fetchUserProfile } = useCurrentUser()

  // If not authenticated, let authChecker handle redirects
  if (!authUser.value) return

  // Ensure we have the profile loaded (best-effort)
  if (!userProfile.value) {
    await fetchUserProfile()
  }

  const adminFlag = userProfile.value?.is_admin ?? authUser.value?.user_metadata?.is_admin ?? false

  // Prevent residents (non-admin) from accessing /dashboard
  if (to.path.startsWith('/dashboard') && !adminFlag) {
    return navigateTo('/resident')
  }

  // Prevent admins from accessing /resident section
  if (to.path.startsWith('/resident') && adminFlag) {
    return navigateTo('/dashboard')
  }
})
