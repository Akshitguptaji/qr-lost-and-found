//we r calling the backend api to get the auth client for the frontend

import { createAuthClient } from "better-auth/vue";

export const auth = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("session_token") || "", // Pulls token dynamically
    },
  },
});
