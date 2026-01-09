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

  const { category_id } = body

  if (!category_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required',
    })
  }

  // Get category with hostel info to check permissions
  const { data: category, error: categoryError } = await client
    .from('hostel_fee_categories')
    .select('hostel_id, hostels!inner(admin_user_id)')
    .eq('id', category_id)
    .single()

  if (categoryError || !category) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found',
    })
  }

  // Check if user is admin or staff with manage_fees permission
  const isAdmin = category.hostels.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, category.hostel_id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasManagePermission = await staffHasPermission(event, user.sub, category.hostel_id, "manage_fees");
    if (!hasManagePermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to manage fees" });
    }
  }

  // Delete fee category
  const { error } = await client
    .from('hostel_fee_categories')
    .delete()
    .eq('id', category_id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return { success: true }
})
