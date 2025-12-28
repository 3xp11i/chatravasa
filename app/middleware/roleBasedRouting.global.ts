/**
 * Global middleware to handle staff/resident/admin role-based routing
 * Redirects users to appropriate dashboards based on their role
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  // Only apply middleware to protected routes
  if (!user.value) return;

  // Get the path to determine which section we're in
  const path = to.path;

  // Don't apply to login pages or home
  if (path.startsWith('/login') || path === '/' || path === '/contact') {
    return;
  }

  // Check if trying to access admin/dashboard
  if (path.startsWith('/dashboard')) {
    
  //   const { staffContext, isStaff } = useStaffContext();

  //   // If not initialized, wait for context to load
  //   if (!staffContext.value.member && !isStaff.value) {
  //     // Try to fetch context
      
  //     await new Promise((resolve) => {
  //       console.log("Inside Promise");
  //       const checkInterval = setInterval(() => {
  //         console.log("One try");
          
  //         if (staffContext.value.member) {
  //           clearInterval(checkInterval);
  //           resolve(null);
  //         }
  //       }, 100);
  //       // Timeout after 3 seconds
  //       setTimeout(() => {
  //         clearInterval(checkInterval);
  //         resolve(null);
  //       }, 3000);
  //     });
  //   }


    // If user is staff (not admin), allow them but they'll see filtered UI
    // Staff access to dashboard is now based on permissions, which are checked per-feature
    return;
  }

  // Check if trying to access resident pages
  if (path.startsWith('/resident')) {
    const { isInitialized } = useResidentStore();

    // Residents can access their pages
    return;
  }
});
