import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);
  const query = getQuery(event);

  const hostel_slug = query.hostel_slug as string
  const limit = parseInt(query.limit as string) || 10
  const offset = parseInt(query.offset as string) || 0

  if (!hostel_slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Hostel slug is required',
    })
  }

  // Get hostel ID from slug
  const { data: hostel, error: hostelError } = await client
    .from('hostels')
    .select('id, admin_user_id')
    .eq('hostel_slug', hostel_slug)
    .single()

  if (hostelError || !hostel) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Hostel not found',
    })
  }

  // Check if user is admin or staff with view_fees permission
  const isAdmin = hostel.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasViewPermission = await staffHasPermission(event, user.sub, hostel.id, "view_fees");
    if (!hasViewPermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to view fees" });
    }
  }

  // Get current month index (0-11)
  const currentMonthIndex = new Date().getMonth()

  // Get all residents with their profile info
  const { data: residents, error: residentsError } = await client
    .from('residents')
    .select(`
      id,
      room,
      joining_date,
      guardian_name,
      family_phone_number,
      profiles!inner (
        id,
        first_name,
        last_name,
        phone,
        avatar
      )
    `)
    .eq('hostel_id', hostel.id)
    .order('room', { ascending: true })
    .range(offset, offset + limit - 1)

  if (residentsError) {
    throw createError({
      statusCode: 500,
      statusMessage: residentsError.message,
    })
  }

  // Get total count
  const { count, error: countError } = await client
    .from('residents')
    .select('*', { count: 'exact', head: true })
    .eq('hostel_id', hostel.id)

  if (countError) {
    throw createError({
      statusCode: 500,
      statusMessage: countError.message,
    })
  }

  // Get resident invites
  const { data: invites, error: invitesError } = await client
    .from('resident_invites')
    .select('*')
    .eq('hostel_id', hostel.id)

  const residentIds = residents?.map((r) => r.id) || []

  // Get fee info for all residents
  const { data: feeInfo, error: feeInfoError } = await client
    .from('hostel_resident_fee_info')
    .select(`
      resident_id,
      discount_amount,
      hostel_fee_categories!inner (
        id,
        title,
        amount
      )
    `)
    .in('resident_id', residentIds)

  // Get payments for current month
  const { data: payments, error: paymentsError } = await client
    .from('resident_fee_payments')
    .select('*')
    .in('resident_id', residentIds)
    .eq('month_index', currentMonthIndex)

  // Combine all data
  const residentsWithFees = residents?.map((resident) => {
    const profile = resident.profiles as any
    const feeData = feeInfo?.find((f) => f.resident_id === resident.id)
    const payment = payments?.find((p) => p.resident_id === resident.id)
    const isInvite = invites?.some((inv) => inv.phone === profile.phone)

    // Calculate fee amounts
    const categoryAmount = feeData?.hostel_fee_categories?.amount
      ? parseFloat(feeData.hostel_fee_categories.amount)
      : 0
    const discountAmount = feeData?.discount_amount
      ? parseFloat(feeData.discount_amount)
      : 0
    const totalAmount = categoryAmount - discountAmount
    const amountPaid = payment?.amount_paid ? parseFloat(payment.amount_paid) : 0
    const remainingBalance = totalAmount - amountPaid

    // Determine payment status
    let paymentStatus = 'unpaid'
    if (amountPaid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'paid'
    } else if (amountPaid > 0 && amountPaid < totalAmount) {
      paymentStatus = 'partial'
    }

    return {
      id: resident.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone,
      avatar: profile.avatar,
      room: resident.room,
      joining_date: resident.joining_date,
      guardian_name: resident.guardian_name,
      family_phone_number: resident.family_phone_number,
      is_invite: isInvite,
      fee_category: feeData?.hostel_fee_categories?.title || null,
      fee_category_id: feeData?.hostel_fee_categories?.id || null,
      fee_category_amount: categoryAmount,
      discount_amount: discountAmount,
      total_fee_amount: totalAmount,
      amount_paid: amountPaid,
      remaining_balance: remainingBalance,
      payment_status: paymentStatus,
      payment_date: payment?.paid_on || null,
    }
  }) || []

  return {
    residents: residentsWithFees,
    total: count || 0,
    current_month: currentMonthIndex,
  }
})
