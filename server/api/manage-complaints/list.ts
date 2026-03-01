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
    const hostel_slug = (query.hostel_slug as string) || ""
    const status = query.status as string | undefined
    const type = query.type as string | undefined

    if (!hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" })
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

    // Build query for complaints
    let complaintsQuery = client
      .from("hostel_complaints")
      .select(`
        id,
        title,
        description,
        status,
        type,
        author,
        created_at,
        attached_media,
        upvotes,
        residents:author (
          room,
          profiles (
            id,
            first_name,
            last_name,
            avatar
          )
        )
      `)
      .eq("hostel_id", hostel.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (status && ["pending", "ongoing", "resolved"].includes(status)) {
      complaintsQuery = complaintsQuery.eq("status", status as Database["public"]["Enums"]["Complaint Status"])
    }
    if (type && ["private", "public"].includes(type)) {
      complaintsQuery = complaintsQuery.eq("type", type as Database["public"]["Enums"]["Complaint Type"])
    }

    const { data: complaints, error: complaintsErr } = await complaintsQuery

    if (complaintsErr) {
      throw createError({ statusCode: 500, statusMessage: complaintsErr.message })
    }

    // Get reply counts for each complaint
    const complaintIds = complaints?.map(c => c.id) || []
    let replyCounts: Record<string, number> = {}

    if (complaintIds.length > 0) {
      const { data: replies, error: repliesErr } = await client
        .from("hostel_complaint_replies")
        .select("complaint_id")
        .in("complaint_id", complaintIds)

      if (!repliesErr && replies) {
        replyCounts = replies.reduce((acc, reply) => {
          acc[reply.complaint_id] = (acc[reply.complaint_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Add reply count to each complaint
    const enrichedComplaints = complaints?.map(complaint => {
      const resident = complaint.residents as any
      return {
        ...complaint,
        reply_count: replyCounts[complaint.id] || 0,
        author_profile: resident?.profiles || null,
        author_room: resident?.room || null,
      }
    }) || []

    return { success: true, complaints: enrichedComplaints }
  } catch (error: any) {
    console.error("Error listing complaints:", error)
    throw error
  }
})
