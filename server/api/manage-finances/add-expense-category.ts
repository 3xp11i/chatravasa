import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const body = await readBody(event);

  const {
    hostel_slug,
    title,
    description,
    is_recurring,
    default_amount,
  } = body;

  if (!hostel_slug || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: hostel_slug, title",
    });
  }

  // Get hostel ID from slug
  const { data: hostel, error: hostelError } = await client
    .from("hostels")
    .select("id, admin_user_id")
    .eq("hostel_slug", hostel_slug)
    .single();

  if (hostelError || !hostel) {
    throw createError({
      statusCode: 404,
      statusMessage: "Hostel not found",
    });
  }

  // Only admins can add expense categories
  if (hostel.admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can add expense categories",
    });
  }

  // Insert category
  const { data: category, error: insertError } = await client
    .from("hostel_expense_categories")
    .insert({
      hostel_id: hostel.id,
      title,
      description: description || null,
      is_recurring: is_recurring || false,
      default_amount: default_amount ? default_amount.toString() : null,
    })
    .select()
    .single();

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message,
    });
  }

  return { success: true, category };
});
