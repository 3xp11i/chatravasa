import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types"
import { sendNotificationToHostelAdmins } from "../../../utils/notifications"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_IMAGES = 2
const MAX_VIDEOS = 1

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)
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

    // Parse FormData
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "No data provided" })
    }

    // Extract form fields
    let title = ""
    let description = ""
    let type: "private" | "public" = "private"
    const mediaFiles: { data: Buffer; filename: string; type: string }[] = []

    for (const part of formData) {
      if (part.name === "title" && part.data) {
        title = part.data.toString("utf-8")
      } else if (part.name === "description" && part.data) {
        description = part.data.toString("utf-8")
      } else if (part.name === "type" && part.data) {
        const typeValue = part.data.toString("utf-8")
        if (typeValue === "public" || typeValue === "private") {
          type = typeValue
        }
      } else if (part.name === "media" && part.data && part.filename) {
        if (part.data.length > MAX_FILE_SIZE) {
          throw createError({
            statusCode: 400,
            statusMessage: `File ${part.filename} exceeds maximum size of 10MB`,
          })
        }
        mediaFiles.push({
          data: part.data,
          filename: part.filename,
          type: part.type || "application/octet-stream",
        })
      }
    }

    if (!title?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Title is required" })
    }

    if (!description?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Description is required" })
    }

    // Validate file counts
    const imageCount = mediaFiles.filter(f => f.type.startsWith("image/")).length
    const videoCount = mediaFiles.filter(f => f.type.startsWith("video/")).length

    if (imageCount > MAX_IMAGES) {
      throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_IMAGES} images allowed` })
    }

    if (videoCount > MAX_VIDEOS) {
      throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_VIDEOS} video allowed` })
    }

    // Upload media files
    const uploadedMediaUrls: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i]
      const ext = file.filename.split(".").pop()?.toLowerCase() || "bin"
      const filename = `${userId}/${timestamp}-${i}.${ext}`

      const { data: uploadData, error: uploadError } = await client.storage
        .from("complaints_media")
        .upload(filename, file.data, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Media upload error:", uploadError)
        // Clean up already uploaded files
        if (uploadedMediaUrls.length > 0) {
          await client.storage
            .from("complaints_media")
            .remove(uploadedMediaUrls.map(url => {
              const parts = url.split("/complaints_media/")
              return parts[1] || ""
            }))
        }
        throw createError({ statusCode: 500, statusMessage: `Failed to upload media: ${uploadError.message}` })
      }

      const { data: publicUrlData } = client.storage
        .from("complaints_media")
        .getPublicUrl(uploadData.path)

      uploadedMediaUrls.push(publicUrlData.publicUrl)
    }

    // Create complaint
    const { data: complaint, error: insertErr } = await client
      .from("hostel_complaints")
      .insert({
        hostel_id: resident.hostel_id,
        author: userId,
        title: title.trim(),
        description: description.trim(),
        type,
        attached_media: uploadedMediaUrls,
        status: "pending",
        upvotes: 0,
      })
      .select()
      .single()

    if (insertErr || !complaint) {
      // Clean up uploaded media
      if (uploadedMediaUrls.length > 0) {
        await client.storage
          .from("complaints_media")
          .remove(uploadedMediaUrls.map(url => {
            const parts = url.split("/complaints_media/")
            return parts[1] || ""
          }))
      }
      throw createError({ statusCode: 500, statusMessage: insertErr?.message || "Failed to create complaint" })
    }

    // Get hostel slug for the notification URL
    const { data: hostel } = await client
      .from("hostels")
      .select("hostel_slug")
      .eq("id", resident.hostel_id)
      .single()

    // Send notification to hostel admin and staff with manage_complaints permission
    // This runs in the background and won't block the response
    sendNotificationToHostelAdmins(
      event,
      resident.hostel_id,
      {
        title: `New Complaint: ${title.trim().substring(0, 40)}${title.length > 40 ? '...' : ''}`,
        body: `${type === 'public' ? '[Public]' : '[Private]'} ${description.trim().substring(0, 80)}${description.length > 80 ? '...' : ''}`,
        url: hostel?.hostel_slug ? `/dashboard/hostels/${hostel.hostel_slug}/manage-complaints` : '/dashboard',
        type: "complaint",
        data: {
          complaintId: complaint.id,
          complaintType: type,
        },
      },
      "manage_complaints" // Only notify staff who can manage complaints
    ).catch(err => {
      // Log error but don't fail the request
      console.error("Failed to send complaint notification:", err)
    })

    return { success: true, complaint }
  } catch (error: any) {
    console.error("Error creating complaint:", error)
    throw error
  }
})
