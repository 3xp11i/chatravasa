<template>
    <div class="min-h-screen bg-background text-text px-4 py-8">
        <div class="card space-y-8">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold">Meals Planner</h1>
                <span v-if="hostelMeals.length" class="text-sm text-text-muted">Meals: {{ hostelMeals.length }}</span>
            </div>

            <div v-if="loading">Loading meals…</div>
            <div v-else>
                <p v-if="error" class="text-red-600 text-sm mb-6">{{ error }}</p>

                <!-- Today / Tomorrow -->
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold mb-4">Quick Choices</h2>
                    <div class="grid gap-6 md:grid-cols-2">
                        <div class="rounded-xl border border-surface-200 bg-surface p-4">
                            <h3 class="text-lg font-semibold mb-3">Today's Plan</h3>
                            <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                            <div v-else-if="servedMealsForDay(todayWeekday).filter(m => isMealEditable(m.id, todayStr)).length === 0" class="text-text-muted text-sm">No editable meals for today (all deadlines have passed).</div>
                            <div v-for="meal in servedMealsForDay(todayWeekday).filter(m => isMealEditable(m.id, todayStr))" :key="'today-' + meal.id" class="flex items-center justify-between py-2">
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ meal.name }}</span>
                                    <span class="text-xs text-text-muted capitalize">{{ meal.timing }}</span>
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="pill"
                                        :class="todayChoices[meal.id] === true ? 'pill-yes' : 'pill-idle'"
                                        @click="handleSetDailyChoice(meal.id, 'today', true)"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        class="pill"
                                        :class="todayChoices[meal.id] === false ? 'pill-no' : 'pill-idle'"
                                        @click="handleSetDailyChoice(meal.id, 'today', false)"
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="rounded-xl border border-surface-200 bg-surface p-4">
                            <h3 class="text-lg font-semibold mb-3">Tomorrow's Plan</h3>
                            <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                            <div v-else-if="servedMealsForDay(tomorrowWeekday).length === 0" class="text-text-muted text-sm">No meals served tomorrow.</div>
                            <div v-for="meal in servedMealsForDay(tomorrowWeekday)" :key="'tomorrow-' + meal.id" class="flex items-center justify-between py-2">
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ meal.name }}</span>
                                    <span class="text-xs text-text-muted capitalize">{{ meal.timing }}</span>
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="pill"
                                        :class="tomorrowChoices[meal.id] === true ? 'pill-yes' : 'pill-idle'"
                                        @click="handleSetDailyChoice(meal.id, 'tomorrow', true)"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        class="pill"
                                        :class="tomorrowChoices[meal.id] === false ? 'pill-no' : 'pill-idle'"
                                        @click="handleSetDailyChoice(meal.id, 'tomorrow', false)"
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Weekly Preferences Table -->
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold mb-4">Weekly Preferences</h2>
                    <p class="text-sm text-text-muted mb-4">Set your preference for each meal on each day of the week</p>
                    <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                    <div v-else class="overflow-x-auto bg-surface rounded-lg border border-surface-200">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-surface-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Weekday</th>
                                    <th v-for="meal in hostelMeals" :key="'header-' + meal.id" class="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        <div>{{ meal.name }}</div>
                                        <div class="text-xs font-normal text-gray-500 normal-case">{{ meal.timing }}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-200">
                                <tr v-for="(day, dayIdx) in weekDays" :key="'pref-' + dayIdx" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium text-gray-900">{{ day }}</td>
                                    <td v-for="meal in hostelMeals" :key="'pref-' + meal.id + '-' + dayIdx" class="px-3 py-3 text-center">
                                        <template v-if="isMealServed(meal.id, dayIdx)">
                                            <button
                                                class="pill-small"
                                                :class="isWeeklyYes(meal.id, dayIdx) ? 'pill-yes' : (isWeeklyNo(meal.id, dayIdx) ? 'pill-no' : 'pill-idle')"
                                                @click="handleToggleWeeklyChoice(meal.id, dayIdx)"
                                                :title="isWeeklyYes(meal.id, dayIdx) ? 'Yes' : (isWeeklyNo(meal.id, dayIdx) ? 'No' : 'Unset')"
                                            >
                                                {{ isWeeklyYes(meal.id, dayIdx) ? 'Yes' : (isWeeklyNo(meal.id, dayIdx) ? 'No' : '—') }}
                                            </button>
                                        </template>
                                        <span v-else class="text-text-muted text-xs">Not served</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Weekly Menu Table -->
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Weekly Menu</h2>
                    <p class="text-sm text-text-muted mb-4">View what's being served each day</p>
                    <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                    <div v-else class="overflow-x-auto bg-surface rounded-lg border border-surface-200">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-surface-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Weekday</th>
                                    <th v-for="meal in hostelMeals" :key="'menu-header-' + meal.id" class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        <div>{{ meal.name }}</div>
                                        <div class="text-xs font-normal text-gray-500 normal-case">{{ meal.timing }}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-200">
                                <tr v-for="(day, dayIdx) in weekDays" :key="'menu-' + dayIdx" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium text-gray-900">{{ day }}</td>
                                    <td v-for="meal in hostelMeals" :key="'menu-' + meal.id + '-' + dayIdx" class="px-4 py-3 text-sm text-gray-700">
                                        <template v-if="isMealServed(meal.id, dayIdx)">
                                            {{ getWeeklyMenuFood(dayIdx, meal.id) }}
                                        </template>
                                        <span v-else class="text-text-muted">Not served</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="statusError" class="text-red-600 text-sm mt-6 p-3 bg-red-50 rounded-lg">{{ statusError }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    layout: 'default',
    name: 'resident-meals',
});

const authUser = useSupabaseUser();

const {
    meals: hostelMeals,
    weeklyStatus,
    overrides,
    weeklyMenu,
    loading,
    error,
    statusError,
    load,
    setDailyChoice,
    toggleWeeklyChoice,
    servedMealsForDay,
    isMealServed,
    getWeeklyMenuFood,
    initialChoice,
    isWeeklyYes,
    isWeeklyNo,
    isMealEditable,
} = useMealsData();

const todayChoices = ref<Record<string, boolean | undefined>>({});
const tomorrowChoices = ref<Record<string, boolean | undefined>>({});

const todayStr = computed(() => new Date().toISOString().slice(0, 10));
const tomorrowStr = computed(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayWeekday = computed(() => new Date(`${todayStr.value}T00:00:00`).getDay());
const tomorrowWeekday = computed(() => new Date(`${tomorrowStr.value}T00:00:00`).getDay());

function rebuildDailyChoices() {
    const today = todayStr.value;
    const tomorrow = tomorrowStr.value;
    const t: Record<string, boolean | undefined> = {};
    const tm: Record<string, boolean | undefined> = {};
    hostelMeals.value.forEach((meal) => {
        t[meal.id] = initialChoice(meal.id, today);
        tm[meal.id] = initialChoice(meal.id, tomorrow);
    });
    todayChoices.value = t;
    tomorrowChoices.value = tm;
}

onMounted(async () => {
    // Load data only on first mount; cached on subsequent visits
    await load();
    rebuildDailyChoices();
});

watch(
    authUser,
    async (newUser) => {
        if (newUser?.id) {
            await load();
            rebuildDailyChoices();
        }
    },
    { immediate: true },
);

async function handleSetDailyChoice(mealId: string, day: 'today' | 'tomorrow', choice: boolean) {
    const dateStr = day === 'today' ? todayStr.value : tomorrowStr.value;
    const dayIdx = day === 'today' ? todayWeekday.value : tomorrowWeekday.value;
    
    if (!isMealServed(mealId, dayIdx)) {
        console.warn('[meals-page] Attempted daily choice for non-served day', { mealId, day, dayIdx });
        return;
    }

    // Update UI optimistically
    if (day === 'today') {
        todayChoices.value = { ...todayChoices.value, [mealId]: choice };
    } else {
        tomorrowChoices.value = { ...tomorrowChoices.value, [mealId]: choice };
    }

    try {
        await setDailyChoice(mealId, dateStr, choice);
    } catch (err) {
        console.error('[meals-page] Update-daily error:', err);
    }
}

async function handleToggleWeeklyChoice(mealId: string, weekday: number, choice?: boolean) {
    if (!isMealServed(mealId, weekday)) {
        console.warn('[meals-page] Attempted to set status for a non-served day', { mealId, weekday });
        return;
    }

    try {
        await toggleWeeklyChoice(mealId, weekday, choice);
        rebuildDailyChoices();
    } catch (err) {
        console.error('[meals-page] Update-weekly error:', err);
    }
}
</script>

<style scoped>
.card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-surface-200, #e5e7eb);
    border-radius: 12px;
    padding: 24px;
}

.pill {
    padding: 6px 12px;
    /* border-radius: 999px; */
    border: 1px solid transparent;
    font-weight: 600;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
}

.pill-small {
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid transparent;
    font-weight: 600;
    font-size: 0.875rem;
    min-width: 40px;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
}

.pill-yes {
    background: #22c55e;
    color: #fff;
    border-color: #16a34a;
}

.pill-no {
    background: #ef4444;
    color: #fff;
    border-color: #dc2626;
}

.pill-idle {
    background: #f3f4f6;
    color: #374151;
    border-color: #e5e7eb;
}

.pill:hover {
    opacity: 0.9;
}
</style>
