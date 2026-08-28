<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const accuracy = ref<number | null>(null);
const locationStatus = ref("Pending...");
const message = ref("");
const contactInfo = ref("");
const honeypot = ref(""); // Hidden field to trap bots
const turnstileToken = ref("");
const route = useRoute();
const shortcode = route.params.shortcode as string;
const isSubmitting = ref(false);
const manualLocation = ref("");
onMounted(() => {
  const saved = localStorage.getItem("finder_draft");
  if (saved) message.value = saved;
});
watch(message, (newVal) => {
  localStorage.setItem("finder_draft", newVal);
});
//navigator.geolocation.getCurrentPosition(success, error, options)
const requestLocation = () => {
  if (!("geolocation" in navigator)) {
    locationStatus.value = "Geolocation is not supported by your browser.";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      accuracy.value = position.coords.accuracy;
      locationStatus.value = "Location obtained successfully!";
      console.log(position);
    },
    (err) => {
      if (err.code === 1) {
        // PERMISSION_DENIED
        locationStatus.value =
          "Location was not shared - no problem, your message will still reach the owner.";
      } else if (err.code === 2 || err.code === 3) {
        // POSITION_UNAVAILABLE or TIMEOUT
        locationStatus.value =
          "Could not get a precise location, but you can still send your message.";
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
};

const submitReport = async (attempt = 1) => {
  isSubmitting.value = true;
  try {
    const response = await fetch(`/api/found/${shortcode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.value,
        contactInfo: contactInfo.value,
        honeypot: honeypot.value,
        turnstileToken: turnstileToken.value,
        latitude: latitude.value,
        longitude: longitude.value,
        accuracy: accuracy.value,
        manualLocation: manualLocation.value,
      }),
    });
    localStorage.removeItem("finder_draft");
    locationStatus.value = "Report sent successfully!";
    isSubmitting.value = false;
  } catch (error) {
    if (attempt < 3) {
      locationStatus.value = `Couldn't send - retrying (Attempt ${attempt + 1})...`; //
      setTimeout(() => submitReport(attempt + 1), 2000 * attempt);
    } else {
      locationStatus.value = "Network failed. Please try again later.";
      isSubmitting.value = false;
    }
};
</script>
<template>
  <main>
    <div class="p-4 max-w-md mx-auto mt-10">
      <h1 class="text-2xl font-bold mb-4">You found an item!</h1>
      <div class="bg-gray-100 p-4 rounded-lg mb-6">
        <p class="text-sm text-gray-700 mb-3">
          Sharing your location helps the owner find their item faster
          (optional)
        </p>

        <button
          @click="requestLocation"
          class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Share My Location
        </button>
      </div>
    </div>
    <div
      v-if="
        locationStatus.includes('not shared') ||
        locationStatus.includes('Could not get')
      "
      class="mb-6"
    >
      <label class="block text-sm font-bold mb-2"
        >Type where you left it (optional):</label
      >
      <input
        v-model="manualLocation"
        type="text"
        class="border p-2 w-full rounded"
        placeholder="e.g., Under the park bench"
      />
    </div>
    <form @submit.prevent="submitReport()">
      <!-- Honeypot field (hidden from real users) -->
      <input
        v-model="honeypot"
        type="text"
        class="hidden"
        tabindex="-1"
        autocomplete="off"
      />

      <div class="mb-4">
        <label class="block text-sm font-bold mb-2"
          >Message <span class="text-red-500">*</span></label
        >
        <textarea
          v-model="message"
          placeholder="I found your item..."
          class="border p-2 w-full rounded"
          rows="4"
          required
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-bold mb-2"
          >Your Phone/Email (optional)</label
        >
        <input
          v-model="contactInfo"
          type="text"
          class="border p-2 w-full rounded"
          placeholder="So the owner can reach you"
        />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded mt-2"
      >
        {{ isSubmitting ? "Sending..." : "Send Message" }}
      </button>
    </form>
  </main>
</template>
