import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const body = await readBody(event);

  const { category_id } = body;

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

  // Only admins can delete categories
  if ((category.hostels as any).admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can delete expense categories",
    });
  }

  // Delete category (expenses will have category_id set to NULL due to ON DELETE SET NULL)
  const { error: deleteError } = await client
    .from("hostel_expense_categories")
    .delete()
    .eq("id", category_id);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    });
  }

  return { success: true };
});
