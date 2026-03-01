/**
 * Push Subscription API Endpoint
 * 
 * POST /api/push/subscribe
 * 
 * Saves a push notification subscription to the database.
 * Called when a user enables push notifications in the app.
 * 
 * Request body:
 * - subscription: PushSubscription JSON object containing endpoint, keys
 * - userId: The authenticated user's ID
 * 
 * The subscription is stored in the push_subscriptions table and linked to the user.
 * If a subscription with the same endpoint exists, it will be updated (upsert).
 */

import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types"

export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const body = await readBody(event)
    const { subscription, userId } = body

    // Validate required fields
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Invalid subscription data" 
      })
    }

    // Verify the userId matches the authenticated user
    const authUserId = (user as any).sub || (user as any).id
    if (userId !== authUserId) {
      throw createError({ 
        statusCode: 403, 
        statusMessage: "User ID mismatch" 
      })
    }

    const client = await getAuthenticatedClient(event)

    // Upsert subscription - update if endpoint exists, insert if not
    // This handles cases where user re-enables notifications
    const { error } = await client
      .from("push_subscriptions")
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "endpoint",
      })

    if (error) {
      console.error("Failed to save subscription:", error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to save subscription" 
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error("Subscribe error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal server error",
    })
  }
})
