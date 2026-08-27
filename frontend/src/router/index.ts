import { auth } from "@/lib/auth.ts";
import { createRouter, createWebHistory } from "vue-router";
//createWebHistory(): This makes your URLs look normal. Older web apps used to put an ugly hash in the URL to navigate without reloading the page (e.g., http://localhost:5173/#/login). This function uses modern browser APIs to drop the #, giving you clean URLs like http://localhost:5173/login.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //`   path: "/",
    //   name: "home",

    //   //: This is lazy loading
    //   component: () => import("../views/public/LandingPage.vue"),
    // },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/public/Login.vue"),
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("../views/secure/Dashboard.vue"),
      meta: { requiresAuth: true },
    },

    {
      path: "/found/:shortCode",
      name: "FinderPage",
      component: () => import("../views/public/FinderPage.vue"),
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("../views/secure/Profile.vue"),
      meta: { requiresAuth: true },
    },
  ],
});
router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next();
  const { data } = await auth.getSession();
  if (!data?.session) {
    return next("/login");
  }
  next();
});
export default router;
