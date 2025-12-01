// FILE: app/composables/usePwaInstall.ts
// PURPOSE: PWA install prompt handling and state management.
// TODO:
//   - Capture beforeinstallprompt event
//   - Provide method to trigger install
//   - Track installation status

export interface PwaInstallState {
  canInstall: boolean
  isInstalled: boolean
}

export function usePwaInstall() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const canInstall = ref(false)
  const isInstalled = ref(false)
  const deferredPrompt = ref<any>(null)

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  
  /**
   * Initialize PWA install listeners
   * Call this in app.vue or a layout
   */
  function initialize() {
    if (typeof window === 'undefined') return
    
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
      return
    }
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e
      canInstall.value = true
    })
    
    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      canInstall.value = false
      deferredPrompt.value = null
      console.log('PWA installed successfully')
    })
  }

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------

  /**
   * Prompt user to install the PWA
   * Returns true if user accepted, false if dismissed
   */
  async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt.value) {
      console.warn('Install prompt not available')
      return false
    }
    
    // Show the install prompt
    deferredPrompt.value.prompt()
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.value.userChoice
    
    // Clear the deferred prompt
    deferredPrompt.value = null
    canInstall.value = false
    
    if (outcome === 'accepted') {
      console.log('User accepted install prompt')
      return true
    } else {
      console.log('User dismissed install prompt')
      return false
    }
  }

  /**
   * Check if running as installed PWA
   */
  function isRunningAsPwa(): boolean {
    if (typeof window === 'undefined') return false
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    // State
    canInstall,
    isInstalled,
    
    // Methods
    initialize,
    promptInstall,
    isRunningAsPwa,
  }
}
