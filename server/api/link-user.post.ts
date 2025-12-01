// FILE: server/api/link-user.post.ts
// PURPOSE: After OAuth login, link auth user id to resident profile.
// FLOW: 
//   1. Verify the temporary token from access code validation
//   2. Get the authenticated user from session
//   3. Link the auth user ID to the profile with matching phone
//   4. Mark profile as verified
// SECURITY:
//   - Verify temp token is valid and not expired
//   - Ensure authenticated user is making the request
//   - Prevent linking to already-verified profiles

export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event)
  const { tempToken, phone } = body

  // ---------------------------------------------------------------------------
  // Authentication Check
  // ---------------------------------------------------------------------------
  // TODO: Get authenticated user from Supabase session
  // const user = event.context.user // Set by auth middleware
  // 
  // if (!user) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Authentication required',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Verify Temporary Token (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Verify the temp token from access code validation step
  // - Check token exists in Redis/database
  // - Check token is not expired
  // - Get associated phone number from token
  //
  // const tokenData = await getTokenData(tempToken)
  // if (!tokenData || tokenData.phone !== phone) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Invalid or expired token',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Link User to Profile (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Update profile with auth user ID and mark as verified
  //
  // const { data, error } = await supabase
  //   .from('profiles')
  //   .update({
  //     id: user.id, // Link to auth user
  //     is_verified: true,
  //     access_code: null, // Clear access code after verification
  //   })
  //   .eq('phone', phone)
  //   .eq('is_verified', false) // Only update unverified profiles
  //   .select()
  //   .single()
  //
  // if (error || !data) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'Failed to link account. Profile may already be verified.',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Invalidate Token (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Delete the temp token so it can't be reused
  // await deleteToken(tempToken)

  // ---------------------------------------------------------------------------
  // Placeholder Response
  // ---------------------------------------------------------------------------
  console.log('[link-user] Linking user:', { phone })
  
  return {
    success: true,
    message: 'Account linked successfully',
    // profile: data, // TODO: Return linked profile
  }
})
