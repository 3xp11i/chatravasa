export default defineNuxtRouteMiddleware(async (to) => {
  const { isAdmin, userProfile, authUser, fetchUserProfile } = useCurrentUser()
  const { staffContext, fetchStaffContext } = useStaffContext()

  // If not authenticated, let authChecker handle redirects
  if (!authUser.value) return

  // Ensure we have the profile loaded (best-effort)
  if (!userProfile.value) {
    await fetchUserProfile()
  }

  // Ensure staff context is loaded
  await fetchStaffContext()

  const adminFlag = userProfile.value?.is_admin ?? authUser.value?.user_metadata?.is_admin ?? false
  
  // Check if user has staff assignments (more reliable than isStaff computed)
  const hasStaffAssignments = staffContext.value.assignments && staffContext.value.assignments.length > 0
  
  const isResident = !adminFlag && !hasStaffAssignments

  // Prevent residents (non-admin, non-staff) from accessing /dashboard
  if (to.path.startsWith('/dashboard') && isResident) {
    return navigateTo('/resident')
  }

  // Prevent admins and staff from accessing /resident section (they should use /dashboard)
  if (to.path.startsWith('/resident') && (adminFlag || hasStaffAssignments)) {
    return navigateTo('/dashboard')
  }
})
