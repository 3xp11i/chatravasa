/**
 * Send Fee Reminder API Endpoint
 * 
 * POST /api/manage-fees/send-reminder
 * 
 * Sends a fee reminder notification to all residents of a hostel,
 * or to specific residents who have pending fees.
 * 
 * Request body:
 * - hostel_slug: The hostel slug to send reminders for
 * - resident_ids: (optional) Array of specific resident IDs to notify
 * - message: (optional) Custom message to include in the notification
 * - only_pending: (optional) If true, only notify residents with pending fees
 * 
 * Returns information about:
 * - How many users were notified
 * - How many push notifications were sent
 * - Which users don't have push subscriptions (so admin can follow up)
 * 
 * Only accessible by hostel admin or staff with manage_fees permission.
 */

import { serverSupabaseServiceRole } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"
import type { Database } from "~/types/database.types"
import { sendNotification } from "../../utils/notifications"
import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const client = await getAuthenticatedClient(event)
    const serviceClient = await serverSupabaseServiceRole(event)
    const userId = (user as any).sub || (user as any).id
    const body = await readBody(event)

    const { hostel_slug, resident_ids, message, only_pending } = body

    if (!hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" })
    }

    // Get hostel - using hostel_name not name
    const { data: hostel, error: hostelErr } = await client
      .from("hostels")
      .select("id, admin_user_id, hostel_name")
      .eq("hostel_slug", hostel_slug)
      .single()

    if (hostelErr || !hostel) {
      throw createError({ statusCode: 404, statusMessage: "Hostel not found" })
    }

    // Check permissions - must be admin or staff with manage_fees permission
    const isAdmin = hostel.admin_user_id === userId
    const isStaff = await isStaffForHostel(event, userId, hostel.id)
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "manage_fees"))

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Rate limiting: Check if reminder was sent in the last 24 hours (except in development)
    if (process.env.NODE_ENV !== 'development') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const { data: recentReminder } = await serviceClient
        .from('hostel_reminder_logs')
        .select('sent_at')
        .eq('hostel_id', hostel.id)
        .eq('reminder_type', 'fee_reminder')
        .gte('sent_at', twentyFourHoursAgo.toISOString())
        .order('sent_at', { ascending: false })
        .limit(1)
        .single()
      
      if (recentReminder) {
        const hoursSinceLastReminder = Math.round((Date.now() - new Date(recentReminder.sent_at).getTime()) / (60 * 60 * 1000))
        throw createError({ 
          statusCode: 429, 
          statusMessage: `Rate limit exceeded. Fee reminders can only be sent once per day. Last reminder was sent ${hoursSinceLastReminder} hours ago. Please try again later.`
        })
      }
    }

    // Get target residents - residents.id IS the user_id (references profiles.id)
    let targetUserIds: string[] = []
    let residentsWithoutSubscription: { id: string; name: string }[] = []

    if (resident_ids && Array.isArray(resident_ids) && resident_ids.length > 0) {
      // Send to specific residents
      const { data: residents } = await client
        .from("residents")
        .select(`
          id,
          profiles!inner (first_name, last_name)
        `)
        .eq("hostel_id", hostel.id)
        .in("id", resident_ids)

      if (residents) {
        targetUserIds = residents.map(r => r.id)
      }
    } else if (only_pending) {
      // Get residents with pending fees for current month
      const currentMonthIndex = new Date().getMonth()
      
      // Get all residents with their fee info and payment status
      const { data: residentsWithFees } = await client
        .from("residents")
        .select(`
          id,
          profiles!inner (first_name, last_name),
          hostel_resident_fee_info (
            fee_category_id,
            discount_amount,
            hostel_fee_categories (amount)
          ),
          resident_fee_payments (
            amount_paid,
            month_index
          )
        `)
        .eq("hostel_id", hostel.id)

      if (residentsWithFees) {
        // Filter to only residents with unpaid or partial fees
        targetUserIds = residentsWithFees.filter((r: any) => {
          const feeInfo = r.hostel_resident_fee_info?.[0]
          if (!feeInfo) return false // No fee configured, skip
          
          const categoryAmount = parseFloat(feeInfo.hostel_fee_categories?.amount || "0")
          const discount = parseFloat(feeInfo.discount_amount || "0")
          const totalFee = categoryAmount - discount
          
          // Sum payments for current month
          const currentMonthPayments = (r.resident_fee_payments || [])
            .filter((p: any) => p.month_index === currentMonthIndex)
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid), 0)
          
          // Include if not fully paid
          return currentMonthPayments < totalFee
        }).map((r: any) => r.id)
      }
    } else {
      // Send to all residents of the hostel
      const { data: residents } = await client
        .from("residents")
        .select(`
          id,
          profiles!inner (first_name, last_name)
        `)
        .eq("hostel_id", hostel.id)

      if (residents) {
        targetUserIds = residents.map(r => r.id)
      }
    }

    if (!targetUserIds.length) {
      return { success: true, sent: 0, stored: 0, message: "No residents to notify" }
    }

    // Check which users have push subscriptions
    const { data: subscriptions } = await serviceClient
      .from("push_subscriptions")
      .select("user_id")
      .in("user_id", targetUserIds)

    const subscribedUserIds = new Set((subscriptions || []).map((s: any) => s.user_id))
    
    // Get names of users without subscriptions
    const { data: unsubscribedResidents } = await client
      .from("residents")
      .select(`
        id,
        profiles!inner (first_name, last_name)
      `)
      .in("id", targetUserIds.filter(id => !subscribedUserIds.has(id)))

    if (unsubscribedResidents) {
      residentsWithoutSubscription = unsubscribedResidents.map((r: any) => ({
        id: r.id,
        name: `${r.profiles.first_name} ${r.profiles.last_name}`
      }))
    }

    // Prepare notification content
    const notificationTitle = "Fee Payment Reminder"
    const notificationBody = message || `Please check your pending fee payments for ${hostel.hostel_name}.`

    // Send notification (this stores in-app + sends push where available)
    const result = await sendNotification(event, {
      userIds: targetUserIds,
      title: notificationTitle,
      body: notificationBody,
      url: "/resident/my-hostel", // Residents can check their fee status here
      type: "fee",
      data: {
        hostelId: hostel.id,
        hostelName: hostel.hostel_name,
      },
    })

    // Log the reminder for rate limiting
    await serviceClient
      .from('hostel_reminder_logs')
      .insert({
        hostel_id: hostel.id,
        sent_by_user_id: userId,
        reminder_type: 'fee_reminder',
        target_count: targetUserIds.length,
        message: message || null,
      })

    return {
      success: true,
      totalNotified: targetUserIds.length,
      pushSent: result.sent,
      pushFailed: result.failed,
      inAppStored: result.stored,
      residentsWithoutPushSubscription: residentsWithoutSubscription,
    }
  } catch (err: any) {
    console.error("Fee reminder error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to send fee reminders",
    })
  }
})
