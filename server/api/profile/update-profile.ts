// Update user profile - only first_name and last_name can be updated
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No authenticated user',
    })
  }

  // Get the user ID - might be in different fields depending on response format
  const userId = user.id || (user as any).sub
  
  if (!userId) {
    console.error('User object:', user)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unable to determine user ID from authentication token',
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  // Get request body
  const body = await readBody(event)
  const { firstName, lastName } = body

  // Validate input
  if (!firstName?.trim() || !lastName?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name and last name are required',
    })
  }

  try {
    // Update the profile
    const { data, error } = await client
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update profile: ${error.message}`,
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found',
      })
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      profile: data,
    }
  } catch (err: any) {
    console.error('Exception while updating profile:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to update profile',
    })
  }
})
