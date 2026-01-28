<template>
    <div class="text-text px-4 py-8">
        <div class="card space-y-8">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold">Meals Planner</h1>
                <span v-if="hostelMeals.length" class="text-sm text-text-muted">Meals: {{ hostelMeals.length }}</span>
            </div>

            <div v-if="loading && !hostelMeals.length">Loading meals…</div>
            <div v-else-if="!loading || hostelMeals.length">
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

                <!-- Weekly Preferences Table (Meals as columns, highlight current day, sticky meal names, visible borders) -->
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold mb-4">Weekly Preferences</h2>
                    <p class="text-sm text-text-muted mb-4">Set your preference for each meal on each day of the week</p>
                    <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                    <div v-else class="overflow-x-auto bg-surface rounded-lg border border-surface-200">
                        <table class="w-full border-separate" style="border-spacing: 0;">
                            <thead class="bg-gray-50 border-b border-gray-400">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 z-10 bg-green-50 border-r-2 border-gray-400">Weekday</th>
                                    <th v-for="meal in hostelMeals" :key="'header-' + meal.id"
                                        class="px-3 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r-2 border-gray-400">
                                        <div>{{ meal.name }}</div>
                                        <div class="text-xs font-normal text-gray-500 normal-case">{{ meal.timing }}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(day, dayIdx) in weekDays" :key="'pref-' + dayIdx" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-green-50 z-10 border-r-2 border-gray-400">{{ day }}</td>
                                    <td v-for="meal in hostelMeals" :key="'pref-' + meal.id + '-' + dayIdx"
                                        :class="['px-3 py-3 text-center border-r-2 border-gray-400', todayWeekday === dayIdx ? 'bg-green-200' : '']"
                                        style="border-bottom: 2px solid #9ca3af;">
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

                <!-- Weekly Menu Table (Meals as rows, Days as columns, highlight current day) -->
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Weekly Menu</h2>
                    <p class="text-sm text-text-muted mb-4">View what's being served each day</p>
                    <div v-if="!hostelMeals.length" class="text-text-muted text-sm">No meals found for your hostel.</div>
                    <div v-else class="overflow-x-auto bg-surface rounded-lg border border-surface-200">
                        <table class="w-full border-separate" style="border-spacing: 0;">
                            <thead class="bg-gray-50 border-b border-gray-400">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 z-10 bg-green-50 border-r-2 border-gray-400">Meal</th>
                                    <th v-for="(day, dayIdx) in weekDays" :key="'menu-header-day-' + dayIdx"
                                        :ref="el => { if (todayWeekday === dayIdx) todayColumnRef = el as HTMLElement }"
                                        :class="['px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r-2 border-gray-400', todayWeekday === dayIdx ? 'bg-green-50' : '']"
                                        style="min-width: 120px;">
                                        {{ day }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="meal in hostelMeals" :key="'menu-row-' + meal.id" class="hover:bg-gray-50">
                                    <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-green-50 z-10 border-r-2 border-gray-400">
                                        <div>{{ meal.name }}</div>
                                        <div class="text-xs font-normal text-gray-500 normal-case">{{ meal.timing }}</div>
                                    </td>
                                    <td v-for="(day, dayIdx) in weekDays" :key="'menu-cell-' + meal.id + '-' + dayIdx"
                                        :class="['px-4 py-3 text-sm text-gray-700 border-r-2 border-gray-400', todayWeekday === dayIdx ? 'bg-green-200' : '']"
                                        style="max-width: 220px; min-width: 120px; word-break: break-word; white-space: normal; border-bottom: 2px solid #9ca3af;">
                                        <template v-if="isMealServed(meal.id, dayIdx)">
                                            <span>{{ getWeeklyMenuFood(dayIdx, meal.id) }}</span>
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

const {
    meals: hostelMeals,
    loading,
    error,
    statusError,
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
const todayColumnRef = ref<HTMLElement | null>(null);

// Scroll to today's column in the Weekly Menu table on mount
onMounted(() => {
    nextTick(() => {
        if (todayColumnRef.value) {
            todayColumnRef.value.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    });
});

// Helper to get local date string in YYYY-MM-DD format
const getLocalDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const todayStr = computed(() => getLocalDateStr(new Date()));
const tomorrowStr = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateStr(tomorrow);
});
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayWeekday = computed(() => new Date().getDay());
const tomorrowWeekday = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getDay();
});

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

// Watch for data changes and rebuild daily choices
watch(hostelMeals, () => {
    rebuildDailyChoices();
}, { immediate: true });

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
        rebuildDailyChoices();
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
