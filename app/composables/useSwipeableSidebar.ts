import { computed, ref, watch, type Ref } from 'vue'
import { usePointerSwipe, useEventListener } from '@vueuse/core'

interface UseSwipeableSidebarOptions {
    /** Width of the sidebar in pixels or computed ref */
    sidebarWidth: number | Ref<number>
    /** Distance from left edge to start swipe open (in pixels), default: 25 */
    edgeThreshold?: number
    /** Percentage (0-1) of sidebar width to trigger close/open, default: 0.4 */
    snapThreshold?: number
    /** Whether the sidebar is initially open */
    isOpen?: Ref<boolean>
}

export function useSwipeableSidebar(
    sidebarRef: Ref<HTMLElement | null>,
    options: UseSwipeableSidebarOptions
) {
    const {
        edgeThreshold = 25,
        snapThreshold = 0.4,
        isOpen: externalIsOpen,
    } = options

    // Make sidebarWidth reactive
    const sidebarWidth = computed(() => 
        typeof options.sidebarWidth === 'number' 
            ? options.sidebarWidth 
            : options.sidebarWidth.value
    )

    // Internal state
    const isOpen = externalIsOpen ?? ref(false)
    const translateX = ref(isOpen.value ? 0 : -sidebarWidth.value)
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const initialTranslateX = ref(0)

    // Sync translateX when isOpen changes externally (e.g., button click)
    watch(isOpen, (open) => {
        if (!isDragging.value) {
            translateX.value = open ? 0 : -sidebarWidth.value
        }
    })

    // Update translateX when sidebar width changes (e.g., window resize)
    watch(sidebarWidth, (newWidth) => {
        if (!isDragging.value && !isOpen.value) {
            translateX.value = -newWidth
        }
    })

    // Edge swipe detection - for opening sidebar from left edge
    useEventListener(document, 'pointerdown', (e: PointerEvent) => {
        // Only trigger from left edge when sidebar is closed
        if (!isOpen.value && e.clientX <= edgeThreshold) {
            isDragging.value = true
            dragStartX.value = e.clientX
            initialTranslateX.value = -sidebarWidth.value
        }
    })

    useEventListener(document, 'pointermove', (e: PointerEvent) => {
        if (!isDragging.value || isOpen.value) return

        // Opening gesture: translate from -sidebarWidth towards 0
        const delta = e.clientX - dragStartX.value
        const newTranslate = Math.min(0, initialTranslateX.value + delta)
        translateX.value = Math.max(-sidebarWidth.value, newTranslate)
    })

    useEventListener(document, 'pointerup', () => {
        if (!isDragging.value) return

        // Snap decision based on how much is visible
        const visibleAmount = sidebarWidth.value + translateX.value
        const visibleRatio = visibleAmount / sidebarWidth.value

        if (visibleRatio >= snapThreshold) {
            // Snap open
            translateX.value = 0
            isOpen.value = true
        } else {
            // Snap closed
            translateX.value = -sidebarWidth.value
            isOpen.value = false
        }

        isDragging.value = false
    })

    // Handle swipe on the sidebar itself (for closing)
    usePointerSwipe(sidebarRef, {
        threshold: 10,
        onSwipeStart(e) {
            if (isOpen.value) {
                isDragging.value = true
                dragStartX.value = e.clientX
                initialTranslateX.value = translateX.value
            }
        },
        onSwipe(e) {
            if (!isOpen.value || !isDragging.value) return

            // Calculate how much the finger has moved
            const delta = e.clientX - dragStartX.value

            // When swiping left (negative delta), close the sidebar
            // Clamp between -sidebarWidth and 0
            const newTranslate = initialTranslateX.value + delta
            translateX.value = Math.max(-sidebarWidth.value, Math.min(0, newTranslate))
        },
        onSwipeEnd() {
            if (!isDragging.value) return

            // Snap decision
            const visibleAmount = sidebarWidth.value + translateX.value
            const visibleRatio = visibleAmount / sidebarWidth.value

            if (visibleRatio >= (1 - snapThreshold)) {
                // Snap back open
                translateX.value = 0
                isOpen.value = true
            } else {
                // Snap closed
                translateX.value = -sidebarWidth.value
                isOpen.value = false
            }

            isDragging.value = false
        },
    })

    // Programmatic controls
    const open = () => {
        translateX.value = 0
        isOpen.value = true
    }

    const close = () => {
        translateX.value = -sidebarWidth.value
        isOpen.value = false
    }

    const toggle = () => {
        if (isOpen.value) {
            close()
        } else {
            open()
        }
    }

    // Computed style for the sidebar - disables transition while dragging
    const sidebarStyle = computed(() => ({
        transform: `translateX(${translateX.value}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
    }))

    // Backdrop opacity follows sidebar position (0 when closed, 0.5 when fully open)
    const backdropOpacity = computed(() => {
        const progress = (sidebarWidth.value + translateX.value) / sidebarWidth.value
        return Math.max(0, Math.min(0.5, progress * 0.5))
    })

    // Whether to show backdrop (visible when open or being dragged)
    const showBackdrop = computed(() => {
        return isOpen.value || isDragging.value || translateX.value > -sidebarWidth.value
    })

    return {
        isOpen,
        isDragging,
        translateX,
        sidebarStyle,
        backdropOpacity,
        showBackdrop,
        open,
        close,
        toggle,
    }
}
