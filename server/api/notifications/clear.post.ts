/**
 * Clear All Notifications API Endpoint
 * 
 * POST /api/notifications/clear
 * 
 * Deletes all notifications for the authenticated user.
 * This is a permanent action - notifications cannot be recovered.
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

    const userId = (user as any).sub || (user as any).id
    const client = await getAuthenticatedClient(event)

    // Delete all notifications for this user
    const { error } = await client
      .from("notifications")
      .delete()
      .eq("user_id", userId)

    if (error) {
      console.error("Failed to clear notifications:", error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to clear notifications" 
      })
    }

    return { success: true }
  } catch (err: any) {
    console.error("Clear notifications error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal server error",
    })
  }
})
