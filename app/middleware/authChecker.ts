// Check if user is logged in by checking the supabase user, 
// If going to /dashboard and not authenticated, not redirect to login page
// If going to /login and authenticated, redirect to /dashboard
export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser();
    if (to.path.startsWith("/dashboard") && !user.value) {
        return navigateTo("/login");
    }   
    if (to.path.startsWith("/login") && user.value) {
        return navigateTo("/dashboard");
    }
});