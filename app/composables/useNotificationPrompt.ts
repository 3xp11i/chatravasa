/**
 * Composable for managing automatic notification permission prompt
 * 
 * Handles:
 * - First-time deployment to existing users (app version-based prompting)
 * - First-time prompt after login or PWA install
 * - Respects user's previous choice
 * - Can re-prompt after 7 days if user selected "maybe later"
 * 
 * Uses app version from package.json to ensure all existing users see the notification prompt
 * when this feature is first deployed, regardless of their previous PWA usage.
 */

export const useNotificationPrompt = () => {
  const showPrompt = ref(false)
  const user = useSupabaseUser()
  const { appVersion } = useRuntimeConfig().public

  /**
   * Check if app is running as PWA
   */
  const isPWA = computed(() => {
    if (!import.meta.client) return false
    return window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true
      || document.referrer.includes('android-app://')
  })

  /**
   * Check if we should show the notification prompt
   */
  const shouldShowPrompt = (): boolean => {
    if (!import.meta.client) return false
    if (!user.value) return false

    // Check if browser supports notifications
    if (!('Notification' in window)) return false

    // Don't prompt if already granted or denied
    if (Notification.permission !== 'default') return false

    const status = localStorage.getItem('notification_prompt_status')
    
    // Never show if user dismissed permanently
    if (status === 'dismissed' || status === 'denied') return false

    // Already accepted
    if (status === 'accepted') return false

    // Check if we should wait before prompting again (maybe later)
    const nextPrompt = localStorage.getItem('notification_prompt_next')
    if (nextPrompt) {
      const nextPromptTime = parseInt(nextPrompt, 10)
      if (Date.now() < nextPromptTime) return false
    }

    // **Check app version for first-time deployment or updates**
    // This ensures all existing users see the prompt when notifications are first deployed
    // or when significant updates requiring re-prompting are made
    const lastPromptedVersion = localStorage.getItem('notification_prompted_version')
    
    // Handle backward compatibility: existing users will have null, new users will have no version
    // Both cases should trigger the prompt on first deployment of versioning system
    if (!lastPromptedVersion || lastPromptedVersion !== appVersion) {
      // Cases covered:
      // 1. New user: lastPromptedVersion is null -> !null = true -> prompt shown
      // 2. Existing user (pre-versioning): lastPromptedVersion is null -> !null = true -> prompt shown  
      // 3. App updated: lastPromptedVersion !== current appVersion -> prompt shown
      localStorage.setItem('notification_prompted_version', appVersion)
      return true
    }

    // Check if this is first time opening as PWA
    const hasOpenedAsPWA = localStorage.getItem('has_opened_as_pwa')
    if (isPWA.value && !hasOpenedAsPWA) {
      localStorage.setItem('has_opened_as_pwa', 'true')
      return true
    }

    // Check if user just logged in (within last 5 seconds)
    const lastLoginCheck = localStorage.getItem('last_login_prompt_check')
    if (!lastLoginCheck) {
      localStorage.setItem('last_login_prompt_check', Date.now().toString())
      // Wait a bit after login so user sees the app first
      setTimeout(() => {
        if (shouldShowPrompt()) {
          showPrompt.value = true
        }
      }, 3000)
      return false
    }

    return false // Changed from true to false as fallback
  }

  /**
   * Initialize and check if prompt should be shown
   */
  const initialize = () => {
    if (!import.meta.client) return

    // Wait for user to be loaded
    watch(user, (newUser) => {
      if (newUser && shouldShowPrompt()) {
        // Small delay to let page load
        setTimeout(() => {
          showPrompt.value = true
        }, 2000)
      }
    }, { immediate: true })
  }

  /**
   * Close the prompt
   */
  const closePrompt = () => {
    showPrompt.value = false
  }

  /**
   * Reset prompt state (for testing)
   */
  const resetPromptState = () => {
    if (!import.meta.client) return
    localStorage.removeItem('notification_prompt_status')
    localStorage.removeItem('notification_prompt_next')
    localStorage.removeItem('has_opened_as_pwa')
    localStorage.removeItem('last_login_prompt_check')
    localStorage.removeItem('notification_prompted_version') // Clear version tracking
  }

  /**
   * Get current app version
   * Useful for debugging or display purposes
   * 
   * To force re-prompt: Bump version in package.json (e.g., from '1.0.0' to '1.1.0')
   */
  const getCurrentVersion = () => appVersion

  return {
    showPrompt,
    isPWA,
    initialize,
    closePrompt,
    resetPromptState,
    getCurrentVersion,
  }
}
