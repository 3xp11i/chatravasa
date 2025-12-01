// FILE: app/composables/useAuth.ts
// PURPOSE: Authentication state management - current user, profile, role, and auth methods.
// TODO:
//   - Integrate with Supabase Auth
//   - Fetch user profile from database after login
//   - Provide reactive user state across the app
//   - Handle session persistence and refresh

import type { Ref } from 'vue'

// Types
export interface User {
  id: string
  email: string
  phone?: string
}

export interface Profile {
  id: string
  phone: string
  fullName: string
  roomNumber?: string
  avatarUrl?: string
  role: 'resident' | 'cook' | 'owner'
  isVerified: boolean
}

export interface AuthState {
  user: Ref<User | null>
  profile: Ref<Profile | null>
  isAuthenticated: Ref<boolean>
  isLoading: Ref<boolean>
  role: Ref<string | null>
}

export function useAuth() {
  // ---------------------------------------------------------------------------
  // State
  // TODO: Initialize from Supabase auth session
  // ---------------------------------------------------------------------------
  const user = useState<User | null>('auth-user', () => null)
  const profile = useState<Profile | null>('auth-profile', () => null)
  const isLoading = useState<boolean>('auth-loading', () => true)

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => profile.value?.role || null)

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------

  /**
   * Initialize auth state - call on app mount
   * TODO: Get session from Supabase and fetch profile
   */
  async function initialize() {
    isLoading.value = true
    
    try {
      // TODO: Implement Supabase session check
      // const { data: { session } } = await supabase.auth.getSession()
      // if (session?.user) {
      //   user.value = { id: session.user.id, email: session.user.email }
      //   await fetchProfile(session.user.id)
      // }
      
      console.log('TODO: Initialize auth from Supabase session')
      
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user profile from database
   * TODO: Query profiles table by user ID
   */
  async function fetchProfile(userId: string) {
    try {
      // TODO: Fetch profile from Supabase
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', userId)
      //   .single()
      
      console.log('TODO: Fetch profile for user:', userId)
      
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  /**
   * Sign in with Google OAuth
   * TODO: Use Supabase OAuth
   */
  async function signInWithGoogle() {
    try {
      // TODO: Implement Google OAuth
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: 'google',
      //   options: { redirectTo: `${window.location.origin}/login/google` }
      // })
      
      console.log('TODO: Implement Google OAuth sign in')
      
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    }
  }

  /**
   * Sign out and clear state
   */
  async function signOut() {
    try {
      // TODO: Call Supabase signOut
      // await supabase.auth.signOut()
      
      user.value = null
      profile.value = null
      
      console.log('TODO: Implement sign out')
      
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(requiredRole: 'resident' | 'cook' | 'owner'): boolean {
    if (!profile.value) return false
    
    // Owner has access to everything
    if (profile.value.role === 'owner') return true
    
    return profile.value.role === requiredRole
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    // State
    user,
    profile,
    isAuthenticated,
    isLoading,
    role,
    
    // Methods
    initialize,
    fetchProfile,
    signInWithGoogle,
    signOut,
    hasRole,
  }
}
