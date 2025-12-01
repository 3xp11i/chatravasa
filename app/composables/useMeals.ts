// FILE: app/composables/useMeals.ts
// PURPOSE: Meal-related state management - meal plans, toggles, and stats.
// TODO:
//   - Fetch meal plans from Supabase
//   - Update meal selections (toggle on/off)
//   - Enforce cutoff times
//   - Provide stats for cook/owner dashboards

export interface MealPlan {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  updatedAt: string
}

export interface MealStats {
  date: string
  breakfast: number
  lunch: number
  dinner: number
}

export interface CutoffTimes {
  breakfast: string // HH:MM
  lunch: string
  dinner: string
}

export function useMeals() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const mealPlans = useState<Map<string, MealPlan>>('meal-plans', () => new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Default cutoff times (can be overridden by config)
  const cutoffTimes: CutoffTimes = {
    breakfast: '07:00',
    lunch: '11:00',
    dinner: '18:00',
  }

  // ---------------------------------------------------------------------------
  // Computed
  // ---------------------------------------------------------------------------

  /**
   * Get today's meal plan
   */
  const todayPlan = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return mealPlans.value.get(today) || null
  })

  // ---------------------------------------------------------------------------
  // Methods
  // ---------------------------------------------------------------------------

  /**
   * Fetch meal plans for a date range
   * TODO: Query Supabase meal_plans table
   */
  async function fetchMealPlans(startDate: string, endDate: string) {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Get current user
      // const { user } = useAuth()
      // if (!user.value) throw new Error('Not authenticated')
      
      // TODO: Fetch from Supabase
      // const { data, error: fetchError } = await supabase
      //   .from('meal_plans')
      //   .select('*')
      //   .eq('user_id', user.value.id)
      //   .gte('date', startDate)
      //   .lte('date', endDate)
      
      console.log('TODO: Fetch meal plans for range:', startDate, endDate)
      
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get meal status for a specific date and meal type
   */
  function getMealStatus(date: string, mealType: 'breakfast' | 'lunch' | 'dinner'): boolean {
    const plan = mealPlans.value.get(date)
    if (!plan) return true // Default: all meals enabled
    return plan[mealType]
  }

  /**
   * Toggle a meal on/off
   * TODO: Update Supabase and check cutoff time
   */
  async function toggleMeal(date: string, mealType: 'breakfast' | 'lunch' | 'dinner', enabled: boolean) {
    // Check if past cutoff
    if (isPastCutoff(date, mealType)) {
      throw new Error(`Cannot modify ${mealType} - past cutoff time`)
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Update in Supabase (upsert)
      // const { user } = useAuth()
      // const { data, error: updateError } = await supabase
      //   .from('meal_plans')
      //   .upsert({
      //     user_id: user.value.id,
      //     date: date,
      //     [mealType]: enabled,
      //   })
      //   .select()
      //   .single()
      
      console.log('TODO: Toggle meal', { date, mealType, enabled })
      
      // Update local state
      const existing = mealPlans.value.get(date) || {
        id: '',
        userId: '',
        date,
        breakfast: true,
        lunch: true,
        dinner: true,
        updatedAt: new Date().toISOString(),
      }
      existing[mealType] = enabled
      mealPlans.value.set(date, existing)
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if a meal is past its cutoff time
   */
  function isPastCutoff(date: string, mealType: 'breakfast' | 'lunch' | 'dinner'): boolean {
    const today = new Date().toISOString().split('T')[0]
    
    // Future dates are never past cutoff
    if (date > today) return false
    
    // Past dates are always past cutoff
    if (date < today) return true
    
    // Today: check current time vs cutoff
    const now = new Date()
    const [hours, minutes] = cutoffTimes[mealType].split(':').map(Number)
    const cutoff = new Date()
    cutoff.setHours(hours, minutes, 0, 0)
    
    return now > cutoff
  }

  /**
   * Get aggregated stats for a date (for cook/owner)
   * TODO: Call API endpoint
   */
  async function getStats(date: string): Promise<MealStats | null> {
    try {
      // TODO: Call stats API
      // const data = await $fetch('/api/stats', { params: { date } })
      
      console.log('TODO: Fetch stats for date:', date)
      
      // Placeholder
      return {
        date,
        breakfast: 15,
        lunch: 18,
        dinner: 16,
      }
      
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------
  return {
    // State
    mealPlans,
    todayPlan,
    isLoading,
    error,
    cutoffTimes,
    
    // Methods
    fetchMealPlans,
    getMealStatus,
    toggleMeal,
    isPastCutoff,
    getStats,
  }
}
