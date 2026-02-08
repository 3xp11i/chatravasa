/**
 * Composable to track the app's initial loading state
 * Shows a loading screen until Supabase session is initialized and user profile is loaded
 */
export const useAppInitialization = () => {
  const isInitialized = useState<boolean>('app-initialized', () => false)
  const supabase = useSupabaseClient()
  const authUser = useSupabaseUser()

  const initialize = async () => {
    // If already initialized, skip
    if (isInitialized.value) return

    try {
      // Wait for Supabase to check the session
      // This ensures we have a definitive auth state before showing the app
      await supabase.auth.getSession()
      
      // Wait for reactive state updates to propagate
      await nextTick()
      
      // If user is authenticated, wait for profile to load
      if (authUser.value) {
        const { loading, hasFetched } = useCurrentUser()
        
        // Wait for profile to be fetched
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max wait
        while (!hasFetched.value && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        // Wait for loading to complete
        attempts = 0
        while (loading.value && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
      }
      
      // Wait for next tick and animation frame to ensure DOM is rendered
      await nextTick()
      await new Promise(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(undefined))
      }))
      
      // Small additional delay for content to be painted
      await new Promise(resolve => setTimeout(resolve, 200))
      
    } catch (error) {
      console.error('Error initializing app:', error)
    } finally {
      // Mark as initialized regardless of success/failure
      // to prevent indefinite loading state
      isInitialized.value = true
    }
  }

  return {
    isInitialized,
    initialize,
  }
}
