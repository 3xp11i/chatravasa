<template>
    <div class="min-h-screen bg-background text-text flex items-center justify-center px-4 py-8">
        <div class="w-full">
            <div class="card auth-card">
                <h1 class="text-center font-bold text-xl mb-3 md:mb-4">Resident Login</h1>
                <p class="text-center text-sm text-text-muted mb-5 md:mb-6">Sign in to your hostel account</p>

                <form class="space-y-4"
                      @submit.prevent="handleSubmit">
                    <template v-if="step === 'request' || step === 'verify'">
                        <PhoneInput v-model="phone"
                                    label="Phone Number"
                                    :disabled="loading || step === 'verify'"
                                    required />

                        <div v-if="step === 'verify'"
                             class="space-y-2">
                            <label for="otp"
                                   class="font-medium">OTP Code</label>
                            <input id="otp"
                                   type="text"
                                   inputmode="numeric"
                                   pattern="[0-9]*"
                                   maxlength="6"
                                   autocomplete="one-time-code"
                                   placeholder="Enter 6-digit code"
                                   v-model="otp"
                                   :disabled="loading" />
                        </div>

                        <div class="space-y-3">
                            <button class="w-full bg-primary text-surface font-medium py-3 rounded-lg flex items-center justify-center gap-2"
                                    type="submit"
                                    :disabled="loading">
                                <span v-if="!loading">{{ step === 'request' ? 'Continue' : 'Verify & Sign In' }}</span>
                                <span v-else>Processing...</span>
                            </button>

                            <button v-if="step === 'verify'"
                                    type="button"
                                    class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
                                    :disabled="loading || resendTimer > 0"
                                    @click="requestOtp(true)">
                                Resend OTP <span v-if="resendTimer > 0">({{ resendTimer }}s)</span>
                            </button>
                        </div>
                    </template>

                    <div v-else-if="step === 'google'"
                         class="space-y-4 text-center">
                        <div class="space-y-2">
                            <h2 class="font-semibold text-lg">Continue with Google</h2>
                            <p class="text-sm text-text-muted">
                                You already have a Google account linked. Sign in with Google to continue.
                            </p>
                            <p v-if="loggedInPhoneDisplay"
                               class="text-sm font-medium text-text">
                                Entered Phone Number: {{ loggedInPhoneDisplay }}
                            </p>
                        </div>

                        <button type="button"
                                class="w-full greenBtn text-text border-2 border-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
                                :disabled="loading"
                                @click="loginWithGoogle">
                            <span v-if="!loading">Continue with Google</span>
                            <span v-else>Opening Google...</span>
                        </button>

                        <button type="button"
                                class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
                                :disabled="signingOut"
                                @click="signOutAndReset">
                            <span v-if="!signingOut">Use a different phone</span>
                            <span v-else>Signing out...</span>
                        </button>

                    </div>

                    <div v-else
                         class="space-y-4 text-center">
                        <div class="space-y-2">
                            <h2 class="font-semibold text-lg">Link your Google account</h2>
                            <p class="text-sm text-text-muted">
                                Your hostel account is signed in. Link Google to finish setup and continue.
                            </p>
                            <p v-if="loggedInPhoneDisplay"
                               class="text-sm font-medium text-text">
                                Signed in with {{ loggedInPhoneDisplay }}
                            </p>
                        </div>

                        <button type="button"
                                class="w-full greenBtn text-text border-2 border-gray-300 font-medium py-3 rounded-lg flex items-center justify-center gap-2"
                                :disabled="linkingGoogle"
                                @click="linkGoogleIdentity">
                            <span v-if="!linkingGoogle">Continue with Google</span>
                            <span v-else>Opening Google...</span>
                        </button>

                        <button type="button"
                                class="w-full outline text-primary border-2 border-primary py-3 rounded-lg font-medium"
                                :disabled="signingOut"
                                @click="signOutAndReset">
                            <span v-if="!signingOut">Use a different phone</span>
                            <span v-else>Signing out...</span>
                        </button>
                    </div>

                    <p v-if="message"
                       class="text-green-700 text-sm text-center">{{ message }}</p>
                    <p v-if="redirecting"
                       class="text-primary text-sm text-center font-medium">Redirecting to your dashboard...</p>
                    <p v-if="errorMessage"
                       class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
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
const authUser = useSupabaseUser();

const phone = ref('');
const otp = ref('');
const step = ref<'request' | 'verify' | 'google' | 'link'>('request');
const loading = ref(false);
const redirecting = ref(false);
const linkingGoogle = ref(false);
const signingOut = ref(false);
const message = ref('');
const errorMessage = ref('');
const resendTimer = ref(0);
let countdown: ReturnType<typeof setInterval> | null = null;

const sessionPhone = computed(() => authUser.value?.phone?.replace(/^\+/, '') || '');
const loggedInPhoneDisplay = computed(() => {
    const phoneNumber = sessionPhone.value;
    if (!phoneNumber) return '';

    return phoneNumber.startsWith('91') ? `+${phoneNumber}` : phoneNumber;
});

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

async function syncFromExistingSession() {
    const existingPhone = sessionPhone.value;

    if (!existingPhone) {
        return;
    }

    phone.value = existingPhone.startsWith('91') ? existingPhone.slice(2) : existingPhone;

    loading.value = true;
    message.value = '';
    errorMessage.value = '';

    try {
        const checkRes = await $fetch('/api/auth/check-resident', {
            method: 'POST',
            body: { phone: `+${existingPhone}` },
        });

        if (checkRes.exists && checkRes.googleIdentityExists) {
            step.value = 'google';
            message.value = 'Your account is already linked with Google. Continue with Google sign-in.';
            return;
        }

        if (checkRes.exists || checkRes.invited) {
            step.value = 'link';
            message.value = 'Your session is active. Link Google to finish setup.';
            return;
        }

        step.value = 'request';
    } catch (error: any) {
        errorMessage.value = error?.data?.message || error?.message || 'Unable to restore your session.';
    } finally {
        loading.value = false;
    }
}

async function handleSubmit() {
    if (step.value === 'request') {
        await requestOtp();
        return;
    }

    if (step.value === 'verify') {
        await verifyOtp();
    }
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

        if (checkRes.exists && checkRes.googleIdentityExists) {
            step.value = 'google';
            message.value = 'This resident already has Google linked. Continue with Google.';
            loading.value = false;
            return;
        }

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

    step.value = 'link';
    message.value = 'Signed in successfully. Please link Google to continue.';
}

async function linkGoogleIdentity() {
    linkingGoogle.value = true;
    message.value = '';
    errorMessage.value = '';

    try {
        await supabase.auth.linkIdentity({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/login/resident`,
            },
        });
    } catch (error: any) {
        errorMessage.value = error?.message || 'Failed to start Google linking.';
        linkingGoogle.value = false;
    }
}

async function loginWithGoogle() {
    loading.value = true;
    message.value = '';
    errorMessage.value = '';

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/login/resident`,
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

        phone.value = '';
        otp.value = '';
        step.value = 'request';
        loading.value = false;
        redirecting.value = false;
        linkingGoogle.value = false;
        resendTimer.value = 0;
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

watch(
    authUser,
    async (user) => {
        if (user?.phone) {
            await syncFromExistingSession();
        }
    },
    { immediate: true }
)

onUnmounted(() => {
    if (countdown) clearInterval(countdown);
});
</script>