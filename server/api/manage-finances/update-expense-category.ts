import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  const {
    category_id,
    title,
    description,
    is_recurring,
    default_amount,
  } = body;

  if (!category_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Category ID is required",
    });
  }

  // Get category with hostel info
  const { data: category, error: categoryError } = await client
    .from("hostel_expense_categories")
    .select("*, hostels!inner(admin_user_id)")
    .eq("id", category_id)
    .single();

  if (categoryError || !category) {
    throw createError({
      statusCode: 404,
      statusMessage: "Category not found",
    });
  }

  // Only admins can update categories
  if ((category.hostels as any).admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can update expense categories",
    });
  }

  // Build update object
  const updateData: any = {};
  
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (is_recurring !== undefined) updateData.is_recurring = is_recurring;
  if (default_amount !== undefined) updateData.default_amount = default_amount ? default_amount.toString() : null;

  // Update category
  const { data: updatedCategory, error: updateError } = await client
    .from("hostel_expense_categories")
    .update(updateData)
    .eq("id", category_id)
    .select()
    .single();

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message,
    });
  }

  return { success: true, category: updatedCategory };
});
