// Upload avatar to Supabase storage and update profile
import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from '~/types/database.types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  // Get the user from the server-side auth
  const user = await getAuthUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No authenticated user',
    })
  }

  const userId = user.id || (user as any).sub

  if (!userId) {
    console.error('User object:', user)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unable to determine user ID from authentication token',
    })
  }

  console.log('Avatar upload initiated for user:', userId)

  try {
    // Parse FormData
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided',
      })
    }

    // Find the file in formData
    const filePart = formData.find((part) => part.name === 'file')

    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided',
      })
    }

    // Validate file size
    if (filePart.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size must be less than 5MB. Current size: ${(filePart.data.length / 1024 / 1024).toFixed(2)}MB`,
      })
    }

    // Get file extension from filename
    const originalFilename = filePart.filename || 'avatar'
    const fileExtension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg'

    // Validate image file type
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!allowedExtensions.includes(fileExtension)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
      })
    }

    const client = await getAuthenticatedClient(event)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${userId}-${timestamp}.${fileExtension}`

    // Delete old avatar if it exists
    const { data: existingFiles } = await client.storage
      .from('avatars')
      .list(userId)

    if (existingFiles && existingFiles.length > 0) {
      const filePathsToDelete = existingFiles.map((file) => `${userId}/${file.name}`)
      await client.storage.from('avatars').remove(filePathsToDelete)
    }

    // Upload new avatar
    const { data: uploadData, error: uploadError } = await client.storage
      .from('avatars')
      .upload(`${userId}/${filename}`, filePart.data, {
        contentType: filePart.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to upload image: ${uploadError.message}`,
      })
    }

    if (!uploadData) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to upload image: No response from storage',
      })
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from('avatars')
      .getPublicUrl(uploadData.path)

    const avatarUrl = publicUrlData.publicUrl

    if (!avatarUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate avatar URL',
      })
    }

    // Update profile with avatar URL
    console.log('Updating profile with avatar URL for user:', userId, 'URL:', avatarUrl)
    
    const { data: profileData, error: updateError } = await client
      .from('profiles')
      .update({
        avatar: avatarUrl,
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      })
      // Try to clean up uploaded file
      await client.storage.from('avatars').remove([uploadData.path])
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update profile: ${updateError.message}`,
      })
    }

    if (!profileData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found',
      })
    }

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      profile: profileData,
      avatarUrl,
    }
  } catch (err: any) {
    console.error('Exception while uploading avatar:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to upload avatar',
    })
  }
})
