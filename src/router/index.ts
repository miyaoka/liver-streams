import { createRouter, createWebHistory } from "vue-router";
const VerticalView = () => import("@/views/VerticalView.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "vertical",
      component: VerticalView,
    },

    // fallback
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "vertical" },
    },
  ],
});

export default router;
