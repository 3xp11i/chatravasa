/**
 * Send Fee Reminder API Endpoint
 * 
 * POST /api/manage-fees/send-reminder
 * 
 * Sends a fee reminder notification to all residents of a hostel,
 * or to specific residents who have pending fees.
 * 
 * Request body:
 * - hostel_slug: The hostel slug to send reminders for
 * - resident_ids: (optional) Array of specific resident IDs to notify
 * - message: (optional) Custom message to include in the notification
 * 
 * Only accessible by hostel admin or staff with manage_fees permission.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"
import type { Database } from "~/types/database.types"
import { sendNotification } from "../../utils/notifications"

export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const client = await serverSupabaseClient<Database>(event)
    const userId = (user as any).sub || (user as any).id
    const body = await readBody(event)

    const { hostel_slug, resident_ids, message } = body

    if (!hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" })
    }

    // Get hostel - using hostel_name not name
    const { data: hostel, error: hostelErr } = await client
      .from("hostels")
      .select("id, admin_user_id, hostel_name")
      .eq("hostel_slug", hostel_slug)
      .single()

    if (hostelErr || !hostel) {
      throw createError({ statusCode: 404, statusMessage: "Hostel not found" })
    }

    // Check permissions - must be admin or staff with manage_fees permission
    const isAdmin = hostel.admin_user_id === userId
    const isStaff = await isStaffForHostel(event, userId, hostel.id)
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "manage_fees"))

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Get target residents - residents.id IS the user_id (references profiles.id)
    let targetUserIds: string[] = []

    if (resident_ids && Array.isArray(resident_ids) && resident_ids.length > 0) {
      // Send to specific residents
      const { data: residents } = await client
        .from("residents")
        .select("id")
        .eq("hostel_id", hostel.id)
        .in("id", resident_ids)

      if (residents) {
        targetUserIds = residents.map(r => r.id)
      }
    } else {
      // Send to all residents of the hostel
      const { data: residents } = await client
        .from("residents")
        .select("id")
        .eq("hostel_id", hostel.id)

      if (residents) {
        targetUserIds = residents.map(r => r.id)
      }
    }

    if (!targetUserIds.length) {
      return { success: true, sent: 0, message: "No residents to notify" }
    }

    // Prepare notification content
    const notificationTitle = "Fee Payment Reminder"
    const notificationBody = message || `Please check your pending fee payments for ${hostel.hostel_name}.`

    // Send notification
    const result = await sendNotification(event, {
      userIds: targetUserIds,
      title: notificationTitle,
      body: notificationBody,
      url: "/resident/my-hostel", // Residents can check their fee status here
      type: "fee",
      data: {
        hostelId: hostel.id,
        hostelName: hostel.hostel_name,
      },
    })

    return {
      success: true,
      notifiedCount: targetUserIds.length,
      ...result,
    }
  } catch (err: any) {
    console.error("Fee reminder error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to send fee reminders",
    })
  }
})
