export const useLinkedIdentity = () => {
  const supabase = useSupabaseClient()
  const authUser = useSupabaseUser()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchIdentities = async () => {
    if (!authUser.value) {
      return []
    }

    const sessionIdentities = authUser.value.identities
    if (sessionIdentities && sessionIdentities.length > 0) {
      return sessionIdentities
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: identitiesError } = await supabase.auth.getUserIdentities()

      if (identitiesError) {
        error.value = identitiesError.message
        return []
      }

      return data?.identities ?? []
    } catch (err: any) {
      error.value = err?.message || 'Failed to read linked identities'
      return []
    } finally {
      loading.value = false
    }
  }

  const hasLinkedProvider = async (provider: string) => {
    const identities = await fetchIdentities()
    return identities.some((identity) => identity.provider === provider)
  }

  return {
    loading,
    error,
    fetchIdentities,
    hasLinkedProvider,
    hasGoogleIdentity: () => hasLinkedProvider('google'),
  }
}