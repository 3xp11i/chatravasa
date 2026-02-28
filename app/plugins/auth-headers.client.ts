import { Capacitor } from '@capacitor/core';

/**
 * Intercepts all $fetch API calls and:
 * 1. Automatically adds Authorization header from Supabase session
 * 2. On native platforms, prepends the API base URL for /api/* routes
 * 
 * This is critical for Capacitor apps where:
 * - Cookies don't work reliably, so we use localStorage + auth headers
 * - Local files are served, so API calls need the full server URL
 */
export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()
  const isNative = Capacitor.isNativePlatform()
  const apiBaseUrl = config.public.apiBaseUrl as string

  // Log initial session state for debugging
  if (import.meta.client) {
    const { data: { session: initialSession } } = await supabase.auth.getSession()
    console.log('[Auth] Initial session state:', {
      hasSession: !!initialSession,
      hasAccessToken: !!initialSession?.access_token,
      userId: initialSession?.user?.id,
      isNative,
      apiBaseUrl: isNative ? apiBaseUrl : '(relative)',
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
        // Only process internal API routes
        if (typeof request === 'string' && request.startsWith('/api/')) {
          // On native platforms, prepend the API base URL
          if (isNative) {
            // Modify the request URL by updating options.baseURL
            // This works because ofetch will combine baseURL + request path
            options.baseURL = apiBaseUrl
            
            // Ensure credentials are included for cross-origin requests
            options.credentials = options.credentials ?? 'include'
            
            console.log('[API] 🌐 Native: Using base URL:', apiBaseUrl, 'for:', request)
          }

          // Add auth header
          try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.access_token) {
              // Ensure headers object exists and add Authorization
              // Cast through unknown to handle both Headers and plain object types
              const existingHeaders = (options.headers as unknown as Record<string, string>) || {}
              ;(options as any).headers = {
                ...existingHeaders,
                Authorization: `Bearer ${session.access_token}`,
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

    console.log('[Auth] Fetch interceptor initialized', isNative ? '(native mode)' : '(web mode)')
  }
})
