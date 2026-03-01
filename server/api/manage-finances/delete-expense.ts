import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const body = await readBody(event);

  const { expense_id } = body;

  if (!expense_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Expense ID is required",
    });
  }

  // Get expense with hostel info
  const { data: expense, error: expenseError } = await client
    .from("hostel_expenses")
    .select("*, hostels!inner(admin_user_id)")
    .eq("id", expense_id)
    .single();

  if (expenseError || !expense) {
    throw createError({
      statusCode: 404,
      statusMessage: "Expense not found",
    });
  }

  // Only admins can delete expenses
  if ((expense.hostels as any).admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can delete expenses",
    });
  }

  // Delete expense
  const { error: deleteError } = await client
    .from("hostel_expenses")
    .delete()
    .eq("id", expense_id);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    });
  }

  return { success: true };
});
