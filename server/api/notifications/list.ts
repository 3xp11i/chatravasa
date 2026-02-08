/**
 * List Notifications API Endpoint
 * 
 * GET /api/notifications/list
 * 
 * Fetches all notifications for the authenticated user.
 * Returns notifications ordered by creation date (newest first).
 * 
 * Query params:
 * - limit: (optional) Max number of notifications to return (default: 50)
 * - unreadOnly: (optional) If "true", only return unread notifications
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

    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 50
    const unreadOnly = query.unreadOnly === "true"

    const userId = (user as any).sub || (user as any).id
    const client = await serverSupabaseClient<Database>(event)

    // Build query for notifications
    let notificationsQuery = client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    // Filter by unread if requested
    if (unreadOnly) {
      notificationsQuery = notificationsQuery.eq("is_read", false)
    }

    const { data, error } = await notificationsQuery

    if (error) {
      console.error("Failed to fetch notifications:", error)
      throw createError({ 
        statusCode: 500, 
        statusMessage: "Failed to fetch notifications" 
      })
    }

    return data || []
  } catch (err: any) {
    console.error("List notifications error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Internal server error",
    })
  }
})
