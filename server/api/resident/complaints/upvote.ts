import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import type { Database } from "~/types/database.types"

// Resident upvotes a public complaint
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

    // Verify user is a resident
    const { data: resident, error: residentErr } = await client
      .from("residents")
      .select("id, hostel_id")
      .eq("id", userId)
      .single()

    if (residentErr || !resident) {
      throw createError({ statusCode: 403, statusMessage: "Only residents can upvote complaints" })
    }

    // Get the complaint and verify it's public and belongs to the same hostel
    const { data: complaint, error: complaintErr } = await client
      .from("hostel_complaints")
      .select("id, type, hostel_id, upvotes, author")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.type !== "public") {
      throw createError({ statusCode: 400, statusMessage: "Only public complaints can be upvoted" })
    }

    if (complaint.hostel_id !== resident.hostel_id) {
      throw createError({ statusCode: 403, statusMessage: "You can only upvote complaints from your hostel" })
    }

    // Cannot upvote own complaint
    if (complaint.author === userId) {
      throw createError({ statusCode: 400, statusMessage: "You cannot upvote your own complaint" })
    }

    // Check if user has already upvoted
    const { data: existingUpvote, error: upvoteCheckErr } = await client
      .from("complaint_upvotes")
      .select("id")
      .eq("complaint_id", complaint_id)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingUpvote) {
      // Remove upvote (toggle off)
      await client
        .from("complaint_upvotes")
        .delete()
        .eq("complaint_id", complaint_id)
        .eq("user_id", userId)

      // Decrement upvotes count
      const newUpvotes = Math.max(0, (complaint.upvotes || 0) - 1)
      const { error: updateErr } = await client
        .from("hostel_complaints")
        .update({ upvotes: newUpvotes })
        .eq("id", complaint_id)

      if (updateErr) {
        throw createError({ statusCode: 500, statusMessage: updateErr.message })
      }

      return { success: true, upvoted: false, upvotes: newUpvotes }
    } else {
      // Add upvote
      const { error: insertErr } = await client
        .from("complaint_upvotes")
        .insert({
          complaint_id,
          user_id: userId,
        })

      if (insertErr) {
        throw createError({ statusCode: 500, statusMessage: insertErr.message })
      }

      // Increment upvotes count
      const newUpvotes = (complaint.upvotes || 0) + 1
      const { error: updateErr } = await client
        .from("hostel_complaints")
        .update({ upvotes: newUpvotes })
        .eq("id", complaint_id)

      if (updateErr) {
        throw createError({ statusCode: 500, statusMessage: updateErr.message })
      }

      return { success: true, upvoted: true, upvotes: newUpvotes }
    }
  } catch (error: any) {
    console.error("Error upvoting complaint:", error)
    throw error
  }
})
