import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const body = await readBody(event);

  const { hostel_slug, resident_ids } = body;

  if (!hostel_slug || !resident_ids || !Array.isArray(resident_ids) || resident_ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Hostel slug and resident IDs are required",
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

  // Check if user is admin or staff with manage_fees permission
  const isAdmin = hostel.admin_user_id === user.sub;

  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }

    const hasManagePermission = await staffHasPermission(
      event,
      user.sub,
      hostel.id,
      "manage_fees"
    );
    if (!hasManagePermission) {
      throw createError({
        statusCode: 403,
        statusMessage: "You do not have permission to manage fees",
      });
    }
  }

  // Get current month info
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  // First day of current month
  const paidOnDate = new Date(currentYear, currentMonthIndex, 1)
    .toISOString()
    .split("T")[0];

  // Get fee info for selected residents
  const { data: feeInfoData, error: feeInfoError } = await client
    .from("hostel_resident_fee_info")
    .select(`
      resident_id,
      discount_amount,
      hostel_fee_categories!inner (
        id,
        amount
      )
    `)
    .in("resident_id", resident_ids);

  if (feeInfoError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch fee info",
    });
  }

  // Filter out residents without a fee category
  const validFeeInfo = feeInfoData?.filter((f) => f.hostel_fee_categories) || [];

  if (validFeeInfo.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No selected residents have a fee category assigned",
    });
  }

  // Check which residents already have payments for this month
  const { data: existingPayments } = await client
    .from("resident_fee_payments")
    .select("resident_id, amount_paid")
    .in("resident_id", validFeeInfo.map((f) => f.resident_id))
    .eq("month_index", currentMonthIndex);

  // Calculate total paid per resident for this month
  const paidByResident = new Map<string, number>();
  existingPayments?.forEach((p) => {
    const current = paidByResident.get(p.resident_id) || 0;
    paidByResident.set(p.resident_id, current + parseFloat(p.amount_paid));
  });

  // Prepare payment records for residents who haven't fully paid
  const paymentRecords: {
    resident_id: string;
    amount_paid: string;
    paid_on: string;
    month_index: number;
    total_amount: string;
    discount_amount: string;
  }[] = [];

  for (const feeInfo of validFeeInfo) {
    const categoryAmount = parseFloat((feeInfo.hostel_fee_categories as any)?.amount || "0");
    const discount = parseFloat(feeInfo.discount_amount?.toString() || "0");
    const totalFee = categoryAmount - discount;
    const alreadyPaid = paidByResident.get(feeInfo.resident_id) || 0;
    const remainingAmount = totalFee - alreadyPaid;

    // Only create payment if there's remaining balance
    if (remainingAmount > 0) {
      paymentRecords.push({
        resident_id: feeInfo.resident_id,
        amount_paid: remainingAmount.toString(),
        paid_on: paidOnDate,
        month_index: currentMonthIndex,
        total_amount: totalFee.toString(),
        discount_amount: discount.toString(),
      });
    }
  }

  if (paymentRecords.length === 0) {
    return {
      success: true,
      message: "All selected residents have already paid for this month",
      markedCount: 0,
    };
  }

  // Insert all payment records
  const { error: insertError } = await client
    .from("resident_fee_payments")
    .insert(paymentRecords);

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to record payments",
    });
  }

  return {
    success: true,
    markedCount: paymentRecords.length,
    skippedCount: validFeeInfo.length - paymentRecords.length,
  };
});
