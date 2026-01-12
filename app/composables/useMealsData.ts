/**
 * Composable for managing meals data with caching
 * Prevents unnecessary refetches when navigating back and forth
 */
export const useMealsData = () => {
  const store = useMealsStore();

  const load = async () => {
    try {
      await store.fetchMealsData();
    } catch (error) {
      console.error('Failed to load meals data:', error);
      throw error;
    }
  };

  const setDailyChoice = async (mealId: string, dateStr: string, choice: boolean) => {
    try {
      await store.updateDailyChoice(mealId, dateStr, choice);
    } catch (error) {
      console.error('Failed to update daily choice:', error);
      throw error;
    }
  };

  const toggleWeeklyChoice = async (mealId: string, weekday: number, choice?: boolean) => {
    const current = store.weeklyStatus[mealId] || { isOpted: [], notOpted: [] };

    let finalChoice: boolean;
    if (choice !== undefined) {
      finalChoice = choice;
    } else {
      // Toggle: if currently yes, switch to no; otherwise set to yes
      const isCurrentlyYes = current.isOpted.includes(weekday);
      finalChoice = !isCurrentlyYes;
    }

    try {
      await store.updateWeeklyPreference(mealId, weekday, finalChoice);
    } catch (error) {
      console.error('Failed to update weekly preference:', error);
      throw error;
    }
  };

  const refresh = async () => {
    await store.refresh();
  };

  // Helper functions
  const servedMealsForDay = (weekday: number) => {
    return store.meals.filter((m) => Array.isArray(m.weekdays) && m.weekdays.includes(weekday));
  };

  const isMealServed = (mealId: string, weekday: number) => {
    const meal = store.meals.find((m) => m.id === mealId);
    return !!meal && Array.isArray(meal.weekdays) && meal.weekdays.includes(weekday);
  };

  const getWeeklyMenuFood = (weekday: number, mealId: string) => {
    const entry = store.weeklyMenu.find((row) => row.hostel_meal_id === mealId && row.weekdays.includes(weekday));
    return entry?.food || '-';
  };

  const initialChoice = (mealId: string, dateStr: string) => {
    const key = `${mealId}:${dateStr}`;
    // If there's an override, use it
    if (key in store.overrides) {
      return store.overrides[key];
    }
    // Otherwise, check weekly preference
    // Parse date string (YYYY-MM-DD) in local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    const status = store.weeklyStatus[mealId];
    if (status) {
      if (status.isOpted.includes(weekday)) return true;
      if (status.notOpted.includes(weekday)) return false;
    }
    return true; // default opt-in if nothing set
  };

  const isWeeklyYes = (mealId: string, weekday: number) => {
    return store.weeklyStatus[mealId]?.isOpted.includes(weekday) || false;
  };

  const isWeeklyNo = (mealId: string, weekday: number) => {
    return store.weeklyStatus[mealId]?.notOpted.includes(weekday) || false;
  };

  const isMealEditable = (mealId: string, dateStr: string) => {
    const meal = store.meals.find((m) => m.id === mealId);
    if (!meal) return false;

    const deadlineHours = meal.status_deadline || 0;
    const now = new Date();
    
    // Parse meal time (e.g., "08:00" or "13:30")
    const mealTime = meal.timing || "00:00";
    const [mealHours, mealMinutes] = mealTime.split(':').map(Number);
    
    // Parse date string (YYYY-MM-DD) and create local datetime
    const [year, month, day] = dateStr.split('-').map(Number);
    const mealDateTime = new Date(year, month - 1, day, mealHours || 0, mealMinutes || 0, 0, 0);
    
    // Calculate deadline: X hours BEFORE the meal time
    const deadlineTime = new Date(mealDateTime.getTime() - deadlineHours * 60 * 60 * 1000);

    return now < deadlineTime;
  };

  return {
    // Reactive state
    meals: computed(() => store.meals),
    weeklyStatus: computed(() => store.weeklyStatus),
    overrides: computed(() => store.overrides),
    weeklyMenu: computed(() => store.weeklyMenu),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    statusError: computed(() => store.statusError),
    isInitialized: computed(() => store.isInitialized),

    // Methods
    load,
    setDailyChoice,
    toggleWeeklyChoice,
    refresh,

    // Helper functions
    servedMealsForDay,
    isMealServed,
    getWeeklyMenuFood,
    initialChoice,
    isWeeklyYes,
    isWeeklyNo,
    isMealEditable,
  };
};
