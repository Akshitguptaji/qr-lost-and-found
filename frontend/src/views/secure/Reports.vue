<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { auth } from "../../lib/auth.js";
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
    const response = await fetch(
      import.meta.env.VITE_API_URL + `/api/reports/${reportId}`,
      {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log("response", response);
    if (!response.ok) {
      throw new Error("Failed to fetch report data");
    }

    const data = await response.json();
    console.log("report data", data);
    reportData.value = data;
  } catch (err: any) {
    console.error("Error fetching report data:", err);
    error.value = err.message;
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
  </div>
</template>

<style scoped></style>
