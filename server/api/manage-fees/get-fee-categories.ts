import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event)

  const hostel_slug = query.hostel_slug as string

  if (!hostel_slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Hostel slug is required',
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

  // Check if user is admin or staff with view_fees permission
  const isAdmin = hostel.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasViewPermission = await staffHasPermission(event, user.sub, hostel.id, "view_fees");
    if (!hasViewPermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to view fees" });
    }
  }

  // Get fee categories for this hostel
  const { data: categories, error: categoriesError } = await client
    .from('hostel_fee_categories')
    .select('*')
    .eq('hostel_id', hostel.id)
    .order('created_at', { ascending: false })

  if (categoriesError) {
    throw createError({
      statusCode: 500,
      statusMessage: categoriesError.message,
    })
  }

  return {
    categories: categories || [],
  }
})
