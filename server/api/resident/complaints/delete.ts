import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import type { Database } from "~/types/database.types"

// Resident deletes their own complaint
export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await serverSupabaseClient<Database>(event)

    const body = await readBody<{
      complaint_id: string
    }>(event)

    const { complaint_id } = body || ({} as any)

    if (!complaint_id) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id is required" })
    }

    const userId = (user as any).sub || (user as any).id

    // Get the complaint and verify ownership
    const { data: complaint, error: complaintErr } = await client
      .from("hostel_complaints")
      .select("id, author")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.author !== userId) {
      throw createError({ statusCode: 403, statusMessage: "Only the complaint author can delete it" })
    }

    // Delete related upvotes first (if no cascade)
    await client
      .from("complaint_upvotes")
      .delete()
      .eq("complaint_id", complaint_id)

    // Delete related replies (if no cascade)
    await client
      .from("hostel_complaint_replies")
      .delete()
      .eq("complaint_id", complaint_id)

    // Delete the complaint
    const { error: deleteErr } = await client
      .from("hostel_complaints")
      .delete()
      .eq("id", complaint_id)

    if (deleteErr) {
      throw createError({ statusCode: 500, statusMessage: deleteErr.message })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting complaint:", error)
    throw error
  }
})
