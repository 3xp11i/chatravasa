import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types"

// Resident marks their own complaint as resolved
export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)

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
      .select("id, author, status")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.author !== userId) {
      throw createError({ statusCode: 403, statusMessage: "Only the complaint author can mark it as resolved" })
    }

    if (complaint.status === "resolved") {
      throw createError({ statusCode: 400, statusMessage: "Complaint is already resolved" })
    }

    // Update status to resolved
    const { data: updatedComplaint, error: updateErr } = await client
      .from("hostel_complaints")
      .update({ status: "resolved" })
      .eq("id", complaint_id)
      .select()
      .single()

    if (updateErr) {
      throw createError({ statusCode: 500, statusMessage: updateErr.message })
    }

    return { success: true, complaint: updatedComplaint }
  } catch (error: any) {
    console.error("Error resolving complaint:", error)
    throw error
  }
})
