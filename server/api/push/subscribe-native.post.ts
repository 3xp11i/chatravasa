import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * Subscribe endpoint for native push notifications (Android/iOS via Capacitor)
 * Saves FCM/APNs token to database
 */
export default defineEventHandler(async (event) => {
  const { token, userId, platform } = await readBody(event)

  if (!token || !userId) {
    throw createError({
      statusCode: 400,
      message: 'Token and userId are required',
    })
  }

  const supabase = await serverSupabaseServiceRole(event)

  try {
    // Check if token already exists for this user
    const { data: existingToken } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform || 'android')
      .single()

    if (existingToken) {
      // Update existing token
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          native_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id)

      if (error) throw error
    } else {
      // Insert new token
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          native_token: token,
          platform: platform || 'android',
        })

      if (error) throw error
    }

    return { success: true, message: 'Native push token saved' }
  } catch (error: any) {
    console.error('Error saving native push token:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to save native push token',
    })
  }
})
