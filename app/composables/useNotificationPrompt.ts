/**
 * Composable for managing automatic notification permission prompt
 * 
 * Handles:
 * - First-time prompt after login or PWA install
 * - Respects user's previous choice
 * - Can re-prompt after 7 days if user selected "maybe later"
 */

export const useNotificationPrompt = () => {
  const showPrompt = ref(false)
  const user = useSupabaseUser()

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

    return true
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
  }

  return {
    showPrompt,
    isPWA,
    initialize,
    closePrompt,
    resetPromptState,
  }
}
