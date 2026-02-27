import { computed, watch } from 'vue'
import type { Database } from '~/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export const useCurrentUser = () => {
  const supabase = useSupabaseClient<Database>()
  const authUser = useSupabaseUser()
  
  // Use useState for shared state across all components - prevents refetching
  const userProfile = useState<ProfileRow | null>('user-profile', () => null)
  const loading = useState<boolean>('user-profile-loading', () => false)
  const error = useState<string | null>('user-profile-error', () => null)
  const hasFetched = useState<boolean>('user-profile-fetched', () => false)
  const isFetching = useState<boolean>('user-profile-is-fetching', () => false)

  const isAdmin = computed(() => userProfile.value?.is_admin ?? authUser.value?.user_metadata?.is_admin ?? false)
  const isResident = computed(() => !!authUser.value && !isAdmin.value)
  const userName = computed(() => {
    if (!userProfile.value) return ''
    return `${userProfile.value.first_name} ${userProfile.value.last_name}`
  })

  const fetchUserProfile = async (force = false) => {
    // Skip if already fetched and not forcing refresh
    if (hasFetched.value && !force && userProfile.value) {
      return
    }

    // Prevent concurrent fetches (mutex)
    if (isFetching.value) {
      // Wait for current fetch to complete
      while (isFetching.value) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return
    }

    // Try to get userId from authUser - could be in 'id' or 'sub' field
    const userId = authUser.value?.id || (authUser.value as any)?.user?.id || (authUser.value as any)?.sub
    if (!userId) {
      error.value = 'No authenticated user ID found'
      return
    }

    isFetching.value = true
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        error.value = `Database error: ${fetchError.message}`
        hasFetched.value = true
        return
      }

      if (!data) {
        error.value = 'Profile not found in database'
        hasFetched.value = true
        return
      }

      userProfile.value = data
      hasFetched.value = true
    } catch (err: any) {
      error.value = `Error: ${err.message}`
      hasFetched.value = true
    } finally {
      loading.value = false
      isFetching.value = false
    }
  }

  const clearUserProfile = () => {
    userProfile.value = null
    hasFetched.value = false
    error.value = null
  }

  // Only watch for auth changes to handle login/logout
  watch(
    () => authUser.value?.id || (authUser.value as any)?.sub,
    async (userId, oldUserId) => {
      if (userId && !oldUserId) {
        // User just logged in - fetch profile
        await fetchUserProfile()
      } else if (!userId && oldUserId) {
        // User logged out - clear profile
        clearUserProfile()
      } else if (userId && !hasFetched.value) {
        // User is logged in but we haven't fetched yet
        await fetchUserProfile()
      }
    },
    { immediate: true }
  )

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!authUser.value?.id && !(authUser.value as any)?.sub) {
      throw new Error('No authenticated user')
    }

    try {
      // Get the session to ensure we have the latest JWT token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session token available')
      }

      const response = await fetch('/api/profile/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Failed to update profile')
      }

      const result = await response.json()

      // Update local state with the new profile data
      if (result.profile) {
        userProfile.value = result.profile
      }

      return result
    } catch (err: any) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!authUser.value?.id && !(authUser.value as any)?.sub) {
      throw new Error('No authenticated user')
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Get the session to ensure we have the latest JWT token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No valid session token available')
      }

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Failed to upload avatar')
      }

      const result = await response.json()

      // Update local state with the new profile data
      if (result.profile) {
        userProfile.value = result.profile
      }

      return result
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      throw err
    }
  }

  const removeAvatar = async () => {
    if (!authUser.value?.id && !(authUser.value as any)?.sub) {
      throw new Error('No authenticated user')
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No valid session token available')
      }

      const response = await fetch('/api/profile/remove-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || 'Failed to remove avatar')
      }

      const result = await response.json()

      if (result.profile) {
        userProfile.value = result.profile
      }

      return result
    } catch (err: any) {
      console.error('Error removing avatar:', err)
      throw err
    }
  }

  return {
    userProfile,
    authUser,
    isAdmin,
    isResident,
    userName,
    loading,
    error,
    fetchUserProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
  }
}
