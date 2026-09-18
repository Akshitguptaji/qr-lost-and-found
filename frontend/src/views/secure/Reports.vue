<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { auth } from "../../lib/auth.js";
import { apiFetch } from "../../lib/api.js";
const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const name = ref("");
const email = ref("");
const reportId = route.params.id as string;
const reportData = ref<any>(null);
const error = ref("");
onMounted(async () => {
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      router.push("/login");
    }

    name.value = data?.user.name as string;
    email.value = data?.user.email as string;
    await getreport();
  } catch (error) {
    console.error("Error checking session:", error);
    router.push("/login");
  } finally {
    isLoading.value = false;
  }
});

const getreport = async () => {
  try {
    // const response = await fetch(
    //   import.meta.env.VITE_API_URL + `/api/reports/${reportId}`,
    //   {
    //     credentials: "include",
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   },
    // );
    const response = await apiFetch(`/api/reports/${reportId}`);
    // console.log("response", response);
    if (!response.ok) {
      // Local component error handling conceptual feedback
      console.error(
        `Backend API error retrieving report details: ${response.status}`,
      );
      error.value = "Failed to load report data."; // Component localized UI error feedback conceptual
      reportData.value = null; // Prevention UI crash safe fallback assignment
      return;
    }
    const data = await response.json();
    // console.log("report data", data);
    reportData.value = data || null;
  } catch (err: any) {
    console.error("Error fetching report data:", err);
    error.value = err.message;
    reportData.value = null; // Prevention UI crash safe fallback assignment
  }
};
</script>
<template>
  <div class="max-w-3xl mx-auto p-6 mt-10">
    <button
      @click="router.push('/dashboard')"
      class="text-blue-500 mb-6 font-bold"
    >
      &larr; Back to Dashboard
    </button>

    <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded">
      {{ error }}
    </div>

    <div v-else-if="!reportData" class="text-gray-500">
      Loading report details...
    </div>

    <div v-else class="bg-white p-6 rounded shadow-lg border">
      <!-- Item Details -->
      <h1 class="text-2xl font-bold mb-2">
        Found Item: {{ reportData.Report.item.label }}
      </h1>
      <p class="text-gray-600 mb-6">
        Category: {{ reportData.Report.item.category }}
      </p>
      <p class="text-gray-600 mb-6">
        Description: {{ reportData.Report.item.description }}
      </p>
      <hr class="mb-6" />

      <!-- Finder's Message -->
      <div class="mb-6">
        <h2 class="text-sm text-gray-500 font-bold uppercase mb-1">
          Finder's Message
        </h2>
        <p class="text-lg bg-gray-50 p-4 rounded border">
          {{ reportData.Report.message || "No message provided" }}
        </p>
      </div>
      <!-- Finder's Message -->
      <div class="mb-6">
        <h2 class="text-sm text-gray-500 font-bold uppercase mb-1">
          Finder's Contact
        </h2>
        <p class="text-lg bg-gray-50 p-4 rounded border">
          {{ reportData.Report.finderContact || "No Contact provided" }}
        </p>
      </div>
      <div class="mb-6">
        <h2 class="text-sm text-gray-500 font-bold uppercase mb-1">
          Manual Location
        </h2>
        <p class="text-lg bg-gray-50 p-4 rounded border">
          {{ reportData.Report.manualLocation || "No location provided" }}
        </p>
      </div>

      <!-- Map & Location -->
      <div class="mb-4">
        <h2 class="text-sm text-gray-500 font-bold uppercase mb-2">
          Location Found
        </h2>

        <div v-if="reportData.Report.latitude && reportData.Report.longitude">
          <!-- The Free Google Maps Iframe -->
          <iframe
            width="100%"
            height="300"
            class="rounded border shadow-sm"
            style="border: 0"
            loading="lazy"
            allowfullscreen
            :src="`https://maps.google.com/maps?q=${reportData.Report.latitude},${reportData.Report.longitude}&z=15&output=embed`"
          >
          </iframe>
          <p class="text-sm text-gray-500 mt-2">
            Exact Coordinates: {{ reportData.Report.latitude }},
            {{ reportData.Report.longitude }}
          </p>
        </div>
        <div v-else class="bg-gray-100 p-4 rounded text-gray-500">
          No GPS location was shared by the finder.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
