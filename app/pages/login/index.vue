<template>
  <div class="min-h-screen bg-background text-text flex items-center justify-center px-4 py-8">
    <div class="w-full">
      <div class="card auth-card">
        <!-- Header -->
        <h1 class="text-center font-bold text-xl mb-3 md:mb-4">{{ headerTitle }}</h1>
        <p class="text-center text-sm text-text-muted mb-5 md:mb-6">{{ headerSubtitle }}</p>

        <form class="space-y-4" @submit.prevent="handleFormSubmit">
          <!-- Phone Input (shown in 'phone' and 'verify' steps) -->
          <template v-if="step === 'phone' || step === 'verify'">
            <PhoneInput
              v-model="phone"
              label="Phone Number"
              :disabled="loading || step === 'verify'"
              required
            />
          </template>

          <!-- OTP Input (shown in 'verify' step) -->
          <div v-if="step === 'verify'" class="space-y-2">
            <label for="otp" class="font-medium">OTP Code</label>
            <input
              id="otp"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="Enter 6-digit code"
              v-model="otp"
              :disabled="loading"
            />
          </div>

          <!-- Google OAuth Flow (shown in 'google-continue' or 'google-link' steps) -->
          <template v-if="step === 'google-continue' || step === 'google-link'">
            <div class="space-y-4 text-center">
              <div class="space-y-2">
                <h2 class="font-semibold text-lg">
                  {{ step === 'google-continue' ? 'Continue with Google' : 'Link your Google account' }}
                </h2>
                <p class="text-sm text-text-muted">
                  {{ step === 'google-continue'
                    ? 'Your account is already linked with Google. Sign in with Google to continue.'
                    : 'Your hostel account is verified. Link Google to finish setup and continue.'
                  }}
                </p>
                <p v-if="censoredEmail" class="text-sm font-medium text-text">
                  Linked Email: {{ censoredEmail }}
                </p>
                <p v-if="loggedInPhoneDisplay" class="text-sm font-medium text-text">
                  Phone: {{ loggedInPhoneDisplay }}
                </p>
              </div>
            </div>
          </template>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <!-- OTP Request/Verify Button -->
            <button
              v-if="step === 'phone' || step === 'verify'"
              class="w-full bg-primary text-surface font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              type="submit"
              :disabled="loading"
            >
              <span v-if="!loading">
                {{ step === 'phone' ? 'Continue' : 'Verify & Sign In' }}
              </span>
              <span v-else>Processing...</span>
            </button>

            <!-- Resend OTP Button -->
            <button
              v-if="step === 'verify'"
              type="button"
              class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
              :disabled="loading || resendTimer > 0"
              @click="requestOtp(true)"
            >
              Resend OTP <span v-if="resendTimer > 0">({{ resendTimer }}s)</span>
            </button>

            <!-- Google OAuth Buttons -->
            <button
              v-if="step === 'google-continue'"
              type="button"
              class="w-full greenBtn text-text border-2 border-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              :disabled="loading"
              @click="loginWithGoogle"
            >
              <span v-if="!loading">Continue with Google</span>
              <span v-else>Opening Google...</span>
            </button>

            <button
              v-if="step === 'google-link'"
              type="button"
              class="w-full greenBtn text-text border-2 border-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              :disabled="linkingGoogle"
              @click="linkGoogleIdentity"
            >
              <span v-if="!linkingGoogle">Continue with Google</span>
              <span v-else>Opening Google...</span>
            </button>

            <!-- Change Phone Button (for Google flows) -->
            <button
              v-if="step === 'google-continue' || step === 'google-link'"
              type="button"
              class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
              :disabled="signingOut"
              @click="signOutAndReset"
            >
              <span v-if="!signingOut">Use a different phone</span>
              <span v-else>Signing out...</span>
            </button>
          </div>

          <!-- Status Messages -->
          <p v-if="message" class="text-green-700 text-sm text-center">{{ message }}</p>
          <p v-if="redirecting" class="text-primary text-sm text-center font-medium">
            Redirecting to your dashboard...
          </p>
          <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "blank",
  name: "login",
});

const supabase = useSupabaseClient();
const authUser = useSupabaseUser();

// ==================== State ====================
const phone = ref('');
const otp = ref('');
const step = ref<'phone' | 'verify' | 'google-continue' | 'google-link'>('phone');
const loading = ref(false);
const redirecting = ref(false);
const linkingGoogle = ref(false);
const signingOut = ref(false);
const message = ref('');
const errorMessage = ref('');
const resendTimer = ref(0);
const censoredEmail = ref('');

// User role tracking
const userRole = ref<'admin' | 'staff_member' | 'resident' | null>(null);
const isNewUser = ref(false); // true if user is invited but not in profiles

let countdown: ReturnType<typeof setInterval> | null = null;

// ==================== Computed Properties ====================

const normalizedPhone = computed(() => {
  const digits = phone.value.trim();
  return digits ? `+91${digits}` : '';
});

const sessionPhone = computed(() => authUser.value?.phone?.replace(/^\+/, '') || '');

const loggedInPhoneDisplay = computed(() => {
  const phoneNumber = sessionPhone.value;
  if (!phoneNumber) return '';
  return phoneNumber.startsWith('91') ? `+${phoneNumber}` : phoneNumber;
});

const headerTitle = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return 'Admin Login';
    case 'staff_member':
      return 'Staff Login';
    case 'resident':
      return 'Resident Login';
    default:
      return 'Welcome Back';
  }
});

const headerSubtitle = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return 'Sign in securely with your phone number';
    case 'staff_member':
      return 'Sign in to your hostel staff account';
    case 'resident':
      return 'Sign in to your hostel account';
    default:
      return 'Enter your phone number to continue';
  }
});

// ==================== Functions ====================

/**
 * Start countdown timer for resend OTP button
 */
function startResendTimer(seconds = 30) {
  resendTimer.value = seconds;
  if (countdown) clearInterval(countdown);
  countdown = setInterval(() => {
    resendTimer.value -= 1;
    if (resendTimer.value <= 0 && countdown) {
      clearInterval(countdown);
      countdown = null;
    }
  }, 1000);
}

/**
 * Check if user has an existing session and restore it
 * Used when component mounts with an authenticated user
 */
async function syncFromExistingSession() {
  const existingPhone = sessionPhone.value;
  console.log("Auth user: ", authUser.value);
  console.log("Session phone: ", sessionPhone.value);
  

  if (!existingPhone) {
    return;
  }

  phone.value = existingPhone.startsWith('91') ? existingPhone.slice(2) : existingPhone;

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    // Get user role from unified endpoint
    const checkRes = await $fetch('/api/auth/check-user-role', {
      method: 'POST',
      body: { phone: `+${existingPhone}` },
    });

    userRole.value = (checkRes.role as 'admin' | 'staff_member' | 'resident' | null);
    isNewUser.value = !checkRes.exists && checkRes.invited;

    if (checkRes.role === 'admin' || checkRes.role === 'staff_member') {
      // For admin and staff, they're already logged in
      step.value = 'verify';
      return;
    }

    if (checkRes.role === 'resident') {
      // For residents, check if Google is linked
      const googleRes = await $fetch('/api/auth/get-resident-google-identity', {
        method: 'POST',
        body: { phone: `+${existingPhone}` },
      });

      if (googleRes.googleIdentityExists) {
        censoredEmail.value = googleRes.censoredEmail || '';
        step.value = 'google-continue';
        message.value = 'Your account is already linked with Google. Continue with Google sign-in.';
        return;
      }

      // Resident is verified but needs to link Google
      step.value = 'google-link';
      message.value = 'Your session is active. Link Google to finish setup.';
      return;
    }

    step.value = 'phone';
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Unable to restore your session.';
  } finally {
    loading.value = false;
  }
}

/**
 * Main form submission handler
 * Routes to appropriate handler based on current step
 */
async function handleFormSubmit() {
  if (step.value === 'phone') {
    await checkUserAndRequestOtp();
    return;
  }

  if (step.value === 'verify') {
    await verifyOtp();
  }
}

/**
 * Check user role and request OTP
 * First validates the phone number format and checks user role/eligibility
 * For existing residents: skips OTP and goes directly to Google login
 * For new residents/staff/admin: proceeds with OTP verification
 */
async function checkUserAndRequestOtp() {
  if (!phone.value || phone.value.length < 10) {
    errorMessage.value = 'Enter a valid 10 digit phone number.';
    return;
  }

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    // Get user role and eligibility
    const checkRes = await $fetch('/api/auth/check-user-role', {
      method: 'POST',
      body: { phone: normalizedPhone.value },
    });

    userRole.value = (checkRes.role as 'admin' | 'staff_member' | 'resident' | null);
    isNewUser.value = !checkRes.exists && checkRes.invited;

    // Check if user can proceed
    if (!checkRes.canProceed) {
      const roleMessage = checkRes.role
        ? `You are not registered in the system.`
        : 'You have not been added to any hostel yet.';
      errorMessage.value = `${roleMessage} Please contact your hostel admin.`;
      loading.value = false;
      return;
    }

    // Special case: Existing resident (already in profiles) - skip OTP, go directly to Google
    if (userRole.value === 'resident' && checkRes.exists) {
      try {
        // Fetch Google identity status for existing resident
        const googleRes = await $fetch('/api/auth/get-resident-google-identity', {
          method: 'POST',
          body: { phone: normalizedPhone.value },
        });

        if (googleRes.googleIdentityExists) {
          // Existing resident with Google already linked
          censoredEmail.value = googleRes.censoredEmail || '';
          step.value = 'google-continue';
          message.value = 'Welcome back! Continue with Google to sign in.';
        } else {
          // This shouldn't happen for existing residents, but handle it
          step.value = 'google-link';
          message.value = 'Link your Google account to continue.';
        }
      } catch (error: any) {
        errorMessage.value = error.data?.message || 'Failed to check account status. Please try again.';
      }
      loading.value = false;
      return;
    }

    // For all other cases: invited resident, staff, or admin - proceed with OTP
    await requestOtp();
  } catch (error: any) {
    loading.value = false;
    errorMessage.value = error.data?.message || 'An error occurred. Please try again.';
  }
}

/**
 * Request OTP from Supabase
 * Can be used for initial request or resend
 */
async function requestOtp(isResend = false) {
  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone.value,
    });

    loading.value = false;

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    step.value = 'verify';
    otp.value = '';
    message.value = isResend ? 'OTP resent. Check your messages.' : 'OTP sent. Check your messages.';
    startResendTimer();
  } catch (error: any) {
    loading.value = false;
    errorMessage.value = error?.message || 'Failed to request OTP.';
  }
}

/**
 * Verify OTP and handle post-authentication flow
 * For residents: proceed to Google linking (mandatory for new residents)
 * For admin/staff: redirect to dashboard
 */
async function verifyOtp() {
  if (otp.value.trim().length < 4) {
    errorMessage.value = 'Enter the OTP you received.';
    return;
  }

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone.value,
      token: otp.value.trim(),
      type: 'sms',
    });

    loading.value = false;

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    // Route based on user role
    if (userRole.value === 'admin' || userRole.value === 'staff_member') {
      console.log("Signed in Successfully!");
      
      // Admin and staff go directly to dashboard
      message.value = 'Signed in successfully!';
      redirecting.value = true;
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 1000);
      return;
    }

    if (userRole.value === 'resident') {
      // Residents must link Google account (mandatory)
      // New residents won't have Google linked yet, so go directly to linking step
      step.value = 'google-link';
      message.value = 'Verified successfully! Please link your Google account to continue.';
    }
  } catch (error: any) {
    loading.value = false;
    errorMessage.value = error.data?.message || error?.message || 'Verification failed. Please try again.';
  }
}

/**
 * Link Google identity to resident account
 */
async function linkGoogleIdentity() {
  linkingGoogle.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  } catch (error: any) {
    errorMessage.value = error?.message || 'Failed to start Google linking.';
    linkingGoogle.value = false;
  }
}

/**
 * Login with Google for residents who already have Google linked
 */
async function loginWithGoogle() {
  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      errorMessage.value = error.message;
    }
  } catch (error: any) {
    errorMessage.value = error?.message || 'Failed to start Google sign-in.';
  } finally {
    loading.value = false;
  }
}

/**
 * Sign out user and reset form to initial state
 * Allows user to try a different phone number
 */
async function signOutAndReset() {
  signingOut.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      errorMessage.value = error.message;
      return;
    }

    // Reset all state
    phone.value = '';
    otp.value = '';
    step.value = 'phone';
    loading.value = false;
    redirecting.value = false;
    linkingGoogle.value = false;
    resendTimer.value = 0;
    censoredEmail.value = '';
    userRole.value = null;
    isNewUser.value = false;

    if (countdown) {
      clearInterval(countdown);
      countdown = null;
    }

    message.value = 'Signed out. Enter a different phone number to continue.';
  } catch (error: any) {
    errorMessage.value = error?.message || 'Failed to sign out.';
  } finally {
    signingOut.value = false;
  }
}

// ==================== Lifecycle ====================

/**
 * Watch for authentication changes
 * Syncs 
    console.log("User object updated", user);
    session when user becomes authenticated
 * ALSO handles OAuth callback completion after Google linking/signing in
 */
watch(
  authUser,
  async (user) => {
    if (user?.phone) {
      // User is authenticated - could be from:
      // 1. Initial phone+OTP auth (step is 'google-link')
      // 2. OAuth callback after linking Google (step might still be 'google-link')
      // 3. OAuth callback after signing in with Google
      
      loading.value = true
      message.value = ''
      errorMessage.value = ''

      try {
        const checkRes = await $fetch('/api/auth/check-user-role', {
          method: 'POST',
          body: { phone: `+${user.phone}` },
        })

        userRole.value = (checkRes.role as 'admin' | 'staff_member' | 'resident' | null)

        if (checkRes.role === 'admin' || checkRes.role === 'staff_member') {
          // Admin and staff - redirect immediately
          message.value = 'Signed in successfully!'
          redirecting.value = true
          setTimeout(() => navigateTo('/dashboard'), 500)
          return
        }

        if (checkRes.role === 'resident') {
          // For residents, check if Google is linked
          const googleRes = await $fetch('/api/auth/get-resident-google-identity', {
            method: 'POST',
            body: { phone: `+${user.phone}` },
          })

          if (googleRes.googleIdentityExists) {
            // Google is now linked (either was before or just completed linking)
            // Redirect to resident home
            message.value = 'Signed in successfully!'
            redirecting.value = true
            setTimeout(() => navigateTo('/resident'), 500)
            return
          }

          // Google not linked yet - show linking prompt
          censoredEmail.value = googleRes.censoredEmail || ''
          step.value = 'google-link'
          message.value = 'Your session is active. Link Google to finish setup.'
          return
        }

        // Unknown role - stay on login
        step.value = 'phone'
      } catch (error: any) {
        errorMessage.value = error?.data?.message || error?.message || 'Unable to process your session.'
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
);

/**
 * Cleanup on component unmount
 */
onUnmounted(() => {
  if (countdown) clearInterval(countdown);
});
</script>