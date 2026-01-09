<template>
  <div class="min-h-screen bg-background text-text flex items-center justify-center px-4 py-8">
    <div class="w-full">
      <div class="card auth-card">
        <h1 class="text-center font-bold text-xl mb-3 md:mb-4">Resident Login</h1>
        <p class="text-center text-sm text-text-muted mb-5 md:mb-6">Sign in to your hostel account</p>

        <form class="space-y-4" @submit.prevent="step === 'request' ? requestOtp() : verifyOtp()">
          <PhoneInput
            v-model="phone"
            label="Phone Number"
            :disabled="loading || step === 'verify'"
            required
          />

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

          <div class="space-y-3">
            <button
              class="w-full bg-primary text-surface font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              type="submit"
              :disabled="loading"
            >
              <span v-if="!loading">{{ step === 'request' ? 'Send OTP' : 'Verify & Sign In' }}</span>
              <span v-else>Processing...</span>
            </button>

            <button
              v-if="step === 'verify'"
              type="button"
              class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
              :disabled="loading || resendTimer > 0"
              @click="requestOtp(true)"
            >
              Resend OTP <span v-if="resendTimer > 0">({{ resendTimer }}s)</span>
            </button>
          </div>

          <p v-if="message" class="text-green-700 text-sm text-center">{{ message }}</p>
          <p v-if="redirecting" class="text-primary text-sm text-center font-medium">Redirecting to your dashboard...</p>
          <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "blank",
  name: "resident-login",
});

const supabase = useSupabaseClient();

const phone = ref('');
const otp = ref('');
const step = ref<'request' | 'verify'>('request');
const loading = ref(false);
const redirecting = ref(false);
const message = ref('');
const errorMessage = ref('');
const resendTimer = ref(0);
let countdown: ReturnType<typeof setInterval> | null = null;

const normalizedPhone = computed(() => {
  const digits = phone.value.trim();
  return digits ? `+91${digits}` : '';
});

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

async function requestOtp(isResend = false) {
  if (!phone.value || phone.value.length < 10) {
    errorMessage.value = 'Enter a valid 10 digit phone number.';
    return;
  }

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

  try {
    // First, check if user exists in auth.users or resident_invites
    const checkRes = await $fetch('/api/auth/check-resident', {
      method: 'POST',
      body: { phone: normalizedPhone.value },
    });

    if (!checkRes.exists && !checkRes.invited) {
      errorMessage.value =
        'You have not been added to any hostel yet. Please contact your hostel admin.';
      loading.value = false;
      return;
    }

    // Proceed with OTP request
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
    errorMessage.value = error.data?.message || 'An error occurred. Please try again.';
  }
}

async function verifyOtp() {
  if (otp.value.trim().length < 4) {
    errorMessage.value = 'Enter the OTP you received.';
    return;
  }

  loading.value = true;
  message.value = '';
  errorMessage.value = '';

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

  message.value = 'Signed in successfully!';
  redirecting.value = true;

  setTimeout(() => {
    navigateTo('/resident');
  }, 1000);
}

onUnmounted(() => {
  if (countdown) clearInterval(countdown);
});
</script>