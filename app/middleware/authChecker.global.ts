// Check if user is logged in by checking the supabase user, 
// If going to /dashboard and not authenticated, not redirect to login page
// If going to /login and authenticated, redirect to /dashboard
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

        // Ensure we have the profile loaded
        if (!userProfile.value) {
            await fetchUserProfile();
        }
        
        // Check admin status directly from the loaded sources
        const isAdminUser = userProfile.value?.is_admin ?? user.value?.user_metadata?.is_admin ?? false;
        
        return navigateTo(isAdminUser ? "/dashboard" : "/resident");
    }
});