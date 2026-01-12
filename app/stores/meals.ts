import { defineStore } from 'pinia';

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

export const useMealsStore = defineStore('meals', () => {
  // State
  const meals = ref<HostelMeal[]>([]);
  const weeklyStatus = ref<Record<string, { isOpted: number[]; notOpted: number[] }>>({});
  const overrides = ref<Record<string, boolean>>({});
  const weeklyMenu = ref<WeeklyMenuItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  const statusError = ref('');
  const isInitialized = ref(false);

  // Fetch meals data
  async function fetchMealsData() {
    if (isInitialized.value && meals.value.length > 0) {
      // Use cached data
      return { meals: meals.value, weeklyStatus: weeklyStatus.value, overrides: overrides.value, weeklyMenu: weeklyMenu.value };
    }

    loading.value = true;
    error.value = '';

    try {
      const mealsData = await $fetch<MealsData>('/api/resident/meals');

      if (!mealsData) {
        error.value = 'No meals data received';
        isInitialized.value = true;
        return null;
      }

      // Map API response to local state
      meals.value = mealsData.meals || [];

      weeklyStatus.value = {};
      mealsData.weeklyStatus?.forEach((row: WeeklyStatus) => {
        if (row.meal_id) {
          weeklyStatus.value[row.meal_id] = {
            isOpted: row.is_opted_weekdays || [],
            notOpted: row.not_opted_weekdays || [],
          };
        }
      });
      sanitizeWeeklyStatus();

      overrides.value = {};
      mealsData.overrides?.forEach((row: DailyOverride) => {
        overrides.value[`${row.meal_id}:${row.meal_date}`] = row.is_opted;
      });

      weeklyMenu.value = mealsData.weeklyMenu || [];

      isInitialized.value = true;
      return { meals: meals.value, weeklyStatus: weeklyStatus.value, overrides: overrides.value, weeklyMenu: weeklyMenu.value };
    } catch (err: any) {
      error.value = err?.message || err?.data?.message || 'Failed to load meals data';
      isInitialized.value = true;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Update daily choice
  async function updateDailyChoice(mealId: string, dateStr: string, isOpted: boolean) {
    statusError.value = '';
    const key = `${mealId}:${dateStr}`;

    // Update UI optimistically
    overrides.value[key] = isOpted;

    try {
      const result = await $fetch('/api/resident/meals/update-daily', {
        method: 'POST',
        body: { mealId, date: dateStr, isOpted },
      });

      if (!result?.success) {
        statusError.value = 'Failed to update meal choice';
        throw new Error('Update failed');
      }

      return result;
    } catch (err: any) {
      statusError.value = err?.data?.message || err?.message || 'Failed to update meal choice';
      throw err;
    }
  }

  // Update weekly preference
  async function updateWeeklyPreference(mealId: string, weekday: number, choice: boolean) {
    statusError.value = '';
    const current = weeklyStatus.value[mealId] || { isOpted: [], notOpted: [] };

    const isOpted = current.isOpted.filter((d) => d !== weekday);
    const notOpted = current.notOpted.filter((d) => d !== weekday);

    if (choice) {
      isOpted.push(weekday);
    } else {
      notOpted.push(weekday);
    }

    // Update UI optimistically
    weeklyStatus.value = { ...weeklyStatus.value, [mealId]: { isOpted, notOpted } };

    try {
      const result = await $fetch('/api/resident/meals/update-weekly', {
        method: 'POST',
        body: { mealId, weekday, choice },
      });

      if (!result?.success) {
        statusError.value = 'Failed to update weekly preference';
        throw new Error('Update failed');
      }

      return result;
    } catch (err: any) {
      statusError.value = err?.data?.message || err?.message || 'Failed to update weekly preference';
      throw err;
    }
  }

  // Refresh all data (force refetch)
  async function refresh() {
    isInitialized.value = false;
    error.value = '';
    await fetchMealsData();
  }

  // Sanitize weekly status to only include served weekdays
  function sanitizeWeeklyStatus() {
    const map: Record<string, { isOpted: number[]; notOpted: number[] }> = {};
    const mealIndex: Record<string, number[]> = {};

    meals.value.forEach((meal) => {
      mealIndex[meal.id] = Array.isArray(meal.weekdays) ? meal.weekdays : [];
    });

    Object.entries(weeklyStatus.value).forEach(([mealId, status]) => {
      const allowed = new Set(mealIndex[mealId] || []);
      const isOpted = (status?.isOpted || []).filter((d) => allowed.has(d));
      const notOpted = (status?.notOpted || []).filter((d) => allowed.has(d));
      map[mealId] = { isOpted, notOpted };
    });

    weeklyStatus.value = map;
  }

  return {
    // State
    meals,
    weeklyStatus,
    overrides,
    weeklyMenu,
    loading,
    error,
    statusError,
    isInitialized,

    // Methods
    fetchMealsData,
    updateDailyChoice,
    updateWeeklyPreference,
    refresh,
    sanitizeWeeklyStatus,
  };
});
