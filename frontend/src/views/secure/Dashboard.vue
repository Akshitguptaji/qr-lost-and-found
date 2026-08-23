<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const name = ref("");
const email = ref("");
const isloading = ref(true);
const itemcreation = ref({
  category: "", // Placeholder for future data fetching, currently unused
  label: "", // Placeholder for future data fetching, currently unused
  description: "", // Placeholder for future data fetching, currently unused
  status: "", // Placeholder for future data fetching, currently unused
  //label, category, description, status
  // Set to true initially to show loading state while checking session
});
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
    console.error("logout because error:", error);
  }
};

const createItem = async () => {
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      console.error("No active session found!");
      return; // Stop the function if they aren't logged in
    }
    const token = data.session.userId;
    const payload = {
      ...itemcreation.value,
      userId: `${token}`,
    };
    const response = await fetch(import.meta.env.VITE_API_URL + "/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
  } catch (error) {
    console.error("create item error:", error);
  } finally {
    itemcreation.value = {
      category: "",
      label: "",
      description: "",
      status: "",
    };
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
          <br />button to add new item
          <div class="data-card">
            form to add new item
            <form @submit.prevent="createItem">
              <label for="itemname">Item Name:</label>
              <input
                type="text"
                id="itemname"
                v-model="itemcreation.label"
                required
              />
              <label for="category">Category:</label>
              <input
                type="text"
                id="category"
                v-model="itemcreation.category"
                required
              />
              <label for="description">Description:</label>
              <input
                type="text "
                id="description "
                v-model="itemcreation.description"
                required
              />
              <label for="status">Status:</label>

              <input
                type="radio"
                id="status"
                value="LOST"
                v-model="itemcreation.status"
              />
              LOST
              <input
                type="radio"
                id="status"
                value="ACTIVE"
                v-model="itemcreation.status"
              />
              ACTIVE
              <br />
              <button type="submit">Create New Item</button>
            </form>
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
//// class ke sath bhi condition lga skte ho , that i scalled dynamic class
binding in vue.js, for example you can use :class="{ 'active': isActive }" where
isActive is a boolean variable in your component's data., the active class will
be applied to the element when isActive is true, and removed when isActive is
false. This allows you to dynamically change the styling of elements based on
<!-- the component's state or props.
<router-link> = A clickable link in HTML that doesn't refresh the page.

 <router-view> = The blank canvas where Vue paints the page you just navigated to.

useRouter() = The tool to redirect users via JavaScript.


useRoute() = The tool to read the current URL. -->
