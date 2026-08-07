import { createRouter, createWebHistory } from "vue-router";
//createWebHistory(): This makes your URLs look normal. Older web apps used to put an ugly hash in the URL to navigate without reloading the page (e.g., http://localhost:5173/#/login). This function uses modern browser APIs to drop the #, giving you clean URLs like http://localhost:5173/login.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: "/",
    //   name: "home",

    //   //: This is lazy loading
    //   component: () => import("../views/public/LandingPage.vue"),
    // },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/public/Login.vue"),
    },
    // {
    //   path: "/dashboard",
    //   name: "dashboard",
    //   component: () => import("../views/secure/Dashboard.vue"),
    // },

    // {
    //   path: "/found/:shortCode",
    //   name: "finder",
    //   component: () => import("../views/public/FinderPage.vue"),
    // },
  ],
});

export default router;
