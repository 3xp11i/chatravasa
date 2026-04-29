<template>
    <div v-if="isMounted && !isInstalled && canInstallNow"
         class="relative">
        <div class="flex items-center gap-2">
        <button type="button"
            class="greenBtn inline-flex items-center gap-2"
            :disabled="isInstalling"
            @click="installApp">
            <Icon name="material-symbols:download-rounded"
                  class="text-xl" />
            <span>{{ isInstalling ? 'Opening...' : 'Install App' }}</span>
        </button>
        <button
            type="button"
            class="tapCircle shrink-0"
            @click="openInstallDialog"
            aria-label="View install details"
            title="View install details"
        >
            <Icon name="material-symbols:info-outline-rounded" class="text-2xl text-gray-700" />
        </button>
        </div>

        <Teleport to="body">
            <Transition name="install-sheet">
                <div v-if="isDialogOpen"
                     class="fixed inset-0 z-9999 flex items-start justify-center overflow-y-auto bg-black/55 px-3 py-4 sm:items-center sm:p-6"
                     @click.self="closeDialog">
                    <div
                         class="my-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[calc(100dvh-2rem)]">
                        <div class="grid max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
                            <div class="space-y-6 p-6 sm:p-8">
                                <button type="button"
                                        class="fixed top-5 right-5 rounded-full p-2 bg-white text-black transition hover:bg-white/20"
                                        @click="closeDialog"
                                        aria-label="Close install dialog">
                                    <Icon name="material-symbols:close-rounded"
                                          class="text-2xl" />
                                </button>
                                <div class="">
                                    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
                                        App preview
                                    </p>
                                    <p class="mt-2 text-base leading-6 text-gray-700">
                                        A quick look at the in-app experience before you install.
                                    </p>
                                </div>

                                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                                    <figure v-for="shot in screenshots"
                                            :key="shot.src"
                                            class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
                                        <img :src="shot.src"
                                             :alt="shot.label"
                                             class="h-40 w-full object-cover"
                                             loading="lazy" />
                                        <figcaption
                                                    class="border-t border-gray-200 px-3 py-2 text-xs font-medium text-gray-600">
                                            {{ shot.label }}
                                        </figcaption>
                                    </figure>
                                </div>

                                <div class="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
                                    <div class="flex items-start gap-3">
                                        <Icon name="material-symbols:shield-outline-rounded"
                                              class="mt-0.5 text-2xl text-green-600" />
                                        <div>
                                            <p class="font-semibold text-gray-900">Installation details</p>
                                            <p class="mt-1 text-sm leading-6 text-gray-600">
                                                The browser may show its own native install prompt. This modal gives you
                                                the
                                                context first, then hands off to the platform prompt when available.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="installError"
                                     class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {{ installError }}
                                </div>

                                <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button type="button"
                                            class="inline-flex items-center justify-center rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                                            @click="closeDialog">
                                        Not now
                                    </button>

                                        <button v-if="canInstallNow"
                                            type="button"
                                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            :disabled="isInstalling"
                                            @click="installApp">
                                        <Icon v-if="!isInstalling"
                                              name="material-symbols:download-rounded"
                                              class="text-xl" />
                                        <Icon v-else
                                              name="svg-spinners:180-ring"
                                              class="text-xl" />
                                        {{ isInstalling ? 'Opening prompt...' : 'Install app' }}
                                    </button>

                                        <button v-else
                                            type="button"
                                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                                            @click="scrollToManualSteps">
                                        <Icon name="material-symbols:info-outline-rounded"
                                              class="text-xl" />
                                        How to install
                                    </button>
                                </div>

                                <div ref="manualStepsEl"
                                     class="rounded-2xl border border-dashed border-gray-300 p-4">
                                    <p class="text-sm font-semibold text-gray-900">Manual install help</p>
                                    <ol class="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                                        <li>1. Open the browser menu.</li>
                                        <li>2. Look for Install app or Add to Home Screen.</li>
                                        <li>3. Confirm the install prompt and launch Chatravasa from your apps.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import screenshot1 from '~/assets/images/screenshots/screenshot1.jpeg'
import screenshot2 from '~/assets/images/screenshots/screenshot2.jpeg'
import screenshot3 from '~/assets/images/screenshots/screenshot3.jpeg'
import screenshot4 from '~/assets/images/screenshots/screenshot4.jpeg'

type Screenshot = {
    src: string
    label: string
}

type Highlight = {
    title: string
    description: string
}

const { $pwa } = useNuxtApp()

const isMounted = ref(false)
const isDialogOpen = ref(false)
const isInstalling = ref(false)
const installError = ref('')
const manualStepsEl = ref<HTMLElement | null>(null)

const screenshots: Screenshot[] = [
    { src: screenshot1, label: 'Chatravasa screenshot 1' },
    { src: screenshot2, label: 'Chatravasa screenshot 2' },
    { src: screenshot3, label: 'Chatravasa screenshot 3' },
    { src: screenshot4, label: 'Chatravasa screenshot 4' },
]

const isInstalled = computed(() => Boolean($pwa?.isPWAInstalled))
const canInstallNow = computed(() => Boolean($pwa?.showInstallPrompt))

onMounted(() => {
    isMounted.value = true
})

const closeDialog = () => {
    isDialogOpen.value = false
    installError.value = ''
}

const openInstallDialog = () => {
    console.log('Opening install dialog')
    isDialogOpen.value = true
}

const installApp = async () => {
    if (!$pwa) {
        installError.value = 'Installation is not available in this browser context.'
        isDialogOpen.value = true
        return
    }

    installError.value = ''
    isInstalling.value = true

    try {
        await $pwa.install()
    } catch (error) {
        installError.value = 'The install prompt could not be opened. Try the browser menu instead.'
        isDialogOpen.value = true
    } finally {
        isInstalling.value = false
    }
}

const scrollToManualSteps = () => {
    manualStepsEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.install-sheet-enter-active,
.install-sheet-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.install-sheet-enter-from,
.install-sheet-leave-to {
    opacity: 0;
    transform: translateY(16px);
}
</style>