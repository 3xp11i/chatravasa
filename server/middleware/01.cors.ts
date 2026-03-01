import { setResponseHeaders, sendNoContent } from 'h3'

/**
 * CORS middleware for handling cross-origin requests from native apps.
 * 
 * Problem: When the Capacitor app makes requests from a local origin (https://localhost)
 * to the production API (dev.app.chatravasa.com), browsers send OPTIONS preflight requests.
 * 
 * Nitro must handle OPTIONS before route matching to avoid 404 responses.
 * 
 * This middleware:
 * 1. Sets CORS headers on ALL requests (runs before route matching)
 * 2. Immediately responds to OPTIONS preflight requests with 204
 */
export default defineEventHandler((event) => {
  // Set CORS headers on ALL responses (not just /api)
  // This ensures headers are present even if the route doesn't exist
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*', // Allow all origins for mobile apps
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  })

  // Handle OPTIONS preflight requests immediately - return 204 No Content
  if (event.method === 'OPTIONS') {
    return sendNoContent(event)
  }
})
