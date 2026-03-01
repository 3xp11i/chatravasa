import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event);
    console.log("[test-endpoint] User:", user?.id);
    
    return {
      success: true,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      message: "Test endpoint working",
    };
  } catch (error: any) {
    console.error("[test-endpoint] Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});
