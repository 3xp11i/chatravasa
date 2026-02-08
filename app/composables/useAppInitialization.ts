/**
 * Composable to track the app's initial loading state
 * Shows a loading screen until Supabase session is initialized
 */
export const useAppInitialization = () => {
  const isInitialized = useState<boolean>('app-initialized', () => false)
  const supabase = useSupabaseClient()

  const initialize = async () => {
    // If already initialized, skip
    if (isInitialized.value) return

    try {
      // Wait for Supabase to check the session
      // This ensures we have a definitive auth state before showing the app
      await supabase.auth.getSession()
      
      // Small delay to ensure reactive state updates propagate
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
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
