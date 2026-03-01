import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import { isStaffForHostel, staffHasPermission } from "#imports"
import type { Database } from "~/types/database.types"

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)
    const query = getQuery(event)
    const complaint_id = query.complaint_id as string
    const hostel_slug = query.hostel_slug as string

    if (!complaint_id || !hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id and hostel_slug are required" })
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
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "view_complaints"))

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Get the complaint and verify it belongs to this hostel
    const { data: complaint, error: complaintErr } = await client
      .from("hostel_complaints")
      .select("id, hostel_id")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.hostel_id !== hostel.id) {
      throw createError({ statusCode: 403, statusMessage: "Complaint does not belong to this hostel" })
    }

    // Get replies
    const { data: replies, error: repliesErr } = await client
      .from("hostel_complaint_replies")
      .select(`
        id,
        message,
        created_at,
        author,
        profiles:author (
          id,
          first_name,
          last_name,
          avatar,
          is_admin
        )
      `)
      .eq("complaint_id", complaint_id)
      .order("created_at", { ascending: true })

    if (repliesErr) {
      throw createError({ statusCode: 500, statusMessage: repliesErr.message })
    }

    // Format replies with author info
    const formattedReplies = replies?.map(reply => ({
      ...reply,
      author_profile: reply.profiles,
    })) || []

    return { success: true, replies: formattedReplies }
  } catch (error: any) {
    console.error("Error getting replies:", error)
    throw error
  }
})
