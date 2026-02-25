/**
 * Intercepts all $fetch API calls and automatically adds Authorization header
 * This is critical for Capacitor apps where cookies don't work and we use localStorage
 */
export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()

  // Log initial session state for debugging
  if (import.meta.client) {
    const { data: { session: initialSession } } = await supabase.auth.getSession()
    console.log('[Auth] Initial session state:', {
      hasSession: !!initialSession,
      hasAccessToken: !!initialSession?.access_token,
      userId: initialSession?.user?.id,
    })

    // Set up auth state listener to debug session changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State changed:', event, {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: session?.user?.id,
      })
    })

    // Store reference to original $fetch
    const originalFetch = globalThis.$fetch

    // Create a new $fetch instance with interceptor
    globalThis.$fetch = originalFetch.create({
      async onRequest({ request, options }) {
        // Only add auth header to internal API routes
        if (typeof request === 'string' && request.startsWith('/api/')) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.access_token) {
              // Ensure headers object exists
              if (!options.headers) {
                options.headers = {}
              }
              
              // Add Authorization header
              if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
                (options.headers as Record<string, string>).Authorization = `Bearer ${session.access_token}`
              }
              
              console.log('[Auth] ✅ Authorization header added to:', request)
            } else {
              console.warn('[Auth] ⚠️  No session token available for:', request)
            }
          } catch (error) {
            console.error('[Auth] ❌ Error getting session for:', request, error)
          }
        }
      },
    })

    console.log('[Auth] Fetch interceptor initialized')
  }
})
