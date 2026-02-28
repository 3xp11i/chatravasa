import { setResponseHeaders, sendNoContent } from 'h3'

/**
 * CORS middleware for handling cross-origin requests from native apps.
 * 
 * Problem: When the Capacitor app makes requests from local files (https:// scheme)
 * to the production API (app.chatravasa.com), browsers send OPTIONS preflight requests.
 * 
 * This middleware:
 * 1. Sets CORS headers on all API responses
 * 2. Immediately responds to OPTIONS preflight requests
 * 
 * NOTE: This file is named 01.cors.ts to ensure it runs BEFORE auth.ts (alphabetically)
 */
export default defineEventHandler((event) => {
  // Only process API routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Set CORS headers for all API responses
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*', // Allow all origins for native apps
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  })

  // Handle OPTIONS preflight requests immediately
  if (event.method === 'OPTIONS') {
    // Return 204 No Content for preflight requests
    return sendNoContent(event)
  }
})
