import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import { isStaffForHostel, staffHasPermission } from "#imports"
import type { Database } from "~/types/database.types"
import { sendNotification } from "../../utils/notifications"

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)

    const body = await readBody<{
      complaint_id: string
      status: "ongoing"
      hostel_slug: string
    }>(event)

    const { complaint_id, status, hostel_slug } = body || ({} as any)

    if (!complaint_id || !status || !hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "complaint_id, status, and hostel_slug are required" })
    }

    // Admin/staff can only change status from pending to ongoing
    if (status !== "ongoing") {
      throw createError({ statusCode: 400, statusMessage: "Admin/staff can only update status to 'ongoing'" })
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
      .select("id, status, hostel_id, author, title")
      .eq("id", complaint_id)
      .single()

    if (complaintErr || !complaint) {
      throw createError({ statusCode: 404, statusMessage: "Complaint not found" })
    }

    if (complaint.hostel_id !== hostel.id) {
      throw createError({ statusCode: 403, statusMessage: "Complaint does not belong to this hostel" })
    }

    // Can only move from pending to ongoing
    if (complaint.status !== "pending") {
      throw createError({ statusCode: 400, statusMessage: "Can only update status from 'pending' to 'ongoing'" })
    }

    // Update status
    const { data: updatedComplaint, error: updateErr } = await client
      .from("hostel_complaints")
      .update({ status: "ongoing" })
      .eq("id", complaint_id)
      .select()
      .single()

    if (updateErr) {
      throw createError({ statusCode: 500, statusMessage: updateErr.message })
    }

    // Send notification to complaint author about status change
    if (complaint.author) {
      sendNotification(event, {
        userId: complaint.author,
        title: `Status Update: ${complaint.title.substring(0, 35)}${complaint.title.length > 35 ? '...' : ''}`,
        body: `Your complaint is now being addressed. Status changed to "Ongoing".`,
        url: `/resident/complaints`,
        type: "complaint",
        data: {
          complaintId: complaint_id,
          newStatus: "ongoing",
        },
      }).catch(err => {
        console.error("Failed to send status update notification:", err)
      })
    }

    return { success: true, complaint: updatedComplaint }
  } catch (error: any) {
    console.error("Error updating complaint status:", error)
    throw error
  }
})
