import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types"

// Get resident's own complaints and public complaints from their hostel
export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)
    const query = getQuery(event)
    const filter = query.filter as string | undefined // 'my' | 'public' | undefined (all)

    const userId = (user as any).sub || (user as any).id

    // Get resident's hostel
    const { data: resident, error: residentErr } = await client
      .from("residents")
      .select("id, hostel_id")
      .eq("id", userId)
      .single()

    if (residentErr || !resident) {
      throw createError({ statusCode: 404, statusMessage: "Resident not found" })
    }

    // Build query based on filter
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
      .eq("hostel_id", resident.hostel_id)
      .order("created_at", { ascending: false })

    if (filter === "my") {
      // Only show user's own complaints
      complaintsQuery = complaintsQuery.eq("author", userId)
    } else if (filter === "public") {
      // Show all public complaints
      complaintsQuery = complaintsQuery.eq("type", "public")
    } else {
      // Show user's own complaints AND public complaints
      complaintsQuery = complaintsQuery.or(`author.eq.${userId},type.eq.public`)
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

    // Get user's upvotes
    const { data: userUpvotes, error: upvotesErr } = await client
      .from("complaint_upvotes")
      .select("complaint_id")
      .eq("user_id", userId)
      .in("complaint_id", complaintIds)

    const upvotedIds = new Set(userUpvotes?.map(u => u.complaint_id) || [])

    // Add reply count and upvote status to each complaint
    const enrichedComplaints = complaints?.map(complaint => {
      const residentData = complaint.residents as any
      return {
        ...complaint,
        reply_count: replyCounts[complaint.id] || 0,
        author_profile: residentData?.profiles || null,
        author_room: residentData?.room || null,
        is_own: complaint.author === userId,
        has_upvoted: upvotedIds.has(complaint.id),
      }
    }) || []

    return { success: true, complaints: enrichedComplaints, hostel_id: resident.hostel_id }
  } catch (error: any) {
    console.error("Error listing resident complaints:", error)
    throw error
  }
})
