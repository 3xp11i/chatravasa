<template>
    <div class="w-full max-w-6xl mx-auto px-4 py-6">
        <!-- Experimental Banner -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
                <Icon name="material-symbols:science" class="text-2xl text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h3 class="font-semibold text-amber-800">{{ t('experimentalFeature') }}</h3>
                    <p class="text-sm text-amber-700">{{ t('experimentalFeatureDesc') }}</p>
                </div>
            </div>
        </div>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold text-gray-900">{{ t('manageFinances') }}</h1>
                <p class="text-gray-600">{{ t('manageFinancesDesc') }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button @click="openAddExpenseModal"
                        class="greenBtn flex items-center justify-center">
                    <Icon name="material-symbols:add" class="text-xl mr-1" />
                    {{ t('addExpense') }}
                </button>
                <button @click="openCategoriesModal"
                        class="flex items-center justify-center px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors">
                    <Icon name="material-symbols:category" class="text-xl mr-1" />
                    {{ t('manageCategories') }}
                </button>
            </div>
        </div>

        <!-- Year/Month Selector -->
        <div class="bg-white rounded-xl shadow p-4 mb-6">
            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">{{ t('year') }}:</label>
                    <select v-model="selectedYear"
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option v-for="year in availableYears" :key="year" :value="year">{{ localizeNumber(year) }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm font-medium text-gray-700">{{ t('month') }}:</label>
                    <select v-model="selectedMonth"
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option :value="undefined">{{ t('allMonths') }}</option>
                        <option v-for="(name, index) in monthNames" :key="index" :value="index">{{ name }}</option>
                    </select>
                </div>
                <button @click="refreshData" 
                        class="px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                    <Icon name="material-symbols:refresh" class="text-lg" :class="{ 'animate-spin': loadingSummary }" />
                    {{ t('refresh') }}
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingSummary" class="text-center text-gray-500 py-10">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p class="mt-2">{{ t('loading') }}...</p>
        </div>

        <!-- Summary Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Revenue Card -->
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm font-medium">{{ t('totalRevenue') }}</p>
                        <p class="text-3xl font-bold mt-1">₹{{ localizeNumber(formatAmount(summary.totalRevenue)) }}</p>
                    </div>
                    <div class="bg-white/20 p-3 rounded-full">
                        <Icon name="material-symbols:trending-up" class="text-3xl" />
                    </div>
                </div>
                <p class="text-green-100 text-xs mt-3">{{ t('fromFeePayments') }}</p>
            </div>

            <!-- Expenses Card -->
            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-red-100 text-sm font-medium">{{ t('totalExpenses') }}</p>
                        <p class="text-3xl font-bold mt-1">₹{{ localizeNumber(formatAmount(summary.totalExpenses)) }}</p>
                    </div>
                    <div class="bg-white/20 p-3 rounded-full">
                        <Icon name="material-symbols:trending-down" class="text-3xl" />
                    </div>
                </div>
                <p class="text-red-100 text-xs mt-3">{{ t('hostelOperations') }}</p>
            </div>

            <!-- Profit Card -->
            <div :class="[
                'rounded-xl shadow-lg p-6 text-white',
                summary.totalProfit >= 0 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
            ]">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-white/80 text-sm font-medium">{{ t('netProfit') }}</p>
                        <p class="text-3xl font-bold mt-1">
                            {{ summary.totalProfit < 0 ? '-' : '' }}₹{{ localizeNumber(formatAmount(Math.abs(summary.totalProfit))) }}
                        </p>
                    </div>
                    <div class="bg-white/20 p-3 rounded-full">
                        <Icon :name="summary.totalProfit >= 0 ? 'material-symbols:savings' : 'material-symbols:warning'" class="text-3xl" />
                    </div>
                </div>
                <p class="text-white/80 text-xs mt-3">{{ summary.totalProfit >= 0 ? t('profitPositive') : t('profitNegative') }}</p>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Monthly Trend Chart -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('monthlyTrend') }}</h3>
                <div class="h-64">
                    <Line v-if="monthlyChartData" :data="monthlyChartData" :options="lineChartOptions" />
                </div>
            </div>

            <!-- Revenue vs Expenses Chart -->
            <div class="bg-white rounded-xl shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('revenueVsExpenses') }}</h3>
                <div class="h-64">
                    <Bar v-if="comparisonChartData" :data="comparisonChartData" :options="barChartOptions" />
                </div>
            </div>
        </div>

        <!-- Quick Add Expense Section -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="material-symbols:bolt" class="text-amber-500" />
                {{ t('quickAddExpense') }}
            </h3>
            <form @submit.prevent="quickAddExpense" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <input v-model="quickExpense.title"
                           type="text"
                           :placeholder="t('expenseTitle')"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           required />
                </div>
                <div>
                    <input v-model.number="quickExpense.amount"
                           type="number"
                           min="1"
                           :placeholder="t('amount')"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           required />
                </div>
                <div>
                    <select v-model="quickExpense.category_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option :value="undefined">{{ t('noCategory') }}</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
                    </select>
                </div>
                <button type="submit"
                        :disabled="isAddingExpense || !quickExpense.title || !quickExpense.amount"
                        class="greenBtn flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <Icon v-if="isAddingExpense" name="material-symbols:progress-activity" class="animate-spin mr-1" />
                    {{ isAddingExpense ? t('adding') : t('addExpense') }}
                </button>
            </form>
            <!-- Quick Presets -->
            <div class="mt-4 flex flex-wrap gap-2">
                <span class="text-sm text-gray-500">{{ t('quickPresets') }}:</span>
                <button v-for="preset in expensePresets" 
                        :key="preset.title"
                        @click="applyPreset(preset)"
                        class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                    {{ preset.title }}
                </button>
            </div>
        </div>

        <!-- Expenses List -->
        <div class="bg-white rounded-xl shadow">
            <div class="p-6 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ t('recentExpenses') }}</h3>
                    <div class="flex items-center gap-2">
                        <select v-model="categoryFilter"
                                class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option :value="undefined">{{ t('allCategories') }}</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Loading Expenses -->
            <div v-if="loadingExpenses" class="p-6 text-center text-gray-500">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>

            <!-- Expenses Table -->
            <div v-else-if="expenses.length > 0" class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('date') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('title') }}</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('category') }}</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('amount') }}</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ formatDate(expense.expense_date) }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-medium text-gray-900">{{ expense.title }}</div>
                                <div v-if="expense.description" class="text-xs text-gray-500 truncate max-w-xs">{{ expense.description }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span v-if="expense.hostel_expense_categories"
                                      class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                    {{ expense.hostel_expense_categories.title }}
                                </span>
                                <span v-else class="text-xs text-gray-400">{{ t('uncategorized') }}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                ₹{{ localizeNumber(expense.amount) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button @click="editExpense(expense)"
                                        class="text-blue-600 hover:text-blue-800 mr-3">
                                    <Icon name="material-symbols:edit" class="text-lg" />
                                </button>
                                <button @click="confirmDeleteExpense(expense)"
                                        class="text-red-600 hover:text-red-800">
                                    <Icon name="material-symbols:delete" class="text-lg" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- No Expenses -->
            <div v-else class="p-6 text-center text-gray-500">
                <Icon name="material-symbols:receipt-long" class="text-4xl mb-2" />
                <p>{{ t('noExpensesYet') }}</p>
            </div>

            <!-- Pagination -->
            <div v-if="totalExpenses > expenseLimit" class="p-4 border-t border-gray-200 flex items-center justify-between">
                <button @click="expenseOffset -= expenseLimit" 
                        :disabled="expenseOffset === 0"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ t('previous') }}
                </button>
                <span class="text-sm text-gray-600">
                    {{ localizeNumber(expenseOffset + 1) }} - {{ localizeNumber(Math.min(expenseOffset + expenseLimit, totalExpenses)) }} {{ t('of') }} {{ localizeNumber(totalExpenses) }}
                </span>
                <button @click="expenseOffset += expenseLimit"
                        :disabled="expenseOffset + expenseLimit >= totalExpenses"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ t('next') }}
                </button>
            </div>
        </div>

        <!-- Add/Edit Expense Modal -->
        <!-- Modals are opened programmatically via useModal -->

        <ModalsContainer />
    </div>
</template>

<script lang="ts" setup>
import { ModalsContainer, useModal } from 'vue-final-modal'
import { Line, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

import AddExpenseModal from '~/components/modals/AddExpenseModal.vue'
import ManageExpenseCategoriesModal from '~/components/modals/ManageExpenseCategoriesModal.vue'

const { t } = useI18n()
const route = useRoute()
const { localizeNumber } = useNumberLocalization()

const hostelSlug = computed(() => route.params.hostelslug as string)

// State
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref<number | undefined>(undefined)
const loadingSummary = ref(true)
const loadingExpenses = ref(false)
const isAddingExpense = ref(false)

const summary = ref({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0
})

const monthlyData = ref<{ [key: number]: { revenue: number; expenses: number; profit: number } }>({})
const expenses = ref<any[]>([])
const categories = ref<any[]>([])
const totalExpenses = ref(0)
const expenseLimit = 20
const expenseOffset = ref(0)
const categoryFilter = ref<string | undefined>(undefined)

// Selected expense for editing
const selectedExpense = ref<any>(null)

// Quick expense form
const quickExpense = ref({
    title: '',
    amount: undefined as number | undefined,
    category_id: undefined as string | undefined
})

// Year options
const availableYears = computed(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        years.push(y)
    }
    return years
})

// Month names
const monthNames = computed(() => [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
])

// Common expense presets
const expensePresets = [
    { title: 'Cook Salary', amount: 5000 },
    { title: 'Electricity Bill', amount: 3000 },
    { title: 'Water Bill', amount: 500 },
    { title: 'Atta', amount: 1500 },
    { title: 'Dal', amount: 800 },
    { title: 'Rice', amount: 1000 },
    { title: 'Vegetables', amount: 2000 },
    { title: 'Oil', amount: 1000 },
    { title: 'Gas Cylinder', amount: 900 },
    { title: 'Maintenance', amount: 1000 }
]

// Chart data
const monthlyChartData = computed(() => {
    const labels = monthNames.value
    const revenueData = []
    const expenseData = []
    const profitData = []

    for (let i = 0; i < 12; i++) {
        const data = monthlyData.value[i] || { revenue: 0, expenses: 0, profit: 0 }
        revenueData.push(data.revenue)
        expenseData.push(data.expenses)
        profitData.push(data.profit)
    }

    return {
        labels,
        datasets: [
            {
                label: t('revenue'),
                data: revenueData,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: t('expenses'),
                data: expenseData,
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    }
})

const comparisonChartData = computed(() => {
    const labels = monthNames.value
    const revenueData = []
    const expenseData = []

    for (let i = 0; i < 12; i++) {
        const data = monthlyData.value[i] || { revenue: 0, expenses: 0, profit: 0 }
        revenueData.push(data.revenue)
        expenseData.push(data.expenses)
    }

    return {
        labels,
        datasets: [
            {
                label: t('revenue'),
                data: revenueData,
                backgroundColor: 'rgba(34, 197, 94, 0.8)'
            },
            {
                label: t('expenses'),
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.8)'
            }
        ]
    }
})

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value: any) {
                    return '₹' + value.toLocaleString()
                }
            }
        }
    }
}

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value: any) {
                    return '₹' + value.toLocaleString()
                }
            }
        }
    }
}

// Methods
const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN')
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const loadSummary = async () => {
    loadingSummary.value = true
    try {
        const query: any = {
            hostel_slug: hostelSlug.value,
            year: selectedYear.value
        }
        if (selectedMonth.value !== undefined) {
            query.month = selectedMonth.value
        }

        const data = await $fetch('/api/manage-finances/get-financial-summary', { query })
        summary.value = data.summary
        monthlyData.value = data.monthlyData
    } catch (error) {
        console.error('Failed to load financial summary:', error)
    } finally {
        loadingSummary.value = false
    }
}

const loadExpenses = async () => {
    loadingExpenses.value = true
    try {
        const query: any = {
            hostel_slug: hostelSlug.value,
            year: selectedYear.value,
            limit: expenseLimit,
            offset: expenseOffset.value
        }
        if (selectedMonth.value !== undefined) {
            query.month = selectedMonth.value
        }
        if (categoryFilter.value) {
            query.category_id = categoryFilter.value
        }

        const data = await $fetch('/api/manage-finances/get-expenses', { query })
        expenses.value = data.expenses
        totalExpenses.value = data.total
    } catch (error) {
        console.error('Failed to load expenses:', error)
    } finally {
        loadingExpenses.value = false
    }
}

const loadCategories = async () => {
    try {
        const data = await $fetch('/api/manage-finances/get-expense-categories', {
            query: { hostel_slug: hostelSlug.value }
        })
        categories.value = data.categories
    } catch (error) {
        console.error('Failed to load categories:', error)
    }
}

const refreshData = () => {
    loadSummary()
    loadExpenses()
}

const openAddExpenseModal = () => {
    selectedExpense.value = null
    const { open, close } = useModal({
        component: AddExpenseModal,
        attrs: {
            expense: null,
            categories: categories.value,
            hostelSlug: hostelSlug.value,
            onClose() {
                close()
            },
            onSaved() {
                close()
                refreshData()
            },
        },
    })
    open()
}

const editExpense = (expense: any) => {
    selectedExpense.value = expense
    const { open, close } = useModal({
        component: AddExpenseModal,
        attrs: {
            expense: expense,
            categories: categories.value,
            hostelSlug: hostelSlug.value,
            onClose() {
                close()
            },
            onSaved() {
                close()
                refreshData()
            },
        },
    })
    open()
}

const confirmDeleteExpense = async (expense: any) => {
    if (!confirm(t('confirmDeleteExpense'))) return

    try {
        await $fetch('/api/manage-finances/delete-expense', {
            method: 'POST',
            body: { expense_id: expense.id }
        })
        refreshData()
    } catch (error) {
        console.error('Failed to delete expense:', error)
        alert(t('failedDeleteExpense'))
    }
}

const openCategoriesModal = () => {
    const { open, close } = useModal({
        component: ManageExpenseCategoriesModal,
        attrs: {
            hostelSlug: hostelSlug.value,
            onClose() {
                close()
            },
            onUpdated() {
                loadCategories()
            },
        },
    })
    open()
}

const applyPreset = (preset: { title: string; amount: number }) => {
    quickExpense.value.title = preset.title
    quickExpense.value.amount = preset.amount
}

const quickAddExpense = async () => {
    if (!quickExpense.value.title || !quickExpense.value.amount) return

    isAddingExpense.value = true
    try {
        await $fetch('/api/manage-finances/add-expense', {
            method: 'POST',
            body: {
                hostel_slug: hostelSlug.value,
                title: quickExpense.value.title,
                amount: quickExpense.value.amount,
                expense_date: new Date().toISOString().split('T')[0],
                category_id: quickExpense.value.category_id
            }
        })
        quickExpense.value = { title: '', amount: undefined, category_id: undefined }
        refreshData()
    } catch (error) {
        console.error('Failed to add expense:', error)
        alert(t('failedAddExpense'))
    } finally {
        isAddingExpense.value = false
    }
}

// Watchers
watch([selectedYear, selectedMonth], () => {
    expenseOffset.value = 0
    refreshData()
})

watch([categoryFilter, expenseOffset], () => {
    loadExpenses()
})

// Initial load
onMounted(() => {
    loadCategories()
    refreshData()
})
</script>

<style scoped>
@reference "tailwindcss";

.greenBtn {
    @apply px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors;
}
</style>