// FILE: app/composables/useProfile.ts
// PURPOSE: Profile data loading and updating logic.
// TODO:
//   - Fetch profile from Supabase
//   - Update profile fields (name, room, avatar)
//   - Handle avatar upload to storage
//   - Sync with useAuth profile state

export interface ProfileUpdate {
  fullName?: string
  roomNumber?: string
  avatarUrl?: string
}

export function useProfile() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------

  /**
   * Fetch current user's profile
   * TODO: Query Supabase profiles table
   */
  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Get current user ID from useAuth
      // const { user } = useAuth()
      // if (!user.value) throw new Error('Not authenticated')
      
      // TODO: Fetch from Supabase
      // const { data, error: fetchError } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.value.id)
      //   .single()
      
      console.log('TODO: Implement fetchProfile')
      
      return null // Placeholder
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update profile fields
   * TODO: Update Supabase profiles table
   */
  async function updateProfile(updates: ProfileUpdate) {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Get current user ID
      // const { user, profile } = useAuth()
      // if (!user.value) throw new Error('Not authenticated')
      
      // TODO: Update in Supabase
      // const { data, error: updateError } = await supabase
      //   .from('profiles')
      //   .update(updates)
      //   .eq('id', user.value.id)
      //   .select()
      //   .single()
      
      // TODO: Update auth state
      // profile.value = { ...profile.value, ...data }
      
      console.log('TODO: Implement updateProfile', updates)
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload avatar image
   * TODO: Upload to Supabase Storage
   */
  async function uploadAvatar(file: File): Promise<string> {
    try {
      // TODO: Upload to Supabase storage
      // const fileExt = file.name.split('.').pop()
      // const fileName = `${user.value.id}.${fileExt}`
      // const { data, error } = await supabase.storage
      //   .from('avatars')
      //   .upload(fileName, file, { upsert: true })
      
      // TODO: Get public URL
      // const { data: { publicUrl } } = supabase.storage
      //   .from('avatars')
      //   .getPublicUrl(fileName)
      
      console.log('TODO: Implement avatar upload')
      
      return '' // Placeholder
      
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
  }
}
