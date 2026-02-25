import { createClient } from '@supabase/supabase-js'
import { getHeader } from 'h3'
import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

/**
 * Get the authenticated user from either:
 * 1. Authorization header (Bearer token) - for Capacitor/mobile apps
 * 2. Cookies - for web apps (via the standard serverSupabaseUser)
 * 
 * This is necessary because @nuxtjs/supabase only reads from cookies,
 * but Capacitor apps can't use cookies and must send Authorization headers.
 */
export async function getAuthUser(event: H3Event): Promise<{
  id: string
  sub: string
  phone?: string
  email?: string
  [key: string]: any
} | null> {
  // First, check for Authorization header (Capacitor/mobile apps)
  const authHeader = getHeader(event, 'Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7) // Remove 'Bearer ' prefix
    
    console.log('[getAuthUser] Using Authorization header')
    
    try {
      const config = useRuntimeConfig()
      const supabaseUrl = config.public.supabase.url
      const supabaseKey = config.public.supabase.key
      
      // Create a Supabase client with the user's token
      const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
      
      // Get the user from the token
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error) {
        console.error('[getAuthUser] Error verifying token:', error.message)
        return null
      }
      
      if (!user) {
        console.warn('[getAuthUser] No user found for token')
        return null
      }
      
      console.log('[getAuthUser] User authenticated via header:', user.id)
      
      // Return user in the same format as serverSupabaseUser
      return {
        id: user.id,
        sub: user.id, // serverSupabaseUser returns 'sub' as the user ID
        phone: user.phone,
        email: user.email,
        ...user,
      }
    } catch (error: any) {
      console.error('[getAuthUser] Exception:', error.message)
      return null
    }
  }
  
  // Fall back to standard cookie-based authentication
  console.log('[getAuthUser] Using cookie-based auth')
  
  try {
    const user = await serverSupabaseUser(event)
    
    if (user) {
      console.log('[getAuthUser] User authenticated via cookies:', (user as any).sub || (user as any).id)
    }
    
    return user as any
  } catch (error: any) {
    console.error('[getAuthUser] Cookie auth error:', error.message)
    return null
  }
}

/**
 * Get a Supabase client authenticated as the current user.
 * Works with both Authorization headers (Capacitor) and cookies (web).
 */
export async function getAuthenticatedClient(event: H3Event) {
  const authHeader = getHeader(event, 'Authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const config = useRuntimeConfig()
    
    return createClient<Database>(
      config.public.supabase.url,
      config.public.supabase.key,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }
  
  // Fall back to the standard server client from cookies
  const { serverSupabaseClient } = await import('#supabase/server')
  return serverSupabaseClient<Database>(event)
}
