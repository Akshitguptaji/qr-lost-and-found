<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const name = ref("");
const email = ref("");
const isloading = ref(true);
// Set to true initially to show loading state while checking session
onMounted(async () => {
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      router.push("/login");
    }
    name.value = data?.user.name as string;
    email.value = data?.user.email as string;
  } catch (error) {
    console.error("dashboard error:", error);
  } finally {
    isloading.value = false;
  }
});
const handleLogout = async () => {
  try {
    await auth.signOut();
    router.push("/login");
  } catch (error) {
    console.error("logout because of error:", error);
  }
};
</script>
<template>
  <main>
    <div v-if="isloading" class="loading-screen">
      <h2>Loading Dashboard...</h2>
    </div>

    <div v-else class="dashboard-wrapper">
      <aside class="sidebar">
        <div class="logo">Qr lost and find App</div>
        <nav class="nav-links">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
        </nav>
      </aside>

      <div class="main-area">
        <header class="top-header">
          <div class="user-info">
            <span class="user-name">Welcome, {{ name }}</span>
            <span class="user-email">{{ email }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">Log Out</button>
        </header>
        <main class="content">
          <h1>Dashboard Overview</h1>
          <div class="data-card">
            <p>This is where your database tables or stats will go.</p>
          </div>
        </main>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Reset basic margins for this component */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Loading Screen */
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1a1a1a;
  color: white;
}

/* Layout Shell */
.dashboard-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f4f4f5;
  font-family: sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #18181b;
  color: white;
  display: flex;
  flex-direction: column;
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 20px;
  border-bottom: 1px solid #333;
}
.nav-links {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}
.nav-links a {
  color: #a1a1aa;
  text-decoration: none;
  padding: 12px 20px;
  transition: 0.2s;
}
.nav-links a:hover,
.nav-links a.active {
  background-color: #27272a;
  color: white;
}

/* Main Area (Right Side) */
.main-area {
  flex: 1; /* Takes up all remaining space */
  display: flex;
  flex-direction: column;
}

/* Top Header */
.top-header {
  height: 70px;
  background-color: white;
  border-bottom: 1px solid #e4e4e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: bold;
  color: #09090b;
}
.user-email {
  font-size: 0.85rem;
  color: #71717a;
}
.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.logout-btn:hover {
  background-color: #dc2626;
}

/* Content Area */
.content {
  padding: 30px;
  flex: 1;
  overflow-y: auto;
}
.data-card {
  margin-top: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e4e7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
