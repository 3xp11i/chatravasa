import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const lastPages = ref<Record<string, number>>({})

  // Key by route path (works for every page in the app)
  function saveLastPage(path: string, page: number) {
    lastPages.value[path] = page
  }

  function getLastPage(path: string): number {
    return lastPages.value[path] || 1
  }

  function clearLastPage(path: string) {
    delete lastPages.value[path]
  }

  return {
    lastPages,
    saveLastPage,
    getLastPage,
    clearLastPage,
  }
}, {
  persist: true
})
