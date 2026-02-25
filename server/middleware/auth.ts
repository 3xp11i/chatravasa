import { getHeader, setHeader } from 'h3'

/**
 * Server middleware to handle Authorization header authentication for Capacitor apps.
 * 
 * Problem: @nuxtjs/supabase only reads auth from cookies, but Capacitor apps 
 * can't use cookies reliably, so they send Authorization headers instead.
 * 
 * Solution: This middleware reads the Authorization header and injects it as
 * a cookie that the Supabase SSR library can understand.
 */
export default defineEventHandler((event) => {
  // Only process API routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Check if there's an Authorization header
  const authHeader = getHeader(event, 'Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7) // Remove 'Bearer ' prefix
    
    console.log('[Auth Middleware] Bearer token found for:', event.path)
    
    // The @nuxtjs/supabase module uses a cookie with format:
    // sb-auth-token (or custom cookiePrefix)
    // The value is a JSON object with the session data
    
    const config = useRuntimeConfig(event)
    const cookiePrefix = (config.public.supabase as any)?.cookiePrefix || 'sb-auth-token'
    
    // Create a minimal session object that Supabase can parse
    // The @supabase/ssr library will use this to create the client
    const sessionData = JSON.stringify({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: '',
    })
    
    // URL encode the session data for the cookie
    const encodedSession = encodeURIComponent(sessionData)
    
    // Get existing cookies
    const existingCookies = getHeader(event, 'Cookie') || ''
    
    // Create the cookie string - use base64 encoding as that's what Supabase expects
    const base64Session = Buffer.from(sessionData).toString('base64')
    
    // Build new cookie string - the cookie name needs to exactly match what Supabase looks for
    const cookieString = `${cookiePrefix}=${base64Session}`
    
    // Append to existing cookies
    const newCookies = existingCookies 
      ? `${existingCookies}; ${cookieString}`
      : cookieString
    
    // Override the Cookie header in the raw request
    event.node.req.headers.cookie = newCookies
    
    // Also store in context for our custom auth utility
    event.context._authToken = token
    event.context._authHeader = authHeader
    
    console.log('[Auth Middleware] Cookie injected:', cookiePrefix)
  }
})
