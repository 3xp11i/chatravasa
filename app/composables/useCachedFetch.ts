/**
 * A wrapper around useFetch that provides proper caching for SPA navigation.
 * Data is cached in memory and reused when navigating back to a page,
 * avoiding unnecessary refetches while still allowing manual refresh.
 */
export function useCachedFetch<T>(
  url: string | (() => string),
  options: Parameters<typeof useFetch<T>>[1] & {
    /** Time in ms before cache is considered stale. Default: 5 minutes */
    maxAge?: number
  } = {}
) {
  const { maxAge = 5 * 60 * 1000, ...fetchOptions } = options

  return useFetch<T>(url, {
    ...fetchOptions,
    getCachedData(key, nuxtApp) {
      // Check for SSR payload data first (hydration)
      const payloadData = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      if (payloadData) {
        return payloadData
      }

      // Check for client-side cached data with timestamp
      const cached = nuxtApp.payload._cachedFetch?.[key]
      if (!cached) {
        return undefined
      }

      // Check if cache has expired
      const expiresAt = cached.timestamp + maxAge
      if (Date.now() > expiresAt) {
        // Cache expired, clear it
        delete nuxtApp.payload._cachedFetch[key]
        return undefined
      }

      return cached.data
    },
    transform(data) {
      // Store in cache with timestamp for future navigations
      const nuxtApp = useNuxtApp()
      const key = fetchOptions.key || (typeof url === 'function' ? url() : url)
      
      if (!nuxtApp.payload._cachedFetch) {
        nuxtApp.payload._cachedFetch = {}
      }
      
      nuxtApp.payload._cachedFetch[key] = {
        data,
        timestamp: Date.now()
      }

      // Apply user's transform if provided
      if (options.transform) {
        return options.transform(data as T)
      }
      return data
    }
  })
}

/**
 * A simpler approach using useAsyncData with getCachedData for SPA caching.
 * This mimics the old behavior where data is cached indefinitely during the session.
 */
export function useCachedAsyncData<T>(
  key: string,
  handler: () => Promise<T>,
  options: Parameters<typeof useAsyncData<T>>[2] = {}
) {
  const nuxtApp = useNuxtApp()
  
  const asyncData = useAsyncData<T>(key, handler, {
    ...options,
    getCachedData(key, nuxtApp) {
      // Always return cached data if available (for SPA navigation)
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  })

  // Override refresh to clear cache before fetching new data
  const originalRefresh = asyncData.refresh
  asyncData.refresh = async (opts) => {
    // Clear the cached data so getCachedData doesn't return stale data
    if (nuxtApp.payload.data[key] !== undefined) {
      delete nuxtApp.payload.data[key]
    }
    if (nuxtApp.static.data[key] !== undefined) {
      delete nuxtApp.static.data[key]
    }
    return originalRefresh(opts)
  }

  return asyncData
}
