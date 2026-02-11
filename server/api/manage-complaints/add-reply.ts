import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"
import type { Database } from "~/types/database.types"
import { sendNotification } from "../../utils/notifications"

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await serverSupabaseClient<Database>(event)

    const body = await readBody<{
      complaint_id: string
      message: string
      hostel_slug: string
    }>(event)

    const { complaint_id, message, hostel_slug } = body || ({} as any)

    if (!complaint_id || !message?.trim() || !hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id, message, and hostel_slug are required" })
    }

    const userId = (user as any).sub || (user as any).id

    // Verify hostel and get id
    const { data: hostel, error: hostelErr } = await client
      .from("hostels")
      .select("id, admin_user_id")
      .eq("hostel_slug", hostel_slug)
      .single()

    if (hostelErr || !hostel) {
      throw createError({ statusCode: 404, statusMessage: "Hostel not found" })
    }

    const isAdmin = hostel.admin_user_id === userId
    const isStaff = await isStaffForHostel(event, userId, hostel.id)
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "manage_complaints"))

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Get the complaint and verify it belongs to this hostel
    const { data: complaint, error: complaintErr } = await client
      .from("hostel_complaints")
      .select("id, hostel_id, status, author, title")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.hostel_id !== hostel.id) {
      throw createError({ statusCode: 403, statusMessage: "Complaint does not belong to this hostel" })
    }

    // Insert reply
    const { data: reply, error: insertErr } = await client
      .from("hostel_complaint_replies")
      .insert({
        complaint_id,
        author: userId,
        message: message.trim(),
      })
      .select(`
        id,
        message,
        created_at,
        author,
        profiles:author (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .single()

    if (insertErr || !reply) {
      throw createError({ statusCode: 500, statusMessage: insertErr?.message || "Failed to add reply" })
    }

    // Send notification to complaint author (if not the same person replying)
    if (complaint.author && complaint.author !== userId) {
      sendNotification(event, {
        userId: complaint.author,
        title: `Reply: ${complaint.title.substring(0, 40)}${complaint.title.length > 40 ? '...' : ''}`,
        body: message.trim().substring(0, 80) + (message.length > 80 ? '...' : ''),
        url: `/resident/complaints`,
        type: "complaint",
        data: {
          complaintId: complaint_id,
          replyId: reply.id,
        },
      }).catch(err => {
        console.error("Failed to send reply notification:", err)
      })
    }

    return { 
      success: true, 
      reply: {
        ...reply,
        author_profile: reply.profiles
      }
    }
  } catch (error: any) {
    console.error("Error adding reply:", error)
    throw error
  }
})
