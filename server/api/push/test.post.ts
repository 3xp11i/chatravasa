/**
 * Test Push Notification API Endpoint
 * 
 * POST /api/push/test
 * 
 * Sends a test push notification to the current user.
 * Used for testing that push notifications are working correctly.
 * 
 * This endpoint is for development/testing purposes only.
 */

import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import { sendNotification } from "../../utils/notifications"

export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }

    const userId = (user as any).sub || (user as any).id

    // Send a test notification to the current user
    const result = await sendNotification(event, {
      userId,
      title: "🎉 Test Notification",
      body: "Push notifications are working! You will receive important updates here.",
      url: "/settings",
      type: "system",
      data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    })

    return {
      success: true,
      message: "Test notification sent",
      ...result,
    }
  } catch (err: any) {
    console.error("Test notification error:", err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || "Failed to send test notification",
    })
  }
})
