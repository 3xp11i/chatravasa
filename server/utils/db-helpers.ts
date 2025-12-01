// FILE: server/utils/db-helpers.ts
// PURPOSE: Database access utilities and Supabase client helpers.
// TODO:
//   - Initialize Supabase server client
//   - Common database queries
//   - Meal-specific helpers (cutoff times, etc.)

// ---------------------------------------------------------------------------
// Supabase Client Initialization
// ---------------------------------------------------------------------------
/**
 * Get Supabase server client with service role key.
 * Use this for server-side operations that need elevated permissions.
 * 
 * TODO: Implement with actual Supabase client
 */
// import { createClient } from '@supabase/supabase-js'
//
// let supabaseAdmin: ReturnType<typeof createClient> | null = null
//
// export function getSupabaseAdmin() {
//   if (!supabaseAdmin) {
//     const config = useRuntimeConfig()
//     supabaseAdmin = createClient(
//       config.public.supabaseUrl,
//       config.supabaseServiceKey,
//       { auth: { autoRefreshToken: false, persistSession: false } }
//     )
//   }
//   return supabaseAdmin
// }

// ---------------------------------------------------------------------------
// Meal Cutoff Time Helpers
// ---------------------------------------------------------------------------

interface CutoffTimes {
  breakfast: string // HH:MM format
  lunch: string
  dinner: string
}

/**
 * Default cutoff times.
 * TODO: Make configurable via environment or database.
 */
export const CUTOFF_TIMES: CutoffTimes = {
  breakfast: '07:00',
  lunch: '11:00',
  dinner: '18:00',
}

/**
 * Check if a meal is past its cutoff time for a given date.
 * 
 * @param date - Date string (YYYY-MM-DD)
 * @param mealType - Type of meal
 * @returns true if past cutoff
 */
export function isPastCutoff(date: string, mealType: 'breakfast' | 'lunch' | 'dinner'): boolean {
  const today = new Date().toISOString().split('T')[0]
  
  // Future dates are never past cutoff
  if (date > today) return false
  
  // Past dates are always past cutoff
  if (date < today) return true
  
  // Today: check current time vs cutoff
  const now = new Date()
  const [hours, minutes] = CUTOFF_TIMES[mealType].split(':').map(Number)
  const cutoff = new Date()
  cutoff.setHours(hours, minutes, 0, 0)
  
  return now > cutoff
}

// ---------------------------------------------------------------------------
// Common Database Queries (TODO)
// ---------------------------------------------------------------------------

/**
 * Get all verified residents.
 * TODO: Implement with Supabase
 */
export async function getVerifiedResidents() {
  // const supabase = getSupabaseAdmin()
  // const { data, error } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('role', 'resident')
  //   .eq('is_verified', true)
  //   .order('full_name')
  //
  // return data || []
  
  console.log('[db-helpers] TODO: Implement getVerifiedResidents')
  return []
}

/**
 * Get meal plan for a user and date.
 * TODO: Implement with Supabase
 */
export async function getMealPlan(userId: string, date: string) {
  // const supabase = getSupabaseAdmin()
  // const { data } = await supabase
  //   .from('meal_plans')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .eq('date', date)
  //   .single()
  //
  // return data || { breakfast: true, lunch: true, dinner: true }
  
  console.log('[db-helpers] TODO: Implement getMealPlan')
  return { breakfast: true, lunch: true, dinner: true }
}

/**
 * Upsert meal plan.
 * TODO: Implement with Supabase
 */
export async function upsertMealPlan(
  userId: string,
  date: string,
  meals: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }
) {
  // const supabase = getSupabaseAdmin()
  // const { data, error } = await supabase
  //   .from('meal_plans')
  //   .upsert({
  //     user_id: userId,
  //     date,
  //     ...meals,
  //     updated_at: new Date().toISOString(),
  //   }, { onConflict: 'user_id,date' })
  //   .select()
  //   .single()
  //
  // return data
  
  console.log('[db-helpers] TODO: Implement upsertMealPlan')
  return null
}

/**
 * Get aggregated meal stats for a date.
 * TODO: Implement with Supabase
 */
export async function getMealStats(date: string) {
  // const supabase = getSupabaseAdmin()
  //
  // // Get all meal plans for the date
  // const { data: mealPlans } = await supabase
  //   .from('meal_plans')
  //   .select('breakfast, lunch, dinner')
  //   .eq('date', date)
  //
  // // Also count residents who haven't set a plan (default all meals ON)
  // const { count: totalResidents } = await supabase
  //   .from('profiles')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('role', 'resident')
  //   .eq('is_verified', true)
  //
  // const plannedUserIds = new Set(mealPlans?.map(p => p.user_id) || [])
  // const unplannedCount = (totalResidents || 0) - plannedUserIds.size
  //
  // return {
  //   breakfast: (mealPlans?.filter(p => p.breakfast).length || 0) + unplannedCount,
  //   lunch: (mealPlans?.filter(p => p.lunch).length || 0) + unplannedCount,
  //   dinner: (mealPlans?.filter(p => p.dinner).length || 0) + unplannedCount,
  // }
  
  console.log('[db-helpers] TODO: Implement getMealStats')
  return { breakfast: 15, lunch: 18, dinner: 16 }
}

/**
 * Log an action to the audit log.
 * TODO: Implement with Supabase
 */
export async function logAuditAction(
  action: string,
  performedBy: string,
  targetUserId?: string,
  details?: Record<string, any>
) {
  // const supabase = getSupabaseAdmin()
  // await supabase.from('audit_log').insert({
  //   action,
  //   performed_by: performedBy,
  //   target_user_id: targetUserId,
  //   details,
  // })
  
  console.log('[db-helpers] TODO: Log audit action:', { action, performedBy, targetUserId, details })
}

/**
 * Generate a secure random access code.
 */
export function generateAccessCode(length: number = 6): string {
  const chars = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
