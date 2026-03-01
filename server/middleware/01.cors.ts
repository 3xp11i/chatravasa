import { setResponseHeaders, sendNoContent, getHeader } from 'h3'

/**
 * CORS middleware for handling cross-origin requests from native apps.
 * 
 * Handles OPTIONS preflight requests and sets proper CORS headers.
 * NOTE: We use wildcard origin (*) without credentials header per CORS spec.
 */
export default defineEventHandler((event) => {
  // Set CORS headers on ALL responses
  // Using wildcard for mobile apps, with Vary header for proper caching
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Max-Age': '3600', // 1 hour cache for preflight
    'Vary': 'Origin', // Important for proper caching of CORS responses
  })

  // Handle OPTIONS preflight requests immediately
  if (event.method === 'OPTIONS') {
    return sendNoContent(event)
  }
})
