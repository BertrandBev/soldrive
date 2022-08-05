import * as VueRouter from "vue-router";
import Home from "./components/Home.vue";
import EditFile from "./components/EditFile.vue";

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/explorer" },
    {
      path: "/explorer",
      component: Home,
      meta: { name: "SolDrive", hideBack: true },
    },
    {
      path: "/explorer/:path(.*)*",
      component: Home,
      meta: { name: "SolDrive", hideBack: true },
      props: true,
    },
    {
      path: "/file",
      component: EditFile,
      meta: { name: "File" },
    },
  ],
});

export default router;
