// FILE: server/api/owner-add-resident.post.ts
// PURPOSE: Admin-only API to add a new resident with phone, name, room, and generated access code.
// RESPONSE: { success: boolean, resident: { id, phone, fullName, accessCode } }
// SECURITY:
//   - Verify caller has 'owner' role
//   - Validate phone uniqueness
//   - Generate secure random access code

export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event)
  const { phone, fullName, roomNumber, role = 'resident' } = body

  // ---------------------------------------------------------------------------
  // Authorization Check (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Verify caller is an owner
  // const user = event.context.user
  // const profile = event.context.profile
  //
  // if (!user || profile?.role !== 'owner') {
  //   throw createError({
  //     statusCode: 403,
  //     message: 'Owner access required',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Input Validation
  // ---------------------------------------------------------------------------
  if (!phone || !fullName) {
    throw createError({
      statusCode: 400,
      message: 'Phone and full name are required',
    })
  }

  // TODO: Validate phone format
  // TODO: Validate role is 'resident' or 'cook'

  // ---------------------------------------------------------------------------
  // Check Phone Uniqueness (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Check if phone already exists in profiles
  //
  // const { data: existing } = await supabase
  //   .from('profiles')
  //   .select('id')
  //   .eq('phone', phone)
  //   .single()
  //
  // if (existing) {
  //   throw createError({
  //     statusCode: 409,
  //     message: 'A resident with this phone number already exists',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Generate Access Code
  // ---------------------------------------------------------------------------
  // Generate a 6-digit random access code
  const accessCode = Math.random().toString().slice(2, 8).padStart(6, '0')

  // ---------------------------------------------------------------------------
  // Create Profile (TODO)
  // ---------------------------------------------------------------------------
  // TODO: Insert new profile into Supabase
  // NOTE: id will be null until user links their Google account
  //
  // const { data: newProfile, error } = await supabase
  //   .from('profiles')
  //   .insert({
  //     phone,
  //     full_name: fullName,
  //     room_number: roomNumber,
  //     role,
  //     access_code: accessCode,
  //     is_verified: false,
  //   })
  //   .select()
  //   .single()
  //
  // if (error) {
  //   throw createError({
  //     statusCode: 500,
  //     message: 'Failed to create resident',
  //   })
  // }

  // ---------------------------------------------------------------------------
  // Placeholder Response
  // ---------------------------------------------------------------------------
  console.log('[owner-add-resident] Adding resident:', { phone, fullName, role })
  
  return {
    success: true,
    resident: {
      id: 'placeholder-id',
      phone,
      fullName,
      roomNumber,
      role,
      accessCode,
      isVerified: false,
    },
  }
})
