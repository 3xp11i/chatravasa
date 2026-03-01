import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const body = await readBody(event)

  const { hostel_slug, title, amount } = body

  if (!hostel_slug || !title || !amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  // Get hostel ID from slug
  const { data: hostel, error: hostelError } = await client
    .from('hostels')
    .select('id, admin_user_id')
    .eq('hostel_slug', hostel_slug)
    .single()

  if (hostelError || !hostel) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Hostel not found',
    })
  }

  // Check if user is admin or staff with manage_fees permission
  const isAdmin = hostel.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasManagePermission = await staffHasPermission(event, user.sub, hostel.id, "manage_fees");
    if (!hasManagePermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to manage fees" });
    }
  }

  // Insert fee category
  const { data, error } = await client
    .from('hostel_fee_categories')
    .insert({
      hostel_id: hostel.id,
      title,
      amount: amount.toString(),
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return { success: true, category: data }
})
