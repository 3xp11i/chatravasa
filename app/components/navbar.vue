<template>

    <nav class="flex justify-between items-center p-2">

        <button class="tapCircle"
                @click="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="32"
                 class=""
                 height="32"
                 viewBox="0 0 24 24">
                <path fill="none"
                      stroke="black"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12h18M3 18h18M3 6h18" />
            </svg>
        </button>

        <NuxtLink to="/login" v-if="!useSupabaseUser().value"
                  class="greenBtn justify-self-end">Login</NuxtLink>


        <!-- A Navlink which gets back user to /dashboard/hostels/hostel-slug if they are inside any page of the hostel like /dashboard/hostels/hostel-slug/manage-meals, etc. It contains the text "Hostel Home" if the user is inside any hostel page, if the user is already on the hostel home, that is /dashboard/hostels/hostel-slug, then the text will be Dashboard and it will direct them to the /dashboard instead -->
        <NuxtLink v-if="useSupabaseUser().value && route.path.startsWith('/dashboard/hostels/')" 
                  :to="isOnHostelHome ? '/dashboard' : hostelHomeUrl"
                  class="greenBtn">
            {{ isOnHostelHome ? 'Dashboard' : 'Hostel Home' }}
        </NuxtLink>

    </nav>


</template>

<script lang="ts" setup>

const { toggleSidebar } = useSidebar();

const route = useRoute()
const isOnHostelHome = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined
    return hostelSlug && route.path === `/dashboard/hostels/${hostelSlug}`
})
const hostelHomeUrl = computed(() => {
    const hostelSlug = route.params.hostelslug as string | undefined
    return hostelSlug ? `/dashboard/hostels/${hostelSlug}` : '/dashboard'
})


</script>

<style></style>