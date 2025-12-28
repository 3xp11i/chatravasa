// Check if user is logged in by checking the supabase user, 
// If going to /dashboard and not authenticated, not redirect to login page
// If going to /login and authenticated, redirect to appropriate home (dashboard for admin/staff, resident for residents)
export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser();
    let hasSession = !!user.value;
    
    // On client-side, check session explicitly
    if (typeof window !== 'undefined' && !hasSession) {
        const supabase = useSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        hasSession = !!session?.user;
    }

    if ((to.path.startsWith("/dashboard") || to.path.startsWith("/resident")) && !hasSession && !user.value) {
        return navigateTo("/login");
    }

    // If already authenticated and visiting /login, route to role home
    if (to.path.startsWith("/login") && (user.value || hasSession)) {
        const { userProfile, fetchUserProfile } = useCurrentUser();
        const { staffContext, fetchStaffContext } = useStaffContext();

        // Ensure we have the profile loaded
        if (!userProfile.value) {
            await fetchUserProfile();
        }
        
        // Check admin status first
        const isAdminUser = userProfile.value?.is_admin ?? user.value?.user_metadata?.is_admin ?? false;
        
        if (isAdminUser) {
            return navigateTo("/dashboard");
        }
        
        // Fetch staff context to check if user is staff
        await fetchStaffContext();
        
        // Check if user has staff assignments
        const hasStaffAssignments = staffContext.value.assignments && staffContext.value.assignments.length > 0;
        
        if (hasStaffAssignments) {
            return navigateTo("/dashboard");
        }
        
        // Not admin and not staff - go to resident
        return navigateTo("/resident");
    }
});