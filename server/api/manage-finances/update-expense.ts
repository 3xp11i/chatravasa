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
    expense_id,
    title,
    description,
    amount,
    expense_date,
    category_id,
  } = body;

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

  // Only admins can update expenses
  if ((expense.hostels as any).admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can update expenses",
    });
  }

  // Build update object
  const updateData: any = {};
  
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (amount !== undefined) updateData.amount = amount.toString();
  if (category_id !== undefined) updateData.category_id = category_id || null;
  
  if (expense_date !== undefined) {
    const date = new Date(expense_date);
    updateData.expense_date = expense_date;
    updateData.month_index = date.getMonth();
    updateData.year = date.getFullYear();
  }

  // Update expense
  const { data: updatedExpense, error: updateError } = await client
    .from("hostel_expenses")
    .update(updateData)
    .eq("id", expense_id)
    .select(`
      *,
      hostel_expense_categories (
        id,
        title,
        is_recurring
      )
    `)
    .single();

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message,
    });
  }

  return { success: true, expense: updatedExpense };
});
