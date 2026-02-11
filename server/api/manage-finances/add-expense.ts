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
    hostel_slug,
    title,
    description,
    amount,
    expense_date,
    category_id,
  } = body;

  if (!hostel_slug || !title || !amount || !expense_date) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: hostel_slug, title, amount, expense_date",
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

  // Only admins can add expenses
  if (hostel.admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can add expenses",
    });
  }

  // Parse expense date to get month_index and year
  const date = new Date(expense_date);
  const month_index = date.getMonth();
  const year = date.getFullYear();

  // Insert expense
  const { data: expense, error: insertError } = await client
    .from("hostel_expenses")
    .insert({
      hostel_id: hostel.id,
      title,
      description: description || null,
      amount: amount.toString(),
      expense_date,
      month_index,
      year,
      category_id: category_id || null,
      created_by: user.sub,
    })
    .select(`
      *,
      hostel_expense_categories (
        id,
        title,
        is_recurring
      )
    `)
    .single();

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message,
    });
  }

  return { success: true, expense };
});
