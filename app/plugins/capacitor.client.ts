import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Capacitor initialization plugin
 * Sets up native app features and handlers
 */
export default defineNuxtPlugin(() => {
  const { isNative } = usePlatform();

  if (!isNative) return;

  // Initialize on client side only
  if (import.meta.client) {
    // Configure status bar
    StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
    StatusBar.setBackgroundColor({ color: '#4CAF50' }).catch(console.error);

    // Hide splash screen after app is ready
    setTimeout(() => {
      SplashScreen.hide().catch(console.error);
    }, 500);

    // Handle Android hardware back button
    App.addListener('backButton', ({ canGoBack }) => {
      const router = useRouter();
      
      if (canGoBack) {
        router.back();
      } else {
        // On root page - minimize app instead of closing
        App.minimizeApp();
      }
    });

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[App] State changed. Active:', isActive);
      // You can add logic here to refresh data when app comes to foreground
    });

    // Handle deep links for authentication and navigation
    App.addListener('appUrlOpen', async (data) => {
      console.log('[App] URL opened:', data.url);
      
      try {
        const url = new URL(data.url);
        const router = useRouter();
        const supabase = useSupabaseClient();
        
        // Extract path from URL (remove scheme and host)
        const path = url.pathname + url.search + url.hash;
        
        // Check if this is an auth callback (contains access_token, code, or type=recovery)
        const isAuthCallback = url.searchParams.has('access_token') || 
                              url.searchParams.has('code') || 
                              url.searchParams.get('type') === 'recovery';
        
        if (isAuthCallback) {
          console.log('[App] Auth callback detected, processing...');
          
          // Let Supabase handle the auth callback
          // The detectSessionInUrl option will automatically process this
          await supabase.auth.getSession();
          
          // Navigate to appropriate page after auth
          // Give a small delay for session to be established
          setTimeout(() => {
            if (url.searchParams.get('type') === 'recovery') {
              router.push('/settings'); // or your password reset page
            } else {
              router.push('/'); // Let the index page handle role-based redirect
            }
          }, 100);
        } else {
          // Regular deep link - navigate to the path
          router.push(path);
        }
      } catch (error) {
        console.error('[App] Error handling deep link:', error);
      }
    });
  }
});
