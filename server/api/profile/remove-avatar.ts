import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No authenticated user',
    })
  }

  const userId = (user as any).id || (user as any).sub

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unable to determine user ID from authentication token',
    })
  }

  const client = await getAuthenticatedClient(event)

  try {
    // Delete existing avatar files for the user (if any)
    const { data: existingFiles, error: listError } = await client.storage
      .from('avatars')
      .list(userId)

    if (listError) {
      console.error('Error listing avatar files:', listError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing avatar files',
      })
    }

    if (existingFiles && existingFiles.length > 0) {
      const pathsToDelete = existingFiles.map((file) => `${userId}/${file.name}`)
      const { error: removeError } = await client.storage.from('avatars').remove(pathsToDelete)

      if (removeError) {
        console.error('Error removing avatar files:', removeError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete existing avatar files',
        })
      }
    }

    // Clear avatar URL from profile
    const { data: profileData, error: updateError } = await client
      .from('profiles')
      .update({ avatar: null })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error (remove avatar):', updateError)
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
      message: 'Avatar removed successfully',
      profile: profileData,
    }
  } catch (err: any) {
    console.error('Exception while removing avatar:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to remove avatar',
    })
  }
})
