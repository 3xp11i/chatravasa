import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types"

// Get replies for a complaint (resident can view replies for their own or public complaints)
export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)
    const query = getQuery(event)
    const complaint_id = query.complaint_id as string

    if (!complaint_id) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id is required" })
    }

    const userId = (user as any).sub || (user as any).id

    // Verify user is a resident
    const { data: resident, error: residentErr } = await client
      .from("residents")
      .select("id, hostel_id")
      .eq("id", userId)
      .single()

    if (residentErr || !resident) {
      throw createError({ statusCode: 403, statusMessage: "Only residents can view replies" })
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
      throw createError({ statusCode: 403, statusMessage: "You can only view complaints from your hostel" })
    }

    // Can view replies for own complaints or public complaints
    const canView = complaint.author === userId || complaint.type === "public"
    if (!canView) {
      throw createError({ statusCode: 403, statusMessage: "You can only view replies for your own complaints or public complaints" })
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
      is_own: reply.author === userId,
    })) || []

    return { success: true, replies: formattedReplies }
  } catch (error: any) {
    console.error("Error getting replies:", error)
    throw error
  }
})
