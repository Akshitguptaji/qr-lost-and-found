<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const name = ref("");
const email = ref("");

const handleLogout = async () => {
  await auth.signOut();
  router.push("/login");
};
</script>
<template>
  <div>
    <h1 class="text-3xl font-bold text-center text-zinc-900 mb-6">Dashboard</h1>

    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      @click="handleLogout"
    >
      Logout
    </button>
  </div>
</template>
