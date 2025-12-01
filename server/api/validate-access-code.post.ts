// FILE: server/api/validate-access-code.post.ts
// PURPOSE: Validate that the submitted phone number + access code exists and is not yet verified.
// RESPONSE: { success: boolean, message?: string, tempToken?: string }
// SECURITY: 
//   - Rate-limit/throttle brute-force attempts (implement with Redis or in-memory store)
//   - Do not reveal whether phone exists if code is wrong
//   - Generate temporary token for linking step

export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event)
  const { phone, code } = body

  // ---------------------------------------------------------------------------
  // Input Validation
  // ---------------------------------------------------------------------------
  if (!phone || !code) {
    throw createError({
      statusCode: 400,
      message: 'Phone number and access code are required',
    })
  }

  // TODO: Validate phone format
  // TODO: Validate code is 6 digits

  // ---------------------------------------------------------------------------
  // Rate Limiting (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Implement rate limiting to prevent brute-force attacks
  // - Track attempts by IP and phone number
  // - Block after X failed attempts for Y minutes
  // Example: max 5 attempts per phone per 15 minutes

  // ---------------------------------------------------------------------------
  // Database Lookup (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Query Supabase to find profile with matching phone + access_code
  // 
  // const { data: profile, error } = await supabase
  //   .from('profiles')
  //   .select('id, phone, access_code, is_verified')
  //   .eq('phone', phone)
  //   .eq('access_code', code)
  //   .single()
  //
  // if (error || !profile) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Invalid phone number or access code',
  //   })
  // }
  //
  // if (profile.is_verified) {
  //   throw createError({
  //     statusCode: 400,
  //     message: 'This account is already verified. Please sign in with Google.',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Generate Temporary Token (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Generate a short-lived token that links phone to OAuth flow
  // This token will be used after Google login to link the accounts
  //
  // const tempToken = generateSecureToken()
  // Store in Redis or database with expiry (e.g., 10 minutes)

  // ---------------------------------------------------------------------------
  // Placeholder Response
  // ---------------------------------------------------------------------------
  console.log('[validate-access-code] Validating:', { phone, code })
  
  return {
    success: true,
    message: 'Access code validated. Proceed to Google sign-in.',
    // tempToken: tempToken, // TODO: Return actual token
  }
})
