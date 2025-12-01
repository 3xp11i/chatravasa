// FILE: server/utils/auth-helpers.ts
// PURPOSE: Server-side utilities for authentication and authorization.
// TODO:
//   - Verify Supabase auth tokens
//   - Get user profile from session
//   - Check role permissions
//   - Rate limiting helpers

import type { H3Event } from 'h3'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: string
  email: string
}

export interface AuthProfile {
  id: string
  phone: string
  fullName: string
  role: 'resident' | 'cook' | 'owner'
  isVerified: boolean
}

// ---------------------------------------------------------------------------
// Get Authenticated User from Event
// ---------------------------------------------------------------------------
/**
 * Extract and verify the authenticated user from the request.
 * TODO: Implement with Supabase server client
 * 
 * @param event - H3 event from request
 * @returns User object or null if not authenticated
 */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  // TODO: Get session from Supabase server client
  //
  // Option 1: Using @nuxtjs/supabase server utilities
  // const client = await serverSupabaseClient(event)
  // const { data: { user } } = await client.auth.getUser()
  // return user ? { id: user.id, email: user.email } : null
  //
  // Option 2: Using JWT from Authorization header
  // const token = getHeader(event, 'Authorization')?.replace('Bearer ', '')
  // if (!token) return null
  // const { data: { user } } = await supabase.auth.getUser(token)
  // return user ? { id: user.id, email: user.email } : null

  console.log('[auth-helpers] TODO: Implement getAuthUser')
  return null
}

// ---------------------------------------------------------------------------
// Get User Profile
// ---------------------------------------------------------------------------
/**
 * Get the profile for an authenticated user.
 * TODO: Query Supabase profiles table
 * 
 * @param userId - User ID to lookup
 * @returns Profile object or null
 */
export async function getUserProfile(userId: string): Promise<AuthProfile | null> {
  // TODO: Query profiles table
  //
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', userId)
  //   .single()
  //
  // if (!profile) return null
  //
  // return {
  //   id: profile.id,
  //   phone: profile.phone,
  //   fullName: profile.full_name,
  //   role: profile.role,
  //   isVerified: profile.is_verified,
  // }

  console.log('[auth-helpers] TODO: Implement getUserProfile')
  return null
}

// ---------------------------------------------------------------------------
// Check Role
// ---------------------------------------------------------------------------
/**
 * Check if a profile has the required role.
 * Owner role has access to everything.
 * 
 * @param profile - User profile
 * @param requiredRole - Role to check for
 * @returns true if user has the role
 */
export function hasRole(profile: AuthProfile | null, requiredRole: 'resident' | 'cook' | 'owner'): boolean {
  if (!profile) return false
  
  // Owner has access to all roles
  if (profile.role === 'owner') return true
  
  return profile.role === requiredRole
}

// ---------------------------------------------------------------------------
// Require Auth (Middleware Helper)
// ---------------------------------------------------------------------------
/**
 * Throw error if user is not authenticated.
 * Use at the start of protected API routes.
 * 
 * @param event - H3 event
 * @returns Authenticated user
 */
export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const user = await getAuthUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }
  
  return user
}

// ---------------------------------------------------------------------------
// Require Role (Middleware Helper)
// ---------------------------------------------------------------------------
/**
 * Throw error if user doesn't have required role.
 * 
 * @param event - H3 event
 * @param requiredRole - Role required
 * @returns User profile
 */
export async function requireRole(event: H3Event, requiredRole: 'resident' | 'cook' | 'owner'): Promise<AuthProfile> {
  const user = await requireAuth(event)
  const profile = await getUserProfile(user.id)
  
  if (!hasRole(profile, requiredRole)) {
    throw createError({
      statusCode: 403,
      message: `${requiredRole} access required`,
    })
  }
  
  return profile!
}

// ---------------------------------------------------------------------------
// Rate Limiting (TODO)
// ---------------------------------------------------------------------------
/**
 * Simple in-memory rate limiter.
 * TODO: Replace with Redis for production
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (entry.count >= maxAttempts) {
    return false // Rate limited
  }
  
  entry.count++
  return true
}
