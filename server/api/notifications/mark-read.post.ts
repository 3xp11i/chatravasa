/**
 * Mark Notification as Read API Endpoint
 * 
 * POST /api/notifications/mark-read
 * 
 * Marks one or all notifications as read for the authenticated user.
 * 
 * Request body:
 * - notificationId: (optional) Single notification ID to mark as read
 * - markAll: (optional) If true, marks all notifications as read
 * 
 * One of notificationId or markAll must be provided.
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
    const { notificationId, markAll } = body

    if (!notificationId && !markAll) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Must specify notificationId or markAll" 
      })
    }

    const userId = (user as any).sub || (user as any).id
    const client = await getAuthenticatedClient(event)

    if (markAll) {
      // Mark all user's notifications as read
      const { error } = await client
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        console.error("Failed to mark all as read:", error)
        throw createError({ 
          statusCode: 500, 
          statusMessage: "Failed to mark notifications as read" 
        })
      }
    } else {
      // Mark single notification as read
      // We verify the notification belongs to the user
      const { error } = await client
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) {
        console.error("Failed to mark as read:", error)
        throw createError({ 
          statusCode: 500, 
          statusMessage: "Failed to mark notification as read" 
        })
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Mark read error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal server error",
    })
  }
})
