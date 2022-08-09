import * as VueRouter from "vue-router";
import Home from "./components/Home.vue";
import EditFile from "./components/file/EditFile.vue";
import Account from "./components/Account.vue";

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
      props: (route) => route.query,
      meta: { name: "File" },
    },
    {
      path: "/account",
      component: Account,
      meta: { name: "Account" },
    },
  ],
});

export function folderId(path: string[]) {
  if (path.length == 0) return 0;
  return parseInt(path[path.length - 1]) || 0;
}

export default router;
