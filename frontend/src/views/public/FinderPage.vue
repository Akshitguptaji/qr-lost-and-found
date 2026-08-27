<script lang="ts" setup>
import { ref,onMounted ,watch} from "vue";
import { useRoute } from "vue-router";
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const accuracy = ref<number | null>(null);
const locationStatus = ref("Pending...");
const message = ref('');
const contactInfo = ref('');
const honeypot = ref(''); // Hidden field to trap bots
const turnstileToken = ref('');
onMounted(() => {
  const saved = localStorage.getItem('finder_draft');
  if (saved) message.value = saved;
});
watch(message, (newVal) => {
  localStorage.setItem('finder_draft', newVal);
});
//navigator.geolocation.getCurrentPosition(success, error, options)
const requestLocation = () => {
  if (!('geolocation' in navigator)) {
    locationStatus.value = 'Geolocation is not supported by your browser.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      accuracy.value = position.coords.accuracy;
      locationStatus.value = 'Location obtained successfully!';
      console.log(position)
    },
    (err) => {
      if (err.code === 1) { // PERMISSION_DENIED
        locationStatus.value = 'Location was not shared - no problem, your message will still reach the owner.';
      } else if (err.code === 2 || err.code === 3) {
        // POSITION_UNAVAILABLE or TIMEOUT
        locationStatus.value = 'Could not get a precise location, but you can still send your message.';
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
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
  </main>
</template>
