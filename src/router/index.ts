import { createRouter, createWebHistory } from "vue-router";
const LiverStreamsView = () => import("@/views/LiverStreamsView.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: LiverStreamsView,
    },

    // fallback
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
  ],
});

export default router;
