<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const isLoading = ref(true);
const name = ref("");
const email = ref("");
onMounted(async () => {
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      router.push("/login");
    }

    name.value = data?.user.name as string;
    email.value = data?.user.email as string;
  } catch (error) {
    console.error("Error checking session:", error);
    router.push("/login");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template></template>

<style scoped></style>
