/**
 * Composable for managing meals data with caching using useCachedAsyncData
 * Prevents unnecessary refetches when navigating back and forth
 * Implements optimistic updates for instant UI feedback
 */
export const useMealsData = () => {
  interface HostelMeal {
    id: string;
    name: string;
    timing: string;
    weekdays: number[];
    status_deadline: number;
  }

  interface WeeklyStatus {
    meal_id: string;
    is_opted_weekdays: number[];
    not_opted_weekdays: number[];
  }

  interface DailyOverride {
    meal_id: string;
    meal_date: string;
    is_opted: boolean;
  }

  interface WeeklyMenuItem {
    hostel_meal_id: string;
    weekdays: number[];
    food: string;
  }

  interface MealsData {
    meals: HostelMeal[];
    weeklyStatus: WeeklyStatus[];
    overrides: DailyOverride[];
    weeklyMenu: WeeklyMenuItem[];
  }

  // Fetch meals data with caching
  const { data: mealsData, pending: loading, error: fetchError, refresh } = useCachedAsyncData(
    'resident-meals-data',
    () => $fetch<MealsData>('/api/resident/meals')
  );

  const statusError = ref('');

  // Optimistic state for weekly preferences (overrides server data temporarily)
  // Key format: "mealId:weekday" -> true (yes), false (no), undefined (use server data)
  const optimisticWeekly = ref<Record<string, boolean | undefined>>({});
  
  // Optimistic state for daily overrides
  // Key format: "mealId:dateStr" -> true (yes), false (no), undefined (use server data)
  const optimisticDaily = ref<Record<string, boolean | undefined>>({});

  // Transform API response to computed properties
  const meals = computed(() => mealsData.value?.meals || []);

  const weeklyStatus = computed(() => {
    const map: Record<string, { isOpted: number[]; notOpted: number[] }> = {};
    mealsData.value?.weeklyStatus?.forEach((row) => {
      if (row.meal_id) {
        map[row.meal_id] = {
          isOpted: row.is_opted_weekdays || [],
          notOpted: row.not_opted_weekdays || [],
        };
      }
    });
    
    // Sanitize: only include weekdays that are actually served
    const mealIndex: Record<string, number[]> = {};
    meals.value.forEach((meal) => {
      mealIndex[meal.id] = Array.isArray(meal.weekdays) ? meal.weekdays : [];
    });

    const sanitized: Record<string, { isOpted: number[]; notOpted: number[] }> = {};
    Object.entries(map).forEach(([mealId, status]) => {
      const allowed = new Set(mealIndex[mealId] || []);
      sanitized[mealId] = {
        isOpted: (status?.isOpted || []).filter((d) => allowed.has(d)),
        notOpted: (status?.notOpted || []).filter((d) => allowed.has(d)),
      };
    });

    return sanitized;
  });

  const overrides = computed(() => {
    const map: Record<string, boolean> = {};
    mealsData.value?.overrides?.forEach((row) => {
      map[`${row.meal_id}:${row.meal_date}`] = row.is_opted;
    });
    return map;
  });

  const weeklyMenu = computed(() => mealsData.value?.weeklyMenu || []);

  // Update daily choice with optimistic update
  const setDailyChoice = async (mealId: string, dateStr: string, isOpted: boolean) => {
    statusError.value = '';
    const key = `${mealId}:${dateStr}`;
    const previousValue = optimisticDaily.value[key];
    
    // Optimistic update - immediately update UI
    optimisticDaily.value = { ...optimisticDaily.value, [key]: isOpted };
    
    try {
      const result = await $fetch('/api/resident/meals/update-daily', {
        method: 'POST',
        body: { mealId, date: dateStr, isOpted },
      });

      if (!result?.success) {
        // Revert optimistic update on failure
        optimisticDaily.value = { ...optimisticDaily.value, [key]: previousValue };
        statusError.value = 'Failed to update meal choice';
        throw new Error('Update failed');
      }

      // Refresh to get server data, then clear optimistic state
      await refresh();
      delete optimisticDaily.value[key];
      optimisticDaily.value = { ...optimisticDaily.value };
      return result;
    } catch (err: any) {
      // Revert optimistic update on error
      optimisticDaily.value = { ...optimisticDaily.value, [key]: previousValue };
      statusError.value = err?.data?.message || err?.message || 'Failed to update meal choice';
      throw err;
    }
  };

  // Update weekly preference with optimistic update
  const toggleWeeklyChoice = async (mealId: string, weekday: number, choice?: boolean) => {
    statusError.value = '';
    const key = `${mealId}:${weekday}`;
    const previousOptimistic = optimisticWeekly.value[key];
    
    // Determine current state (check optimistic first, then server data)
    const current = weeklyStatus.value[mealId] || { isOpted: [], notOpted: [] };
    const isCurrentlyYes = optimisticWeekly.value[key] === true || 
      (optimisticWeekly.value[key] === undefined && current.isOpted.includes(weekday));

    let finalChoice: boolean;
    if (choice !== undefined) {
      finalChoice = choice;
    } else {
      // Toggle: if currently yes, switch to no; otherwise set to yes
      finalChoice = !isCurrentlyYes;
    }

    // Optimistic update - immediately update UI
    optimisticWeekly.value = { ...optimisticWeekly.value, [key]: finalChoice };

    try {
      const result = await $fetch('/api/resident/meals/update-weekly', {
        method: 'POST',
        body: { mealId, weekday, choice: finalChoice },
      });

      if (!result?.success) {
        // Revert optimistic update on failure
        optimisticWeekly.value = { ...optimisticWeekly.value, [key]: previousOptimistic };
        statusError.value = 'Failed to update weekly preference';
        throw new Error('Update failed');
      }

      // Refresh to get server data, then clear optimistic state
      await refresh();
      delete optimisticWeekly.value[key];
      optimisticWeekly.value = { ...optimisticWeekly.value };
      return result;
    } catch (err: any) {
      // Revert optimistic update on error
      optimisticWeekly.value = { ...optimisticWeekly.value, [key]: previousOptimistic };
      statusError.value = err?.data?.message || err?.message || 'Failed to update weekly preference';
      throw err;
    }
  };

  // Helper functions
  const servedMealsForDay = (weekday: number) => {
    return meals.value.filter((m) => Array.isArray(m.weekdays) && m.weekdays.includes(weekday));
  };

  const isMealServed = (mealId: string, weekday: number) => {
    const meal = meals.value.find((m) => m.id === mealId);
    return !!meal && Array.isArray(meal.weekdays) && meal.weekdays.includes(weekday);
  };

  const getWeeklyMenuFood = (weekday: number, mealId: string) => {
    const entry = weeklyMenu.value.find((row) => row.hostel_meal_id === mealId && row.weekdays.includes(weekday));
    return entry?.food || '-';
  };

  const initialChoice = (mealId: string, dateStr: string) => {
    const dailyKey = `${mealId}:${dateStr}`;
    
    // Check optimistic daily state first
    if (dailyKey in optimisticDaily.value) {
      return optimisticDaily.value[dailyKey];
    }
    
    // Check server daily override
    if (dailyKey in overrides.value) {
      return overrides.value[dailyKey];
    }
    
    // Parse date to get weekday
    const parts = dateStr.split('-').map(Number);
    const year = parts[0] || 0;
    const month = parts[1] || 1;
    const day = parts[2] || 1;
    const weekday = new Date(year, month - 1, day).getDay();
    
    // Check optimistic weekly state
    const weeklyKey = `${mealId}:${weekday}`;
    if (weeklyKey in optimisticWeekly.value) {
      return optimisticWeekly.value[weeklyKey];
    }
    
    // Check server weekly preference
    const status = weeklyStatus.value[mealId];
    if (status) {
      if (status.isOpted.includes(weekday)) return true;
      if (status.notOpted.includes(weekday)) return false;
    }
    return true; // default opt-in if nothing set
  };

  const isWeeklyYes = (mealId: string, weekday: number) => {
    const key = `${mealId}:${weekday}`;
    // Check optimistic state first
    if (key in optimisticWeekly.value) {
      return optimisticWeekly.value[key] === true;
    }
    // Fall back to server data
    return weeklyStatus.value[mealId]?.isOpted.includes(weekday) || false;
  };

  const isWeeklyNo = (mealId: string, weekday: number) => {
    const key = `${mealId}:${weekday}`;
    // Check optimistic state first
    if (key in optimisticWeekly.value) {
      return optimisticWeekly.value[key] === false;
    }
    // Fall back to server data
    return weeklyStatus.value[mealId]?.notOpted.includes(weekday) || false;
  };

  const isMealEditable = (mealId: string, dateStr: string) => {
    const meal = meals.value.find((m) => m.id === mealId);
    if (!meal) return false;

    const deadlineMinutes = meal.status_deadline || 0;
    const now = new Date();
    
    // Parse meal time (e.g., "08:00" or "13:30")
    const mealTime = meal.timing || "00:00";
    const [mealHours, mealMinutes] = mealTime.split(':').map(Number);
    
    // Parse date string (YYYY-MM-DD) and create local datetime
    const parts = dateStr.split('-').map(Number);
    const year = parts[0] || 0;
    const month = parts[1] || 1;
    const day = parts[2] || 1;
    const mealDateTime = new Date(year, month - 1, day, mealHours || 0, mealMinutes || 0, 0, 0);
    
    // Calculate deadline: X minutes BEFORE the meal time
    const deadlineTime = new Date(mealDateTime.getTime() - deadlineMinutes * 60 * 1000);

    return now < deadlineTime;
  };

  return {
    // Reactive state
    meals,
    weeklyStatus,
    overrides,
    weeklyMenu,
    loading,
    error: computed(() => fetchError.value ? 'Failed to load meals data' : ''),
    statusError: computed(() => statusError.value),
    isInitialized: computed(() => mealsData.value !== null && mealsData.value !== undefined),

    // Methods
    load: refresh, // Alias for consistency
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
