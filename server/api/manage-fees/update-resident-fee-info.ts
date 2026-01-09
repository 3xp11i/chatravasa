import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event)

  const { resident_id, fee_category_id, discount_amount } = body

  if (!resident_id || !fee_category_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  // Get resident with hostel info to check permissions
  const { data: resident, error: residentError } = await client
    .from('residents')
    .select('hostel_id, hostels!inner(admin_user_id)')
    .eq('id', resident_id)
    .single()

  if (residentError || !resident) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resident not found',
    })
  }

  // Check if user is admin or staff with manage_fees permission
  const isAdmin = resident.hostels.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, resident.hostel_id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasManagePermission = await staffHasPermission(event, user.sub, resident.hostel_id, "manage_fees");
    if (!hasManagePermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to manage fees" });
    }
  }

  // Check if fee info already exists
  const { data: existing, error: checkError } = await client
    .from('hostel_resident_fee_info')
    .select('*')
    .eq('resident_id', resident_id)
    .single()

  let result

  if (existing) {
    // Update existing record
    const { data, error } = await client
      .from('hostel_resident_fee_info')
      .update({
        fee_category_id,
        discount_amount: discount_amount?.toString() || '0',
      })
      .eq('resident_id', resident_id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    result = data
  } else {
    // Insert new record
    const { data, error } = await client
      .from('hostel_resident_fee_info')
      .insert({
        resident_id,
        fee_category_id,
        discount_amount: discount_amount?.toString() || '0',
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    result = data
  }

  return { success: true, fee_info: result }
})
