/**
 * iOS Safari Zoom Prevention Plugin
 * 
 * This plugin prevents unwanted pinch-to-zoom and double-tap-to-zoom behavior
 * on iOS Safari, which ignores the user-scalable=no viewport meta tag since iOS 10+.
 * 
 * It uses event listeners with { passive: false } to properly intercept
 * and prevent zoom gestures while still allowing normal scrolling.
 */

export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (typeof window === 'undefined') return

  // Detect iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (!isIOS) return

  // Prevent pinch-to-zoom
  // This intercepts multi-touch gestures that would trigger zoom
  document.addEventListener('touchmove', (event: TouchEvent) => {
    // Check if this is a pinch gesture (scale !== 1)
    if ((event as any).scale !== undefined && (event as any).scale !== 1) {
      event.preventDefault()
    }
  }, { passive: false })

  // Prevent double-tap-to-zoom
  // Track the last touch time to detect double-taps
  let lastTouchEnd = 0
  
  document.addEventListener('touchend', (event: TouchEvent) => {
    const now = Date.now()
    
    // If two taps happen within 300ms, it's a double-tap
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
      
      // Still trigger a click so the element works
      if (event.target instanceof HTMLElement) {
        event.target.click()
      }
    }
    
    lastTouchEnd = now
  }, { passive: false })

  // Prevent gesture events (iOS-specific zoom gestures)
  document.addEventListener('gesturestart', (event: Event) => {
    event.preventDefault()
  }, { passive: false })

  document.addEventListener('gesturechange', (event: Event) => {
    event.preventDefault()
  }, { passive: false })

  document.addEventListener('gestureend', (event: Event) => {
    event.preventDefault()
  }, { passive: false })

  // Log for debugging (can be removed in production)
  console.log('[iOS Zoom Prevention] Initialized')
})
