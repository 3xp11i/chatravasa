/**
 * Push Unsubscribe API Endpoint
 * 
 * POST /api/push/unsubscribe
 * 
 * Removes a push notification subscription from the database.
 * Called when a user disables push notifications in the app.
 * 
 * Request body:
 * - endpoint: The push subscription endpoint URL to remove
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import type { Database } from "~/types/database.types"

export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const body = await readBody(event)
    const { endpoint } = body

    if (!endpoint) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Missing endpoint" 
      })
    }

    const client = await serverSupabaseClient<Database>(event)
    const userId = (user as any).sub || (user as any).id

    // Delete subscription matching endpoint and user
    // We verify the user owns this subscription for security
    const { error } = await client
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", userId)

    if (error) {
      console.error("Failed to remove subscription:", error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to remove subscription" 
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error("Unsubscribe error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal server error",
    })
  }
})
