<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../../lib/auth.js";

const router = useRouter();
const name = ref("");
const email = ref("");
const isloading = ref(true);
const qrcode = ref("");
const showForm = ref(false); // Controls the visibility of the form
const iscreateitem = ref(false);
const getqr = ref("");
const getscode = ref(false);
interface ItemCreation {
  id: number;
  category: string;
  label: string;
  description: string;
  status: string;
  shortCode: string;
  qrImage?: string;
}
const itemlist = ref<ItemCreation[]>([]); // Placeholder for future data fetching, currently unused
const printSpecificQRCode = (item: any) => {
  const base64 = item.qrImage;
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Popup blocked! Allow popups to print.");
    return;
  }
  printWindow.document.head.innerHTML = `
    <title>Print Label</title>
    <style>
      body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
      img { width: 200px; height: 200px; }
    </style>
  `;
  printWindow.document.body.innerHTML = `<img src="${base64}" />`;
  setTimeout(() => {
    printWindow.print();
    item.qrImage = undefined; // Automatically close the invisible window when done
    printWindow.close();
  }, 250);
};
const printQRCode = (base64: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Popup blocked! Allow popups to print.");
    return;
  }
  printWindow.document.head.innerHTML = `
    <title>Print Label</title>
    <style>
      body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
      img { width: 200px; height: 200px; }
    </style>
  `;
  printWindow.document.body.innerHTML = `<img src="${base64}" />`;
  setTimeout(() => {
    printWindow.print();
    // qrcode = ""; // Clear the base64 string after printing
    printWindow.close();
  }, 250);
}; // Controls the state of item creation
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
    await getitem();
  } catch (error) {
    console.error("dashboard error:", error);
  } finally {
    isloading.value = false;
  }
});
//get all item register by the user:-
const getitem = async () => {
  const { data } = await auth.getSession();
  if (!data?.session) {
    console.log("can not get the item");
    return;
  }
  const userId = data.session.userId;
  const response = await fetch(import.meta.env.VITE_API_URL + "/api/items/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const item = await response.json();
  // console.log("fetched items:", item);
  // console.log("fetched items:", item.message);
  itemlist.value = item.message; // Store the fetched items in the itemlist ref
  // console.log("fetched items:", itemlist.value);
  // console.log("fetched items:", itemlist.value[0]);
};
const handleLogout = async () => {
  try {
    await auth.signOut();
    router.push("/login");
  } catch (error) {
    console.error("logout because error:", error);
  }
};

const createItem = async () => {
  iscreateitem.value = true; // Set to true to indicate item creation is in progress
  try {
    const { data, error } = await auth.getSession();
    if (error || !data?.session) {
      console.error("No active session found!");
      return; // Stop the function if they aren't logged in
    }
    console.log(data.session);
    // const token = data.session.token;
    const userid = data.session.userId;
    const payload = {
      ...itemcreation.value,
      userId: `${userid}`,
    };
    // console.log(payload);
    const response = await fetch(import.meta.env.VITE_API_URL + "/api/items/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    await getitem(); // Refresh the item list after creating a new item
    const responseData = await response.json();
    qrcode.value = responseData.qrcode;
    console.log("successfully created item");
    console.log(qrcode.value);
    // console.log("successfully created item:", await response.json());
  } catch (error) {
    console.error("create item error:", error);
  } finally {
    itemcreation.value = {
      category: "",
      label: "",
      description: "",
      status: "",
    };
    iscreateitem.value = false; // Reset the item creation state
    // qrcode.value = "";
  }
};
const getqrcode = async (item: any) => {
  getscode.value = true;
  const { data, error } = await auth.getSession();
  if (error || !data?.session) {
    console.error("No active session found!");
    return; // Stop the function if they aren't logged in
  }

  try {
    const shortCode = item.shortCode;
    console.log("shortCode:", shortCode);
    // const shortCode =await fetch(); // Assuming you want to use the userId as the shortCode
    const reponse = await fetch(
      import.meta.env.VITE_API_URL + `/api/items/${shortCode}/qrcode`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const responseData = await reponse.json();
    // console.log("fetched qrcode:", responseData);
    item.qrImage = responseData.qrCode;

    // console.log("fetched qrcode:", qrcode.value);
  } catch (error) {
    console.error("get qrcode error:", error);
  } finally {
    getscode.value = false;
  }
};
const ArchieveItem = async (item: any) => {
  const { data, error } = await auth.getSession();
  if (error || !data?.session) {
    console.error("No active session found!");
    return; // Stop the function if they aren't logged in
  }
  try {
    const itemId = item.id;
    const userId = data.session.userId;

    const response = await fetch(
      import.meta.env.VITE_API_URL + `/api/items/${itemId}/archive`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to archive item: ${response.statusText}`);
    }
    await getitem();
    const responseData = await response.json();
    console.log("Archieve item response:", responseData);
  } catch (error) {
    console.error("Archieve item error:", error);
  }
};
const edititemdata = ref({
  id: "",
  category: "",
  label: "",
  description: "",
  status: "",
});
const isEditModalOpen = ref(false); // Controls the visibility of the edit modal
const edititem = async (item: any) => {
  const { data, error } = await auth.getSession();
  if (error || !data?.session) {
    console.error("No active session found!");
    return; // Stop the function if they aren't logged in
  }
  try {
    edititemdata.value = { ...item };
    isEditModalOpen.value = true;
  } catch (error) {
    console.error("Edit item error:", error);
  }
  // Implement the logic to edit the item here
  console.log("Edit item:", item);
};
const updateItem = async () => {
  const { data, error } = await auth.getSession();
  if (error || !data?.session) {
    console.error("No active session found!");
    return; // Stop the function if they aren't logged in
  }
  try {
    const itemId = edititemdata.value.id;

    const response = await fetch(
      import.meta.env.VITE_API_URL + `/api/items/${itemId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...edititemdata.value }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.statusText}`);
    }
    await getitem();
    const responseData = await response.json();
    console.log("Update item response:", responseData);
    isEditModalOpen.value = false; // Close the modal after successful update
  } catch (error) {
    console.error("Update item error:", error);
  }
};

const updatestatus = async (item: any) => {
  const { data, error } = await auth.getSession();
  if (error || !data?.session) {
    console.error("No active session found!");
    return; // Stop the function if they aren't logged in
  }
  try {
    const itemId = item.id;
    const newStatus = item.status === "ACTIVE" ? "LOST" : "ACTIVE"; // Toggle status

    const response = await fetch(
      import.meta.env.VITE_API_URL + `/api/items/${itemId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`);
    }
    await getitem(); // Refresh the item list after updating status
    const responseData = await response.json();
    console.log("Update status response:", responseData);
  } catch (error) {
    console.error("Update status error:", error);
  }
};
// const updatestatus = async () => {};
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
          <div class="dashboard-header">
            <div>
              <h1>Dashboard Overview</h1>
              <p>This is your dashboard. You can view your items here.</p>
            </div>
            <!-- Toggle Button -->
            <button @click="showForm = !showForm" class="toggle-btn">
              {{ showForm ? "Cancel" : "+ Add New Item" }}
            </button>
          </div>

          <!-- Form Card (Only shows if showForm is true) -->
          <div v-if="showForm" class="data-card form-card">
            <h2>Add New Item</h2>

            <form @submit.prevent="createItem" class="item-form">
              <div class="form-group">
                <label for="itemname">Item Name</label>
                <input
                  type="text"
                  id="itemname"
                  v-model="itemcreation.label"
                  required
                />
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <input
                  type="text"
                  id="category"
                  v-model="itemcreation.category"
                  required
                />
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <input
                  type="text"
                  id="description"
                  v-model="itemcreation.description"
                  required
                />
              </div>

              <div class="form-group">
                <label>Status</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input
                      type="radio"
                      value="LOST"
                      v-model="itemcreation.status"
                    />
                    LOST
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      value="ACTIVE"
                      v-model="itemcreation.status"
                    />
                    ACTIVE
                  </label>
                </div>
              </div>

              <button type="submit" :disabled="iscreateitem" class="submit-btn">
                Create New Item
              </button>
            </form>

            <div v-if="qrcode" class="qr-result-box">
              <h3>Item Created!</h3>
              <p>Here is your QR Code:</p>
              <img :src="qrcode" alt="QR Code" class="qr-image" />
              <button
                @click="printQRCode(qrcode)"
                class="submit-btn print-btn"
                style="margin-top: 15px"
              >
                Print QR Code
              </button>
            </div>
          </div>
          <div class="data-card table-container">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in itemlist" :key="item.id">
                  <td>{{ item.label }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.description }}</td>
                  <td>
                    <strong>{{ item.status }}</strong>
                  </td>
                  <td>
                    <button
                      v-if="!item.qrImage"
                      @click="getqrcode(item)"
                      class="submit-btn"
                      style="background-color: #3b82f6; margin-right: 10px"
                    >
                      Get QR Code
                    </button>
                    <div v-if="item.qrImage">
                      <img :src="item.qrImage" alt="QR Code" class="qr-image" />
                      <button
                        @click="printSpecificQRCode(item)"
                        class="submit-btn print-btn"
                        style="margin-top: 15px"
                      >
                        Print QR Code
                      </button>
                    </div>
                    <!-- Flex container to align the label and toggle -->
                    <div class="flex items-center gap-3">
                      <!-- The actual clickable toggle switch -->
                      <button
                        @click="updatestatus(item)"
                        :class="
                          item.status === 'ACTIVE'
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        "
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                      >
                        <!-- The white sliding circle inside the toggle -->
                        <span
                          :class="
                            item.status === 'ACTIVE'
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          "
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out"
                        ></span>
                      </button>

                      <!-- The text label that updates automatically -->
                      <span
                        :class="
                          item.status === 'ACTIVE'
                            ? 'text-green-600'
                            : 'text-gray-500'
                        "
                        class="font-semibold text-sm"
                      >
                        {{ item.status }}
                      </span>
                    </div>
                    <!-- </button> -->
                    <button
                      @click="ArchieveItem(item)"
                      class="submit-btn"
                      style="background-color: #3b82f6; margin-right: 10px"
                    >
                      Archieved Item
                    </button>

                    <button
                      @click="edititem(item)"
                      class="submit-btn"
                      style="background-color: #3b82f6; margin-right: 10px"
                    >
                      Edit Item
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- This completely hides the form unless isEditModalOpen is true -->
          <div v-if="isEditModalOpen" class="modal-overlay">
            <div class="modal-content">
              <h2>Edit Item</h2>

              <!-- The inputs are wired directly to the clone we made! -->
              <div class="form-group">
                <label>Item Name</label>
                <input
                  v-model="edititemdata.label"
                  type="text"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Category</label>
                <input
                  v-model="edititemdata.category"
                  type="text"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea v-model="edititemdata.description" class="form-input">
                </textarea>
              </div>
              <div class="form-group">
                <label
                  style="display: block; margin-bottom: 8px; font-weight: bold"
                  >Status</label
                >

                <!-- Flex container to align the radio options horizontally -->
                <div style="display: flex; gap: 20px; align-items: center">
                  <label
                    style="
                      display: flex;
                      align-items: center;
                      gap: 5px;
                      cursor: pointer;
                    "
                  >
                    <!-- 🚨 Ensure your v-model matches your exact variable name (editFormData vs edititemdata) -->
                    <input
                      v-model="edititemdata.status"
                      type="radio"
                      value="ACTIVE"
                    />
                    ACTIVE
                  </label>

                  <label
                    style="
                      display: flex;
                      align-items: center;
                      gap: 5px;
                      cursor: pointer;
                    "
                  >
                    <input
                      v-model="edititemdata.status"
                      type="radio"
                      value="LOST"
                    />
                    LOST
                  </label>
                </div>
              </div>
              <div class="button-group">
                <button
                  @click="updateItem"
                  class="submit-btn"
                  style="background-color: #10b981"
                >
                  Update Item
                </button>

                <!-- Canceling just flips the variable back to false, hiding the form -->
                <button
                  @click="isEditModalOpen = false"
                  class="submit-btn"
                  style="background-color: #ef4444"
                >
                  Cancel
                </button>
              </div>
            </div>
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
/* Form Styling */
.data-card h2 {
  margin-bottom: 20px;
  color: #18181b;
  font-size: 1.25rem;
}

.item-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #3f3f46;
}

.form-group input[type="text"] {
  padding: 10px 12px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Radio Buttons */
.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}

/* Submit Button */
.submit-btn {
  margin-top: 10px;
  background-color: #18181b;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #27272a;
}

/* QR Code Box */
.qr-result-box {
  margin-top: 30px;
  padding: 20px;
  border: 2px dashed #d4d4d8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafafa;
}

.qr-result-box h3 {
  color: #16a34a;
  margin-bottom: 4px;
}

.qr-result-box p {
  font-size: 0.9rem;
  color: #71717a;
  margin-bottom: 15px;
}

.qr-image {
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Header layout */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* The new toggle button */
.toggle-btn {
  background-color: #3b82f6; /* Nice blue */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.toggle-btn:hover {
  background-color: #2563eb;
}

/* Stops the form from stretching the whole screen */
.form-card {
  max-width: 600px;
  margin: 0; /* Aligns it to the left */
}
/* Disabled state for the submit button */
.submit-btn:disabled {
  background-color: #a1a1aa; /* Grays it out */
  cursor: not-allowed; /* Changes the mouse pointer to a red circle/slash */
  opacity: 0.7; /* Makes it look slightly faded */
}

/* Stop the hover effect when it is disabled */
.submit-btn:disabled:hover {
  background-color: #a1a1aa;
}
/* 🖨️ PRINT STYLES */

/* --- 🖨️ THE ULTIMATE PRINT STYLES --- */
@media print {
  /* 1. Nuke all app UI elements and buttons (useless on paper) */
  .sidebar,
  .top-header,
  .dashboard-header,
  .item-form,
  .data-card h2,
  button {
    display: none !important;
  }

  /* 2. Force the background to be pure white to save printer ink */
  .dashboard-wrapper,
  .main-area {
    background-color: white !important;
    height: auto !important;
  }

  /* 3. Remove shadows and borders from cards so they look flat */
  .data-card {
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 4. Force the table to stretch across the whole paper */
  .items-table {
    width: 100% !important;
  }

  /* 5. Force all text to be pitch black (bypasses browser ghost-text issues) */
  * {
    color: black !important;
  }

  /* 6. Protect the QR code from being split across two pages */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
  }
}
/* --- TABLE STYLING --- */
.table-container {
  margin-top: 30px;
  overflow-x: auto; /* Adds a scrollbar if the table gets too wide on small screens */
}

.items-table {
  width: 100%;
  border-collapse: collapse; /* Merges double borders into clean single lines */
  text-align: left;
}

/* Headers and Cells */
.items-table th,
.items-table td {
  padding: 16px;
  border-bottom: 1px solid #e4e4e7;
}

/* Header specific styling */
.items-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #52525b;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

/* Hover effect for rows */
.items-table tbody tr:hover {
  background-color: #f4f4f5; /* Highlights the row slightly when you mouse over it */
  transition: background-color 0.2s;
}

/* Remove bottom border from the very last row */
.items-table tbody tr:last-child td {
  border-bottom: none;
}
/* Darkens the background behind the popup */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* The actual white box containing the form */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-input {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
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
