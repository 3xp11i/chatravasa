<template>
  <div class="relative">
    <!-- Role-based background image -->
    <img 
      :src="backgroundImage"
      alt=""
      class="fixed bottom-[-10%] left-[-50%] w-[200%] max-w-none! h-auto opacity-60 -z-10 pointer-events-none"
    />
    <Navbar />
    <SideBar />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import Navbar from '@/components/navbar.vue'
import SideBar from '@/components/sideBar.vue'
import bgAdmin from '@/assets/images/bg_admin.png'
import bgResident from '@/assets/images/bg_resident.png'

const { isAdmin } = useCurrentUser()
const isStaff  = useStaffContext().isStaff

const backgroundImage = computed(() => {
  return (isAdmin.value || isStaff.value) ? bgAdmin : bgResident
})
</script>



<style>

</style>