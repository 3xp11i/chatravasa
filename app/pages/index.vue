<template>
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section class="hero-section mt-10">
      <div class="container mx-auto px-4 py-12 md:py-16 text-center">
        <div class="mb-6">
          <h1 class="text-4xl md:text-6xl font-bold mb-3">
            <span class="hindiFont text-primary">छात्रावास</span>
            <span class="block text-text">Management System</span>
          </h1>
          <p class="text-lg md:text-xl text-text-muted mx-auto">
            A modern, comprehensive solution for hostel management and resident services
          </p>
        </div>
        
      </div>
    </section>

    <!-- Features Overview -->
    <section class="py-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-bold text-text mb-3">
            Everything You Need in One Place
          </h2>
          <p class="text-text-muted">Streamline hostel operations and enhance resident experience</p>
        </div>

        <!-- Management Features -->
        <div class="card mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="grey" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-semibold text-text">For Management Staff</h3>
              <p class="text-sm text-text-muted">Powerful tools to run your hostel efficiently</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Hostel Management</h4>
                  <p class="text-sm text-text-muted">Create, update, and manage multiple hostels with detailed information</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Resident Management</h4>
                  <p class="text-sm text-text-muted">Add residents, assign rooms, and track their details and status</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Meal Planning</h4>
                  <p class="text-sm text-text-muted">Schedule meals, track attendance, and manage dietary requirements</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Fees Management</h4>
                  <p class="text-sm text-text-muted">Track payments, generate invoices, and manage financial records</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Complaints Tracking</h4>
                  <p class="text-sm text-text-muted">Receive, manage, and resolve resident complaints efficiently</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Real-time Dashboard</h4>
                  <p class="text-sm text-text-muted">Monitor occupancy, meal counts, and key metrics at a glance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resident Features -->
        <div class="card">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="grey" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-semibold text-text">For Residents</h3>
              <p class="text-sm text-text-muted">Stay connected and manage your hostel life</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Meal Planner</h4>
                  <p class="text-sm text-text-muted">Mark your meal preferences daily or weekly, skip meals when needed</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">In-Room Status</h4>
                  <p class="text-sm text-text-muted">Update your presence status so staff knows when you're available</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Submit Complaints</h4>
                  <p class="text-sm text-text-muted">Report issues and track the resolution status of your complaints</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Hostel Information</h4>
                  <p class="text-sm text-text-muted">View your hostel details, room info, and important announcements</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Profile Management</h4>
                  <p class="text-sm text-text-muted">Update your details, preferences, and profile picture</p>
                </div>
              </div>
            </div>

            <div class="feature-card">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-secondary mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="font-semibold text-text mb-1">Offline Access</h4>
                  <p class="text-sm text-text-muted">Access key features even when you're offline with PWA support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="py-6 px-4 text-center">
      <div class="container mx-auto max-w-2xl">
        <h3 class="text-2xl md:text-3xl font-bold text-text mb-4">
          Ready to Get Started?
        </h3>
        <p class="text-text-muted mb-8">
          Join Chatravasa to experience seamless hostel management and resident services.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/contact"
            class="px-8 py-3 bg-white hover:bg-gray-50 text-text border-2 border-gray-300 font-semibold rounded-lg shadow-sm transition-all"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "public"
});

const user = useSupabaseUser();
const { userProfile, fetchUserProfile } = useCurrentUser();

// Auto-redirect authenticated users to their role-specific home
onMounted(async () => {
  // Check if user is authenticated
  if (user.value) {
    // Ensure we have the profile loaded
    if (!userProfile.value) {
      await fetchUserProfile();
    }
    
    // Check admin status and redirect accordingly
    const isAdminUser = userProfile.value?.is_admin ?? user.value?.user_metadata?.is_admin ?? false;
    
    await navigateTo(isAdminUser ? "/dashboard" : "/resident", { replace: true });
    return;
  }
  
  // If not authenticated, check session explicitly
  const supabase = useSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Fetch profile for session user
    await fetchUserProfile();
    const isAdminUser = userProfile.value?.is_admin ?? session.user?.user_metadata?.is_admin ?? false;
    
    await navigateTo(isAdminUser ? "/dashboard" : "/resident", { replace: true });
    return;
  }
  
});

</script>

<style scoped>
.hero-section {
  /* background: linear-gradient(135deg, #FFEE91 0%, #FFF9D0 100%); */
}

.card {
  background: var(--color-surface);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;
  }
}

.feature-card {
  background: #F5F5F5;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hindiFont {
  font-family: 'Poppins', sans-serif;
}
</style>