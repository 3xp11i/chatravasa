import { setResponseHeaders, sendNoContent, setResponseStatus } from 'h3'

/**
 * CORS middleware for handling cross-origin requests from native apps.
 * 
 * CRITICAL: This middleware MUST run first (hence 01. prefix) and handle
 * OPTIONS preflight requests before any auth/routing logic.
 */
export default defineEventHandler((event) => {
  // Set CORS headers on ALL responses
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Max-Age': '3600',
    'Vary': 'Origin',
  })

  // Handle OPTIONS preflight - must terminate immediately
  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''  // Return empty body and stop middleware chain
  }
})
