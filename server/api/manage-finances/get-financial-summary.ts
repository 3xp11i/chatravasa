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
  const year = parseInt(query.year as string) || new Date().getFullYear();
  const month = query.month !== undefined ? parseInt(query.month as string) : undefined;

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

  // Only admins can view financial data
  if (hostel.admin_user_id !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only admins can view financial data",
    });
  }

  // Get all residents for this hostel
  const { data: residents } = await client
    .from("residents")
    .select("id")
    .eq("hostel_id", hostel.id);

  const residentIds = residents?.map((r) => r.id) || [];

  // Build expenses query
  let expensesQuery = client
    .from("hostel_expenses")
    .select("amount, month_index, year")
    .eq("hostel_id", hostel.id)
    .eq("year", year);

  if (month !== undefined) {
    expensesQuery = expensesQuery.eq("month_index", month);
  }

  const { data: expenses, error: expensesError } = await expensesQuery;

  if (expensesError) {
    throw createError({
      statusCode: 500,
      statusMessage: expensesError.message,
    });
  }

  // Get fee payments (revenue) for the period
  let paymentsQuery = client
    .from("resident_fee_payments")
    .select("amount_paid, month_index, paid_on")
    .in("resident_id", residentIds.length > 0 ? residentIds : ["none"]);

  if (month !== undefined) {
    paymentsQuery = paymentsQuery.eq("month_index", month);
  }

  const { data: payments, error: paymentsError } = await paymentsQuery;

  if (paymentsError) {
    throw createError({
      statusCode: 500,
      statusMessage: paymentsError.message,
    });
  }

  // Filter payments by year based on paid_on date
  const yearPayments = payments?.filter((p) => {
    const paidYear = new Date(p.paid_on).getFullYear();
    return paidYear === year;
  }) || [];

  // Calculate monthly breakdown
  const monthlyData: { [key: number]: { revenue: number; expenses: number; profit: number } } = {};
  
  // Initialize all months
  for (let i = 0; i <= 11; i++) {
    monthlyData[i] = { revenue: 0, expenses: 0, profit: 0 };
  }

  // Sum up revenue by month
  yearPayments.forEach((payment) => {
    const monthIdx = payment.month_index;
    monthlyData[monthIdx].revenue += parseFloat(payment.amount_paid || "0");
  });

  // Sum up expenses by month
  expenses?.forEach((expense) => {
    const monthIdx = expense.month_index;
    monthlyData[monthIdx].expenses += parseFloat(expense.amount || "0");
  });

  // Calculate profit for each month
  Object.keys(monthlyData).forEach((key) => {
    const monthIdx = parseInt(key);
    monthlyData[monthIdx].profit = monthlyData[monthIdx].revenue - monthlyData[monthIdx].expenses;
  });

  // Calculate totals
  const totalRevenue = Object.values(monthlyData).reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = Object.values(monthlyData).reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return {
    year,
    month,
    summary: {
      totalRevenue,
      totalExpenses,
      totalProfit,
    },
    monthlyData,
  };
});
