import { ref, computed, watch } from 'vue'
import type { Database } from '~/types/database.types'

export const useCurrentUser = () => {
  const supabase = useSupabaseClient<Database>()
  const authUser = useSupabaseUser()
  const userProfile = ref<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAdmin = computed(() => userProfile.value?.is_admin ?? authUser.value?.user_metadata?.is_admin ?? false)
  const isResident = computed(() => !!authUser.value && !isAdmin.value)
  const userName = computed(() => {
    if (!userProfile.value) return ''
    return `${userProfile.value.first_name} ${userProfile.value.last_name}`
  })

  const fetchUserProfile = async () => {
    // Try to get userId from authUser - could be in 'id' or 'sub' field
    const userId = authUser.value?.id || (authUser.value as any)?.user?.id || (authUser.value as any)?.sub
    if (!userId) {
      error.value = 'No authenticated user ID found'
      console.log('No auth user ID at fetch time. Auth object:', authUser.value)
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('Fetching profile for user:', userId)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Supabase error details:', { code: fetchError.code, message: fetchError.message, details: fetchError.details })
        error.value = `Database error: ${fetchError.message}`
        return
      }

      if (!data) {
        error.value = 'Profile not found in database'
        console.error('No profile data returned for user:', userId)
        return
      }

      userProfile.value = data
      console.log('Profile loaded successfully:', data)
    } catch (err: any) {
      console.error('Exception while fetching profile:', err)
      error.value = `Error: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  // Only fetch profile when auth user actually has an ID
  watch(
    () => authUser.value?.id || (authUser.value as any)?.sub,
    async (userId) => {
      if (userId) {
        console.log('Auth user ID detected:', userId)
        await fetchUserProfile()
      } else {
        userProfile.value = null
        error.value = null
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
