<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const userName = ref("");
const userEmail = ref("");
const showPasswordForm = ref(false);
const isLoading = ref(true);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordMessage = ref("");
const isChangingPassword = ref(false);
onMounted(async () => {
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      router.push("/login");
    }
    userName.value = data?.user.name as string;
    userEmail.value = data?.user.email as string;
  } catch (error) {
    console.eror
    console.error("profile error:", error);
  } finally {
    isLoading.value = false;
  }
});
const toggleForm = () => {
  showPasswordForm.value = !showPasswordForm.value;
  passwordMessage.value = "";
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
};
const updatePassword = async () => {
  passwordMessage.value = "";
  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = "New password and confirm password do not match.";
    return;
  }
  if (newPassword.value.length < 8) {
    passwordMessage.value = "New password must be at least 8 characters long.";
    return;
  }
  isChangingPassword.value = true;
  try {
    const { error } = await auth.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      revokeOtherSessions: true,
    });
    if (error) {
      passwordMessage.value = error.message || "Failed to change password.";
    } else {
      passwordMessage.value = "Password updated successfully!";
      setTimeout(() => {
        toggleForm(); // Auto-close the form after success
      }, 2000);
    }
  } catch (error) {
    passwordMessage.value = "An unexpected error occurred.";
  } finally {
    isChangingPassword.value = false;
  }
};
</script>
<template>
  <main class="page-wrapper">
    <div v-if="isLoading" class="loading-screen">
      <div class="spinner"></div>
    </div>

    <div v-else class="profile-container fade-in">
      <header class="page-header">
        <button @click="router.push('/dashboard')" class="back-link">
          &larr; Back to Dashboard
        </button>
        <h1>Account Settings</h1>
        <p>Manage your profile and security preferences.</p>
      </header>

      <div class="settings-card">
        <!-- Profile Section -->
        <section class="settings-section">
          <div class="section-text">
            <h2>Personal Information</h2>
            <p>Your basic account details.</p>
          </div>

          <div class="section-content">
            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                :value="userName"
                disabled
                class="disabled-input"
              />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input
                type="email"
                :value="userEmail"
                disabled
                class="disabled-input"
              />
            </div>
          </div>
        </section>

        <hr class="divider" />

        <!-- Security Section -->
        <section class="settings-section">
          <div class="section-text">
            <h2>Security</h2>
            <p>Keep your account secure by updating your password.</p>
          </div>

          <div class="section-content">
            <div class="action-row">
              <span class="status-text"
                >Password requires at least 8 characters.</span
              >
              <button
                @click="toggleForm"
                class="toggle-btn"
                :class="{ 'cancel-btn': showPasswordForm }"
              >
                {{ showPasswordForm ? "Cancel" : "Update Password" }}
              </button>
            </div>

            <form
              v-if="showPasswordForm"
              @submit.prevent="updatePassword"
              class="password-form slide-down"
            >
              <div class="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  v-model="currentPassword"
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div class="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  v-model="newPassword"
                  required
                  placeholder="At least 8 characters"
                />
              </div>

              <div class="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  v-model="confirmPassword"
                  required
                  placeholder="Repeat new password"
                />
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="save-btn"
                >
                  {{ isChangingPassword ? "Saving..." : "Save Password" }}
                </button>
              </div>

              <p
                v-if="passwordMessage"
                class="feedback-msg"
                :class="{
                  'error-msg':
                    passwordMessage.includes('Failed') ||
                    passwordMessage.includes('match'),
                }"
              >
                {{ passwordMessage }}
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Base Reset & Typography */
* {
  box-sizing: border-box;
}

.page-wrapper {
  background-color: #fafafa;
  min-height: 100vh;
  /* Premium modern font stack */
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  color: #111827;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.profile-container {
  width: 100%;
  max-width: 800px; /* Wider for that dashboard feel */
}

/* Header */
.page-header {
  margin-bottom: 30px;
}
.page-header h1 {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  letter-spacing: -0.025em;
}
.page-header p {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.back-link {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #111827;
}
/* Card Container */
.settings-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  /* Soft, premium drop shadow */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* Section Layout (Two-column feel on desktop) */
.settings-section {
  display: flex;
  flex-direction: column;
  padding: 32px;
}
@media (min-width: 640px) {
  .settings-section {
    flex-direction: row;
    gap: 40px;
  }
}

.section-text {
  flex: 1;
  margin-bottom: 20px;
}
.section-text h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 6px 0;
}
.section-text p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.section-content {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.divider {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 0;
}

/* Forms & Inputs */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.2s ease;
  /* Internal shadow for depth */
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

input::placeholder {
  color: #9ca3af;
}

/* Premium Focus State */
input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 1px #000000;
}

.disabled-input {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  box-shadow: none;
}

/* Buttons & Actions */
.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.status-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.toggle-btn {
  background-color: #ffffff;
  color: #111827;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.cancel-btn {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}
.cancel-btn:hover {
  background-color: #fee2e2;
  border-color: #f87171;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-btn {
  background-color: #111827;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.save-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.save-btn:hover:not(:disabled) {
  background-color: #374151;
}

/* Feedback & Loading */
.feedback-msg {
  font-size: 0.875rem;
  color: #059669; /* Emerald Green */
  background-color: #ecfdf5;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
  margin-top: 16px;
}

.error-msg {
  color: #dc2626; /* Red */
  background-color: #fef2f2;
  border-color: #fecaca;
}

.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

.slide-down {
  animation: slideDown 0.3s ease-out forwards;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
