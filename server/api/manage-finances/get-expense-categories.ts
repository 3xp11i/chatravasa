import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const query = getQuery(event);

  const hostel_slug = query.hostel_slug as string;

  if (!hostel_slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Hostel slug is required",
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

  // Only admins can view expense categories
  if (hostel.admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can view expense categories",
    });
  }

  // Get categories
  const { data: categories, error: categoriesError } = await client
    .from("hostel_expense_categories")
    .select("*")
    .eq("hostel_id", hostel.id)
    .order("title", { ascending: true });

  if (categoriesError) {
    throw createError({
      statusCode: 500,
      statusMessage: categoriesError.message,
    });
  }

  return { categories: categories || [] };
});
