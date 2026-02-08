/**
 * Send Push Notification API Endpoint
 * 
 * POST /api/push/send
 * 
 * Sends push notifications to specified users.
 * Also creates notification records in the database for in-app display.
 * 
 * This is an internal API - should be called from other server endpoints,
 * not directly from the client.
 * 
 * Request body:
 * - userId: (optional) Single user ID to send to
 * - userIds: (optional) Array of user IDs to send to
 * - hostelId: (optional) Send to all users in a hostel
 * - title: Notification title
 * - body: Notification body text
 * - url: (optional) URL to open when notification is clicked
 * - type: (optional) Notification type for categorization
 * - data: (optional) Additional data to include
 * 
 * At least one of userId, userIds, or hostelId must be provided.
 */

import webpush from "web-push"
import { serverSupabaseServiceRole } from "#supabase/server"
import type { Database } from "~/types/database.types"

// Type for the request body
interface SendNotificationBody {
  userId?: string
  userIds?: string[]
  hostelId?: string
  title: string
  body: string
  url?: string
  type?: string
  data?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody<SendNotificationBody>(event)

    const { userId, userIds, hostelId, title, body: messageBody, url, type, data } = body

    // Validate required fields
    if (!title || !messageBody) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Title and body are required" 
      })
    }

    if (!userId && !userIds?.length && !hostelId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Must specify userId, userIds, or hostelId" 
      })
    }

    // Configure web-push with VAPID credentials
    // VAPID (Voluntary Application Server Identification) authenticates our server
    webpush.setVapidDetails(
      config.vapidSubject as string,
      config.public.vapidPublicKey as string,
      config.vapidPrivateKey as string
    )

    // Use service role client to bypass RLS for server-to-server operations
    const supabase = await serverSupabaseServiceRole<Database>(event)

    // Build query to get target user subscriptions
    let targetUserIds: string[] = []

    if (userId) {
      targetUserIds = [userId]
    } else if (userIds?.length) {
      targetUserIds = userIds
    } else if (hostelId) {
      // Get all residents of the hostel
      // Note: In this schema, residents.id IS the user_id (references profiles.id)
      const { data: residents } = await supabase
        .from("residents")
        .select("id")
        .eq("hostel_id", hostelId)

      if (residents) {
        targetUserIds = residents.map(r => r.id).filter(Boolean)
      }

      // Also get admin of the hostel
      const { data: hostel } = await supabase
        .from("hostels")
        .select("admin_user_id")
        .eq("id", hostelId)
        .single()

      if (hostel?.admin_user_id) {
        targetUserIds.push(hostel.admin_user_id)
      }
    }

    if (!targetUserIds.length) {
      return { sent: 0, failed: 0, stored: 0 }
    }

    // Get push subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds)

    if (subError) {
      console.error("Failed to fetch subscriptions:", subError)
    }

    // Create notification records in database for in-app display
    const notificationRecords = targetUserIds.map(uid => ({
      user_id: uid,
      title,
      body: messageBody,
      url: url || null,
      type: type || "general",
      is_read: false,
      metadata: data || null,
    }))

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notificationRecords)

    if (insertError) {
      console.error("Failed to store notifications:", insertError)
    }

    // Send push notifications to all subscriptions
    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: url || "/",
      data,
    })

    let sent = 0
    let failed = 0

    if (subscriptions?.length) {
      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            )
            return { success: true, endpoint: sub.endpoint }
          } catch (err: any) {
            // Remove invalid subscriptions (410 Gone = expired, 404 = not found)
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("endpoint", sub.endpoint)
            }
            return { success: false, endpoint: sub.endpoint, error: err.message }
          }
        })
      )

      // Count successes and failures
      results.forEach(result => {
        if (result.status === "fulfilled" && result.value.success) {
          sent++
        } else {
          failed++
        }
      })
    }

    return { 
      sent, 
      failed, 
      stored: notificationRecords.length 
    }
  } catch (err: any) {
    console.error("Send notification error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to send notifications",
    })
  }
})
