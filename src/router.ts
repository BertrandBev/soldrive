import * as VueRouter from "vue-router";
import Home from "./components/Home.vue";

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [{ path: "/", component: Home, meta: { name: "Home" } }],
});

export default router;
