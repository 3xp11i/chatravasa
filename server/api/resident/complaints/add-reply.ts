import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types"

// Resident adds a reply to their own complaint or a public complaint
export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)

    const body = await readBody<{
      complaint_id: string
      message: string
    }>(event)

    const { complaint_id, message } = body || ({} as any)

    if (!complaint_id || !message?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id and message are required" })
    }

    const userId = (user as any).sub || (user as any).id

    // Verify user is a resident
    const { data: resident, error: residentErr } = await client
      .from("residents")
      .select("id, hostel_id")
      .eq("id", userId)
      .single()

    if (residentErr || !resident) {
      throw createError({ statusCode: 403, statusMessage: "Only residents can add replies" })
    }

    // Get the complaint and verify access
    const { data: complaint, error: complaintErr } = await client
      .from("hostel_complaints")
      .select("id, type, hostel_id, author")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.hostel_id !== resident.hostel_id) {
      throw createError({ statusCode: 403, statusMessage: "You can only reply to complaints from your hostel" })
    }

    // Can reply to own complaints or public complaints
    const canReply = complaint.author === userId || complaint.type === "public"
    if (!canReply) {
      throw createError({ statusCode: 403, statusMessage: "You can only reply to your own complaints or public complaints" })
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

    return {
      success: true,
      reply: {
        ...reply,
        author_profile: reply.profiles,
      },
    }
  } catch (error: any) {
    console.error("Error adding reply:", error)
    throw error
  }
})
