/**
 * Push Notification Utility
 * 
 * Server-side utility for sending push notifications from any API endpoint.
 * This abstracts the notification sending logic for easy reuse.
 * 
 * @example
 * import { sendNotification, sendNotificationToHostelAdmins } from "~/server/utils/notifications"
 * 
 * // Send to specific user
 * await sendNotification(event, {
 *   userId: "user-id",
 *   title: "New message",
 *   body: "You have a new message",
 *   url: "/messages"
 * })
 * 
 * // Send to hostel admin when complaint is created
 * await sendNotificationToHostelAdmins(event, hostelId, {
 *   title: "New Complaint",
 *   body: "A resident has submitted a new complaint",
 *   url: `/dashboard/hostels/${hostelSlug}/complaints`
 * })
 */

import webpush from "web-push"
import { serverSupabaseServiceRole } from "#supabase/server"
import type { H3Event } from "h3"

// Notification types for categorization
export type NotificationType = 
  | "complaint"      // Complaint-related notifications
  | "fee"            // Fee/payment notifications
  | "meal"           // Meal plan notifications
  | "announcement"   // General announcements
  | "system"         // System notifications
  | "general"        // Default type

// Options for sending a notification
export interface NotificationOptions {
  userId?: string
  userIds?: string[]
  hostelId?: string
  title: string
  body: string
  url?: string
  type?: NotificationType
  data?: Record<string, any>
}

/**
 * Send notification to specified users
 * Creates in-app notification record and sends push notification
 * 
 * @param event - H3 event from the request handler
 * @param options - Notification options including recipients and content
 * @returns Object with counts of sent, failed, and stored notifications
 */
export async function sendNotification(
  event: H3Event,
  options: NotificationOptions
): Promise<{ sent: number; failed: number; stored: number }> {
  const config = useRuntimeConfig()
  const { userId, userIds, hostelId, title, body, url, type = "general", data } = options

  if (!userId && !userIds?.length && !hostelId) {
    console.warn("sendNotification: No recipients specified")
    return { sent: 0, failed: 0, stored: 0 }
  }

  // Configure web-push with VAPID credentials
  webpush.setVapidDetails(
    config.vapidSubject as string,
    config.public.vapidPublicKey as string,
    config.vapidPrivateKey as string
  )

  // Use service role client - tables are accessed without type checking
  // since push_subscriptions and notifications tables are new
  const supabase = await serverSupabaseServiceRole(event)

  // Determine target user IDs
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
      targetUserIds = (residents as { id: string }[]).map(r => r.id).filter(Boolean)
    }
  }

  if (!targetUserIds.length) {
    return { sent: 0, failed: 0, stored: 0 }
  }

  // Create notification records for in-app display
  const notificationRecords = targetUserIds.map(uid => ({
    user_id: uid,
    title,
    body,
    url: url || null,
    type,
    is_read: false,
    metadata: data || null,
  }))

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notificationRecords)

  if (insertError) {
    console.error("Failed to store notifications:", insertError)
  }

  // Define subscription type for the new table
  interface PushSubscription {
    id: string
    user_id: string
    endpoint: string
    p256dh: string
    auth: string
  }

  // Get push subscriptions
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", targetUserIds) as { data: PushSubscription[] | null }

  // Send push notifications
  const payload = JSON.stringify({
    title,
    body,
    url: url || "/",
    data,
  })

  let sent = 0
  let failed = 0

  if (subscriptions?.length) {
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscription) => {
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
          return true
        } catch (err: any) {
          // Clean up invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint)
          }
          return false
        }
      })
    )

    results.forEach(result => {
      if (result.status === "fulfilled" && result.value) {
        sent++
      } else {
        failed++
      }
    })
  }

  return { sent, failed, stored: notificationRecords.length }
}

/**
 * Send notification to hostel admin and staff with specific permission
 * Useful for notifying admins about resident actions
 * 
 * @param event - H3 event from the request handler
 * @param hostelId - Hostel ID to get admin and staff from
 * @param options - Notification options (userId/userIds will be overwritten)
 * @param staffPermission - (optional) Only include staff with this permission
 */
export async function sendNotificationToHostelAdmins(
  event: H3Event,
  hostelId: string,
  options: Omit<NotificationOptions, "userId" | "userIds" | "hostelId">,
  staffPermission?: string
): Promise<{ sent: number; failed: number; stored: number }> {
  const supabase = await serverSupabaseServiceRole(event)

  // Get hostel admin
  const { data: hostel } = await supabase
    .from("hostels")
    .select("admin_user_id")
    .eq("id", hostelId)
    .single()

  const targetUserIds: string[] = []

  if (hostel?.admin_user_id) {
    targetUserIds.push(hostel.admin_user_id)
  }

  // Get staff with the required permission (if specified)
  if (staffPermission) {
    const { data: staffWithRoles } = await supabase
      .from("hostel_staff")
      .select(`
        staff_member_id,
        hostel_staff_roles!inner (
          ${staffPermission}
        )
      `)
      .eq("hostel_id", hostelId)

    if (staffWithRoles) {
      staffWithRoles.forEach((staff: any) => {
        const role = staff.hostel_staff_roles
        if (role && role[staffPermission]) {
          targetUserIds.push(staff.staff_member_id)
        }
      })
    }
  }

  if (!targetUserIds.length) {
    return { sent: 0, failed: 0, stored: 0 }
  }

  return sendNotification(event, {
    ...options,
    userIds: [...new Set(targetUserIds)], // Remove duplicates
  })
}

/**
 * Send notification to all residents of a hostel
 * Useful for announcements and fee reminders
 * 
 * @param event - H3 event from the request handler
 * @param hostelId - Hostel ID to get residents from
 * @param options - Notification options (hostelId will be set automatically)
 */
export async function sendNotificationToHostelResidents(
  event: H3Event,
  hostelId: string,
  options: Omit<NotificationOptions, "userId" | "userIds" | "hostelId">
): Promise<{ sent: number; failed: number; stored: number }> {
  const supabase = await serverSupabaseServiceRole(event)

  // Get all residents of the hostel
  // Note: In this schema, residents.id IS the user_id (references profiles.id)
  const { data: residents } = await supabase
    .from("residents")
    .select("id")
    .eq("hostel_id", hostelId)

  if (!residents?.length) {
    return { sent: 0, failed: 0, stored: 0 }
  }

  const targetUserIds = (residents as { id: string }[])
    .map(r => r.id)
    .filter(Boolean)

  return sendNotification(event, {
    ...options,
    userIds: targetUserIds,
  })
}
