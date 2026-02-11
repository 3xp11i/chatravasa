import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const hostel_slug = query.hostel_slug as string;
  const year = parseInt(query.year as string) || new Date().getFullYear();
  const month = query.month !== undefined ? parseInt(query.month as string) : undefined;
  const category_id = query.category_id as string | undefined;
  const limit = parseInt(query.limit as string) || 50;
  const offset = parseInt(query.offset as string) || 0;

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

  // Only admins can view expenses
  if (hostel.admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can view expenses",
    });
  }

  // Build query
  let expensesQuery = client
    .from("hostel_expenses")
    .select(`
      *,
      hostel_expense_categories (
        id,
        title,
        is_recurring
      ),
      profiles:created_by (
        first_name,
        last_name
      )
    `)
    .eq("hostel_id", hostel.id)
    .eq("year", year)
    .order("expense_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (month !== undefined) {
    expensesQuery = expensesQuery.eq("month_index", month);
  }

  if (category_id) {
    expensesQuery = expensesQuery.eq("category_id", category_id);
  }

  const { data: expenses, error: expensesError, count } = await expensesQuery;

  if (expensesError) {
    throw createError({
      statusCode: 500,
      statusMessage: expensesError.message,
    });
  }

  // Get total count for pagination
  let countQuery = client
    .from("hostel_expenses")
    .select("id", { count: "exact", head: true })
    .eq("hostel_id", hostel.id)
    .eq("year", year);

  if (month !== undefined) {
    countQuery = countQuery.eq("month_index", month);
  }

  if (category_id) {
    countQuery = countQuery.eq("category_id", category_id);
  }

  const { count: totalCount } = await countQuery;

  return {
    expenses: expenses || [],
    total: totalCount || 0,
    limit,
    offset,
  };
});
