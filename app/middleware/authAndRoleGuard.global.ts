// Server-side redirect middleware for authentication and role-based routing.
// Handles: root path (/), login redirects, and access control for protected routes.
// Runs on both client and server, redirects happen before page renders.
export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser();
    const { hasGoogleIdentity } = useLinkedIdentity();
    let hasSession = !!user.value;
    
    // On client-side, check session explicitly
    if (typeof window !== 'undefined' && !hasSession) {
        const supabase = useSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        hasSession = !!session?.user;
    }

    // Handle root path redirect based on authentication and role
    if (to.path === "/") {
        if (!hasSession) {
            return navigateTo("/login");
        }

        const { userProfile, fetchUserProfile } = useCurrentUser();
        
        // Ensure we have the profile loaded
        if (!userProfile.value) {
            await fetchUserProfile();
        }

        // Check user role from profiles.user_role column
        const userRole = userProfile.value?.user_role;

        if (userRole === 'admin' || userRole === 'staff_member') {
            return navigateTo("/dashboard");
        }
        
        // Check resident status
        if (userRole === 'resident') {
            const residentData = useResidentData();
            // Verify resident data is loaded
            if (!residentData.residentData.value) {
                try {
                    await residentData.refresh();
                } catch (e) {}
            }

            // Only proceed if resident record exists
            if (residentData.residentData.value?.hasResident) {
                const googleLinked = await hasGoogleIdentity();
                if (!googleLinked) {
                    return navigateTo("/login");
                }
                return navigateTo("/resident");
            }
        }

        // Fallback for unrecognized role or no resident record
        return navigateTo("/login");
    }

    // Block access to /dashboard or /resident if not authenticated
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

        // Check user role from profiles.user_role column
        const userRole = userProfile.value?.user_role;

        // Admin and staff members go to dashboard
        if (userRole === 'admin' || userRole === 'staff_member') {
            return navigateTo("/dashboard");
        }
        
        // Handle resident redirect
        if (userRole === 'resident') {
            const residentData = useResidentData();
            // Verify resident data is loaded
            if (!residentData.residentData.value) {
                try {
                    await residentData.refresh();
                } catch (e) {}
            }

            // Only redirect to resident if resident record exists and Google is linked
            if (residentData.residentData.value?.hasResident) {
                const googleLinked = await hasGoogleIdentity();
                if (!googleLinked) {
                    // Resident without Google - stay on login to show Google linking UI
                    return;
                }
                return navigateTo("/resident");
            }

            // Resident record doesn't exist yet - stay on login
            return;
        }

        // Fallback - unrecognized role
        return navigateTo("/dashboard");
    }
});