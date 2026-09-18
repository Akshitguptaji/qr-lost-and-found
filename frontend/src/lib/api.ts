import router from "@/router";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseURL}${cleanEndpoint}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("session_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const updatedOptions = {
    ...options,
    headers,
  };
  const response = await fetch(fullUrl, updatedOptions);
  if (response.status === 401) {
    // Global Logout Logic: Clear token and redirect
    localStorage.removeItem("session_token");
    router.push("/login");

    // Stop processing the request immediately
    return Promise.reject(new Error("Unauthorized - redirecting to login"));
  }

  return response;
};
