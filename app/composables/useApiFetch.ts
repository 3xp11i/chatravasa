import { Capacitor } from '@capacitor/core';

/**
 * Composable for making API calls that work on both web and native platforms.
 * 
 * NOTE: The auth-headers.client.ts plugin automatically handles:
 * - Base URL prefix for native platforms
 * - Authorization headers
 * 
 * This composable provides utilities for cases where you need direct access
 * to the API URL transformation logic.
 * 
 * @example
 * const { getApiUrl, isNative } = useApiFetch()
 * 
 * // Get the full URL for an endpoint
 * const fullUrl = getApiUrl('/api/notifications')
 * // On web: '/api/notifications'
 * // On native: 'https://app.chatravasa.com/api/notifications'
 */
export const useApiFetch = () => {
  const config = useRuntimeConfig();
  const isNative = Capacitor.isNativePlatform();
  const apiBaseUrl = config.public.apiBaseUrl as string;

  /**
   * Get the full URL for an API endpoint
   * - On web: returns the path as-is (relative)
   * - On native: prepends the API base URL
   */
  const getApiUrl = (path: string): string => {
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // On native, prepend the base URL
    if (isNative) {
      // Ensure no double slashes
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${apiBaseUrl}${cleanPath}`;
    }

    // On web, use relative URL
    return path;
  };

  return {
    getApiUrl,
    isNative,
    apiBaseUrl,
  };
};

/**
 * Direct utility function for use outside of setup context
 * Use with caution - prefer the composable in components
 */
export const getApiUrl = (path: string): string => {
  const isNative = Capacitor.isNativePlatform();
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (isNative) {
    // Hardcoded for non-reactive context - matches nuxt.config.ts default
    const baseUrl = 'https://dev.app.chatravasa.com';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  return path;
};

